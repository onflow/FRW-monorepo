import React from 'react';
import { Stack, Text, XStack, YStack } from 'tamagui';

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
      py="$2"
      width="100%"
    >
      <XStack items="center" gap="$2" width="100%">
        <Avatar src={logo} alt={symbol} fallback={symbol?.[0] || name?.[0] || '?'} size={48} />

        <YStack flex={1} gap="$1">
          {/* Top row: Token name + verified badge + balance */}
          <XStack justify="space-between" items="center" gap="$1">
            <XStack items="center" gap="$1" flex={1} shrink={1}>
              <XStack items="center" gap="$0.5" shrink={1}>
                <Text
                  fontWeight="600"
                  fontSize={14}
                  color="$color"
                  numberOfLines={1}
                  lineHeight="$1"
                  letterSpacing={-0.6}
                  shrink={1}
                >
                  {name || symbol}
                </Text>
                {/* {isVerified && <VerifiedToken size={16} color="#41CC5D" />} */}
              </XStack>
            </XStack>
            <Text
              fontSize={14}
              fontWeight="400"
              color="$color"
              numberOfLines={1}
              text="right"
              lineHeight="$1"
            >
              {balance} {symbol}
            </Text>
          </XStack>

          {/* Bottom row: Token amount + change percentage tag */}
          <XStack items="center" gap="$2">
            <Text
              color="$light80"
              fontSize={14}
              fontWeight="400"
              numberOfLines={1}
              lineHeight="$1"
              flex={1}
            >
              {balance} {symbol}
            </Text>

            {change24h !== undefined && change24h !== null && (
              <XStack
                bg={isPositiveChange ? 'rgba(0, 239, 139, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                rounded="$3"
                px={6}
                py={4}
                justify="center"
                items="center"
              >
                <Text
                  color={isPositiveChange ? '$primary' : '$error'}
                  fontSize={12}
                  fontWeight="400"
                  text="center"
                  lineHeight={16.8}
                  numberOfLines={1}
                  whiteSpace="nowrap"
                >
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
