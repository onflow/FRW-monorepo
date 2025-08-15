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
  usdBalance,
  change24h,
  onPress,
  price,
  isVerified = false,
}: TokenCardProps): React.ReactElement {
  const isPositiveChange = change24h !== undefined && change24h !== null && change24h > 0;
  return (
    <Stack
      {...(onPress && {
        pressStyle: { opacity: 0.7 },
        onPress: onPress,
        cursor: 'pointer',
      })}
      px="$4"
      py="$3"
      width="100%"
    >
      <XStack items="center" gap="$3" width="100%">
        <Avatar src={logo} alt={symbol} fallback={symbol?.[0] || name?.[0] || '?'} size={48} />

        <YStack flex={1} gap="$1.5">
          {/* Top row: Token name + verified badge + balance */}
          <XStack justify="space-between" items="center">
            <XStack items="center" gap="$1" flex={1}>
              <Text fontWeight="600" fontSize={14} color="$color" numberOfLines={1}>
                {name || symbol}
              </Text>
              {isVerified && <VerifiedToken size={16} color="#41CC5D" />}
            </XStack>
            {/* <Text fontSize={14} opacity={0.8} numberOfLines={1} text="right">
              {'$'}
              {price}
            </Text> */}
          </XStack>
          {usdBalance && (
            <Text color="$gray10" opacity={0.8} fontSize={14} numberOfLines={1} mt="$0.5">
              {usdBalance}
            </Text>
          )}
        </YStack>
        <YStack gap="$1" items="center">
          <Text opacity={0.8} fontSize={14} fontWeight={400} numberOfLines={1} text="right">
            {balance} {symbol}
          </Text>

          {change24h !== undefined && change24h !== null && (
            <XStack
              bg={isPositiveChange ? '$primary10' : '$error10'}
              borderRadius="$3"
              px="$1.5"
              py="$1"
              items="center"
              justify="flex-end"
            >
              <Text
                color={isPositiveChange ? '$primary' : '$error'}
                minW="$13"
                fontSize="$3"
                fontWeight="400"
                textAlign="center"
              >
                {isPositiveChange ? '+' : ''}
                {change24h.toFixed(1)}%
              </Text>
            </XStack>
          )}
        </YStack>
      </XStack>
    </Stack>
  );
}

export { TokenCard as UITokenCard };
