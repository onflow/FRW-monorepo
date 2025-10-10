import { ArrowLeft } from '@onflow/frw-icons';
import { IconButton } from '@onflow/frw-ui';
import { useNavigation, useTheme } from '@react-navigation/native';
import React from 'react';

export const NavigationBackButton: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  if (!navigation.canGoBack()) {
    return null;
  }

  return (
    <IconButton
      icon={<ArrowLeft color={theme.colors.text} size={24} width={24} height={24} />}
      variant="ghost"
      size="medium"
      onPress={() => navigation.goBack()}
      mt="$-1" // Move top to reduce padding for iOS26
    />
  );
};
