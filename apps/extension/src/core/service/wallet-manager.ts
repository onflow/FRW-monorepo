/**
 * Wallet Manager for Wallet Package Integration
 * Manages Wallet lifecycle and subscribes to account changes
 */

import { logger } from '@onflow/frw-context';
import {
  Wallet,
  WalletFactory,
  SeedPhraseKey,
  PrivateKey,
  Chain,
  NETWORKS,
  type AccountsListener,
  type EthUnsignedTransaction,
  type EthSignedTransaction,
  type EthSignedMessage,
  type HexLike,
} from '@onflow/frw-wallet';

import { getLocalData, setLocalData } from '@/data-model';
import { consoleError } from '@/shared/utils';

import { ExtensionStorage } from './extension-storage';
import keyringService from './keyring';
import userWalletService from './userWallet';

type EthereumKeyLike = {
  ethAddress: (index?: number) => Promise<string>;
  ethSignTransaction: (
    transaction: EthUnsignedTransaction,
    index?: number
  ) => Promise<EthSignedTransaction>;
  ethSignPersonalMessage: (message: HexLike, index?: number) => Promise<EthSignedMessage>;
  ethSignTypedData: (
    typedData: Record<string, unknown>,
    index?: number
  ) => Promise<EthSignedMessage>;
};

export type EOAAccountSigner = {
  index: number;
  address: string;
  signTransaction: (transaction: EthUnsignedTransaction) => Promise<EthSignedTransaction>;
  signPersonalMessage: (message: HexLike) => Promise<EthSignedMessage>;
  signTypedData: (typedData: Record<string, unknown>) => Promise<EthSignedMessage>;
};

export type EOAAccountInfo = {
  index: number;
  address: string;
  balance?: string;
};

export class WalletManager {
  private static readonly EOA_DISCOVERY_INDEX_LIMIT = 20;

  private wallet: Wallet | null = null;
  private storage: ExtensionStorage;
  private seedPhraseKey: SeedPhraseKey | null = null;
  private privateKey: PrivateKey | null = null;
  private currentUid: string | null = null;

  constructor() {
    this.storage = new ExtensionStorage();
  }

