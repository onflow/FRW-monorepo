import { VerifiedToken } from '@onflow/frw-icons';
import React from 'react';
import { Text, XStack, YStack, useTheme } from 'tamagui';

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
  if (isNaN(n)) return `${amount} ${symbol}`;
  // Remove trailing zeros: parseFloat('0.00100000') → '0.001'
  const formatted = n >= 1000 ? n.toLocaleString() : String(n);
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
  isVerified,
}: ClaimItemRowProps): React.ReactElement {
  const theme = useTheme();

  return (
    <YStack>
      <XStack px="$4" py="$3" items="center" gap="$3">
        <Avatar src={logoURI} alt={name} fallback={symbol[0]} size={48} />
        <YStack flex={1} gap="$1">
          <XStack items="center" justify="space-between">
            <XStack items="center" gap="$1.5">
              <Text fontSize={15} fontWeight="600" color="$text1">
                {symbol}
              </Text>
              {isVerified && <VerifiedToken size={14} color={theme.success?.val ?? '#41CC5D'} />}
            </XStack>
            <Text fontSize={15} fontWeight="600" color="$text1">
              {formatAmount(amount, symbol)}
            </Text>
          </XStack>
          <XStack items="center" justify="space-between">
            <XStack items="center" gap="$1.5">
              <Text fontSize={13} color="$text2">
                {price !== undefined ? formatPrice(price) : '--'}
              </Text>
              {priceChange24h !== undefined && <PriceChangeBadge value={priceChange24h} />}
            </XStack>
            <Text fontSize={13} color="$text2">
              {usdValue !== undefined ? formatUsd(usdValue) : '--'}
            </Text>
          </XStack>
        </YStack>
      </XStack>
      {!isLast && <Separator mx="$4" borderColor="$borderGlass" borderWidth={0.5} />}
    </YStack>
  );
}
