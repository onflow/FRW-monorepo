import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import React from 'react';
import { TouchableOpacity } from 'react-native';
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
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      NativeFRWBridge.closeRN();
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
