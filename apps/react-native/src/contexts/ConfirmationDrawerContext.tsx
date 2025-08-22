import type { NFTModel, TokenModel, WalletAccount } from '@onflow/frw-types';
import React, {
  createContext,
  type ReactNode,
  useContext,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import { View } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import {
  ConfirmationBottomSheet,
  type ConfirmationBottomSheetRef,
} from '@/components/ConfirmationBottomSheet';
import { ConfirmationDrawerContent } from '@/components/ConfirmationDrawerContent';

interface FormData {
  tokenAmount: string;
  fiatAmount: string;
}

interface ConfirmationData {
  fromAccount: WalletAccount;
  toAccount: WalletAccount;
  transactionType?: string;
  selectedToken?: TokenModel;
  selectedNFTs?: NFTModel[];
  formData?: FormData;
  children?: ReactNode;
  onConfirm: () => Promise<void>;
}

interface ConfirmationDrawerContextType {
  openConfirmation: (data: ConfirmationData) => void;
  closeConfirmation: () => void;
}

const ConfirmationDrawerContext = createContext<ConfirmationDrawerContextType | undefined>(
  undefined
);

interface ConfirmationDrawerProviderProps {
  children: ReactNode;
}

export const ConfirmationDrawerProvider: React.FC<ConfirmationDrawerProviderProps> = ({
  children,
}) => {
  const bottomSheetRef = useRef<ConfirmationBottomSheetRef>(null);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldPresent, setShouldPresent] = useState(false);

  // Use useLayoutEffect for synchronous DOM updates before paint
  useLayoutEffect(() => {
    if (shouldPresent && confirmationData) {
      bottomSheetRef.current?.present();
      setShouldPresent(false);
    }
  }, [shouldPresent, confirmationData]);

  const openConfirmation = (data: ConfirmationData) => {
    // Set data and trigger present in next layout effect
    setConfirmationData(data);
    setShouldPresent(true);
  };

  const closeConfirmation = () => {
    bottomSheetRef.current?.dismiss();
    // Clear data after a shorter delay to ensure proper cleanup
    setTimeout(() => {
      setConfirmationData(null);
      setIsProcessing(false);
    }, 150);
  };

  const handleConfirm = async () => {
    if (!confirmationData || isProcessing) return;

    // Set processing state BEFORE starting async operation
    setIsProcessing(true);

    try {
      // Execute the confirmation action
      console.log('[ConfirmationDrawer] Executing onConfirm...');
      await confirmationData.onConfirm();

      // After successful confirmation, close the entire React Native view
      // Don't call closeConfirmation() as we're closing the entire view
      console.log('[ConfirmationDrawer] Closing React Native view...');
      NativeFRWBridge.closeRN();
    } catch (error) {
      // If confirmation fails, just close the bottom sheet
      console.error('Confirmation failed:', error);
      closeConfirmation();
      // Reset processing state on error
      setIsProcessing(false);
    }
    // Note: Don't reset isProcessing in finally block since the view is closing
  };

  const contextValue: ConfirmationDrawerContextType = {
    openConfirmation,
    closeConfirmation,
  };

  return (
    <ConfirmationDrawerContext.Provider value={contextValue}>
      {children}
      <ConfirmationBottomSheet ref={bottomSheetRef} onClose={closeConfirmation}>
        {confirmationData ? (
          <ConfirmationDrawerContent
            key={`confirmation-${confirmationData.fromAccount.address}-${confirmationData.toAccount.address}`}
            fromAccount={confirmationData.fromAccount}
            toAccount={confirmationData.toAccount}
            transactionType={confirmationData.transactionType}
            selectedToken={confirmationData.selectedToken}
            selectedNFTs={confirmationData.selectedNFTs}
            formData={confirmationData.formData}
            children={confirmationData.children}
            onClose={closeConfirmation}
            onConfirm={handleConfirm}
            isProcessing={isProcessing}
          />
        ) : (
          // Render empty container to maintain consistent modal height
          <View style={{ minHeight: 200, flex: 1 }} />
        )}
      </ConfirmationBottomSheet>
    </ConfirmationDrawerContext.Provider>
  );
};

export const useConfirmationDrawer = (): ConfirmationDrawerContextType => {
  const context = useContext(ConfirmationDrawerContext);
  if (!context) {
    throw new Error('useConfirmationDrawer must be used within a ConfirmationDrawerProvider');
  }
  return context;
};
