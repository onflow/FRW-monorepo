import { Earn } from '@onflow/frw-icons';
import React from 'react';
import { XStack } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface VaultTagProps {
  /**
   * The amount to display (e.g., "114.14")
   */
  amount: string;
  /**
   * The APY percentage to display (e.g., "10")
   */
  apy: string | number;
  /**
   * Callback when the tag is clicked
   */
  onPress?: () => void;
}

/**
 * VaultTag - A tag component for displaying vault earning information
 * Displays a pill-shaped tag with dark background, bright green text, and Earn icon
 * Shows "Earn $[amount] APY [apy]%" format
 */
export const VaultTag = ({ amount, apy, onPress }: VaultTagProps) => {
  const apyValue = typeof apy === 'number' ? apy.toString() : apy;

  return (
    <XStack
      onPress={onPress}
      cursor={onPress ? 'pointer' : 'default'}
      items="center"
      gap={8}
      py={4}
      px={10}
      rounded={24}
      bg="#000000"
      hoverStyle={onPress ? { opacity: 0.9 } : undefined}
      pressStyle={onPress ? { opacity: 0.8 } : undefined}
    >
      <Earn width={16} height={16} theme="multicolor" />
      <Text color="#00EF8B" fontSize={12} fontWeight="400">
        Earn ${amount} APY {apyValue}%
      </Text>
    </XStack>
  );
};
