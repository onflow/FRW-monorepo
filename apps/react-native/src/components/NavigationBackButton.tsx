import { ArrowBack } from '@onflow/frw-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export const NavigationBackButton: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  if (!navigation.canGoBack()) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{
        padding: 8,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ArrowBack size={24} color={theme.colors.text} />
    </TouchableOpacity>
  );
};
