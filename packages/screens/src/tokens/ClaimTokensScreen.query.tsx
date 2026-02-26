import { ArrowDownWideNarrow } from '@onflow/frw-icons';
import { useWalletStore, walletSelectors } from '@onflow/frw-stores';
import {
  BackgroundWrapper,
  ClaimDateHeader,
  ClaimItemRow,
  ClaimSenderRow,
  SearchBar,
  SegmentedControl,
  Skeleton,
  Text,
  XStack,
  YStack,
  useTheme,
} from '@onflow/frw-ui';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClaimSender {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  emojiInfo?: { emoji: string; name: string; color: string };
  parentEmoji?: { emoji: string; name: string; color: string };
  type?: 'main' | 'child' | 'evm' | 'eoa';
}

// Stub item type — senderIndex maps to the first/second contact in the address book
interface ClaimItem {
  id: string;
  type: 'token' | 'nft';
  name: string;
  symbol: string;
  logoURI?: string;
  amount: string;
  price?: number;
  priceChange24h?: number;
  usdValue?: number;
  date: string;
  senderIndex: number; // 0 = first contact, 1 = second contact
}

// ---------------------------------------------------------------------------
// Mock item data (amounts/prices stubbed until backend is ready)
// Senders are resolved from the real address book at runtime
// ---------------------------------------------------------------------------

const MOCK_ITEMS: ClaimItem[] = [
  {
    id: 't1',
    type: 'token',
    name: 'Flow',
    symbol: 'FLOW',
    logoURI: 'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/src/tokens/FLOW/logo.png',
    amount: '100',
    price: 0.75,
    priceChange24h: 2.3,
    usdValue: 75,
    date: '2025/09/15',
    senderIndex: 0,
  },
  {
    id: 't2',
    type: 'token',
    name: 'BLC Token',
    symbol: 'BLC',
    amount: '50000',
    price: 0.00001,
    priceChange24h: -1.2,
    usdValue: 0.5,
    date: '2025/09/15',
    senderIndex: 0,
  },
  {
    id: 't3',
    type: 'token',
    name: 'USD Coin',
    symbol: 'USDC',
    logoURI:
      'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    amount: '25',
    price: 1.0,
    priceChange24h: 0.01,
    usdValue: 25,
    date: '2025/09/15',
    senderIndex: 1,
  },
  {
    id: 'n1',
    type: 'nft',
    name: 'Flovatar #1234',
    symbol: 'FLOVATAR',
    amount: '1',
    date: '2025/09/14',
    senderIndex: 0,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

type FilterTab = 'token' | 'nft';

export function ClaimTokensScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('token');
  const [collapsedAccounts, setCollapsedAccounts] = useState<Set<string>>(new Set());

  // ── All receivable accounts (same source as send workflow) ───────────────
  const accounts = useWalletStore(walletSelectors.getAllAccounts);
  const loadAccountsFromBridge = useWalletStore((state) => state.loadAccountsFromBridge);
  const isLoading = useWalletStore((state) => state.isLoading);

  React.useEffect(() => {
    if (accounts.length === 0 && !isLoading) {
      loadAccountsFromBridge();
    }
  }, [loadAccountsFromBridge, accounts.length, isLoading]);

  const receivingAccounts: ClaimSender[] = useMemo(() => {
    if (accounts.length > 0) {
      return accounts.map((a) => ({
        id: a.address,
        name: a.name || truncateAddress(a.address),
        address: a.address,
        avatar: a.emojiInfo ? undefined : a.avatar,
        emojiInfo: a.emojiInfo,
        parentEmoji: a.parentEmoji,
        type: a.type,
      }));
    }
    return [{ id: 'loading', name: '—', address: '—', avatar: undefined }];
  }, [accounts]);

  // ── Filter and group items ───────────────────────────────────────────────

  const tokenCount = MOCK_ITEMS.filter((i) => i.type === 'token').length;
  const nftCount = MOCK_ITEMS.filter((i) => i.type === 'nft').length;

  const segments = [`Tokens ${tokenCount}`, `NFTs ${nftCount}`] as const;
  const segmentValue = activeTab === 'token' ? segments[0] : segments[1];

  const filteredItems = useMemo(() => {
    let items = MOCK_ITEMS.filter((i) => i.type === activeTab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeTab, search]);

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

  // ── Flat list rows ───────────────────────────────────────────────────────

  type Row =
    | { kind: 'account'; account: ClaimSender; itemCount: number }
    | { kind: 'date'; date: string; accountId: string }
    | { kind: 'token'; item: ClaimItem; isLast: boolean };

  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];
    for (const account of receivingAccounts) {
      result.push({ kind: 'account', account, itemCount: filteredItems.length });
      if (!collapsedAccounts.has(account.id)) {
        const byDate = new Map<string, ClaimItem[]>();
        for (const item of filteredItems) {
          if (!byDate.has(item.date)) byDate.set(item.date, []);
          byDate.get(item.date)!.push(item);
        }
        for (const [date, dateItems] of byDate.entries()) {
          result.push({ kind: 'date', date, accountId: account.id });
          dateItems.forEach((item, idx) => {
            result.push({ kind: 'token', item, isLast: idx === dateItems.length - 1 });
          });
        }
      }
    }
    return result;
  }, [filteredItems, receivingAccounts, collapsedAccounts]);

  // ── Render ───────────────────────────────────────────────────────────────

  const renderRow = useCallback(
    ({ item: row }: { item: Row }) => {
      if (row.kind === 'account') {
        return (
          <ClaimSenderRow
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

      return (
        <ClaimItemRow
          name={row.item.name}
          symbol={row.item.symbol}
          logoURI={row.item.logoURI}
          amount={row.item.amount}
          price={row.item.price}
          priceChange24h={row.item.priceChange24h}
          usdValue={row.item.usdValue}
          isLast={row.isLast}
        />
      );
    },
    [collapsedAccounts, toggleCollapse]
  );

  const keyExtractor = useCallback((item: Row, index: number) => {
    if (item.kind === 'account') return `account-${item.account.id}`;
    if (item.kind === 'date') return `date-${item.accountId}-${item.date}`;
    return `token-${item.item.id}-${index}`;
  }, []);

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
          <Pressable>
            <ArrowDownWideNarrow size={24} color={theme.text2?.val ?? '#767676'} theme="outline" />
          </Pressable>
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
    </BackgroundWrapper>
  );
}
