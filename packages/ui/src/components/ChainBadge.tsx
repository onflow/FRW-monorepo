import { Link } from '@onflow/frw-icons';
import React from 'react';
import { YStack } from 'tamagui';

/**
 * Chain types for badge display
 */
export type ChainType = 'evm' | 'flow';

export interface ChainBadgeProps {
  /**
   * The chain type to display
   * - 'evm': Green badge with link icon (Flow-EVM)
   * - 'flow': Green badge with link icon (Flow native)
   */
  chain: ChainType;
  /**
   * Size of the badge (default: 20)
   */
  size?: number;
}

/**
 * Chain badge colors by type
 */
const CHAIN_COLORS: Record<ChainType, string> = {
  evm: '#41CC5D',
  flow: '#41CC5D',
};

/**
 * ChainBadge - Circular overlay badge for showing chain/network type on avatars
 *
 * Used as an overlay on token/NFT avatars to indicate the chain type.
 * Positioned absolutely - parent must have position="relative".
 *
 * @example
 * ```tsx
 * <Stack position="relative">
 *   <Avatar src={tokenImage} size={48} />
 *   <ChainBadge chain="evm" />
 * </Stack>
 * ```
 */
export function ChainBadge({ chain, size = 20 }: ChainBadgeProps): React.ReactElement {
  const color = CHAIN_COLORS[chain];
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
      bg={color}
      items="center"
      justify="center"
      borderWidth={2}
      borderColor="$bg"
    >
      <Link size={iconSize} color="#FFFFFF" theme="outline" />
    </YStack>
  );
}
