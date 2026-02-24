import { bridge } from '@onflow/frw-context';
import {
  enableToken,
  tokenQueries,
  tokenQueryKeys,
  useWalletStore,
  walletSelectors,
} from '@onflow/frw-stores';
import type { FungibleTokenCatalogItem } from '@onflow/frw-types';
import {
  Avatar,
  BackgroundWrapper,
  SearchBar,
  Separator,
  Sheet,
  Skeleton,
  Text,
  XStack,
  YStack,
} from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Switch, TouchableOpacity, View } from 'react-native';

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
  const network = bridge.getNetwork() || 'mainnet';
  const queryClient = useQueryClient();

  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);
  const address = activeAccount?.address ?? '';

  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [confirmToken, setConfirmToken] = useState<FungibleTokenCatalogItem | null>(null);
  const [enablingSymbol, setEnablingSymbol] = useState<string | null>(null);
  const [enableError, setEnableError] = useState<string | null>(null);
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
      tokens = tokens.filter((t) => t.tags && t.tags.length > 0);
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

  // Flatten for FlatList: section headers + items
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

  const handleEnable = useCallback(async () => {
    if (!confirmToken?.flowIdentifier) return;
    setEnablingSymbol(confirmToken.symbol);
    setEnableError(null);
    try {
      logger.debug('[AddTokensScreen] Enabling token:', confirmToken.flowIdentifier);
      await enableToken(confirmToken.flowIdentifier);
      await queryClient.invalidateQueries({ queryKey: tokenQueryKeys.tokens(address, network) });
      setConfirmToken(null);
    } catch (err: unknown) {
      logger.error('[AddTokensScreen] Failed to enable token:', err);
      const message = err instanceof Error ? err.message : undefined;
      setEnableError(message ?? t('addTokens.enableError', 'Failed to enable token'));
    } finally {
      setEnablingSymbol(null);
    }
  }, [confirmToken, queryClient, address, network, t]);

  const renderRow = useCallback(
    ({ item }: { item: string | FungibleTokenCatalogItem }) => {
      // Section header
      if (typeof item === 'string') {
        return (
          <XStack px="$4" pt="$3" pb="$1">
            <Text fontSize={13} fontWeight="600" color="$text2">
              {item}
            </Text>
          </XStack>
        );
      }

      const isEnabled = enabledSet.has(item.symbol?.toLowerCase() ?? '');

      return (
        <XStack mx="$4" bg="$bg1" rounded="$3" mb="$1" px="$3" py="$3" items="center" gap="$3">
          <Avatar src={item.logoURI} alt={item.name} fallback={item.symbol?.[0] ?? '?'} size={40} />
          <YStack flex={1} gap="$0.5">
            <XStack items="center" gap="$1.5">
              <Text fontSize={15} fontWeight="600" color="$text1" numberOfLines={1}>
                {item.name}
              </Text>
            </XStack>
            <Text fontSize={13} color="$text2">
              {item.symbol}
            </Text>
          </YStack>
          {isEnabled ? (
            <XStack w={32} h={32} rounded="$10" bg="$primary" items="center" justify="center">
              <Text fontSize={18} color="$black" fontWeight="700">
                ✓
              </Text>
            </XStack>
          ) : (
            <TouchableOpacity onPress={() => setConfirmToken(item)}>
              <XStack w={32} h={32} rounded="$10" bg="$bg3" items="center" justify="center">
                <Text fontSize={20} color="$text1" fontWeight="400">
                  +
                </Text>
              </XStack>
            </TouchableOpacity>
          )}
        </XStack>
      );
    },
    [enabledSet]
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
          mt="$2"
          mb="$3"
          bg="$bg1"
          rounded="$4"
          px="$3"
          py="$3"
          items="center"
          gap="$3"
          pressStyle={{ opacity: 0.8 }}
        >
          <XStack w={40} h={40} rounded="$3" bg="$green2" items="center" justify="center">
            <Text fontSize={20}>📥</Text>
          </XStack>
          <YStack flex={1}>
            <Text fontSize={14} fontWeight="600" color="$text1">
              {t('addTokens.claimBannerTitle', 'Claim received tokens')}
            </Text>
            <Text fontSize={12} color="$text2">
              {t('addTokens.claimBannerSubtitle', 'You may have tokens waiting')}
            </Text>
          </YStack>
          <Text fontSize={18} color="$text2">
            ›
          </Text>
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
        <XStack px="$4" mb="$3" items="center" justify="space-between">
          <Text fontSize={14} fontWeight="500" color="$text1">
            {t('addTokens.verifiedOnly', 'Only show verified tokens')}
          </Text>
          <Switch
            value={verifiedOnly}
            onValueChange={setVerifiedOnly}
            trackColor={{ false: '#3e3e3e', true: '#00EF8B' }}
            thumbColor="#ffffff"
          />
        </XStack>

        <Separator borderColor="$light25" borderWidth={0.5} mb="$2" />

        {/* Token list with alphabet index */}
        <View style={{ flex: 1, position: 'relative' }}>
          {isCatalogLoading ? (
            <YStack px="$4" gap="$2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height={64} borderRadius={12} />
              ))}
            </YStack>
          ) : (
            <FlatList
              ref={listRef}
              data={flatData}
              keyExtractor={keyExtractor}
              renderItem={renderRow}
              contentContainerStyle={{ paddingBottom: 32, paddingRight: 32 }}
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
                <TouchableOpacity
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
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </YStack>

      {/* Enable token confirmation sheet */}
      <Sheet
        modal
        open={!!confirmToken}
        onOpenChange={(open) => !open && setConfirmToken(null)}
        snapPointsMode="fit"
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          bg="rgba(0,0,0,0.5)"
        />
        <Sheet.Handle bg="$gray8" />
        <Sheet.Frame bg="$bgDrawer" borderTopLeftRadius="$6" borderTopRightRadius="$6">
          {confirmToken && (
            <YStack p="$5" gap="$4" pb="$8">
              <Text fontSize={18} fontWeight="700" color="$text1" text="center">
                {t('addTokens.enableTitle', 'Enable Token')}
              </Text>

              <YStack items="center" gap="$3">
                <Avatar
                  src={confirmToken.logoURI}
                  alt={confirmToken.name}
                  fallback={confirmToken.symbol?.[0] ?? '?'}
                  size={64}
                />
                <Text fontSize={20} fontWeight="600" color="$text1">
                  {confirmToken.name}
                </Text>
                <Text fontSize={15} color="$text2">
                  {confirmToken.symbol}
                </Text>
              </YStack>

              <Text fontSize={13} color="$text2" text="center">
                {t(
                  'addTokens.enableDescription',
                  'Adding this token will create a vault in your Flow account to hold {{symbol}} tokens.',
                  { symbol: confirmToken.symbol }
                )}
              </Text>

              {enableError && (
                <Text fontSize={13} color="$error" text="center">
                  {enableError}
                </Text>
              )}

              <YStack
                bg="$primary"
                rounded="$4"
                height={52}
                items="center"
                justify="center"
                opacity={enablingSymbol ? 0.6 : 1}
                pressStyle={{ opacity: 0.8 }}
                onPress={enablingSymbol ? undefined : handleEnable}
                cursor="pointer"
              >
                <Text fontSize={16} fontWeight="600" color="$black">
                  {enablingSymbol
                    ? t('addTokens.enabling', 'Enabling...')
                    : t('addTokens.enableButton', 'Enable')}
                </Text>
              </YStack>
            </YStack>
          )}
        </Sheet.Frame>
      </Sheet>
    </BackgroundWrapper>
  );
}
