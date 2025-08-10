import React from 'react';
import { Card, XStack, YStack, Text, Circle } from 'tamagui';

import { Avatar } from './Avatar';
import type { TokenCardProps } from '../types';

export function TokenCard({
  symbol,
  name,
  balance,
  logo,
  price,
  change24h,
  onPress,
}: TokenCardProps): React.ReactElement {
  const isPositiveChange = change24h && change24h >= 0;

  return (
    <Card
      {...(onPress && {
        pressStyle: { backgroundColor: '$gray3' },
        onPress: onPress,
      })}
      backgroundColor="$background"
      borderColor="$gray5"
      borderWidth={1}
      padding="$4"
      borderRadius="$4"
      hoverStyle={{ backgroundColor: '$gray2' }}
    >
      <XStack alignItems="center" space="$3">
        {/* Token Logo */}
        <Avatar src={logo} alt={symbol} fallback={symbol[0]} size={44} />

        {/* Token Info */}
        <YStack flex={1} space="$1">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack space="$1">
              <Text fontSize={16} fontWeight="600" color="$gray12">
                {symbol}
              </Text>
              <Text fontSize={14} color="$gray10">
                {name}
              </Text>
            </YStack>

            <YStack alignItems="flex-end" space="$1">
              <Text fontSize={16} fontWeight="600" color="$gray12">
                {balance}
              </Text>
              {price && (
                <XStack alignItems="center" space="$2">
                  <Text fontSize={14} color="$gray10">
                    ${price}
                  </Text>
                  {change24h !== undefined && (
                    <XStack alignItems="center" space="$1">
                      <Circle size={6} backgroundColor={isPositiveChange ? '$green10' : '$red10'} />
                      <Text
                        fontSize={12}
                        fontWeight="500"
                        color={isPositiveChange ? '$green10' : '$red10'}
                      >
                        {isPositiveChange ? '+' : ''}
                        {change24h.toFixed(2)}%
                      </Text>
                    </XStack>
                  )}
                </XStack>
              )}
            </YStack>
          </XStack>
        </YStack>
      </XStack>
    </Card>
  );
}

export { TokenCard as UITokenCard };
