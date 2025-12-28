import { bridge, cadence } from '@onflow/frw-context';
import { flowService } from '@onflow/frw-services';
import {
  type CollectionModel,
  type NFTModel,
  type TokenModel,
  FRWError,
  ErrorCode,
} from '@onflow/frw-types';
import { getNFTResourceIdentifier, getTokenResourceIdentifier, logger } from '@onflow/frw-utils';
import {
  type SendPayload,
  SendTransaction,
  isValidSendTransactionPayload,
} from '@onflow/frw-workflow';
import { create } from 'zustand';

import { useTokenStore } from './tokenStore';
import {
  type AccessibleAssetStore,
  type BalanceData,
  type SendFormData,
  type SendState,
  type TransactionType,
  type WalletAccount,
} from './types';

// Helper function to format amount
function formatAmount(val: string | number | undefined | null): string {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(num) ? '0' : num.toString();
}

// Default form data
const defaultFormData: SendFormData = {
  tokenAmount: '0',
  fiatAmount: '0.00',
  transactionFee: '0.001',
  isTokenMode: true,
};

export const useSendStore = create<SendState>((set, get) => ({
  // Initial state
  selectedToken: null,
  fromAccount: null,
  toAccount: null,
  transactionType: 'tokens',
  formData: defaultFormData,
  selectedNFTs: [],
  currentNFT: null,
  selectedNFTQuantities: {},
  selectedCollection: null,
  currentStep: 'select-tokens',
  isLoading: false,
  error: null,

  // Balance state
  balances: {
    coa: {},
    evm: {},
  },

  // Accessible asset stores state - keyed by address
  accessibleAssetStores: {},

  // Actions
  setSelectedToken: (token: TokenModel | null) => set({ selectedToken: token, error: null }),

  setFromAccount: (account: WalletAccount | null) => set({ fromAccount: account, error: null }),

  setToAccount: (account: WalletAccount | null) => set({ toAccount: account, error: null }),

  setCurrentNFT: (nft: NFTModel | null) => set({ currentNFT: nft, error: null }),

  setTransactionType: (type: TransactionType) =>
    set((state) => {
      // Clear transaction-specific data when switching types
      const updates: Partial<SendState> = {
        transactionType: type,
        error: null,
      };

      // If switching from tokens to NFT, clear token-specific data
      if (state.transactionType === 'tokens' && ['single-nft', 'multiple-nfts'].includes(type)) {
        updates.selectedToken = null;
        updates.formData = { ...defaultFormData };
      }

      // If switching from NFT to tokens, clear NFT-specific data
      if (['single-nft', 'multiple-nfts'].includes(state.transactionType) && type === 'tokens') {
        updates.selectedNFTs = [];
      }

      return { ...state, ...updates };
    }),

  updateFormData: (updates: Partial<SendFormData>) =>
    set((state) => ({
      formData: { ...state.formData, ...updates },
      error: null,
    })),

  setSelectedNFTs: (nfts: NFTModel[]) =>
    set((state) => {
      // Initialize quantities for ERC1155 NFTs
      const newQuantities = { ...state.selectedNFTQuantities };
      nfts.forEach((nft) => {
        if (nft.contractType === 'ERC1155' && nft.id && !newQuantities[nft.id]) {
          // Initialize with 1 if not already set
          newQuantities[nft.id] = 1;
          logger.debug('[sendStore] Initializing ERC1155 quantity:', {
            nftId: nft.id,
            contractType: nft.contractType,
            nftAmount: nft.amount,
          });
        }
      });
      return {
        selectedNFTs: nfts,
        selectedNFTQuantities: newQuantities,
        error: null,
      };
    }),
  setSelectedCollection: (collection: CollectionModel | null) =>
    set({ selectedCollection: collection, error: null }),

  addSelectedNFT: (nft: NFTModel) =>
    set((state) => {
      const exists = state.selectedNFTs.find((n) => n.id === nft.id);
      if (exists) return state;

      // Initialize quantity for ERC1155 NFT
      const newQuantities = { ...state.selectedNFTQuantities };
      if (nft.contractType === 'ERC1155' && nft.id && !newQuantities[nft.id]) {
        newQuantities[nft.id] = 1;
        logger.debug('[sendStore] Initializing ERC1155 quantity on add:', {
          nftId: nft.id,
          contractType: nft.contractType,
          nftAmount: nft.amount,
        });
      }

      return {
        selectedNFTs: [...state.selectedNFTs, nft],
        selectedNFTQuantities: newQuantities,
        error: null,
      };
    }),

  removeSelectedNFT: (nftId: string) =>
    set((state) => {
      const newQuantities = { ...state.selectedNFTQuantities };
      delete newQuantities[nftId];
      return {
        selectedNFTs: state.selectedNFTs.filter((n) => n.id !== nftId),
        selectedNFTQuantities: newQuantities,
        error: null,
      };
    }),

  setNFTQuantity: (nftId: string, quantity: number) =>
    set((state) => ({
      selectedNFTQuantities: {
        ...state.selectedNFTQuantities,
        [nftId]: quantity,
      },
    })),

  getNFTQuantity: (nftId: string) => {
    const state = get();
    return state.selectedNFTQuantities[nftId] || 1;
  },

  setCurrentStep: (step: SendState['currentStep']) => set({ currentStep: step, error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error, isLoading: false }),

  // Balance actions
  fetchCoaBalance: async (flowAddress: string) => {
    const currentBalances = get().balances;

    // Set loading state for this address
    set({
      balances: {
        ...currentBalances,
        coa: {
          ...currentBalances.coa,
          [flowAddress]: {
            ...currentBalances.coa[flowAddress],
            loading: true,
            error: null,
          },
        },
      },
    });

    try {
      const flow = flowService();
      const balance = await flow.getCoaBalance(flowAddress);

      const updatedBalances = get().balances;
      set({
        balances: {
          ...updatedBalances,
          coa: {
            ...updatedBalances.coa,
            [flowAddress]: {
              balance,
              loading: false,
              error: null,
              lastFetched: Date.now(),
            },
          },
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch COA balance';
      const updatedBalances = get().balances;
      set({
        balances: {
          ...updatedBalances,
          coa: {
            ...updatedBalances.coa,
            [flowAddress]: {
              balance: null,
              loading: false,
              error: errorMessage,
              lastFetched: null,
            },
          },
        },
      });
    }
  },

  fetchEvmBalance: async (evmAddress: string) => {
    const currentBalances = get().balances;

    // Set loading state for this address
    set({
      balances: {
        ...currentBalances,
        evm: {
          ...currentBalances.evm,
          [evmAddress]: {
            ...currentBalances.evm[evmAddress],
            loading: true,
            error: null,
          },
        },
      },
    });

    try {
      const flow = flowService();
      const balance = await flow.getEvmBalance(evmAddress);

      const updatedBalances = get().balances;
      set({
        balances: {
          ...updatedBalances,
          evm: {
            ...updatedBalances.evm,
            [evmAddress]: {
              balance,
              loading: false,
              error: null,
              lastFetched: Date.now(),
            },
          },
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch EVM balance';
      const updatedBalances = get().balances;
      set({
        balances: {
          ...updatedBalances,
          evm: {
            ...updatedBalances.evm,
            [evmAddress]: {
              balance: null,
              loading: false,
              error: errorMessage,
              lastFetched: null,
            },
          },
        },
      });
    }
  },

  getCoaBalance: (flowAddress: string) => {
    return get().balances.coa[flowAddress] || null;
  },

  getEvmBalance: (evmAddress: string) => {
    return get().balances.evm[evmAddress] || null;
  },

  // Accessible asset store management
  getAccessibleAssetStore: (address: string) => {
    return get().accessibleAssetStores[address] || null;
  },

  setAccessibleAssetStore: (address: string, store: AccessibleAssetStore) => {
    set((state) => ({
      accessibleAssetStores: {
        ...state.accessibleAssetStores,
        [address]: store,
      },
    }));
  },

  clearAccessibleAssetStore: (address: string) => {
    set((state) => {
      const newStores = { ...state.accessibleAssetStores };
      delete newStores[address];
      return { accessibleAssetStores: newStores };
    });
  },

  clearAllAccessibleAssetStores: () => {
    set({ accessibleAssetStores: {} });
  },

  clearBalances: () => {
    set(() => ({
      balances: {
        coa: {},
        evm: {},
      },
    }));
  },

  clearBalanceForAddress: (type: 'coa' | 'evm', address: string) => {
    set((state) => {
      const newBalances = { ...state.balances };
      delete newBalances[type][address];
      return { balances: newBalances };
    });
  },

  resetSendFlow: () =>
    set({
      selectedToken: null,
      fromAccount: null,
      toAccount: null,
      transactionType: 'tokens',
      formData: defaultFormData,
      selectedNFTs: [],
      selectedNFTQuantities: {},
      currentStep: 'select-tokens',
      isLoading: false,
      error: null,
      balances: {
        coa: {},
        evm: {},
      },
      accessibleAssetStores: {},
    }),

  // Clear transaction-specific data while preserving accounts
  clearTransactionData: () =>
    set({
      selectedToken: null,
      selectedNFTs: [],
      selectedNFTQuantities: {},
      formData: defaultFormData,
      transactionType: 'tokens',
      currentStep: 'select-tokens',
      error: null,
    }),

  // Create send payload for transaction execution
  createSendPayload: async (): Promise<SendPayload | null> => {
    const state = get();
    logger.info('[SendStore] createSendPayload -- state:', state);
    const { fromAccount, toAccount, selectedToken, selectedNFTs, formData, transactionType } =
      state;

    if (!fromAccount || !toAccount) {
      logger.error('[SendStore] Missing fromAccount or toAccount');
      return null;
    }

    const isTokenTransaction = transactionType === 'tokens';
    const isNFTTransaction = ['single-nft', 'multiple-nfts'].includes(transactionType);

    if (isTokenTransaction && !selectedToken) {
      logger.error('[SendStore] Missing selectedToken for token transaction');
      return null;
    }

    if (isNFTTransaction && selectedNFTs.length === 0) {
      logger.error('[SendStore] Missing selectedNFTs for NFT transaction');
      return null;
    }

    try {
      // Get wallet accounts for child addresses and COA
      const { accounts } = await bridge.getWalletAccounts();
      const selectedAccount = await bridge.getSelectedAccount();
      logger.info('[SendStore] createSendPayload -- Selected account:', selectedAccount);
      logger.info('[SendStore] createSendPayload -- Accounts:', accounts);
      const mainAccount =
        selectedAccount.type === 'main'
          ? selectedAccount
          : accounts.find(
              (account) =>
                account.type === 'main' && account.address === selectedAccount.parentAddress
            );
      let coaAddr: string =
        accounts.filter(
          (account) => account.type === 'evm' && account.parentAddress === mainAccount?.address
        )[0]?.address || '';

      // Fallback: fetch COA via cadence if missing
      if (!coaAddr && mainAccount?.address) {
        try {
          const fetched = await cadence.getAddr(mainAccount.address);
          if (fetched) {
            // cadence.getAddr returns without 0x; normalize
            coaAddr = fetched.startsWith('0x') ? fetched : `0x${fetched}`;
          }
        } catch (err) {
          logger.warn('[SendStore] Failed to fetch COA address from cadence', err);
        }
      }
      const childAddrs = accounts
        .filter(
          (account) => account.type === 'child' && account.parentAddress === mainAccount?.address
        )
        .map((account) => account.address);

      if (!mainAccount) {
        logger.error('[SendStore] No main account found');
        return null;
      }
      let contractAddress = isTokenTransaction
        ? selectedToken?.contractAddress || selectedToken?.evmAddress || ''
        : selectedNFTs[0]?.contractAddress || selectedNFTs[0]?.evmAddress || '';

      // Fallback: resolve missing EVM token contract address from tokenStore cache
      if (isTokenTransaction && contractAddress === '' && selectedToken) {
        const network = bridge.getNetwork?.() || 'mainnet';
        const tokens =
          useTokenStore.getState().getTokensForAddress(fromAccount.address, network) || [];
        const matched = tokens.find((token) => {
          if (selectedToken.identifier && token.identifier === selectedToken.identifier) {
            return true;
          }
          if (
            selectedToken.contractAddress &&
            token.contractAddress === selectedToken.contractAddress
          ) {
            return true;
          }
          if (selectedToken.symbol && token.symbol === selectedToken.symbol) {
            return true;
          }
          return false;
        });
        if (matched) {
          contractAddress = matched.contractAddress || matched.evmAddress || contractAddress;
          logger.debug('[SendStore] Resolved missing token contract address from tokenStore', {
            matchedIdentifier: matched.identifier,
            matchedSymbol: matched.symbol,
            matchedContract: matched.contractAddress,
            resolvedAddress: contractAddress,
          });
        }
      }

      // For ERC1155 NFTs, we need to include the amount/quantity
      let nftAmount = '';
      if (isNFTTransaction && selectedNFTs.length > 0) {
        const firstNFT = selectedNFTs[0];
        logger.debug('[sendStore] Processing NFT for payload:', {
          nftId: firstNFT.id,
          contractType: firstNFT.contractType,
          nftAmount: firstNFT.amount,
          selectedNFTQuantities: state.selectedNFTQuantities,
        });
        // Check if it's an ERC1155 NFT
        if (firstNFT.contractType === 'ERC1155') {
          const nftId = firstNFT.id || '';
          const quantity = state.selectedNFTQuantities[nftId] || 1;
          nftAmount = quantity.toString();
          logger.debug('[sendStore] ERC1155 amount set:', {
            nftId,
            quantity,
            nftAmount,
          });
        }
      }

      // Get the flow identifier for the transaction
      const nftIdentifier = isNFTTransaction ? getNFTResourceIdentifier(selectedNFTs[0]) : null;
      const tokenIdentifier = isTokenTransaction ? getTokenResourceIdentifier(selectedToken) : null;
      const flowIdentifier = tokenIdentifier || nftIdentifier || '';

      logger.debug('[sendStore] Flow identifier calculation:', {
        isNFTTransaction,
        isTokenTransaction,
        nftIdentifier,
        tokenIdentifier,
        flowIdentifier,
        selectedNFT: selectedNFTs[0]
          ? {
              id: selectedNFTs[0].id,
              address: selectedNFTs[0].address,
              contractName: selectedNFTs[0].contractName,
              flowIdentifier: selectedNFTs[0].flowIdentifier,
              evmAddress: selectedNFTs[0].evmAddress,
            }
          : null,
      });

      const payload: SendPayload = {
        type: isTokenTransaction ? 'token' : 'nft',
        assetType: senderType,
        proposer: mainAccount.address,
        receiver: toAccount.address,
        flowIdentifier,
        sender: fromAccount.address,
        childAddrs: childAddrs,
        ids: isNFTTransaction
          ? (selectedNFTs
              .map((nft) =>
                nft.id !== null && nft.id !== undefined ? parseInt(nft.id as string) : undefined
              )
              .filter((id) => typeof id === 'number' && !isNaN(id)) as number[])
          : [],
        amount: isTokenTransaction ? formatAmount(formData.tokenAmount) : nftAmount,
        decimal: selectedToken?.decimal || 8,
        coaAddr: coaAddr,
        isCrossVM,
        tokenContractAddr: contractAddress,
      };

      logger.debug('[SendStore] Created send payload:', payload);
      return payload;
    } catch (error) {
      logger.error('[SendStore] Error creating send payload:', error);
      return null;
    }
  },

  // Execute transaction with proper error handling
  executeTransaction: async (): Promise<any> => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      // Create payload
      const payload = await state.createSendPayload();

      if (!payload) {
        throw new Error('Failed to create transaction payload');
      }

      // Validate payload
      if (!isValidSendTransactionPayload(payload)) {
        throw new Error('Invalid transaction payload');
      }

      logger.debug('[SendStore] Executing transaction with payload:', payload);

      const helpers = {
        ethSign: bridge.ethSign ? (data: Uint8Array) => bridge.ethSign(data) : undefined,
        network: bridge.getNetwork ? bridge.getNetwork() : undefined,
      };

      // Get cadence service and execute transaction
      const result = await SendTransaction(payload, cadence, helpers);

      logger.debug('[SendStore] Transaction result:', result);

      // Reset flow on success
      set({ isLoading: false });
      state.resetSendFlow();

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      logger.error('[SendStore] Transaction error:', error);

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw new FRWError(ErrorCode.TRANSACTION_ERROR, errorMessage);
    }
  },

  // Get transaction details formatted for UI display
  getTransactionDetailsForDisplay: () => {
    const state = get();
    const { transactionType, selectedToken, selectedNFTs, formData } = state;

    const isTokenTransaction = transactionType === 'tokens';
    const isNFTTransaction = ['single-nft', 'multiple-nfts'].includes(transactionType);

    return {
      isTokenTransaction,
      isNFTTransaction,
      tokenAmount: isTokenTransaction ? formData.tokenAmount : undefined,
      tokenSymbol: selectedToken?.symbol,
      tokenName: selectedToken?.name,
      nftCount: isNFTTransaction ? selectedNFTs.length : undefined,
      networkFee: '~0.001 FLOW', // This could be made dynamic
    };
  },
}));

// Selectors for better performance and easier usage
export const sendSelectors = {
  // State selectors
  selectedToken: (state: SendState) => state.selectedToken,
  fromAccount: (state: SendState) => state.fromAccount,
  toAccount: (state: SendState) => state.toAccount,
  formData: (state: SendState) => state.formData,
  selectedNFTs: (state: SendState) => state.selectedNFTs,
  currentStep: (state: SendState) => state.currentStep,
  isLoading: (state: SendState) => state.isLoading,
  error: (state: SendState) => state.error,

  // Computed selectors
  isTokensFlow: (state: SendState) => state.transactionType === 'tokens',
  isNFTFlow: (state: SendState) => ['single-nft', 'multiple-nfts'].includes(state.transactionType),
  isMultipleNFTsFlow: (state: SendState) => state.transactionType === 'multiple-nfts',
  hasSelectedToken: (state: SendState) => !!state.selectedToken,
  hasFromAccount: (state: SendState) => !!state.fromAccount,
  hasToAccount: (state: SendState) => !!state.toAccount,
  hasSelectedNFTs: (state: SendState) => state.selectedNFTs.length > 0,
  selectedNFTsCount: (state: SendState) => state.selectedNFTs.length,

  // Balance selectors
  getCoaBalance: (state: SendState) => (flowAddress: string) =>
    state.balances.coa[flowAddress] || null,
  getEvmBalance: (state: SendState) => (evmAddress: string) =>
    state.balances.evm[evmAddress] || null,
  getAllCoaBalances: (state: SendState) => state.balances.coa,
  getAllEvmBalances: (state: SendState) => state.balances.evm,

  // Accessible asset store selectors
  getAccessibleAssetStore: (state: SendState) => (address: string) =>
    state.accessibleAssetStores[address] || null,
  getAllAccessibleAssetStores: (state: SendState) => state.accessibleAssetStores,

  // Validation selectors
  canProceedFromSelectTokens: (state: SendState) =>
    !!state.selectedToken || state.selectedNFTs.length > 0,
  canProceedFromSendTo: (state: SendState) => !!state.toAccount,
  canProceedFromSendTokens: (state: SendState) =>
    !!state.selectedToken && !!state.toAccount && parseFloat(state.formData.tokenAmount) > 0,
  canConfirmTransaction: (state: SendState) => {
    const baseValid = !!state.fromAccount && !!state.toAccount;

    if (state.transactionType === 'tokens') {
      return baseValid && !!state.selectedToken && parseFloat(state.formData.tokenAmount) > 0;
    }

    return baseValid && state.selectedNFTs.length > 0;
  },
};

// Helper functions for common operations
export const sendHelpers = {
  // Get transaction summary for confirmation screen
  getTransactionSummary: () => {
    const state = useSendStore.getState();

    return {
      type: state.transactionType,
      from: state.fromAccount,
      to: state.toAccount,
      token: state.selectedToken,
      amount: state.formData.tokenAmount,
      fiatValue: state.formData.fiatAmount,
      fee: state.formData.transactionFee,
      nfts: state.selectedNFTs,
    };
  },

  // Reset to specific step (useful for navigation)
  goToStep: (step: SendState['currentStep']) => {
    const { setCurrentStep } = useSendStore.getState();
    setCurrentStep(step);
  },

  // Clear errors
  clearError: () => {
    const { setError } = useSendStore.getState();
    setError(null);
  },

  // Balance helpers
  refreshCoaBalance: (flowAddress: string) => {
    const { fetchCoaBalance } = useSendStore.getState();
    return fetchCoaBalance(flowAddress);
  },

  refreshEvmBalance: (evmAddress: string) => {
    const { fetchEvmBalance } = useSendStore.getState();
    return fetchEvmBalance(evmAddress);
  },

  isBalanceStale: (balanceData: BalanceData | null, maxAgeMs: number = 30000) => {
    if (!balanceData?.lastFetched) return true;
    return Date.now() - balanceData.lastFetched > maxAgeMs;
  },
};
