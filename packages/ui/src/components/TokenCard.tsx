import { VerifiedToken } from '@onflow/frw-icons';
import React from 'react';
import { Stack, Text, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import type { TokenCardProps } from '../types';
import { Tag } from './Tag';
export function TokenCard({
  symbol,
  name,
  balance,
  logo,
  change24h,
  onPress,
  isVerified = false,
  isAccessible = true,
  inaccessibleText = 'inaccessible',
}: TokenCardProps): React.ReactElement {
  const isPositiveChange = change24h && change24h >= 0;

  return (
    <Stack
      {...(onPress && {
        pressStyle: { opacity: 0.7 },
        onPress: onPress,
        cursor: 'pointer',
      })}
      py="$3"
      px="$1"
      width="100%"
    >
      <XStack items="center" gap="$3" width="100%">
        <Avatar src={logo} alt={symbol} fallback={symbol?.[0] || name?.[0] || '?'} size={48} />

        <YStack flex={1} gap="$1.5">
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
                {isVerified && <VerifiedToken size={16} color="#41CC5D" />}
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
          <XStack items="flex-start" gap="$2">
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
            {!isAccessible && <Tag>{inaccessibleText}</Tag>}
          </XStack>
        </YStack>
      </XStack>
    </Stack>
  );
}

export { TokenCard as UITokenCard };
