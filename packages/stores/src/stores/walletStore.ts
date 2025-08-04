import { create } from 'zustand';

import { FlowService } from '../service';

// import NativeFRWBridge from '@/bridge/NativeFRWBridge'; // TODO: Update import path when bridge is available

// Simple wallet account - only account identity, no financial data
interface WalletAccount {
  id: string;
  name: string;
  emoji: string;
  avatar?: string;
  address: string;
  type: 'main' | 'child' | 'evm';
  isActive: boolean;
}

interface WalletStoreState {
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;
  isLoading: boolean;
  error: string | null;
}

interface WalletStoreActions {
  // Core bridge operations
  loadAccountsFromBridge: () => Promise<void>;
  setActiveAccount: (account: WalletAccount) => void;

  // Utilities
  getAccountByAddress: (address: string) => WalletAccount | null;
  clearCache: () => void;
}

type WalletStore = WalletStoreState & WalletStoreActions;

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  accounts: [],
  activeAccount: null,
  isLoading: false,
  error: null,

  // Load clean account data from bridge
  loadAccountsFromBridge: async () => {
    set({ isLoading: true, error: null });

    try {
      const service = FlowService.getInstance();
      const walletAccountsData = await service.getWalletAccounts();

      if (!Array.isArray(walletAccountsData.accounts)) {
        throw new Error('Invalid accounts data from bridge');
      }

      // Clean account data - only identity information
      const accounts: WalletAccount[] = walletAccountsData.accounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        emoji: account.emoji,
        avatar: account.avatar,
        address: account.address,
        type: account.type,
        isActive: account.isActive,
      }));

      // Find active account
      const activeAccount = accounts.find((acc) => acc.isActive) || accounts[0] || null;

      set({
        accounts,
        activeAccount,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        accounts: [],
        activeAccount: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load accounts',
      });
    }
  },

  // Set active account
  setActiveAccount: (account: WalletAccount) => {
    set((state) => ({
      accounts: state.accounts.map((acc) => ({
        ...acc,
        isActive: acc.address === account.address,
      })),
      activeAccount: { ...account, isActive: true },
    }));
  },

  // Get account by address
  getAccountByAddress: (address: string) => {
    return get().accounts.find((acc) => acc.address === address) || null;
  },

  // Clear cache
  clearCache: () => {
    set({
      accounts: [],
      activeAccount: null,
      isLoading: false,
      error: null,
    });
  },
}));

// Selectors for easy access
export const walletSelectors = {
  // Get all accounts
  getAllAccounts: (state: WalletStore) => state.accounts,

  // Get active account
  getActiveAccount: (state: WalletStore) => state.activeAccount,

  // Get account by address
  getAccountByAddress: (address: string) => (state: WalletStore) =>
    state.accounts.find((acc) => acc.address === address) || null,

  // Get accounts by type
  getAccountsByType: (type: 'main' | 'child' | 'evm') => (state: WalletStore) =>
    state.accounts.filter((acc) => acc.type === type),

  // Get loading state
  getLoadingState: (state: WalletStore) => ({
    isLoading: state.isLoading,
    error: state.error,
  }),
};

// Helper functions for common patterns
export const walletHelpers = {
  // Initialize wallet data from bridge
  initializeWallet: async () => {
    const store = useWalletStore.getState();

    // Load account identity data from bridge
    await store.loadAccountsFromBridge();

    const accounts = store.accounts;
    return accounts;
  },

  // Get account by address
  getAccountByAddress: (address: string) => {
    const store = useWalletStore.getState();
    return store.getAccountByAddress(address);
  },

  // Get all accounts
  getAllAccounts: () => {
    const store = useWalletStore.getState();
    return store.accounts;
  },

  // Get active account
  getActiveAccount: () => {
    const store = useWalletStore.getState();
    return store.activeAccount;
  },

  // Set active account
  setActiveAccount: (account: WalletAccount) => {
    const store = useWalletStore.getState();
    store.setActiveAccount(account);
  },
};
