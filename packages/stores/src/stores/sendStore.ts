import { type NFTModel, type TokenInfo, addressType } from '@onflow/frw-types';
import { type SendPayload, isFlowToken } from '@onflow/frw-workflow';
import { create } from 'zustand';

import { FlowService } from '../service';
import {
  type SendFormData,
  type SendState,
  type TransactionType,
  type WalletAccount,
  type BalanceData,
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
  currentStep: 'select-tokens',
  isLoading: false,
  error: null,

  // Balance state
  balances: {
    coa: {},
    evm: {},
  },

  // Actions
  setSelectedToken: (token: TokenInfo | null) => set({ selectedToken: token, error: null }),

  setFromAccount: (account: WalletAccount | null) => set({ fromAccount: account, error: null }),

  setToAccount: (account: WalletAccount | null) => set({ toAccount: account, error: null }),

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

  setSelectedNFTs: (nfts: NFTModel[]) => set({ selectedNFTs: nfts, error: null }),

  addSelectedNFT: (nft: NFTModel) =>
    set((state) => {
      const exists = state.selectedNFTs.find((n) => n.id === nft.id);
      if (exists) return state;

      return {
        selectedNFTs: [...state.selectedNFTs, nft],
        error: null,
      };
    }),

  removeSelectedNFT: (nftId: string) =>
    set((state) => ({
      selectedNFTs: state.selectedNFTs.filter((n) => n.id !== nftId),
      error: null,
    })),

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
      const flowService = FlowService.getInstance();
      const balance = await flowService.getCoaBalance(flowAddress);

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
      const flowService = FlowService.getInstance();
      const balance = await flowService.getEvmBalance(evmAddress);

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
      currentStep: 'select-tokens',
      isLoading: false,
      error: null,
      balances: {
        coa: {},
        evm: {},
      },
    }),

  // Clear transaction-specific data while preserving accounts
  clearTransactionData: () =>
    set({
      selectedToken: null,
      selectedNFTs: [],
      formData: defaultFormData,
      transactionType: 'tokens',
      currentStep: 'select-tokens',
      error: null,
    }),

  // Create send payload for transaction execution
  createSendPayload: async (): Promise<SendPayload | null> => {
    const state = get();
    const { fromAccount, toAccount, selectedToken, selectedNFTs, formData, transactionType } =
      state;

    if (!fromAccount || !toAccount) {
      console.error('[SendStore] Missing fromAccount or toAccount');
      return null;
    }

    const isTokenTransaction = transactionType === 'tokens';
    const isNFTTransaction = ['single-nft', 'multiple-nfts'].includes(transactionType);

    if (isTokenTransaction && !selectedToken) {
      console.error('[SendStore] Missing selectedToken for token transaction');
      return null;
    }

    if (isNFTTransaction && selectedNFTs.length === 0) {
      console.error('[SendStore] Missing selectedNFTs for NFT transaction');
      return null;
    }

    try {
      // Get wallet accounts for child addresses and COA
      const flowService = FlowService.getInstance();
      const { accounts } = await flowService.getWalletAccounts();
      const coaAddr = accounts.filter((account) => account.type === 'evm')[0]?.address || '';
      const childAddrs = accounts
        .filter((account) => account.type === 'child')
        .map((account) => account.address);
      const mainAccount = accounts.filter((account) => account.type === 'main')[0];

      if (!mainAccount) {
        console.error('[SendStore] No main account found');
        return null;
      }

      const payload: SendPayload = {
        type: isTokenTransaction ? 'token' : 'nft',
        assetType: addressType(fromAccount.address),
        proposer: mainAccount.address,
        receiver: toAccount.address,
        flowIdentifier: selectedToken?.identifier || '',
        sender: fromAccount.address,
        childAddrs: childAddrs,
        ids: isNFTTransaction
          ? (selectedNFTs
              .map((nft) => (nft.id !== null && nft.id !== undefined ? parseInt(nft.id as string) : undefined))
              .filter((id) => typeof id === 'number' && !isNaN(id)) as number[])
          : [],
        amount: isTokenTransaction ? formatAmount(formData.tokenAmount) : '',
        decimal: selectedToken?.decimal || 8,
        coaAddr: coaAddr,
        // For Flow tokens, contract address can be empty since they're identified by flowIdentifier
        tokenContractAddr:
          selectedToken && selectedToken.identifier && isFlowToken(selectedToken.identifier)
            ? ''
            : selectedToken?.contractAddress || '',
      };

      console.log('[SendStore] Created send payload:', payload);
      return payload;
    } catch (error) {
      console.error('[SendStore] Error creating send payload:', error);
      return null;
    }
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
