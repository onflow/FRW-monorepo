import type { WalletAccount } from '@onflow/frw-types';
import { create } from 'zustand';

/**
 * ReceiveStore - manages state for the receive screen
 * QR code generation is now handled client-side via react-native-qrcode-styled
 */
export interface ReceiveState {
  // Selected account to receive funds
  selectedAccount: WalletAccount | null;

  // Actions
  setSelectedAccount: (account: WalletAccount | null) => void;
  reset: () => void;
}

export const useReceiveStore = create<ReceiveState>((set) => ({
  // Initial state
  selectedAccount: null,

  // Actions
  setSelectedAccount: (account: WalletAccount | null) => {
    set({ selectedAccount: account });
  },

  reset: () => {
    set({
      selectedAccount: null,
    });
  },
}));

// Selectors for better performance
export const receiveSelectors = {
  selectedAccount: (state: ReceiveState) => state.selectedAccount,
};

// Helper functions
export const receiveHelpers = {
  // Get receive summary for display
  getReceiveSummary: () => {
    const state = useReceiveStore.getState();
    return {
      account: state.selectedAccount,
      address: state.selectedAccount?.address || '',
    };
  },
};
