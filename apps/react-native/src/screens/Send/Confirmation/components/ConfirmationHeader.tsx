import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { Text } from 'ui';

interface ConfirmationHeaderProps {
  onGoBack: () => void;
  onClose: () => void;
}

export const ConfirmationHeader: React.FC<ConfirmationHeaderProps> = ({
  onGoBack: _onGoBack,
  onClose: _onClose,
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  return (
    <View className="h-12 mb-4 items-center justify-center">
      <Text
        className="text-center font-bold"
        style={{
          fontSize: 16,
          color: isDark ? '#FFFFFF' : '#000000',
          includeFontPadding: false,
        }}
      >
        {t('send.confirmation')}
      </Text>
    </View>
  );
};
