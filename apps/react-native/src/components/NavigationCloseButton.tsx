import { Close } from '@onflow/frw-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { platform } from '@/bridge/PlatformImpl';

export const NavigationCloseButton: React.FC = () => {
  const theme = useTheme();

  const handleClose = () => {
    // Close the React Native workflow
    platform.closeRN();
  };

  return (
    <TouchableOpacity
      onPress={handleClose}
      style={{
        padding: 8,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Close size={15} color={theme.colors.text} />
    </TouchableOpacity>
  );
};
