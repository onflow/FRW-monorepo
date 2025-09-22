import { ArrowBack } from '@onflow/frw-icons';
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
      icon={<ArrowBack color={theme.colors.text} size={24} />}
      variant="ghost"
      size="small"
      onPress={() => navigation.goBack()}
      pl="$1"
    />
  );
};
