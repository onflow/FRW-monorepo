import { VerifiedToken } from '@onflow/frw-icons';
import { formatCurrencyStringForDisplay } from '@onflow/frw-types';
import { getDisplayBalanceWithSymbol } from '@onflow/frw-utils';
import React from 'react';
import { Stack, Text, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import type { TokenCardProps } from '../types';
import { Tag } from './Tag';

export function TokenCard({
  token,
  currency,
  onPress,
  isVerified = false,
  isAccessible = true,
  inaccessibleText = 'inaccessible',
}: TokenCardProps): React.ReactElement {
  const { symbol, name, logoURI } = token;

  return (
    <Stack
      {...(onPress &&
        isAccessible && {
          pressStyle: { opacity: 0.7 },
          onPress: onPress,
          cursor: 'pointer',
        })}
      items="center"
      justify="center"
      width="100%"
      height={64}
    >
      <XStack items="center" gap="$2" width="100%">
        <Avatar src={logoURI} alt={symbol} fallback={symbol?.[0] || name?.[0] || '?'} size={48} />
        <YStack flex={1} gap="$1">
          {/* Top row: Token name + verified badge + balance */}
          <XStack justify="space-between" items="center" gap="$1">
            <XStack items="center" gap="$1" flex={1} shrink={1}>
              <XStack items="center" gap="$1" shrink={1}>
                <Text
                  fontWeight="600"
                  fontSize={14}
                  color="$text1"
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
              color="$text1"
              numberOfLines={1}
              text="right"
              lineHeight="$1"
            >
              {getDisplayBalanceWithSymbol(token)}
            </Text>
          </XStack>

          {/* Bottom row: Token amount + change percentage tag */}
          <XStack items="center" gap="$1" justify="space-between">
            <XStack items="center" gap="$1">
              <Text color="$text2" fontSize={14} fontWeight="400" numberOfLines={1} lineHeight="$1">
                {(() => {
                  if (token.priceInCurrency === '0' || token.priceInCurrency === '0.00') return '';
                  const currencyValue = parseFloat(token.priceInCurrency ?? '0');
                  return !isNaN(currencyValue) && currencyValue > 0
                    ? `${currency.symbol}${formatCurrencyStringForDisplay({ value: currencyValue, digits: 4 })}`
                    : '';
                })()}
              </Text>

              {!isAccessible && <Tag>{inaccessibleText}</Tag>}
            </XStack>

            <Text color="$text2" fontSize={14} fontWeight="400" numberOfLines={1} lineHeight="$1">
              {(() => {
                if (
                  !token.balanceInCurrency ||
                  token.balanceInCurrency === '0' ||
                  token.balanceInCurrency === '0.00'
                )
                  return '';
                const currencyValue = parseFloat(token.balanceInCurrency);
                return !isNaN(currencyValue) && currencyValue > 0
                  ? `${currency.symbol}${currencyValue.toFixed(2)}`
                  : '';
              })()}
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </Stack>
  );
}

export { TokenCard as UITokenCard };
