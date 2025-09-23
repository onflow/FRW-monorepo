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

  // Theme-aware default colors - use theme's primary green
  const defaultBackgroundColor = theme.primary?.val || '#00EF8B';

  const defaultIconColor = String(theme.name)?.includes('dark')
    ? 'rgba(0, 0, 0, 0.8)' // Keep existing dark gray for dark mode
    : '#000000'; // Black for light mode

  const finalBackgroundColor = backgroundColor || defaultBackgroundColor;
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
