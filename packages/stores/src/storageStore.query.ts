import { type Result } from '@onflow/frw-cadence';
import { cadence } from '@onflow/frw-context';
import { FlatQueryDomain, type WalletAccount } from '@onflow/frw-types';
import { logger, isValidFlowAddress } from '@onflow/frw-utils';

/**
 * Extended Result interface with calculated available storage and converted number fields
 */
export interface AccountInfo extends Omit<Result, 'balance' | 'availableBalance' | 'storageFlow'> {
  balance: number;
  availableBalance: number;
  storageFlow: number;
  // Calculated field
  available: number;
}

/**
 * Query keys for account info data
 * Uses FINANCIAL category (0ms cache) for real-time account information
 */
export const storageQueryKeys = {
  all: [FlatQueryDomain.STORAGE] as const,
  info: () => [...storageQueryKeys.all, 'info'] as const,
  accountInfo: (selectedAccount: WalletAccount | null) =>
    [
      ...storageQueryKeys.info(),
      selectedAccount?.parentAddress || selectedAccount?.address || 'unknown',
    ] as const,
  resourceCheck: (address: string, flowIdentifier: string) =>
    [...storageQueryKeys.all, 'resource-check', address, flowIdentifier] as const,
};

/**
 * Query functions for account operations
 */
export const storageQueries = {
  /**
   * Fetch complete account information including storage and balance
   * @param selectedAccount - Selected account object to determine which address to query
   * @returns Promise<AccountInfo> - Complete account info with storage and balance
   */
  fetchAccountInfo: async (selectedAccount: WalletAccount | null): Promise<AccountInfo> => {
    if (!selectedAccount?.address) {
      throw new Error('No selected account provided');
    }

    try {
      // Use parentAddress if available, otherwise use the account's address
      const queryAddress = selectedAccount.parentAddress || selectedAccount.address;

      logger.info('Fetching complete account info', {
        accountAddress: selectedAccount.address,
        queryAddress,
        hasParent: !!selectedAccount.parentAddress,
      });

      const rawAccountInfo = await cadence.getAccountInfo(queryAddress);

      // Convert string balances to numbers and calculate available storage
      const balance = parseFloat(rawAccountInfo.balance);
      const availableBalance = parseFloat(rawAccountInfo.availableBalance);
      const storageFlow = parseFloat(rawAccountInfo.storageFlow);
      const available = rawAccountInfo.storageCapacity - rawAccountInfo.storageUsed;

      const result: AccountInfo = {
        address: rawAccountInfo.address,
        balance,
        availableBalance,
        storageUsed: rawAccountInfo.storageUsed,
        storageCapacity: rawAccountInfo.storageCapacity,
        storageFlow,
        available,
      };

      logger.info('Account info retrieved', {
        address: queryAddress,
        balance,
        capacity: rawAccountInfo.storageCapacity,
        used: rawAccountInfo.storageUsed,
        available,
        usagePercentage: (
          (rawAccountInfo.storageUsed / rawAccountInfo.storageCapacity) *
          100
        ).toFixed(2),
      });

      return result;
    } catch (error) {
      logger.error('Failed to fetch account info', {
        error: error instanceof Error ? error.message : String(error),
        selectedAccount: selectedAccount?.address,
      });
      throw error;
    }
  },

  /**
   * Check if a specific address can receive a specific resource (token or NFT)
   * @param address - Target address to check
   * @param flowIdentifier - Resource identifier (e.g., A.xxx.FlowToken.Vault for tokens, A.xxx.ExampleNFT.NFT for NFTs)
   * @returns Promise<boolean> - true if the address can receive the resource, false otherwise
   */
  checkResourceCompatibility: async (address: string, flowIdentifier: string): Promise<boolean> => {
    if (!address || !flowIdentifier) {
      logger.warn('Missing address or flowIdentifier for resource check', {
        address,
        flowIdentifier,
      });
      return false;
    }

    // Check if it's a valid Flow address
    const isFlowAddress = isValidFlowAddress(address);
    if (!isFlowAddress) {
      logger.info('Address is not a valid Flow address, returning true for compatibility', {
        address,
        flowIdentifier,
      });
      return true;
    }

    try {
      logger.info('Checking resource compatibility', { address, flowIdentifier });

      const isCompatible = await cadence.checkResource(address, flowIdentifier);

      logger.info('Resource compatibility check result', {
        address,
        flowIdentifier,
        isCompatible,
      });

      return isCompatible;
    } catch (error) {
      logger.error('Failed to check resource compatibility', {
        error: error instanceof Error ? error.message : String(error),
        address,
        flowIdentifier,
      });
      // In case of error, assume incompatible for safety
      return false;
    }
  },
};

