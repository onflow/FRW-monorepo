import { ArrowLeft } from '@onflow/frw-icons';
import { IconButton } from '@onflow/frw-ui';
import { useNavigation, useTheme, useRoute } from '@react-navigation/native';
import React from 'react';

export const NavigationBackButton: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const route = useRoute();

  if (!navigation.canGoBack()) {
    return null;
  }

  const handlePress = () => {
    // Special handling for BackupOptions screen - trigger warning dialog
    if (route.name === 'BackupOptions') {
      const handler = (globalThis as any).__backupOptionsBackHandler;
      if (handler && handler()) {
        // Handler returned true to prevent navigation and show warning
        return;
      }
    }

    // Default behavior - navigate back
    navigation.goBack();
  };

  return (
    <IconButton
      icon={<ArrowLeft color={theme.colors.text} size={24} width={24} height={24} />}
      variant="ghost"
      size="medium"
      onPress={handlePress}
      ml={10}
    />
  );
};
