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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

import type { ClaimItem } from './claim-types';

// ---------------------------------------------------------------------------
// Mock price history data per period
// ---------------------------------------------------------------------------

const MOCK_PRICE_DATA: Record<PriceChartPeriod, number[]> = {
  '1D': [
    0.00095, 0.00092, 0.00098, 0.00105, 0.00101, 0.00108, 0.00112, 0.00109, 0.00115, 0.00118,
    0.00122, 0.00119, 0.00125, 0.00128,
  ],
  '1W': [
    0.00078, 0.00082, 0.00079, 0.00086, 0.00091, 0.00088, 0.00095, 0.00099, 0.00103, 0.00108,
    0.00112, 0.00116, 0.00121, 0.00128,
  ],
  '1M': [
    0.00055, 0.00062, 0.00058, 0.00071, 0.00075, 0.00069, 0.00081, 0.00088, 0.00079, 0.00094,
    0.00101, 0.00096, 0.0011, 0.00128,
  ],
  '1Y': [
    0.00021, 0.00035, 0.00028, 0.00044, 0.00051, 0.00039, 0.00062, 0.00071, 0.00058, 0.00085,
    0.00092, 0.00078, 0.00105, 0.00128,
  ],
};

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
  const chartData = MOCK_PRICE_DATA[period];

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
          <YStack px="$4" pb="$4">
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
