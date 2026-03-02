import type { NFTCollection } from '@onflow/frw-api';
import { bridge } from '@onflow/frw-context';
import { CheckCircleFill, Plus } from '@onflow/frw-icons';
import { tokenQueries, tokenQueryKeys, useWalletStore, walletSelectors } from '@onflow/frw-stores';
import type { CollectionModel } from '@onflow/frw-types';
import {
  AlphabetIndex,
  Avatar,
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
import { FlatList, View } from 'react-native';

interface CollectionGroup {
  letter: string;
  data: NFTCollection[];
}

function groupByLetter(collections: NFTCollection[]): CollectionGroup[] {
  const map = new Map<string, NFTCollection[]>();
  for (const collection of collections) {
    const letter = (collection.name?.[0] ?? '#').toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    const group = map.get(letter);
    if (group) group.push(collection);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, data]) => ({ letter, data }));
}

interface AddNFTCollectionScreenProps {
  onClaimPress?: () => void;
}

export function AddNFTCollectionScreen({
  onClaimPress,
}: AddNFTCollectionScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const network = bridge.getNetwork() || 'mainnet';

  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);
  const address = activeAccount?.address ?? '';

  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  const listRef = useRef<FlatList>(null);

  const { data: catalog = [], isLoading: isCatalogLoading } = useQuery({
    queryKey: tokenQueryKeys.nftCatalog(network),
    queryFn: () => tokenQueries.fetchNFTCatalog(network),
    staleTime: 5 * 60 * 1000,
  });

  const { data: userCollections = [], isLoading: isUserCollectionsLoading } = useQuery({
    queryKey: tokenQueryKeys.nfts(address, network),
    queryFn: () => tokenQueries.fetchNFTCollections(address, network),
    enabled: !!address,
    staleTime: 30_000,
  });

  const enabledSet = useMemo<Set<string>>(
    () =>
      new Set(
        (userCollections as CollectionModel[])
          .map((c) => c.flowIdentifier)
          .filter((id): id is string => !!id)
      ),
    [userCollections]
  );

  const filteredCollections = useMemo(() => {
    if (!search.trim()) return catalog;
    const q = search.trim().toLowerCase();
    return catalog.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.contractName?.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  const groups = useMemo(() => groupByLetter(filteredCollections), [filteredCollections]);
  const letters = useMemo(() => groups.map((g) => g.letter), [groups]);

  const flatData = useMemo(() => {
    const rows: (string | NFTCollection)[] = [];
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

  const handleAddCollection = useCallback((flowIdentifier: string | undefined) => {
    if (!flowIdentifier) return;
    bridge.closeRNWithNFT(flowIdentifier);
  }, []);

  const renderRow = useCallback(
    ({ item, index }: { item: string | NFTCollection; index: number }) => {
      if (typeof item === 'string') {
        return <TokenSectionHeader letter={item} />;
      }

      const isEnabled = !!item.flowIdentifier && enabledSet.has(item.flowIdentifier);
      const isLast = (() => {
        const next = flatData[index + 1];
        return next === undefined || typeof next === 'string';
      })();

      return (
        <YStack>
          <XStack py="$3" pl="$4" items="center" gap="$3">
            <Avatar
              src={item.logo ?? item.logoURI}
              alt={item.name}
              fallback={item.name?.[0] ?? '?'}
              size={44}
            />
            <YStack flex={1} gap="$0.5">
              <Text fontSize={15} fontWeight="600" color="$text1" numberOfLines={1}>
                {item.name}
              </Text>
              <Text fontSize={13} color="$text2" numberOfLines={1}>
                {item.contractName}
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
                onPress={() => handleAddCollection(item.flowIdentifier)}
                pressStyle={{ opacity: 0.7 }}
                cursor="pointer"
              >
                <Plus size={16} color={theme.primary?.val ?? '#00EF8B'} theme="outline" />
              </XStack>
            )}
          </XStack>
          {!isLast && <Separator borderColor="$borderGlass" borderWidth={0.5} />}
        </YStack>
      );
    },
    [enabledSet, flatData, handleAddCollection, theme]
  );

  const keyExtractor = useCallback(
    (item: string | NFTCollection, index: number) =>
      typeof item === 'string'
        ? `header-${item}`
        : `collection-${item.flowIdentifier ?? item.id ?? item.contractName}-${index}`,
    []
  );

  return (
    <BackgroundWrapper backgroundColor="$bg" px={0}>
      <YStack flex={1}>
        <ClaimBanner
          title={t('addNFTCollection.claimBannerTitle', 'Claim received NFTs')}
          onPress={onClaimPress}
        />

        <YStack px="$4" mb="$3">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={t('addNFTCollection.searchPlaceholder', 'Search NFT Collection')}
          />
        </YStack>

        <Separator borderColor="$borderGlass" borderWidth={0.5} mb="$1" />

        <View style={{ flex: 1, position: 'relative' }}>
          {isCatalogLoading || isUserCollectionsLoading ? (
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
