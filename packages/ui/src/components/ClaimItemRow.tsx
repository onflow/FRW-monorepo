import React from 'react';
import { Text, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Separator } from '../foundation/Separator';
import type { ClaimItemRowProps } from '../types';
import { PriceChangeBadge } from './PriceChangeBadge';

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toPrecision(2)}`;
}

function formatAmount(amount: string, symbol: string): string {
  const n = parseFloat(amount);
  const formatted = n >= 1000 ? n.toLocaleString() : amount;
  return `${formatted} ${symbol}`;
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ClaimItemRow({
  name,
  symbol,
  logoURI,
  amount,
  price,
  priceChange24h,
  usdValue,
  isLast,
}: ClaimItemRowProps): React.ReactElement {
  return (
    <YStack>
      <XStack px="$4" py="$3" items="center" gap="$3">
        <Avatar src={logoURI} alt={name} fallback={symbol[0]} size={48} />
        <YStack flex={1} gap="$1">
          <XStack items="center" justify="space-between">
            <Text fontSize={15} fontWeight="600" color="$text1">
              {name}
            </Text>
            <Text fontSize={15} fontWeight="600" color="$text1">
              {formatAmount(amount, symbol)}
            </Text>
          </XStack>
          <XStack items="center" justify="space-between">
            <XStack items="center" gap="$1.5">
              {price !== undefined && (
                <Text fontSize={13} color="$text2">
                  {formatPrice(price)}
                </Text>
              )}
              {priceChange24h !== undefined && <PriceChangeBadge value={priceChange24h} />}
            </XStack>
            {usdValue !== undefined && (
              <Text fontSize={13} color="$text2">
                {formatUsd(usdValue)}
              </Text>
            )}
          </XStack>
        </YStack>
      </XStack>
      {!isLast && <Separator mx="$4" borderColor="$borderGlass" borderWidth={0.5} />}
    </YStack>
  );
}
