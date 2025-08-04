import React from 'react';
import { View } from 'react-native';
import { Text } from 'ui';
import { useTheme } from '@/contexts/ThemeContext';

interface ConfirmationHeaderProps {
  onGoBack: () => void;
  onClose: () => void;
}

export const ConfirmationHeader: React.FC<ConfirmationHeaderProps> = ({
  onGoBack: _onGoBack,
  onClose: _onClose,
}) => {
  const { isDark } = useTheme();

  return (
    <View className="h-12 mb-4 items-center justify-center">
      <Text
        className="text-center text-lg font-semibold"
        style={{
          color: isDark ? '#FFFFFF' : '#000000',
          includeFontPadding: false,
        }}
      >
        Summary
      </Text>
    </View>
  );
};
