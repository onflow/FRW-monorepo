import { VerifiedToken } from '@onflow/frw-icons';
import React from 'react';
import { Text, XStack, YStack, Stack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import type { TokenCardProps } from '../types';

export function TokenCard({
  symbol,
  name,
  balance,
  logo,
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
      p="$2"
      width="100%"
    >
      <XStack items="center" gap="$2" width="100%">
        <Avatar src={logo} alt={symbol} fallback={symbol?.[0] || name?.[0] || '?'} size={48} />

        <YStack flex={1} gap="$1">
          {/* Top row: Token name + verified badge + balance */}
          <XStack justify="space-between" items="center">
            <XStack items="center" gap="$1" flex={1}>
              <Text fontWeight="600" fontSize={14} color="$color" numberOfLines={1}>
                {name || symbol}
              </Text>
              {isVerified && <VerifiedToken size={16} color="#41CC5D" />}
            </XStack>
            <Text fontSize={14} color="$color" numberOfLines={1} text="right">
              {balance} {symbol}
            </Text>
          </XStack>

          {/* Bottom row: Token amount + change percentage tag */}
          <XStack justify="space-between" items="center">
            <Text color="$gray10" fontSize={14} numberOfLines={1}>
              {balance} {symbol}
            </Text>

            {change24h !== undefined && change24h !== null && (
              <XStack
                bg="rgba(0, 239, 139, 0.1)"
                borderRadius={12}
                paddingHorizontal={6}
                paddingVertical={4}
                justify="center"
                items="center"
              >
                <Text color="#00EF8B" fontSize={12} fontWeight="400" width={36} textAlign="left">
                  {isPositiveChange ? '+' : ''}
                  {change24h.toFixed(1)}%
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
