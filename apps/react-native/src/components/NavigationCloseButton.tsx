import { Close } from '@onflow/frw-icons';
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
      icon={<Close color={theme.colors.text} size={15} />}
      variant="ghost"
      size="small"
      onPress={handleClose}
    />
  );
};
