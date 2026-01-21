import { Link } from '@onflow/frw-icons';
import React from 'react';
import { YStack } from 'tamagui';

/**
 * Chain types for badge display
 */
export type ChainType = 'evm' | 'flow';

export interface ChainBadgeProps {
  /**
   * The chain type to display (currently visual is the same for all chains)
   */
  chain: ChainType;
  /**
   * Size of the badge (default: 20)
   */
  size?: number;
}

/**
 * ChainBadge - Circular overlay badge for showing chain/network type on avatars
 *
 * Displays a white circle with a black link icon to indicate cross-chain activity.
 * Positioned absolutely at bottom-left - parent must have position="relative".
 *
 * @example
 * ```tsx
 * <Stack position="relative">
 *   <Avatar src={tokenImage} size={48} />
 *   <ChainBadge chain="evm" />
 * </Stack>
 * ```
 */
export function ChainBadge({ size = 20 }: ChainBadgeProps): React.ReactElement {
  const iconSize = Math.round(size / 2);
  const borderRadius = size / 2;

  return (
    <YStack
      position="absolute"
      l={-2}
      t={28}
      width={size}
      height={size}
      rounded={borderRadius}
      bg="$white"
      items="center"
      justify="center"
      borderWidth={2}
      borderColor="$bg"
    >
      <Link size={iconSize} color="$black" theme="outline" />
    </YStack>
  );
}
