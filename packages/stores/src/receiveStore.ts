import { bridge } from '@onflow/frw-context';
import type { WalletAccount } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';
import { create } from 'zustand';

export interface ReceiveState {
  // Selected account to receive funds
  selectedAccount: WalletAccount | null;

  // QR code data URL
  qrCodeDataUrl: string | null;

  // Loading states
  isGeneratingQR: boolean;
  isLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  setSelectedAccount: (account: WalletAccount | null) => void;
  generateQRCode: (address: string) => Promise<void>;
  clearQRCode: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useReceiveStore = create<ReceiveState>((set, get) => ({
  // Initial state
  selectedAccount: null,
  qrCodeDataUrl: null,
  isGeneratingQR: false,
  isLoading: false,
  error: null,

  // Actions
  setSelectedAccount: (account: WalletAccount | null) => {
    set({ selectedAccount: account, error: null });

    // Auto-generate QR code when account is selected
    if (account?.address) {
      const { generateQRCode } = get();
      void generateQRCode(account.address);
    }
  },

  generateQRCode: async (address: string) => {
    set({ isGeneratingQR: true, error: null });

    try {
      // Generate QR code using bridge
      const qrDataUrl = await bridge.generateQRCode(address);

      set({
        qrCodeDataUrl: qrDataUrl,
        isGeneratingQR: false,
        error: null,
      });

      logger.debug('[ReceiveStore] QR code generated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
      logger.error('[ReceiveStore] Error generating QR code:', error);

      set({
        qrCodeDataUrl: null,
        isGeneratingQR: false,
        error: errorMessage,
      });
    }
  },

  clearQRCode: () => {
    set({ qrCodeDataUrl: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false, isGeneratingQR: false });
  },

  reset: () => {
    set({
      selectedAccount: null,
      qrCodeDataUrl: null,
      isGeneratingQR: false,
      isLoading: false,
      error: null,
    });
  },
}));

// Selectors for better performance
export const receiveSelectors = {
  selectedAccount: (state: ReceiveState) => state.selectedAccount,
  qrCodeDataUrl: (state: ReceiveState) => state.qrCodeDataUrl,
  isGeneratingQR: (state: ReceiveState) => state.isGeneratingQR,
  isLoading: (state: ReceiveState) => state.isLoading,
  error: (state: ReceiveState) => state.error,
  hasQRCode: (state: ReceiveState) => !!state.qrCodeDataUrl,
  hasError: (state: ReceiveState) => !!state.error,
};

// Helper functions
export const receiveHelpers = {
  // Get receive summary for display
  getReceiveSummary: () => {
    const state = useReceiveStore.getState();
    return {
      account: state.selectedAccount,
      address: state.selectedAccount?.address || '',
      qrCode: state.qrCodeDataUrl,
    };
  },

  // Clear error
  clearError: () => {
    const { setError } = useReceiveStore.getState();
    setError(null);
  },

  // Regenerate QR code
  regenerateQRCode: async () => {
    const { selectedAccount, generateQRCode } = useReceiveStore.getState();
    if (selectedAccount?.address) {
      await generateQRCode(selectedAccount.address);
    }
  },
};
