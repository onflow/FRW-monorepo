import { Earn } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface VaultBannerProps {
  /**
   * Primary message text (e.g., "Don't miss out on $1,203 this year")
   */
  message: string;
  /**
   * Secondary highlight text in green (e.g., "Earn 15% APY on Flow Vaults")
   */
  highlight: string;
  /**
   * Callback when the banner is clicked
   */
  onPress?: () => void;
}

/**
 * VaultBanner - A promotional banner for vault/earn features
 * Displays a dark card with gradient border, message, highlight text, and Earn icon
 */
export const VaultBanner = ({ message, highlight, onPress }: VaultBannerProps) => {
  return (
    <XStack
      onPress={onPress}
      cursor={onPress ? 'pointer' : 'default'}
      items="center"
      p={18}
      rounded={16}
      overflow="hidden"
      hoverStyle={onPress ? { opacity: 0.9 } : undefined}
      pressStyle={onPress ? { opacity: 0.8 } : undefined}
      style={{
        background: 'linear-gradient(to top, #191919 0%, #00ef8b 661.74%)',
        border: '0.5px solid #16ff99',
      }}
    >
      <YStack flex={1} gap={4}>
        <Text color="#FFFFFF" fontSize={14} fontWeight="400">
          {message}
        </Text>
        <Text color="#00EF8B" fontSize={16} fontWeight="600">
          {highlight}
        </Text>
      </YStack>
      <Earn width={33} height={33} theme="multicolor" />
    </XStack>
  );
};
