import { bridge } from '@onflow/frw-context';
import { CheckCircleFill, ChevronRight, Inbox, Plus, VerifiedToken } from '@onflow/frw-icons';
import { tokenQueries, tokenQueryKeys, useWalletStore, walletSelectors } from '@onflow/frw-stores';
import type { FungibleTokenCatalogItem } from '@onflow/frw-types';
import {
  Avatar,
  BackgroundWrapper,
  SearchBar,
  Separator,
  Skeleton,
  Text,
  XStack,
  YStack,
  useTheme,
} from '@onflow/frw-ui';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Switch, View } from 'react-native';

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

export function AddTokensScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const network = bridge.getNetwork() || 'mainnet';

  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);
  const address = activeAccount?.address ?? '';

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
      // Section letter header
      if (typeof item === 'string') {
        return (
          <XStack px="$2" pt="$4" pb="$2">
            <Text fontSize={12} fontWeight="500" color="$text2" letterSpacing={0.5}>
              {item}
            </Text>
          </XStack>
        );
      }

      const isEnabled = enabledSet.has(item.symbol?.toLowerCase() ?? '');
      const isLastInGroup = (() => {
        const next = flatData[index + 1];
        return next === undefined || typeof next === 'string';
      })();

      return (
        <YStack>
          <XStack py="$3" items="center" gap="$3">
            <Avatar
              src={item.logoURI}
              alt={item.name}
              fallback={item.symbol?.[0] ?? '?'}
              size={44}
            />
            <YStack flex={1} gap="$0.5">
              <XStack items="center" gap="$1.5">
                <Text fontSize={15} fontWeight="600" color="$text1" numberOfLines={1} shrink={1}>
                  {item.name}
                </Text>
                {item.isVerified && <VerifiedToken size={14} color="#41CC5D" />}
              </XStack>
              <Text fontSize={13} color="$text2">
                {item.symbol}
              </Text>
            </YStack>
            {isEnabled ? (
              <CheckCircleFill size={24} color={theme.primary?.val ?? '#00EF8B'} />
            ) : (
              <XStack
                w={32}
                h={32}
                rounded="$10"
                borderWidth={1.5}
                borderColor="$primary"
                items="center"
                justify="center"
                onPress={() => handleAddToken(item.flowIdentifier)}
                pressStyle={{ opacity: 0.7 }}
                cursor="pointer"
              >
                <Plus size={16} color={theme.primary?.val ?? '#00EF8B'} theme="outline" />
              </XStack>
            )}
          </XStack>
          {!isLastInGroup && <Separator borderColor="rgba(255,255,255,0.15)" borderWidth={0.5} />}
        </YStack>
      );
    },
    [enabledSet, flatData, theme, handleAddToken]
  );

  const keyExtractor = useCallback(
    (item: string | FungibleTokenCatalogItem, index: number) =>
      typeof item === 'string' ? `header-${item}` : `token-${item.symbol}-${index}`,
    []
  );

  return (
    <BackgroundWrapper backgroundColor="$bg">
      <YStack flex={1}>
        {/* Claim received tokens banner */}
        <XStack
          mx="$4"
          mt="$3"
          mb="$3"
          bg="$bg1"
          rounded="$4"
          px="$3"
          py="$3"
          items="center"
          gap="$3"
          pressStyle={{ opacity: 0.75 }}
        >
          <Inbox size={24} color={theme.primary?.val ?? '#00EF8B'} theme="outline" />
          <Text flex={1} fontSize={14} fontWeight="600" color="$text1">
            {t('addTokens.claimBannerTitle', 'Claim received tokens')}
          </Text>
          <ChevronRight size={18} color={theme.text2?.val ?? '#767676'} theme="outline" />
        </XStack>

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
            <VerifiedToken size={16} color="#41CC5D" />
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

        <Separator borderColor="rgba(255,255,255,0.15)" borderWidth={0.5} mb="$1" />

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

          {/* Alphabet sidebar */}
          {!isCatalogLoading && letters.length > 0 && (
            <View
              style={{
                position: 'absolute',
                right: 4,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {letters.map((letter) => (
                <Pressable
                  key={letter}
                  onPress={() => handleLetterPress(letter)}
                  style={{ paddingVertical: 2, paddingHorizontal: 4 }}
                >
                  <Text
                    fontSize={11}
                    fontWeight={activeIndex === letter ? '700' : '500'}
                    color={activeIndex === letter ? '$primary' : '$text2'}
                  >
                    {letter}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </YStack>
    </BackgroundWrapper>
  );
}
