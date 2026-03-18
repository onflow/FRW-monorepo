import { bridge } from '@onflow/frw-context';
import {
  claimFt,
  claimNft,
  coinPairFromSymbol,
  cryptoQueries,
  cryptoQueryKeys,
  tokenQueries,
  tokenQueryKeys,
  useWalletStore,
  walletSelectors,
} from '@onflow/frw-stores';
import {
  Avatar,
  Button,
  ClaimAssetDrawer,
  PriceChangeBadge,
  PriceChart,
  ScrollView,
  SearchBar,
  Separator,
  Skeleton,
  Text,
  XStack,
  YStack,
  useTheme,
  type PriceChartPeriod,
} from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, useWindowDimensions } from 'react-native';

import type { ClaimItem, ClaimNFTItem, ClaimSender } from './claim-types';

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
  if (isNaN(n)) return `${amount} ${symbol}`;
  const formatted = n >= 1000 ? n.toLocaleString() : String(n);
  return `${formatted} ${symbol}`;
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ClaimTokenDetailScreenProps {
  item: ClaimItem;
  sender?: ClaimSender;
  onClaim?: () => void;
  onReject?: () => void;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export function ClaimTokenDetailScreen({
  item,
  sender,
  onClaim,
  onReject,
}: ClaimTokenDetailScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 48; // account for horizontal padding

  const [period, setPeriod] = useState<PriceChartPeriod>('1D');
  const [claimDrawerVisible, setClaimDrawerVisible] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const queryClient = useQueryClient();
  const allAccounts = useWalletStore(walletSelectors.getAllAccounts);
  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);

  const handleClaim = useCallback(async () => {
    if (!item.identifier || isClaiming) return;
    setIsClaiming(true);
    let result;
    try {
      if (item.type === 'token') {
        result = await claimFt(item.identifier);
      } else {
        result = await claimNft(item.identifier);
      }

      console.log(result, '----');
      // Invalidate inbox queries to refresh the claim list
      queryClient.invalidateQueries({ queryKey: tokenQueryKeys.all });
      setClaimDrawerVisible(false);
      onClaim?.();
    } catch (error) {
      logger.error('[ClaimTokenDetail] Claim failed:', error);
    } finally {
      setIsClaiming(false);
    }
  }, [item, isClaiming, queryClient, onClaim]);

  // ── Check verified status from token catalog + NFT collections ───────
  const network = bridge.getNetwork() || 'mainnet';
  const address = activeAccount?.address ?? '';

  // FT catalog (verified tokens)
  const { data: catalog = [] } = useQuery({
    queryKey: tokenQueryKeys.catalog(network, 'flow'),
    queryFn: () => tokenQueries.fetchAllTokens(network, 'flow'),
    staleTime: 5 * 60 * 1000,
  });

  // NFT collections (presence in API response = verified)
  const { data: nftCollections = [] } = useQuery({
    queryKey: tokenQueryKeys.nfts(address, network),
    queryFn: () => tokenQueries.fetchNFTCollections(address, network),
    enabled: !!address && item.type === 'nft',
    staleTime: 5 * 60 * 1000,
  });

  const isVerified = useMemo(() => {
    if (item.isVerified !== undefined) return item.isVerified;
    if (!item.identifier) return false;
    // Trim to 3-part identifier: A.address.ContractName
    const identifierPrefix = item.identifier.split('.').slice(0, 3).join('.');

    // Check FT catalog
    if (catalog.some((t) => t.isVerified && t.flowIdentifier === identifierPrefix)) {
      return true;
    }

    // Check NFT collections — construct A.{addr}.{contractName} for matching
    if (
      nftCollections.some((c) => {
        const addr = (c.address ?? '').replace(/^0x/, '');
        const name = c.contractName ?? (c as any).contract_name ?? '';
        return addr && name && `A.${addr}.${name}` === identifierPrefix;
      })
    ) {
      return true;
    }

    return false;
  }, [item.isVerified, item.identifier, catalog, nftCollections]);

  // ── Chart data: prefer Binance, fall back to FlowIndex history ────────
  const coinPair = coinPairFromSymbol(item.symbol);
  const { data: binanceData = [], isFetching: isBinanceLoading } = useQuery({
    queryKey: cryptoQueryKeys.priceHistory(coinPair, 'binance', period),
    queryFn: () => cryptoQueries.fetchPriceHistory(coinPair, 'binance', period),
    enabled: !!coinPair,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // FlowIndex history fallback (only when Binance pair not available)
  const { data: flowIndexPrices } = useQuery({
    queryKey: tokenQueryKeys.flowIndexPrices(),
    queryFn: () => tokenQueries.fetchFlowIndexPrices(90),
    enabled: !coinPair,
    staleTime: 5 * 60_000,
  });

  const flowIndexChartData = useMemo(() => {
    if (coinPair || !flowIndexPrices) return [];

    // Match by identifier first, then fall back to symbol
    let tokenData = item.identifier
      ? Object.values(flowIndexPrices).find((d) =>
          d.identifiers?.some((id) => id === item.identifier?.split('.').slice(0, 3).join('.'))
        )
      : undefined;
    if (!tokenData) {
      tokenData = flowIndexPrices[item.symbol.toUpperCase()];
    }
    if (!tokenData?.history?.length) return [];

    // Filter history by period
    const now = Date.now();
    const periodMs: Record<PriceChartPeriod, number> = {
      '1D': 86_400_000,
      '1W': 7 * 86_400_000,
      '1M': 30 * 86_400_000,
      '1Y': 365 * 86_400_000,
    };
    const cutoff = now - periodMs[period];
    const filtered = tokenData.history.filter((h) => new Date(h.date).getTime() >= cutoff);
    // FlowIndex has daily granularity — 1D may yield < 2 points.
    // Fall back to the most recent entries so the chart isn't empty.
    if (filtered.length < 2) {
      return tokenData.history.slice(-7).map((h) => h.price);
    }
    return filtered.map((h) => h.price);
  }, [coinPair, flowIndexPrices, item.identifier, item.symbol, period]);

  const chartData = binanceData.length > 0 ? binanceData : flowIndexChartData;
  const isChartLoading = coinPair ? isBinanceLoading : false;

  const currentPrice = item.price;
  const priceChange = item.priceChange24h;

  // Compute 24h absolute change from percentage
  const priceChange24hAbs =
    currentPrice !== undefined && priceChange !== undefined
      ? currentPrice * (priceChange / 100)
      : undefined;

  // ── NFT collection detail view ──────────────────────────────────────
  if (item.type === 'nft') {
    return (
      <NFTCollectionDetailView
        item={item}
        isVerified={isVerified}
        isClaiming={isClaiming}
        onClaim={handleClaim}
        onReject={onReject}
        claimDrawerVisible={claimDrawerVisible}
        setClaimDrawerVisible={setClaimDrawerVisible}
        activeAccount={activeAccount}
        allAccounts={allAccounts}
      />
    );
  }

  // ── FT token detail view ──────────────────────────────────────────
  return (
    <YStack flex={1} bg="$bg">
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack>
          {/* Token info row */}
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
          <YStack px="$4" pt="$7" pb="$2" items="center" gap="$1.5">
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
          {(isChartLoading || chartData.length > 0) && (
            <>
              <YStack px="$6" pb="$4">
                {isChartLoading ? (
                  <YStack gap="$2">
                    <Skeleton width={chartWidth} height={120} borderRadius={8} />
                    <XStack justify="center" gap="$4">
                      {(['1W', '1M', '1Y'] as PriceChartPeriod[]).map((p) => (
                        <Skeleton key={p} width={36} height={24} borderRadius={12} />
                      ))}
                    </XStack>
                  </YStack>
                ) : (
                  <PriceChart
                    data={chartData}
                    width={chartWidth}
                    height={120}
                    color="#00C853"
                    period={period}
                    onPeriodChange={setPeriod}
                    periods={['1D', '1W', '1M', '1Y']}
                  />
                )}
              </YStack>
              <Separator borderColor="$borderGlass" borderWidth={0.5} />
            </>
          )}

          {/* Security section */}
          <YStack mx="$4" mt="$3" rounded="$4" bg="$bg2" overflow="hidden">
            <YStack px="$4" pt="$4" pb="$2">
              <Text fontSize={16} fontWeight="600" color="$text1">
                {t('claim.detail.security', 'Security')}
              </Text>
            </YStack>
            <Separator mx="$4" borderColor="$borderGlass" borderWidth={0.5} />
            <XStack px="$4" py="$3" items="center" justify="space-between">
              <Text fontSize={14} fontWeight="600" color="$text1">
                {t('claim.detail.verified', 'Verified')}
              </Text>
              <Text fontSize={14} color="$text2">
                {isVerified ? t('claim.detail.yes', 'Yes') : t('claim.detail.no', 'No')}
              </Text>
            </XStack>
            {item.contractAddress !== undefined && (
              <XStack px="$4" py="$3" items="center" justify="space-between">
                <Text fontSize={14} fontWeight="600" color="$text1">
                  {t('claim.detail.contractAddress', 'Contract address')}
                </Text>
                <Text fontSize={14} color="$text2">
                  {truncateAddress(item.contractAddress)}
                </Text>
              </XStack>
            )}
          </YStack>

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
          <Button
            testID="claim-detail-reject"
            variant="secondary"
            size="large"
            fullWidth
            onPress={onReject}
          >
            {t('claim.detail.reject', 'Reject')}
          </Button>
        </YStack>
        <YStack flex={1}>
          <Button
            testID="claim-detail-claim"
            variant="inverse"
            size="large"
            fullWidth
            onPress={() => setClaimDrawerVisible(true)}
          >
            {t('claim.detail.claim', 'Claim')}
          </Button>
        </YStack>
      </XStack>

      {activeAccount && (
        <ClaimAssetDrawer
          visible={claimDrawerVisible}
          item={{
            name: item.name,
            symbol: item.symbol,
            logoURI: item.logoURI,
            amount: item.amount,
            usdValue: item.usdValue,
            price: item.price,
            priceChange24h: item.priceChange24h,
            isVerified,
          }}
          receiver={activeAccount}
          allReceivers={allAccounts}
          onConfirm={handleClaim}
          isLoading={isClaiming}
          onClose={() => setClaimDrawerVisible(false)}
          titleText={t('claim.drawer.title', 'Claim asset')}
          receiverSectionText={t('claim.drawer.to', 'To')}
          claimText={t('claim.drawer.cta', 'Claim')}
        />
      )}
    </YStack>
  );
}

// ---------------------------------------------------------------------------
// NFT Collection Detail View
// ---------------------------------------------------------------------------

function NFTCollectionDetailView({
  item,
  isVerified,
  isClaiming,
  onClaim,
  onReject,
  claimDrawerVisible,
  setClaimDrawerVisible,
  activeAccount,
  allAccounts,
}: {
  item: ClaimItem;
  isVerified: boolean;
  isClaiming: boolean;
  onClaim: () => void;
  onReject?: () => void;
  claimDrawerVisible: boolean;
  setClaimDrawerVisible: (v: boolean) => void;
  activeAccount: any;
  allAccounts: any[];
}): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [nftSearch, setNftSearch] = useState('');

  const nftItems = item.nftItems ?? [];
  const itemCount = nftItems.length;

  const filteredNfts = useMemo(() => {
    if (!nftSearch.trim()) return nftItems;
    const q = nftSearch.trim().toLowerCase();
    return nftItems.filter((n) => n.name.toLowerCase().includes(q));
  }, [nftItems, nftSearch]);

  const numColumns = 2;
  const gap = 12;
  const horizontalPadding = 16;
  const tileWidth = (screenWidth - horizontalPadding * 2 - gap) / numColumns;

  const renderNftItem = useCallback(
    ({ item: nft }: { item: ClaimNFTItem }) => (
      <YStack w={tileWidth} mb={gap}>
        <YStack rounded="$3" overflow="hidden" bg="$bg2">
          {nft.image || nft.thumbnail ? (
            <Image
              source={{ uri: nft.thumbnail || nft.image }}
              style={{ width: tileWidth, height: tileWidth, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : (
            <YStack
              w={tileWidth}
              h={tileWidth}
              bg="$bg3"
              items="center"
              justify="center"
              rounded="$3"
            >
              <Text fontSize={24} color="$text2">
                {item.name?.[0] ?? '?'}
              </Text>
            </YStack>
          )}
        </YStack>
        <Text fontSize={12} fontWeight="500" color="$text1" mt="$1" numberOfLines={1}>
          {nft.name}
        </Text>
      </YStack>
    ),
    [tileWidth, item.name]
  );

  return (
    <YStack flex={1} bg="$bg">
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack>
          {/* Collection header */}
          <YStack items="center" pt="$4" pb="$3" gap="$2">
            <Avatar src={item.logoURI} alt={item.name} fallback={item.name[0]} size={80} />
            <XStack items="center" gap="$1.5" mt="$2">
              <Text fontSize={20} fontWeight="700" color="$text1">
                {item.name}
              </Text>
              {isVerified && (
                <YStack
                  w={18}
                  h={18}
                  rounded={9}
                  bg={theme.primary?.val ?? '#00EF8B'}
                  items="center"
                  justify="center"
                >
                  <Text fontSize={11} color="white" fontWeight="700">
                    ✓
                  </Text>
                </YStack>
              )}
            </XStack>
          </YStack>

          {/* Meta row: website + items count */}
          <XStack px="$4" pb="$3" justify="center" gap="$3">
            {item.website && (
              <XStack bg="$bg2" rounded="$10" px="$3" py="$1.5" items="center" gap="$1">
                <Text fontSize={12} color="$text2">
                  Website
                </Text>
                <Text fontSize={12} fontWeight="500" color="$text1">
                  {item.website}
                </Text>
              </XStack>
            )}
            <XStack bg="$bg2" rounded="$10" px="$3" py="$1.5" items="center" gap="$1">
              <Text fontSize={12} color="$text2">
                Items
              </Text>
              <Text fontSize={12} fontWeight="500" color="$text1">
                {itemCount}
              </Text>
            </XStack>
          </XStack>

          {/* Description */}
          {item.description && (
            <YStack px="$4" pb="$3">
              <Text fontSize={14} fontWeight="600" color="$text1" mb="$1">
                {t('claimNFTDetail.about')}
              </Text>
              <Text fontSize={13} color="$text2" lineHeight={18}>
                {item.description}
              </Text>
            </YStack>
          )}

          {/* Search */}
          <YStack px="$4" pb="$3">
            <SearchBar
              value={nftSearch}
              onChangeText={setNftSearch}
              placeholder={t('claim.searchPlaceholder')}
            />
          </YStack>

          {/* NFT grid */}
          <YStack px={horizontalPadding}>
            <FlatList
              data={filteredNfts}
              keyExtractor={(nft) => nft.id}
              renderItem={renderNftItem}
              numColumns={numColumns}
              columnWrapperStyle={{ gap }}
              scrollEnabled={false}
              ListEmptyComponent={
                <YStack items="center" pt="$6">
                  <Text color="$text2" fontSize={14}>
                    {t('claimNFTDetail.empty')}
                  </Text>
                </YStack>
              }
            />
          </YStack>

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
          <Button
            testID="claim-detail-reject"
            variant="secondary"
            size="large"
            fullWidth
            onPress={onReject}
          >
            {t('claim.detail.reject', 'Reject')}
          </Button>
        </YStack>
        <YStack flex={1}>
          <Button
            testID="claim-detail-claim"
            variant="inverse"
            size="large"
            fullWidth
            onPress={() => setClaimDrawerVisible(true)}
          >
            {t('claim.detail.claim', 'Claim')}
          </Button>
        </YStack>
      </XStack>

      {activeAccount && (
        <ClaimAssetDrawer
          visible={claimDrawerVisible}
          item={{
            name: item.name,
            symbol: item.symbol,
            logoURI: item.logoURI,
            amount: item.amount,
            isVerified,
            nftItems: item.nftItems?.map((n) => ({
              id: n.id,
              name: n.name,
              thumbnail: n.thumbnail || n.image,
            })),
          }}
          receiver={activeAccount}
          allReceivers={allAccounts}
          onConfirm={onClaim}
          isLoading={isClaiming}
          onClose={() => setClaimDrawerVisible(false)}
          titleText={t('claim.drawer.title', 'Claim asset')}
          receiverSectionText={t('claim.drawer.to', 'To')}
          claimText={t('claim.drawer.cta', 'Claim')}
        />
      )}
    </YStack>
  );
}
