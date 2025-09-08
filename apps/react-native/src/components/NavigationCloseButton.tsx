import { useSendStore } from '@onflow/frw-stores';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';

import { CloseIcon } from './ui/icons/CloseIcon';

interface NavigationCloseButtonProps {
  width?: number;
  height?: number;
  onPress?: () => void;
}

const NavigationCloseButton: React.FC<NavigationCloseButtonProps> = ({
  width = 24,
  height = 24,
  onPress,
}) => {
  const { clearTransactionData } = useSendStore();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Clear form data before closing to prevent persistence
      clearTransactionData();
      // Close the RN bridge
      NativeFRWBridge.closeRN(null);
    }
  };

  return (
    <TouchableOpacity
      style={{ width, height, justifyContent: 'center', alignItems: 'center' }}
      onPress={handlePress}
    >
      <CloseIcon width={15} height={15} />
    </TouchableOpacity>
  );
};

export default NavigationCloseButton;
