import { useSendStore } from '@onflow/frw-stores';
import React, { createContext, useContext, useRef, type ReactNode, useState } from 'react';

import { SendBottomSheet, type SendBottomSheetRef } from '@/components/SendBottomSheet';
import { SendWorkflowManager, type SendWorkflowStep } from '@/components/SendWorkflowManager';

interface SendBottomSheetContextType {
  openSend: (initialStep?: SendWorkflowStep, params?: Record<string, unknown>) => void;
  closeSend: () => void;
  navigateToStep: (step: SendWorkflowStep, params?: Record<string, unknown>) => void;
}

const SendBottomSheetContext = createContext<SendBottomSheetContextType | undefined>(undefined);

interface SendBottomSheetProviderProps {
  children: ReactNode;
}

export const SendBottomSheetProvider: React.FC<SendBottomSheetProviderProps> = ({ children }) => {
  const bottomSheetRef = useRef<SendBottomSheetRef>(null);
  const [currentStep, setCurrentStep] = useState<SendWorkflowStep>('SelectTokens');
  const [currentParams, setCurrentParams] = useState<Record<string, unknown> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { clearTransactionData } = useSendStore();

  const openSend = (
    initialStep: SendWorkflowStep = 'SelectTokens',
    params?: Record<string, unknown>
  ) => {
    setCurrentStep(initialStep);
    setCurrentParams(params);
    setIsOpen(true);
    bottomSheetRef.current?.present();
  };

  const closeSend = () => {
    try {
      bottomSheetRef.current?.dismiss();

      // Cleanup timeout to ensure state is reset even if sheet dismiss fails
      setTimeout(() => {
        try {
          setIsOpen(false);
          setCurrentStep('SelectTokens');
          setCurrentParams(null);
          // Clear form data including amount field when workflow closes
          clearTransactionData();
        } catch (error) {
          console.warn('[SendBottomSheetContext] Error during cleanup:', error);
        }
      }, 300);
    } catch (error) {
      console.warn('[SendBottomSheetContext] Error closing send workflow:', error);
      // Force cleanup even if dismiss fails
      setIsOpen(false);
      setCurrentStep('SelectTokens');
      setCurrentParams(null);
      clearTransactionData();
    }
  };

  const navigateToStep = (step: SendWorkflowStep, params?: Record<string, unknown>) => {
    setCurrentStep(step);
    setCurrentParams(params);
  };

  const contextValue: SendBottomSheetContextType = {
    openSend,
    closeSend,
    navigateToStep,
  };

  return (
    <SendBottomSheetContext.Provider value={contextValue}>
      {children}
      <SendBottomSheet ref={bottomSheetRef} onClose={closeSend}>
        {isOpen && (
          <SendWorkflowManager
            currentStep={currentStep}
            params={currentParams}
            onNavigate={navigateToStep}
            onClose={closeSend}
          />
        )}
      </SendBottomSheet>
    </SendBottomSheetContext.Provider>
  );
};

export const useSendBottomSheet = (): SendBottomSheetContextType => {
  const context = useContext(SendBottomSheetContext);
  if (!context) {
    throw new Error('useSendBottomSheet must be used within a SendBottomSheetProvider');
  }
  return context;
};
