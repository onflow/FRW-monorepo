import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';

import { Text } from 'ui';

import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24 }) => {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="p-2 rounded-full bg-background-muted"
      accessibilityLabel={isDark ? t('common.switchToLightMode') : t('common.switchToDarkMode')}
    >
      <Text style={{ fontSize: size }}>{isDark ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
};
