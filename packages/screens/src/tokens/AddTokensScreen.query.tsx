import { bridge } from '@onflow/frw-context';
import { VerifiedToken } from '@onflow/frw-icons';
import { tokenQueries, tokenQueryKeys, useWalletStore, walletSelectors } from '@onflow/frw-stores';
import type { FungibleTokenCatalogItem } from '@onflow/frw-types';
import {
  AddTokenListItem,
  AlphabetIndex,
  BackgroundWrapper,
  ClaimBanner,
  SearchBar,
  Separator,
  Skeleton,
  Text,
  TokenSectionHeader,
  XStack,
  YStack,
  useTheme,
} from '@onflow/frw-ui';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Switch, View } from 'react-native';

interface TokenGroup {
  letter: string;
  data: FungibleTokenCatalogItem[];
}

function groupByLetter(tokens: FungibleTokenCatalogItem[]): TokenGroup[] {
  const map = new Map<string, FungibleTokenCatalogItem[]>();
  for (const token of tokens) {
    const letter = (token.name?.[0] ?? token.symbol?.[0] ?? '#').toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    const group = map.get(letter);
    if (group) group.push(token);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, data]) => ({ letter, data }));
}

interface AddTokensScreenProps {
  onClaimPress?: () => void;
}

export function AddTokensScreen({ onClaimPress }: AddTokensScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const network = bridge.getNetwork() || 'mainnet';

  const accounts = useWalletStore(walletSelectors.getAllAccounts);
  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);
  const address = activeAccount?.address ?? '';

  const flowAddresses = useMemo(
    () => accounts.filter((a) => a.type === 'main' || a.type === 'child').map((a) => a.address),
    [accounts]
  );

  const { data: inboxCount } = useQuery({
    queryKey: tokenQueryKeys.inboxCount(flowAddresses, network),
    queryFn: () => tokenQueries.fetchInboxCount(flowAddresses),
    enabled: flowAddresses.length > 0,
    refetchInterval: 10_000,
    staleTime: 10_000,
  });

  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  const listRef = useRef<FlatList>(null);

  const { data: catalog = [], isLoading: isCatalogLoading } = useQuery({
    queryKey: tokenQueryKeys.catalog(network, 'flow'),
    queryFn: () => tokenQueries.fetchAllTokens(network, 'flow'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: userTokens = [] } = useQuery({
    queryKey: tokenQueryKeys.tokens(address, network),
    queryFn: () => tokenQueries.fetchTokens(address, network),
    enabled: !!address,
    staleTime: 30_000,
  });

  const enabledSet = useMemo<Set<string>>(
    () => new Set(userTokens.map((t) => t.symbol?.toLowerCase() ?? '')),
    [userTokens]
  );

  const filteredTokens = useMemo(() => {
    let tokens = catalog;
    if (verifiedOnly) {
      tokens = tokens.filter((t) => t.isVerified === true);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      tokens = tokens.filter(
        (t) => t.name?.toLowerCase().includes(q) || t.symbol?.toLowerCase().includes(q)
      );
    }
    return tokens;
  }, [catalog, verifiedOnly, search]);

  const groups = useMemo(() => groupByLetter(filteredTokens), [filteredTokens]);
  const letters = useMemo(() => groups.map((g) => g.letter), [groups]);

  const flatData = useMemo(() => {
    const rows: (string | FungibleTokenCatalogItem)[] = [];
    for (const group of groups) {
      rows.push(group.letter);
      rows.push(...group.data);
    }
    return rows;
  }, [groups]);

  const handleLetterPress = useCallback(
    (letter: string) => {
      setActiveIndex(letter);
      const idx = flatData.findIndex((item) => item === letter);
      if (idx >= 0) {
        listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
      }
    },
    [flatData]
  );

  const handleAddToken = useCallback((flowIdentifier: string | undefined) => {
    if (!flowIdentifier) return;
    bridge.closeRN(flowIdentifier);
  }, []);

  const renderRow = useCallback(
    ({ item, index }: { item: string | FungibleTokenCatalogItem; index: number }) => {
      if (typeof item === 'string') {
        return <TokenSectionHeader letter={item} />;
      }

      const isEnabled = enabledSet.has(item.symbol?.toLowerCase() ?? '');
      const isLast = (() => {
        const next = flatData[index + 1];
        return next === undefined || typeof next === 'string';
      })();

      return (
        <AddTokenListItem
          token={item}
          isEnabled={isEnabled}
          isLast={isLast}
          onAdd={() => handleAddToken(item.flowIdentifier)}
        />
      );
    },
    [enabledSet, flatData, handleAddToken]
  );

  const keyExtractor = useCallback(
    (item: string | FungibleTokenCatalogItem, index: number) =>
      typeof item === 'string' ? `header-${item}` : `token-${item.symbol}-${index}`,
    []
  );

  return (
    <BackgroundWrapper backgroundColor="$bg" px={0}>
      <YStack flex={1}>
        <ClaimBanner
          title={t('addTokens.claimBannerTitle', 'Claim received tokens')}
          count={inboxCount}
          onPress={onClaimPress}
        />

        {/* Search bar */}
        <YStack px="$4" mb="$3">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={t('addTokens.searchPlaceholder', 'Search Token')}
          />
        </YStack>

        {/* Verified toggle */}
        <XStack px="$4" mb="$2" items="center" justify="space-between">
          <XStack items="center" gap="$1.5">
            <Text fontSize={14} fontWeight="500" color="$text1">
              {t('addTokens.verifiedOnly', 'Only show verified tokens')}
            </Text>
            <VerifiedToken size={16} color={theme.success?.val ?? '#41CC5D'} />
          </XStack>
          <Switch
            value={verifiedOnly}
            onValueChange={setVerifiedOnly}
            trackColor={{
              false: theme.bg3?.val ?? '#3e3e3e',
              true: theme.primary?.val ?? '#00EF8B',
            }}
            thumbColor={theme.white?.val ?? '#ffffff'}
          />
        </XStack>

        <Separator borderColor="$borderGlass" borderWidth={0.5} mb="$1" />

        {/* Token list with alphabet index */}
        <View style={{ flex: 1, position: 'relative' }}>
          {isCatalogLoading ? (
            <YStack px="$4" gap="$3" pt="$2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height={56} borderRadius={8} />
              ))}
            </YStack>
          ) : (
            <FlatList
              ref={listRef}
              data={flatData}
              keyExtractor={keyExtractor}
              renderItem={renderRow}
              contentContainerStyle={{ paddingBottom: 32, paddingRight: 28 }}
              onScrollToIndexFailed={() => {}}
              initialNumToRender={20}
              maxToRenderPerBatch={15}
              windowSize={10}
            />
          )}

          {!isCatalogLoading && (
            <AlphabetIndex
              letters={letters}
              activeIndex={activeIndex}
              onLetterPress={handleLetterPress}
            />
          )}
        </View>
      </YStack>
    </BackgroundWrapper>
  );
}
