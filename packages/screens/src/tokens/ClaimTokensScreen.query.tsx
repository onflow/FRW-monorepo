import { ChevronDown, ChevronRight, SwitchVertical } from '@onflow/frw-icons';
import { addressBookQueryKeys, addressBookQueries } from '@onflow/frw-stores';
import {
  Avatar,
  BackgroundWrapper,
  SearchBar,
  SegmentedControl,
  Separator,
  Text,
  XStack,
  YStack,
  useTheme,
} from '@onflow/frw-ui';
import { useQuery } from '@tanstack/react-query';
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

const AVATAR_COLORS = ['#FF6B35', '#9B59B6', '#3498DB', '#27AE60', '#E67E22', '#E74C3C'];

function avatarColorForAddress(address: string): string {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toPrecision(2)}`;
}

function formatAmount(amount: string, symbol: string): string {
  const n = parseFloat(amount);
  const formatted = n >= 1000 ? n.toLocaleString() : amount;
  return `${formatted} ${symbol}`;
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface PriceChangeBadgeProps {
  value: number;
}

function PriceChangeBadge({ value }: PriceChangeBadgeProps) {
  const isPositive = value >= 0;
  const bg = isPositive ? 'rgba(65, 204, 93, 0.15)' : 'rgba(255, 77, 77, 0.15)';
  const color = isPositive ? '#41CC5D' : '#FF4D4D';
  return (
    <XStack bg={bg} rounded="$10" px="$1.5" py="$0.5" items="center">
      <Text fontSize={10} fontWeight="600" color={color}>
        {isPositive ? '+' : ''}
        {value.toFixed(1)}%
      </Text>
    </XStack>
  );
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
  const [collapsedSenders, setCollapsedSenders] = useState<Set<string>>(new Set());

  // ── Address book queries (same pattern as SendToScreen) ──────────────────

  const { data: userUid } = useQuery({
    queryKey: addressBookQueryKeys.currentUserUid(),
    queryFn: () => addressBookQueries.fetchCurrentUserUid(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  const isUidResolved = userUid !== undefined;
  const scopedUid = userUid ?? null;

  const { data: contacts = [] } = useQuery({
    queryKey: addressBookQueryKeys.contacts(scopedUid),
    queryFn: () => addressBookQueries.fetchContacts(),
    enabled: isUidResolved,
    staleTime: 30_000,
    refetchOnMount: 'always',
  });

  // Map contacts to ClaimSender; fall back to placeholder if address book is empty
  const senders: ClaimSender[] = useMemo(() => {
    if (contacts.length > 0) {
      return contacts.slice(0, 5).map((c) => ({
        id: c.id,
        name: c.name || truncateAddress(c.address),
        address: c.address,
        avatar: c.avatar,
      }));
    }
    // Placeholder senders shown while contacts load or if address book is empty
    return [
      { id: 'placeholder-0', name: '—', address: '—', avatar: undefined },
      { id: 'placeholder-1', name: '—', address: '—', avatar: undefined },
    ];
  }, [contacts]);

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

  // Group by sender (resolved from real contacts)
  const senderGroups = useMemo(() => {
    const map = new Map<string, ClaimItem[]>();
    for (const item of filteredItems) {
      const sender = senders[item.senderIndex] ?? senders[0];
      if (!sender) continue;
      if (!map.has(sender.id)) map.set(sender.id, []);
      map.get(sender.id)!.push(item);
    }
    return Array.from(map.entries()).map(([senderId, items]) => ({
      sender: senders.find((s) => s.id === senderId)!,
      items,
    }));
  }, [filteredItems, senders]);

  const toggleCollapse = useCallback((senderId: string) => {
    setCollapsedSenders((prev) => {
      const next = new Set(prev);
      if (next.has(senderId)) {
        next.delete(senderId);
      } else {
        next.add(senderId);
      }
      return next;
    });
  }, []);

  // ── Flat list rows ───────────────────────────────────────────────────────

  type Row =
    | { kind: 'sender'; sender: ClaimSender; itemCount: number }
    | { kind: 'date'; date: string; senderId: string }
    | { kind: 'token'; item: ClaimItem; isLast: boolean };

  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];
    for (const { sender, items } of senderGroups) {
      result.push({ kind: 'sender', sender, itemCount: items.length });
      if (!collapsedSenders.has(sender.id)) {
        const byDate = new Map<string, ClaimItem[]>();
        for (const item of items) {
          if (!byDate.has(item.date)) byDate.set(item.date, []);
          byDate.get(item.date)!.push(item);
        }
        for (const [date, dateItems] of byDate.entries()) {
          result.push({ kind: 'date', date, senderId: sender.id });
          dateItems.forEach((item, idx) => {
            result.push({ kind: 'token', item, isLast: idx === dateItems.length - 1 });
          });
        }
      }
    }
    return result;
  }, [senderGroups, collapsedSenders]);

  // ── Render ───────────────────────────────────────────────────────────────

  const renderRow = useCallback(
    ({ item: row }: { item: Row }) => {
      if (row.kind === 'sender') {
        const isCollapsed = collapsedSenders.has(row.sender.id);
        const avatarColor = avatarColorForAddress(row.sender.address);
        const initial = row.sender.name !== '—' ? row.sender.name[0].toUpperCase() : '?';

        return (
          <Pressable onPress={() => toggleCollapse(row.sender.id)}>
            <XStack px="$4" py="$3" items="center" gap="$3" bg="$bg">
              <Avatar
                src={row.sender.avatar}
                alt={row.sender.name}
                fallback={initial}
                size={36}
                fallbackStyle={{ backgroundColor: avatarColor }}
              />
              <YStack flex={1} gap="$0.5">
                <Text fontSize={14} fontWeight="600" color="$text1">
                  {row.sender.name}
                </Text>
                <Text fontSize={12} color="$text2">
                  {truncateAddress(row.sender.address)}
                </Text>
              </YStack>
              {isCollapsed ? (
                <ChevronRight size={18} color={theme.text2?.val ?? '#767676'} theme="outline" />
              ) : (
                <ChevronDown size={18} color={theme.text2?.val ?? '#767676'} theme="outline" />
              )}
            </XStack>
          </Pressable>
        );
      }

      if (row.kind === 'date') {
        return (
          <XStack px="$4" pt="$2" pb="$1">
            <Text fontSize={12} color="$text3">
              {row.date}
            </Text>
          </XStack>
        );
      }

      const { item, isLast } = row;
      return (
        <YStack>
          <XStack px="$4" py="$3" items="center" gap="$3">
            <Avatar src={item.logoURI} alt={item.name} fallback={item.symbol[0]} size={40} />
            <YStack flex={1} gap="$0.5">
              <XStack items="center" gap="$1.5">
                <Text fontSize={14} fontWeight="600" color="$text1">
                  {item.name}
                </Text>
                {item.priceChange24h !== undefined && (
                  <PriceChangeBadge value={item.priceChange24h} />
                )}
              </XStack>
              {item.price !== undefined && (
                <Text fontSize={12} color="$text2">
                  {formatPrice(item.price)}
                </Text>
              )}
            </YStack>
            <YStack items="flex-end" gap="$0.5">
              <Text fontSize={14} fontWeight="600" color="$text1">
                {formatAmount(item.amount, item.symbol)}
              </Text>
              {item.usdValue !== undefined && (
                <Text fontSize={12} color="$text2">
                  {formatUsd(item.usdValue)}
                </Text>
              )}
            </YStack>
          </XStack>
          {!isLast && <Separator mx="$4" borderColor="rgba(255,255,255,0.08)" borderWidth={0.5} />}
        </YStack>
      );
    },
    [collapsedSenders, toggleCollapse, theme]
  );

  const keyExtractor = useCallback((item: Row, index: number) => {
    if (item.kind === 'sender') return `sender-${item.sender.id}`;
    if (item.kind === 'date') return `date-${item.senderId}-${item.date}`;
    return `token-${item.item.id}-${index}`;
  }, []);

  return (
    <BackgroundWrapper backgroundColor="$bg">
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
            <XStack w={36} h={36} rounded="$4" bg="$bg1" items="center" justify="center">
              <SwitchVertical size={18} color={theme.text2?.val ?? '#767676'} theme="outline" />
            </XStack>
          </Pressable>
        </XStack>

        <Separator borderColor="rgba(255,255,255,0.15)" borderWidth={0.5} />

        {/* Claim list */}
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
      </YStack>
    </BackgroundWrapper>
  );
}
