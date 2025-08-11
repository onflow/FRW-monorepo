import React from 'react';
import { Text, XStack, YStack, Stack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import type { TokenCardProps } from '../types';

export function TokenCard({
  symbol,
  name,
  balance,
  logo,
  price,
  change24h,
  onPress,
  isVerified = false,
}: TokenCardProps): React.ReactElement {
  const isPositiveChange = change24h && change24h >= 0;

  return (
    <Stack
      {...(onPress && {
        pressStyle: { opacity: 0.7 },
        onPress: onPress,
        cursor: 'pointer',
      })}
      py="$4"
      px="$0"
      w="100%"
    >
      <XStack items="center" gap="$2" w="100%">
        <Avatar src={logo} alt={symbol} fallback={symbol?.[0] || name?.[0] || '?'} size={48} />

        {/* Token info */}
        <YStack flex={1} ml="$2" gap="$1">
          {/* Top row: Token name + verified + balance */}
          <XStack justify="space-between" items="center">
            <XStack items="center" gap="$1" flex={1}>
              <Text fontWeight="600" fontSize="$3" color="$color" numberOfLines={1}>
                {name || symbol}
              </Text>
              {isVerified && (
                <Text color="$primary" fontSize="$2">
                  ✓
                </Text>
              )}
            </XStack>
            <Text fontSize="$3" color="$color" numberOfLines={1} textAlign="right" minWidth="$3">
              {balance || '0'}
            </Text>
          </XStack>

          {/* Bottom row: USD value + change percentage */}
          <XStack justify="space-between" items="center">
            <YStack flex={1}>
              <Text color="$textSecondary" fontSize="$3" numberOfLines={1}>
                {price && parseFloat(price) > 0 ? `$${parseFloat(price).toFixed(2)}` : ''}
              </Text>
            </YStack>

            {change24h !== undefined && change24h !== null && (
              <XStack bg="$bg2" rounded="$3" px="$1.5" py="$1">
                <Text
                  color={isPositiveChange ? '$success' : '$error'}
                  fontSize="$1"
                  fontWeight="500"
                >
                  {isPositiveChange ? '+' : ''}
                  {change24h.toFixed(2)}%
                </Text>
              </XStack>
            )}
          </XStack>
        </YStack>
      </XStack>
    </Stack>
  );
}

export { TokenCard as UITokenCard };
