import { ArrowDown } from '@onflow/frw-icons';
import React from 'react';
import { YStack, useTheme } from 'tamagui';

import { Text } from '../foundation/Text';

export interface SendArrowDividerProps {
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  variant?: 'arrow' | 'text';
  text?: string;
  padding?: number;
  margin?: number;
}

export const SendArrowDivider: React.FC<SendArrowDividerProps> = ({
  size = 44,
  backgroundColor,
  iconColor,
  variant = 'arrow',
  text = '↓',
  padding = 8,
  margin = 0,
}) => {
  const theme = useTheme();

  // Theme detection
  const isDarkMode = String(theme.name)?.includes('dark');

  // Always use primary green background (theme-aware: #00B877 light, #00EF8B dark)
  const defaultBackgroundColor = theme.primary?.val;

  // Icon color should be dark in dark mode (on green background) and white in light mode
  // Use theme tokens for more reliable color detection
  const defaultIconColor = isDarkMode
    ? 'rgba(0, 0, 0, 0.8)' // Dark gray on green background in dark mode
    : (theme.white?.val || '#FFFFFF'); // White on green background in light mode 

  const finalBackgroundColor = defaultBackgroundColor;
  const finalIconColor = iconColor || defaultIconColor;
  return (
    <YStack items="center" py={padding} my={margin}>
      <YStack
        bg={finalBackgroundColor}
        rounded="$12"
        width={size}
        height={size}
        items="center"
        justify="center"
      >
        {variant === 'arrow' ? (
          <ArrowDown size={24} color={finalIconColor} />
        ) : (
          <Text fontSize="$4" color={finalIconColor} text="center">
            {text}
          </Text>
        )}
      </YStack>
    </YStack>
  );
};
