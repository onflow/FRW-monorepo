import React from 'react';
import { Card, Circle, Text, XStack, YStack } from 'tamagui';

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
}: TokenCardProps): React.ReactElement {
  const isPositiveChange = change24h && change24h >= 0;

  return (
    <Card
      {...(onPress && {
        pressStyle: { bg: '$bg3' },
        onPress: onPress,
      })}
      bg="$bg"
      borderColor="$border"
      borderWidth={1}
      p="$4"
      rounded="$4"
      hoverStyle={{ bg: '$bg2' }}
    >
      <XStack items="center" space="$3">
        {/* Token Logo */}
        <Avatar src={logo} alt={symbol} fallback={symbol[0]} size={44} />

        {/* Token Info */}
        <YStack flex={1} space="$1">
          <XStack justify="space-between" items="flex-start">
            <YStack space="$1">
              <Text fontSize={16} fontWeight="600" color="$text">
                {symbol}
              </Text>
              <Text fontSize={14} color="$textSecondary">
                {name}
              </Text>
            </YStack>

            <YStack items="flex-end" space="$1">
              <Text fontSize={16} fontWeight="600" color="$text">
                {balance}
              </Text>
              {price && (
                <XStack items="center" space="$2">
                  <Text fontSize={14} color="$textSecondary">
                    ${price}
                  </Text>
                  {change24h !== undefined && (
                    <XStack items="center" space="$1">
                      <Circle size={6} bg={isPositiveChange ? '$success' : '$error'} />
                      <Text
                        fontSize={12}
                        fontWeight="500"
                        color={isPositiveChange ? '$success' : '$error'}
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
