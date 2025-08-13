import type { NFTModel, TokenModel, WalletAccount } from '@onflow/frw-types';
import React, { createContext, type ReactNode, useContext, useRef, useState } from 'react';

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

  const openConfirmation = (data: ConfirmationData) => {
    setConfirmationData(data);
    bottomSheetRef.current?.present();
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

    try {
      await confirmationData.onConfirm();
      setIsProcessing(true);
      closeConfirmation();
    } finally {
      setIsProcessing(false);
    }
  };

  const contextValue: ConfirmationDrawerContextType = {
    openConfirmation,
    closeConfirmation,
  };

  return (
    <ConfirmationDrawerContext.Provider value={contextValue}>
      {children}
      <ConfirmationBottomSheet ref={bottomSheetRef} onClose={closeConfirmation}>
        {confirmationData && (
          <ConfirmationDrawerContent
            key={`${confirmationData.fromAccount.address}-${Date.now()}`}
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
