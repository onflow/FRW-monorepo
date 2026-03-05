import { bridge } from '@onflow/frw-context';
import { CheckCircle } from '@onflow/frw-icons';
import { tokenQueryKeys, tokenQueries, useWalletStore, walletSelectors } from '@onflow/frw-stores';
import {
  BackgroundWrapper,
  ClaimDateHeader,
  ClaimItemRow,
  ClaimNFTCollectionRow,
  ClaimReceiverRow,
  SearchBar,
  SegmentedControl,
  Sheet,
  Skeleton,
  Text,
  XStack,
  YStack,
  useTheme,
} from '@onflow/frw-ui';
import { useQueries } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable } from 'react-native';

import type { ClaimItem, ClaimReceiver } from './claim-types';
import { transformFtToClaimItem, transformNftToClaimItem } from './claim-utils';

type SortOption = 'date' | 'name' | 'amount';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function sortItems(items: ClaimItem[], sort: SortOption): ClaimItem[] {
  const sorted = [...items];
  if (sort === 'date') {
    sorted.sort((a, b) => b.date.localeCompare(a.date));
  } else if (sort === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'amount') {
    sorted.sort((a, b) => {
      const aVal = a.usdValue ?? parseFloat(a.amount);
      const bVal = b.usdValue ?? parseFloat(b.amount);
      return bVal - aVal;
    });
  }
  return sorted;
}