  /**
   * Initialize wallet with current keyring uid's private key
   */
  async init(uid?: string): Promise<void> {
    try {
      if (!keyringService.isUnlocked()) {
        return;
      }

      // Use provided uid or get current one
      const targetUid = uid || (await this.getCurrentUid());
      if (!targetUid) {
        throw new Error('No uid available for wallet initialization');
      }

      // If already initialized for this uid, skip
      if (this.wallet && this.currentUid === targetUid) {
        return;
      }

      // Clear previous wallet if different uid
      if (this.wallet && this.currentUid !== targetUid) {
        this.cleanup();
      }

      // Check what type of keyring is available
      const hdKeyrings = keyringService.getKeyringsByType('HD Key Tree');
      const simpleKeyrings = keyringService.getKeyringsByType('Simple Key Pair');

      if (hdKeyrings.length > 0) {
        // Try to get mnemonic from HD keyring
        const mnemonic = await keyringService.getMnemonicFromKeyring();

        if (!mnemonic) {
          throw new Error('No mnemonic available from HD keyring');
        }

        // Create SeedPhraseKey
        this.seedPhraseKey = await SeedPhraseKey.createAdvanced(
          {
            mnemonic,
            derivationPath: "m/44'/539'/0'/0/0", // Flow default path
            passphrase: '',
          },
          this.storage
        );

        // Create wallet using factory
        this.wallet = WalletFactory.createKeyWallet(
          this.seedPhraseKey,
          this.getNetworks(),
          this.storage
        );
      } else if (simpleKeyrings.length > 0) {
        // Try to get private key from Simple keyring
        const privateKey = await keyringService.getCurrentPrivateKey();

        if (!privateKey) {
          throw new Error('No private key available from Simple keyring');
        }

        // Create PrivateKey instead of SeedPhraseKey
        this.privateKey = await PrivateKey.createAdvanced(
          Buffer.from(privateKey, 'hex'),
          this.storage
        );

        // Create wallet using factory with private key
        this.wallet = WalletFactory.createKeyWallet(
          this.privateKey,
          this.getNetworks(),
          this.storage
        );
      } else {
        throw new Error('No keyrings available - please import a mnemonic or private key');
      }

      // Subscribe to account changes
      this.subscribeToWalletEvents();

      // Initialize wallet to load all accounts (Flow + EVM)
      await this.wallet.initialize();

      this.currentUid = targetUid;
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Subscribe to wallet account changes
   */
  private subscribeToWalletEvents(): void {
    if (!this.wallet) return;

    const accountsListener: AccountsListener = (accounts) => {
      // Notify extension about account changes
      this.onAccountsChanged(Array.from(accounts.values()));
    };

    this.wallet.addAccountsListener(accountsListener);
  }

  /**
   * Handle account changes from wallet
   */
  private onAccountsChanged(accounts: any[]): void {
    // Broadcast account changes to extension
    chrome.runtime
      .sendMessage({
        type: 'WALLET_ACCOUNTS_CHANGED',
        accounts: accounts,
      })
      .catch((error) => {
        console.error('Failed to broadcast account changes:', error);
      });
  }

  /**
   * Get current uid from keyring or user service
   */
  private async getCurrentUid(): Promise<string | null> {
    try {
      // Try to get uid from userWallet service
      return userWalletService.getCurrentPubkey() || null;
    } catch (error) {
      console.error('Failed to get current uid:', error);
      return null;
    }
  }

  /**
   * Get networks based on extension's network setting
   */
  private getNetworks(): Set<any> {
    const network = userWalletService.getNetwork();

    if (network === 'mainnet') {
      return new Set([NETWORKS.FLOW_MAINNET, NETWORKS.FLOW_EVM_MAINNET]);
    } else {
      return new Set([NETWORKS.FLOW_TESTNET, NETWORKS.FLOW_EVM_TESTNET]);
    }
  }

  /**
   * Get storage key for EOA address by public key
   */
  private getEOAAddressStorageKey(publicKey: string): string {
    return `eoaAddress_${publicKey}`;
  }

  /**
   * Save EOA address to localStorage by public key
   */
  private async saveEOAAddress(publicKey: string, address: string): Promise<void> {
    try {
      const storageKey = this.getEOAAddressStorageKey(publicKey);
      const normalizedAddress = address.toLowerCase();
      const cached = await getLocalData<{ address?: string; addresses?: string[] }>(storageKey);
      const existingAddresses = Array.isArray(cached?.addresses) ? cached.addresses : [];
      const legacyAddress = typeof cached?.address === 'string' ? [cached.address] : [];

      const merged = Array.from(
        new Set(
          [...existingAddresses, ...legacyAddress, normalizedAddress].map((item) =>
            item.toLowerCase()
          )
        )
      );
      await setLocalData(storageKey, {
        // Keep legacy shape for compatibility with old readers.
        address: merged[merged.length - 1],
        addresses: merged,
      });
    } catch (error) {
      consoleError('Failed to save EOA address to localStorage:', error as Error);
    }
  }

  /**
   * Get EOA address from localStorage by public key
   */
  private async getEOAAddressFromStorage(
    publicKey: string
  ): Promise<{ address: string; balance?: string } | null> {
    try {
      const storageKey = this.getEOAAddressStorageKey(publicKey);
      const cached = await getLocalData<{ address?: string; addresses?: string[] }>(storageKey);
      const addresses = Array.isArray(cached?.addresses) ? cached.addresses : [];
      const latestAddress =
        addresses.length > 0 ? addresses[addresses.length - 1] : (cached?.address ?? null);
      if (latestAddress) {
        return { address: latestAddress };
      }
      return null;
    } catch (error) {
      consoleError('Failed to get EOA address from localStorage:', error as Error);
      return null;
    }
  }

  private async getEOAAddressesFromStorage(publicKey: string): Promise<string[]> {
    try {
      const storageKey = this.getEOAAddressStorageKey(publicKey);
      const cached = await getLocalData<{ address?: string; addresses?: string[] }>(storageKey);
      const addresses = Array.isArray(cached?.addresses) ? cached.addresses : [];
      const legacyAddress = typeof cached?.address === 'string' ? [cached.address] : [];
      return Array.from(
        new Set(
          [...addresses, ...legacyAddress].filter(Boolean).map((address) => address.toLowerCase())
        )
      );
    } catch (error) {
      consoleError('Failed to get EOA addresses from localStorage:', error as Error);
      return [];
    }
  }

  /**
   * Get EOA account information
   * @param publicKey - Optional public key. If not provided, uses current profile's public key
   * @param address - Optional EOA address. If provided, resolves the matching derivation index
   * @returns EOA address and balance, or null if not found
   */
  async getEOAAccountInfo(
    publicKey?: string,
    address?: string
  ): Promise<{ address: string; balance?: string } | null> {
    try {
      // Use provided public key or get current one
      const targetPublicKey = publicKey || userWalletService.getCurrentPubkey();
      const normalizedRequestedAddress = address?.toLowerCase();

      // If we have a public key, check localStorage first (only when no explicit address is requested)
      if (targetPublicKey && !normalizedRequestedAddress) {
        const cachedEOA = await this.getEOAAddressFromStorage(targetPublicKey);
        if (cachedEOA?.address) {
          logger.info('[extension] EOA address from cache (getEOAAccountInfo)', {
            address: cachedEOA.address,
            source: 'cache',
          });
          return cachedEOA;
        }
      }

      const wallet = await this.ensureWallet();
      if (!wallet) {
        return null;
      }

      // For default EOA discovery, prefer the highest derived EOA index first
      // so a newly added EOA becomes visible immediately in UI.
      if (!normalizedRequestedAddress) {
        const eoaAddressMap = this.getEOAAddressMapSafe(wallet);
        if (eoaAddressMap.size > 0) {
          const latestIndex = Math.max(...Array.from(eoaAddressMap.keys()));
          const latestAddress = eoaAddressMap.get(latestIndex);
          if (typeof latestAddress === 'string' && latestAddress.length > 0) {
            const eoaInfo = {
              address: latestAddress,
              balance: this.getEvmBalanceByAddress(latestAddress) || '0',
            };
            if (targetPublicKey) {
              await this.saveEOAAddress(targetPublicKey, eoaInfo.address);
            }
            return eoaInfo;
          }
        }

        // Fallback: use any existing EVM account address (older runtime compatibility path).
        const existingEvmAccount = wallet
          .getEVMAccounts()
          .find((account) => typeof account?.address === 'string' && account.address.length > 0);
        if (existingEvmAccount?.address) {
          const eoaInfo = {
            address: existingEvmAccount.address,
            balance: existingEvmAccount.balance || '0',
          };
          if (targetPublicKey) {
            await this.saveEOAAddress(targetPublicKey, eoaInfo.address);
          }
          return eoaInfo;
        }
      }

      const eoaAccount = await this.getEOAAccountSigner(address);
      if (!eoaAccount) {
        return null;
      }

      const eoaInfo = {
        address: eoaAccount.address,
        balance: this.getEvmBalanceByAddress(eoaAccount.address) || '0',
      };

      logger.info('[extension] EOA address from wallet (getEOAAccountInfo)', {
        address: eoaInfo.address,
        source: 'wallet.getEOAAccount',
      });

      // Save to localStorage if we have a public key
      if (targetPublicKey) {
        await this.saveEOAAddress(targetPublicKey, eoaInfo.address);
      }

      return eoaInfo;
    } catch (error) {
      consoleError('Failed to get EOA account info:', error as Error);
      return null;
    }
  }

  async getEOAAccountsInfo(publicKey?: string): Promise<EOAAccountInfo[]> {
    const wallet = await this.ensureWallet();
    if (!wallet) {
      return [];
    }

    const eoaAddressMap = this.getEOAAddressMapSafe(wallet);
    const entries: Array<[number, string]> = Array.from(eoaAddressMap.entries())
      .filter((entry): entry is [number, string] => {
        return typeof entry[0] === 'number' && typeof entry[1] === 'string' && entry[1].length > 0;
      })
      .sort((a, b) => a[0] - b[0]);

    const targetPublicKey = publicKey || userWalletService.getCurrentPubkey();
    const knownEoaAddressSet = new Set<string>(entries.map(([, address]) => address.toLowerCase()));

    // Merge in historically saved EOA addresses from local storage.
    if (targetPublicKey) {
      const storedAddresses = await this.getEOAAddressesFromStorage(targetPublicKey);
      for (const address of storedAddresses) {
        knownEoaAddressSet.add(address);
      }
    }

    // Merge in currently registered EVM accounts; EOAs are a subset and will match derived addresses.
    for (const account of wallet.getEVMAccounts()) {
      if (account?.address) {
        knownEoaAddressSet.add(account.address.toLowerCase());
      }
    }

    // If wallet map is incomplete/empty, recover EOA index mapping by deriving known addresses.
    if (knownEoaAddressSet.size > 0) {
      const existingIndexSet = new Set(entries.map(([index]) => index));
      for (let index = 0; index < WalletManager.EOA_DISCOVERY_INDEX_LIMIT; index += 1) {
        if (existingIndexSet.has(index)) {
          continue;
        }
        const account = await this.deriveEOAAccountByIndex(index);
        if (!account) {
          continue;
        }
        if (knownEoaAddressSet.has(account.address.toLowerCase())) {
          entries.push([index, account.address]);
          existingIndexSet.add(index);
        }
      }
      entries.sort((a, b) => a[0] - b[0]);
    }

    // Backward-compatible fallback when nothing can be recovered.
    if (entries.length === 0) {
      const defaultSigner = await this.getEOAAccountSigner();
      if (!defaultSigner) {
        return [];
      }
      entries.push([defaultSigner.index, defaultSigner.address]);
    }

    const accounts = entries.map(([index, accountAddress]) => ({
      index,
      address: accountAddress,
      balance: this.getEvmBalanceByAddress(accountAddress) || '0',
    }));

    if (targetPublicKey && accounts.length > 0) {
      const latest = accounts[accounts.length - 1];
      await this.saveEOAAddress(targetPublicKey, latest.address);
    }

    return accounts;
  }

  /**
   * Resolve an EOAAccount signer by address (or default index 0 when address is omitted).
   */
  async getEOAAccountSigner(address?: string): Promise<EOAAccountSigner | null> {
    if (!this.wallet) {
      await this.init();
    }
    if (!this.wallet) {
      return null;
    }

    if (!address) {
      return await this.deriveEOAAccountByIndex(0);
    }

    const normalizedAddress = address.toLowerCase();
    const eoaAddressMap = this.getEOAAddressMapSafe(this.wallet);
    const cachedIndex = this.findEOAIndexByAddress(eoaAddressMap, normalizedAddress);
    if (cachedIndex !== undefined) {
      const cachedAccount = await this.deriveEOAAccountByIndex(cachedIndex);
      if (cachedAccount?.address.toLowerCase() === normalizedAddress) {
        return cachedAccount;
      }
    }

    // Runtime-compatible fallback: derive sequentially and match address.
    for (let index = 0; index < WalletManager.EOA_DISCOVERY_INDEX_LIMIT; index += 1) {
      try {
        const account = await this.deriveEOAAccountByIndex(index);
        if (account?.address.toLowerCase() === normalizedAddress) {
          return account;
        }
      } catch (error) {
        if (index === 0) {
          throw error;
        }
        break;
      }
    }

    return null;
  }

  private async ensureWallet(): Promise<Wallet | null> {
    if (!this.wallet) {
      await this.init();
    }
    return this.wallet;
  }

  private findEOAIndexByAddress(
    addressMap: Map<number, string>,
    normalizedAddress: string
  ): number | undefined {
    for (const [index, cachedAddress] of addressMap.entries()) {
      if (cachedAddress.toLowerCase() === normalizedAddress) {
        return index;
      }
    }
    return undefined;
  }

  private getMissingEOAIndexes(addressMap: Map<number, string>): number[] {
    const missing: number[] = [];
    for (let index = 0; index < WalletManager.EOA_DISCOVERY_INDEX_LIMIT; index += 1) {
      if (!addressMap.has(index)) {
        missing.push(index);
      }
    }
    return missing;
  }

  private getEvmBalanceByAddress(address: string): string | undefined {
    if (!this.wallet || typeof address !== 'string' || address.length === 0) {
      return undefined;
    }
    const normalizedAddress = address.toLowerCase();
    const evmAccounts = this.wallet.getEVMAccounts();
    const match = evmAccounts.find(
      (account) =>
        typeof account?.address === 'string' && account.address.toLowerCase() === normalizedAddress
    );
    return match?.balance;
  }

  private getEOAAddressMapSafe(wallet: Wallet): Map<number, string> {
    const eoaAddressMap = (wallet as unknown as { eoaAddressMap?: unknown }).eoaAddressMap;
    if (eoaAddressMap instanceof Map) {
      return eoaAddressMap as Map<number, string>;
    }
    return new Map<number, string>();
  }

  private async deriveEOAAccountByIndex(index: number): Promise<EOAAccountSigner | null> {
    const key = this.seedPhraseKey || this.privateKey;
    if (!key) {
      return null;
    }
    const ethereumKey = key as unknown as Partial<EthereumKeyLike>;
    if (typeof ethereumKey.ethAddress !== 'function') {
      return null;
    }
    const address = await ethereumKey.ethAddress(index);
    if (
      typeof ethereumKey.ethSignTransaction !== 'function' ||
      typeof ethereumKey.ethSignPersonalMessage !== 'function' ||
      typeof ethereumKey.ethSignTypedData !== 'function'
    ) {
      return null;
    }

    return {
      index,
      address,
      signTransaction: async (transaction: EthUnsignedTransaction) =>
        await ethereumKey.ethSignTransaction!(transaction, index),
      signPersonalMessage: async (message: HexLike) =>
        await ethereumKey.ethSignPersonalMessage!(message, index),
      signTypedData: async (typedData: Record<string, unknown>) =>
        await ethereumKey.ethSignTypedData!(typedData, index),
    };
  }

  private async registerEOAInWallet(wallet: Wallet, eoaAccount: EOAAccountSigner): Promise<void> {
    for (const evmNetwork of wallet.getEVMNetworks()) {
      const accountKey = `${evmNetwork.chainId}_${eoaAccount.address}`;
      wallet.setAccount(accountKey, {
        address: eoaAccount.address,
        network: evmNetwork,
        chain: Chain.EVM,
        balance: '0',
      });
    }

    const currentPubKey = userWalletService.getCurrentPubkey();
    if (currentPubKey) {
      await this.saveEOAAddress(currentPubKey, eoaAccount.address);
    }
  }

  private async deriveNextEOAAccount(
    wallet: Wallet
  ): Promise<{ index: number; account: EOAAccountSigner }> {
    const eoaAddressMap = this.getEOAAddressMapSafe(wallet);
    logger.info('[extension-bg] deriveNextEOAAccount start', {
      cachedMapSize: eoaAddressMap.size,
      evmAccountsSize: wallet.getEVMAccounts().length,
    });
    if (eoaAddressMap.size > 0) {
      const existingIndexes = Array.from(eoaAddressMap.keys());
      const nextIndex = Math.max(...existingIndexes) + 1;
      logger.info('[extension-bg] deriveNextEOAAccount using cached map', {
        existingIndexes,
        nextIndex,
      });
      const account = await this.deriveEOAAccountByIndex(nextIndex);
      if (!account) {
        throw new Error('Failed to derive next EOA account');
      }
      return { index: nextIndex, account };
    }

    // Fallback for runtimes where eoaAddressMap is not available yet:
    // derive sequentially and pick the first address not already registered.
    const existingAddresses = new Set(
      wallet
        .getEVMAccounts()
        .map((account) => account?.address)
        .filter((accountAddress): accountAddress is string => typeof accountAddress === 'string')
        .map((accountAddress) => accountAddress.toLowerCase())
    );
    for (let index = 0; index < WalletManager.EOA_DISCOVERY_INDEX_LIMIT; index += 1) {
      try {
        const account = await this.deriveEOAAccountByIndex(index);
        if (
          account &&
          typeof account.address === 'string' &&
          account.address.length > 0 &&
          !existingAddresses.has(account.address.toLowerCase())
        ) {
          logger.info('[extension-bg] deriveNextEOAAccount found available index', {
            index,
            address: account.address,
          });
          return { index, account };
        }
      } catch (error) {
        if (index === 0) {
          logger.error('[extension-bg] deriveNextEOAAccount failed at index 0', error);
          throw error;
        }
        logger.warn('[extension-bg] deriveNextEOAAccount stopped scanning indexes', {
          index,
          error: error instanceof Error ? error.message : String(error),
        });
        break;
      }
    }

    throw new Error('No additional EOA address can be derived from current key type');
  }

  /**
   * Derive and register the next EOA address using BIP44 index progression.
   */
  async addNewEOAAddress(): Promise<{ index: number; address: string }> {
    const wallet = await this.ensureWallet();
    if (!wallet) {
      throw new Error('Wallet is not initialized');
    }
    logger.info('[extension-bg] addNewEOAAddress start');

    // Capability-based check: only keys that can derive index > 0 support multi-EOA.
    try {
      await wallet.getEOAAccount([1]);
    } catch {
      logger.warn('[extension-bg] addNewEOAAddress capability check failed at index 1');
      throw new Error(
        'This profile does not support deriving additional EOA addresses. Please use a seed phrase profile.'
      );
    }

    const { index, account } = await this.deriveNextEOAAccount(wallet);
    await this.registerEOAInWallet(wallet, account);
    logger.info('[extension-bg] addNewEOAAddress success', {
      index,
      address: account.address,
    });
    return { index, address: account.address };
  }

  /**
   * Get all accounts (Flow + EVM) from wallet
   */
  async getAllAccounts(): Promise<{ flowAccounts: any[]; evmAccounts: any[] }> {
    try {
      // Ensure wallet is initialized
      if (!this.wallet) {
        await this.init();
      }

      if (!this.wallet) {
        return { flowAccounts: [], evmAccounts: [] };
      }

      return {
        flowAccounts: this.wallet.getFlowAccounts(),
        evmAccounts: this.wallet.getEVMAccounts(),
      };
    } catch (error) {
      console.error('Failed to get all accounts:', error);
      return { flowAccounts: [], evmAccounts: [] };
    }
  }

  /**
   * Cleanup wallet resources
   */
  private cleanup(): void {
    if (this.wallet) {
      // Remove event listeners
      // Note: Wallet class should provide removeAccountsListener method
      this.wallet = null;
    }
    this.seedPhraseKey = null;
    this.privateKey = null;
    this.currentUid = null;
  }

  /**
   * Clear cached wallet (called when keyring is locked)
   */
  clearKeys(): void {
    this.cleanup();
  }

  /**
   * Check if wallet package is available
   */
  isEOASupported(): boolean {
    try {
      return typeof Wallet !== 'undefined' && typeof SeedPhraseKey !== 'undefined';
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
const walletManager = new WalletManager();
export default walletManager;