const MIN_FLOW_BALANCE = 0.001; // FLOW
const AVERAGE_TX_FEE = 0.0005; // FLOW
const MINIMUM_STORAGE_THRESHOLD = 10000; // bytes

/**
 * Storage and account validation utilities
 */
export const storageUtils = {
  /**
   * Check if balance is insufficient (< 0.001 FLOW)
   */
  isBalanceInsufficient: (balance: number): boolean => {
    return balance < MIN_FLOW_BALANCE;
  },

  /**
   * Check if storage is insufficient (< 10000 bytes available)
   */
  isStorageInsufficient: (accountInfo: AccountInfo): boolean => {
    return accountInfo.available < MINIMUM_STORAGE_THRESHOLD;
  },

  /**
   * Validate Flow token transaction
   * @param accountInfo - Complete account information including balance and storage
   * @param amount - Transaction amount in FLOW
   * @param isFreeGas - Whether gas is free
   * @returns Validation result
   */
  validateFlowTokenTransaction: (
    accountInfo: AccountInfo,
    amount: number,
    isFreeGas: boolean = false
  ): {
    canProceed: boolean;
    showWarning: boolean;
    warningType: 'balance' | 'storage' | 'storage_after_action' | null;
  } => {
    // Check storage insufficient
    if (storageUtils.isStorageInsufficient(accountInfo)) {
      return {
        canProceed: false,
        showWarning: true,
        warningType: 'storage',
      };
    }

    // Check balance insufficient
    if (storageUtils.isBalanceInsufficient(accountInfo.balance)) {
      return {
        canProceed: false,
        showWarning: true,
        warningType: 'balance',
      };
    }

    // Check if there will be enough balance after transaction to cover average tx fee
    const averageTxFee = isFreeGas ? 0 : AVERAGE_TX_FEE;
    const remainingBalanceAfterTx = accountInfo.balance - amount;

    if (remainingBalanceAfterTx < averageTxFee) {
      return {
        canProceed: false,
        showWarning: true,
        warningType: 'storage_after_action',
      };
    }

    return {
      canProceed: true,
      showWarning: false,
      warningType: null,
    };
  },

  /**
   * Validate other (non-Flow) transaction
   */
  validateOtherTransaction: (
    accountInfo: AccountInfo,
    isFreeGas: boolean = false
  ): {
    canProceed: boolean;
    showWarning: boolean;
    warningType: 'balance' | 'storage' | 'storage_after_action' | null;
  } => {
    return storageUtils.validateFlowTokenTransaction(
      accountInfo,
      0, // No FLOW amount for other transactions
      isFreeGas
    );
  },

  /**
   * Get storage warning message keys based on validation result
   * @param warningType - Type of warning to get the i18n key for
   * @returns i18n key for the warning message
   */
  getStorageWarningMessageKey: (
    warningType: 'balance' | 'storage' | 'storage_after_action' | null
  ): string => {
    switch (warningType) {
      case 'balance':
        return 'storage.warning.balance';

      case 'storage': {
        return 'storage.warning.storage';
      }

      case 'storage_after_action':
        return 'storage.warning.storageAfterAction';

      default:
        return '';
    }
  },

  /**
   * Legacy method for backward compatibility
   * @deprecated Use validateFlowTokenTransaction or validateOtherTransaction instead
   */
  shouldShowStorageWarning: (
    accountInfo: AccountInfo,
    estimatedStorageIncrease: number = 0
  ): boolean => {
    // Simple check based on storage threshold
    return accountInfo.available < MINIMUM_STORAGE_THRESHOLD + estimatedStorageIncrease;
  },
};
