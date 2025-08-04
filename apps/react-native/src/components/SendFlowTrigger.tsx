import React, { useEffect } from 'react';
import { useSendBottomSheet } from '@/contexts/SendBottomSheetContext';

interface SendFlowTriggerProps {
  shouldOpen: boolean;
}

export const SendFlowTrigger: React.FC<SendFlowTriggerProps> = ({ shouldOpen }) => {
  const { openSend } = useSendBottomSheet();

  useEffect(() => {
    if (shouldOpen) {
      // Small delay to ensure the app is fully loaded
      setTimeout(() => {
        openSend('SelectTokens');
      }, 100);
    }
  }, [shouldOpen, openSend]);

  return null; // This component doesn't render anything
};
