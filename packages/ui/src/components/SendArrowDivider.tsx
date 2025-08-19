import { ArrowDown } from '@onflow/frw-icons';
import React from 'react';
import { YStack } from 'tamagui';

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
        <ArrowDown size={size * 0.5} color={iconColor} />
        {/* {variant === 'arrow' ? (
        ) : (
          <Text fontSize="$4" color={iconColor} textAlign="center">
            {text}
          </Text>
        )} */}
      </YStack>
    </YStack>
  );
};