/** LostAndFound is a Cadence contract — only Flow addresses have inbox data */
function isFlowAddress(account: ClaimReceiver): boolean {
  return account.type === 'main' || account.type === 'child';
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

type FilterTab = 'token' | 'nft';

interface ClaimTokensScreenProps {
  onItemPress?: (item: ClaimItem) => void;
  initialTab?: FilterTab;
}

export function ClaimTokensScreen({
  onItemPress,
  initialTab = 'token',
}: ClaimTokensScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const network = bridge.getNetwork() || 'mainnet';

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);
  const [collapsedAccounts, setCollapsedAccounts] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  // ── All receivable accounts (same source as send workflow) ───────────────
  const accounts = useWalletStore(walletSelectors.getAllAccounts);
  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);
  const loadAccountsFromBridge = useWalletStore((state) => state.loadAccountsFromBridge);
  const isAccountsLoading = useWalletStore((state) => state.isLoading);

  React.useEffect(() => {
    if (accounts.length === 0 && !isAccountsLoading) {
      loadAccountsFromBridge();
    }
  }, [loadAccountsFromBridge, accounts.length, isAccountsLoading]);

  const receivingAccounts: ClaimReceiver[] = useMemo(() => {
    if (accounts.length === 0) return [];

    const flowAccts = accounts
      .filter((a) => a.type === 'main' || a.type === 'child')
      .map((a) => ({
        id: a.address,
        name: a.name || truncateAddress(a.address),
        address: a.address,
        avatar: a.emojiInfo ? undefined : a.avatar,
        emojiInfo: a.emojiInfo,
        parentEmoji: a.parentEmoji,
        type: a.type,
      }));

    // Sort active account first
    const activeAddr = activeAccount?.address;
    if (activeAddr) {
      flowAccts.sort((a, b) => {
        if (a.address === activeAddr) return -1;
        if (b.address === activeAddr) return 1;
        return 0;
      });
    }

    return flowAccts;
  }, [accounts, activeAccount]);

  // ── Fetch inbox data per Flow account ───────────────────────────────────
  const flowAccounts = useMemo(() => receivingAccounts.filter(isFlowAddress), [receivingAccounts]);

  const inboxQueries = useQueries({
    queries: flowAccounts.map((account) => ({
      queryKey: tokenQueryKeys.inbox(account.address, network),
      queryFn: () => tokenQueries.fetchInbox(account.address, network),
      enabled: !!account.address,
      staleTime: 60_000,
    })),
  });

  const isInboxLoading = inboxQueries.some((q) => q.isLoading);

  // ── Build per-account ClaimItem[] from real data ────────────────────────
  const accountItemsMap = useMemo(() => {
    const map: Record<string, ClaimItem[]> = {};
    flowAccounts.forEach((account, idx) => {
      const result = inboxQueries[idx]?.data;
      if (!result) {
        map[account.address] = [];
        return;
      }
      const ftItems = result.fts.map((ft: any, i: number) => transformFtToClaimItem(ft, i));
      const nftItems = result.nfts.map((nft: any, i: number) => transformNftToClaimItem(nft, i));
      map[account.address] = [...ftItems, ...nftItems];
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowAccounts, inboxQueries.map((q) => q.dataUpdatedAt).join(',')]);

  // ── All items flattened for counts and search ───────────────────────────
  const allItems = useMemo(() => Object.values(accountItemsMap).flat(), [accountItemsMap]);

  const searchedAllItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.trim().toLowerCase();
    return allItems.filter(
      (i) => i.name.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q)
    );
  }, [search, allItems]);

  const tokenCount = searchedAllItems.filter((i) => i.type === 'token').length;
  const nftCount = searchedAllItems.filter((i) => i.type === 'nft').length;

  const segments = [`Tokens ${tokenCount}`, `NFTs ${nftCount}`] as const;
  const segmentValue = activeTab === 'token' ? segments[0] : segments[1];

  const toggleCollapse = useCallback((accountId: string) => {
    setCollapsedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  }, []);

  // ── Flat list rows (per-account) ──────────────────────────────────────

  type Row =
    | { kind: 'account'; account: ClaimReceiver; itemCount: number }
    | { kind: 'date'; date: string; accountId: string }
    | { kind: 'token'; item: ClaimItem; isLast: boolean; accountAddress: string };

  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];
    const q = search.trim().toLowerCase();

    for (const account of flowAccounts) {
      let items = accountItemsMap[account.address] ?? [];

      // Apply search filter
      if (q) {
        items = items.filter(
          (i) => i.name.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q)
        );
      }

      // Apply tab filter
      const byTab = items.filter((i) => i.type === activeTab);
      const sorted = sortItems(byTab, sortOption);

      // Skip accounts with no items for current tab
      if (sorted.length === 0) continue;

      result.push({ kind: 'account', account, itemCount: sorted.length });

      if (!collapsedAccounts.has(account.id)) {
        // Group by date
        const byDate = new Map<string, ClaimItem[]>();
        for (const item of sorted) {
          const dateKey = item.date || '';
          if (!byDate.has(dateKey)) byDate.set(dateKey, []);
          byDate.get(dateKey)!.push(item);
        }
        for (const [date, dateItems] of byDate.entries()) {
          if (date) {
            result.push({ kind: 'date', date, accountId: account.id });
          }
          dateItems.forEach((item, idx) => {
            result.push({
              kind: 'token',
              item,
              isLast: idx === dateItems.length - 1,
              accountAddress: account.address,
            });
          });
        }
      }
    }
    return result;
  }, [flowAccounts, accountItemsMap, search, activeTab, sortOption, collapsedAccounts]);

  // ── Render ───────────────────────────────────────────────────────────────

  const renderRow = useCallback(
    ({ item: row }: { item: Row }) => {
      if (row.kind === 'account') {
        return (
          <ClaimReceiverRow
            name={row.account.name}
            address={row.account.address}
            avatar={row.account.avatar}
            emojiInfo={row.account.emojiInfo}
            parentEmoji={row.account.parentEmoji}
            type={row.account.type}
            isCollapsed={collapsedAccounts.has(row.account.id)}
            onPress={() => toggleCollapse(row.account.id)}
          />
        );
      }

      if (row.kind === 'date') {
        return <ClaimDateHeader date={row.date} />;
      }

      const isActiveItem = row.accountAddress === activeAccount?.address;
      const disabled = !isActiveItem;

      if (row.item.type === 'nft') {
        return (
          <Pressable
            onPress={() => !disabled && onItemPress?.(row.item)}
            disabled={disabled}
            style={{ opacity: disabled ? 0.4 : 1 }}
          >
            <ClaimNFTCollectionRow
              name={row.item.name}
              logoURI={row.item.logoURI}
              itemCount={parseInt(row.item.amount, 10)}
              isLast={row.isLast}
            />
          </Pressable>
        );
      }

      return (
        <Pressable
          onPress={() => !disabled && onItemPress?.(row.item)}
          disabled={disabled}
          style={{ opacity: disabled ? 0.4 : 1 }}
        >
          <ClaimItemRow
            name={row.item.name}
            symbol={row.item.symbol}
            logoURI={row.item.logoURI}
            amount={row.item.amount}
            price={row.item.price}
            priceChange24h={row.item.priceChange24h}
            usdValue={row.item.usdValue}
            isLast={row.isLast}
            isVerified={row.item.isVerified}
          />
        </Pressable>
      );
    },
    [activeAccount, collapsedAccounts, onItemPress, toggleCollapse]
  );

  const keyExtractor = useCallback((item: Row, index: number) => {
    if (item.kind === 'account') return `account-${item.account.id}`;
    if (item.kind === 'date') return `date-${item.accountId}-${item.date}`;
    return `token-${item.item.id}-${index}`;
  }, []);

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'date', label: t('claim.sort.date', 'Date received') },
    { value: 'name', label: t('claim.sort.name', 'Token name') },
    { value: 'amount', label: t('claim.sort.amount', 'Amount') },
  ];

  const isLoading = isAccountsLoading || isInboxLoading;

  return (
    <BackgroundWrapper backgroundColor="$bg" px={0}>
      <YStack flex={1}>
        {/* Search */}
        <YStack px="$4" pt="$2" pb="$3">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={t('claim.searchPlaceholder', 'Search')}
          />
        </YStack>

        {/* Filter row */}
        <XStack px="$4" pb="$3" items="center" gap="$2">
          <SegmentedControl
            segments={segments as unknown as string[]}
            value={segmentValue}
            onChange={(value) => setActiveTab(value === segments[0] ? 'token' : 'nft')}
          />
          <XStack flex={1} />
        </XStack>

        {/* Claim list */}
        {isLoading ? (
          <YStack gap="$3" pt="$2">
            {Array.from({ length: 5 }).map((_, i) => (
              <YStack key={i}>
                <Skeleton height={52} borderRadius={0} />
                {i < 4 && (
                  <YStack pt="$3" gap="$3" px="$4">
                    <Skeleton height={56} borderRadius={8} />
                    <Skeleton height={56} borderRadius={8} />
                  </YStack>
                )}
              </YStack>
            ))}
          </YStack>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={keyExtractor}
            renderItem={renderRow}
            contentContainerStyle={{ paddingBottom: 32 }}
            initialNumToRender={20}
            maxToRenderPerBatch={15}
            windowSize={10}
            ListEmptyComponent={
              <YStack flex={1} items="center" justify="center" pt="$10">
                <Text color="$text2" fontSize={14}>
                  {t('claim.empty', 'No items to claim')}
                </Text>
              </YStack>
            }
          />
        )}
      </YStack>

      {/* Sort sheet */}
      <Sheet
        modal
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        snapPointsMode="fit"
        dismissOnSnapToBottom
        zIndex={100_000}
      >
        <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Handle />
        <Sheet.Frame bg="$bgDrawer" borderTopLeftRadius={16} borderTopRightRadius={16} pb="$6">
          <YStack pt="$4" pb="$2" px="$4">
            <Text fontSize={16} fontWeight="700" color="$text1">
              {t('claim.sort.title', 'Sort by')}
            </Text>
          </YStack>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                setSortOption(opt.value);
                setSortSheetOpen(false);
              }}
            >
              <XStack px="$4" py="$4" items="center" justify="space-between">
                <Text
                  fontSize={16}
                  color={sortOption === opt.value ? '$primary' : '$text1'}
                  fontWeight={sortOption === opt.value ? '600' : '400'}
                >
                  {opt.label}
                </Text>
                {sortOption === opt.value && (
                  <CheckCircle size={20} color={theme.primary?.val ?? '#00EF8B'} theme="filled" />
                )}
              </XStack>
            </Pressable>
          ))}
        </Sheet.Frame>
      </Sheet>
    </BackgroundWrapper>
  );
}
