import { X } from '@onflow/frw-icons';
import { IconButton } from '@onflow/frw-ui';
import { useTheme } from '@react-navigation/native';
import React from 'react';

import { platform } from '@/bridge/PlatformImpl';

export const NavigationCloseButton: React.FC = () => {
  const theme = useTheme();

  const handleClose = () => {
    // Close the React Native workflow
    platform.closeRN();
  };

  return (
    <IconButton
      icon={<X color={theme.colors.text} size={24} width={24} height={24} />}
      variant="ghost"
      size="medium"
      onPress={handleClose}
      mt="$-1" // Move top to reduce padding
      // mr="$-2" // Move right to reduce padding
      // pr="$2" // Add some internal padding
    />
  );
};
