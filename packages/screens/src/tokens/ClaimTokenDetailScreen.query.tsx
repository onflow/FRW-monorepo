import { coinPairFromSymbol, cryptoQueries, cryptoQueryKeys } from '@onflow/frw-stores';
import {
  Avatar,
  Button,
  PriceChangeBadge,
  PriceChart,
  ScrollView,
  Separator,
  Text,
  XStack,
  YStack,
  type PriceChartPeriod,
} from '@onflow/frw-ui';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

import type { ClaimItem } from './claim-types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toPrecision(7)}`;
}

function formatAmount(amount: string, symbol: string): string {
  const n = parseFloat(amount);
  const formatted = n >= 1000 ? n.toLocaleString() : amount;
  return `${formatted} ${symbol}`;
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}v...${address.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ClaimTokenDetailScreenProps {
  item: ClaimItem;
  /** Mock contract address shown in the Security section */
  contractAddress?: string;
  /** Whether the token is verified */
  isVerified?: boolean;
  onClaim?: () => void;
  onReject?: () => void;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export function ClaimTokenDetailScreen({
  item,
  contractAddress = 'TSLv1809kXYZABCD',
  isVerified = true,
  onClaim,
  onReject,
}: ClaimTokenDetailScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 32; // account for horizontal padding

  const [period, setPeriod] = useState<PriceChartPeriod>('1D');

  const coinPair = coinPairFromSymbol(item.symbol);
  const { data: chartData = [], isFetching: isChartLoading } = useQuery({
    queryKey: cryptoQueryKeys.priceHistory(coinPair, 'binance', period),
    queryFn: () => cryptoQueries.fetchPriceHistory(coinPair, 'binance', period),
    enabled: !!coinPair,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const currentPrice = item.price;
  const priceChange = item.priceChange24h;

  // Compute 24h absolute change from percentage
  const priceChange24hAbs =
    currentPrice !== undefined && priceChange !== undefined
      ? currentPrice * (priceChange / 100)
      : undefined;

  return (
    <YStack flex={1} bg="$bg">
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack>
          {/* Token info row — mirrors ClaimItemRow layout */}
          <XStack px="$4" py="$3" items="center" gap="$3">
            <Avatar src={item.logoURI} alt={item.name} fallback={item.symbol[0]} size={48} />
            <YStack flex={1} gap="$1">
              <XStack items="center" justify="space-between">
                <Text fontSize={15} fontWeight="600" color="$text1">
                  {item.name}
                </Text>
                <Text fontSize={15} fontWeight="600" color="$text1">
                  {formatAmount(item.amount, item.symbol)}
                </Text>
              </XStack>
              <XStack items="center" justify="space-between">
                <XStack items="center" gap="$1.5">
                  {currentPrice !== undefined && (
                    <Text fontSize={13} color="$text2">
                      {formatPrice(currentPrice)}
                    </Text>
                  )}
                  {priceChange !== undefined && <PriceChangeBadge value={priceChange} />}
                </XStack>
                {item.usdValue !== undefined && (
                  <Text fontSize={13} color="$text2">
                    {formatUsd(item.usdValue)}
                  </Text>
                )}
              </XStack>
            </YStack>
          </XStack>

          <Separator borderColor="$borderGlass" borderWidth={0.5} />

          {/* Large price display */}
          <YStack px="$4" pt="$5" pb="$2" items="center" gap="$1.5">
            <Text fontSize={32} fontWeight="700" color="$text1" letterSpacing={-0.5}>
              {currentPrice !== undefined ? formatPrice(currentPrice) : '—'}
            </Text>
            <XStack items="center" gap="$2">
              {priceChange24hAbs !== undefined && (
                <Text fontSize={13} color="$text2">
                  {priceChange24hAbs >= 0 ? '+' : ''}
                  {formatPrice(Math.abs(priceChange24hAbs))}
                </Text>
              )}
              {priceChange !== undefined && <PriceChangeBadge value={priceChange} />}
            </XStack>
          </YStack>

          {/* Price chart */}
          <YStack px="$4" pb="$4" opacity={isChartLoading ? 0.5 : 1}>
            <PriceChart
              data={chartData}
              width={chartWidth}
              height={120}
              color="#00C853"
              period={period}
              onPeriodChange={setPeriod}
            />
          </YStack>

          {/* Security section */}
          <YStack mx="$4" rounded="$4" bg="$bg2" overflow="hidden">
            <YStack px="$4" pt="$4" pb="$2">
              <Text fontSize={16} fontWeight="600" color="$text1">
                {t('claim.detail.security', 'Security')}
              </Text>
            </YStack>

            <XStack px="$4" py="$3" items="center" justify="space-between">
              <Text fontSize={14} color="$text1">
                {t('claim.detail.verified', 'Verified')}
              </Text>
              <Text fontSize={14} color={isVerified ? '$success' : '$error'}>
                {isVerified ? t('claim.detail.yes', 'Yes') : t('claim.detail.no', 'No')}
              </Text>
            </XStack>

            <Separator mx="$4" borderColor="$borderGlass" borderWidth={0.5} />

            <XStack px="$4" py="$3" items="center" justify="space-between">
              <Text fontSize={14} color="$text1">
                {t('claim.detail.contractAddress', 'Contract address')}
              </Text>
              <Text fontSize={14} color="$text2">
                {truncateAddress(contractAddress)}
              </Text>
            </XStack>
          </YStack>

          {/* Spacer so content clears the fixed bottom bar */}
          <YStack height={100} />
        </YStack>
      </ScrollView>

      {/* Bottom action buttons */}
      <XStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        px="$4"
        pb="$8"
        pt="$3"
        gap="$3"
        bg="$bg"
      >
        <YStack flex={1}>
          <Button variant="secondary" size="large" fullWidth onPress={onReject}>
            {t('claim.detail.reject', 'Reject')}
          </Button>
        </YStack>
        <YStack flex={1}>
          <Button variant="inverse" size="large" fullWidth onPress={onClaim}>
            {t('claim.detail.claim', 'Claim')}
          </Button>
        </YStack>
      </XStack>
    </YStack>
  );
}
