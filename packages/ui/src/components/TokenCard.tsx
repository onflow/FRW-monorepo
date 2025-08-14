import { VerifiedToken } from '@onflow/frw-icons';
import React from 'react';
import { Text, XStack, YStack, Stack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import type { TokenCardProps } from '../types';
import { PercentageChangeBadge } from './PercentageChangeBadge';

export function TokenCard({
  symbol,
  name,
  balance,
  logo,
  usdBalance,
  change24h,
  onPress,
  isVerified = false,
}: TokenCardProps): React.ReactElement {
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
          <XStack justify="space-between" items="flex-start">
            <YStack flex={1}>
              <XStack ai="center" flex={1}>
                <Text fontWeight="600" fontSize={16} color="$color" numberOfLines={1} flex={1}>
                  {name || symbol}
                </Text>
                {isVerified && <VerifiedToken size={16} color="#41CC5D" marginLeft={4} />}
              </XStack>
              {usdBalance && (
                <Text color="$gray10" fontSize={14} numberOfLines={1} mt="$0.5">
                  {usdBalance}
                </Text>
              )}
            </YStack>
            <YStack ai="flex-end" ml="$2">
              <Text fontWeight="600" fontSize={16} color="$color" numberOfLines={1} ta="right">
                {balance} {symbol}
              </Text>
              {change24h !== undefined && change24h !== null && usdBalance && (
                <PercentageChangeBadge value={change24h} size="small" />
              )}
            </YStack>
          </XStack>
        </YStack>
      </XStack>
    </Stack>
  );
}

export { TokenCard as UITokenCard };
