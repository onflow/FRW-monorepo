import { DownArrow } from '@onflow/frw-icons';
import React from 'react';
import { YStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface SendArrowDividerProps {
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  variant?: 'arrow' | 'text';
  text?: string;
  padding?: number;
}

export const SendArrowDivider: React.FC<SendArrowDividerProps> = ({
  size = 44,
  backgroundColor = '#00EF8B',
  iconColor = 'rgba(0, 0, 0, 0.8)',
  variant = 'arrow',
  text = '↓',
  padding = 8,
}) => {
  return (
    <YStack items="center" py={padding}>
      <YStack
        bg={backgroundColor}
        rounded="$12"
        width={size}
        height={size}
        items="center"
        justify="center"
      >
        {variant === 'arrow' ? (
          <DownArrow size={size * 0.5} color={iconColor} />
        ) : (
          <Text fontSize="$4" color={iconColor} textAlign="center">
            {text}
          </Text>
        )}
      </YStack>
    </YStack>
  );
};
