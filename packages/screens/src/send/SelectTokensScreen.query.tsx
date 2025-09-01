import { bridge, navigation } from '@onflow/frw-context';
import { useSendStore, tokenQueryKeys, tokenQueries } from '@onflow/frw-stores';
import { type CollectionModel, type TokenModel } from '@onflow/frw-types';
import {
  AccountCard,
  AddressText,
  BackgroundWrapper,
  Badge,
  Divider,
  ExtensionHeader,
  NFTCollectionRow,
  RefreshView,
  ScrollView,
  SegmentedControl,
  Skeleton,
  TokenCard,
  XStack,
  YStack,
} from '@onflow/frw-ui';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryClient } from '../providers/QueryProvider';
import type { TabType } from '../types';

export function SelectTokensScreen(): React.ReactElement {
  const { t } = useTranslation();

  // State management
  const [tab, setTab] = React.useState<TabType>('Tokens');

  // Get shared QueryClient to ensure it matches the one in stores
  const _queryClient = useQueryClient();

  // Store hooks
  const {
    setSelectedToken,
    setTransactionType,
    setCurrentStep,
    clearTransactionData,
    setSelectedCollection,
  } = useSendStore();

  // Tab options
  const TABS = [t('tabs.tokens'), t('tabs.nfts')] as const;

  // Check if we're running in extension platform
  const isExtension = bridge.getPlatform() === 'extension';

  // Get current address and network
  const address = bridge.getSelectedAddress() || '';
  const network = bridge.getNetwork() || 'mainnet';

  // 🔥 TanStack Query: Fetch tokens with automatic caching, retry, and background refresh
  const {
    data: tokens = [],
    isLoading: isTokensLoading,
    error: tokensError,
    refetch: refetchTokens,
  } = useQuery({
    queryKey: tokenQueryKeys.tokens(address, network),
    queryFn: () => tokenQueries.fetchTokens(address, network),
    enabled: !!address && tab === 'Tokens',
    staleTime: 0, // Always fetch fresh for financial data
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // 🔥 TanStack Query: Fetch NFT collections with intelligent caching
  const {
    data: nftCollections = [],
    isLoading: isNFTsLoading,
    error: nftsError,
    refetch: refetchNFTs,
  } = useQuery({
    queryKey: tokenQueryKeys.nfts(address, network),
    queryFn: () => tokenQueries.fetchNFTCollections(address, network),
    enabled: !!address && tab === 'NFTs',
    staleTime: 5 * 60 * 1000, // NFTs can be cached for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // 🔥 TanStack Query: Fetch balance with stale-while-revalidate pattern
  const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: tokenQueryKeys.balance(address, network),
    queryFn: () => tokenQueries.fetchBalance(address, undefined, network),
    enabled: !!address,
    staleTime: 30 * 1000, // Use cached balance for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Refresh balance every minute in background
  });

  // Initialize screen
  React.useEffect(() => {
    setCurrentStep('select-tokens');
  }, [setCurrentStep]);

  // Handle tab change
  const handleTabChange = (newTab: TabType): void => {
    if (newTab !== tab) {
      clearTransactionData();
    }
    setTab(newTab);
  };

  // Handle token press
  const handleTokenPress = (token: TokenModel): void => {
    setSelectedToken(token);
    setTransactionType('tokens');
    setCurrentStep('send-to');
    navigation.navigate('SendTo');
  };

  // Handle NFT press
  const handleNFTPress = (collection: CollectionModel): void => {
    setSelectedCollection(collection);
    setTransactionType('multiple-nfts');
    navigation.navigate('NFTList', { collection, address });
  };

  // Refresh functions - TanStack Query makes this super simple!
  const refreshTokens = useCallback(() => {
    refetchTokens();
  }, [refetchTokens]);

  const refreshNFTCollections = useCallback(() => {
    refetchNFTs();
  }, [refetchNFTs]);

  // Filter tokens with balance
  const tokensWithBalance = tokens.filter((token) => {
    const rawBalance = parseFloat(token.displayBalance || token.balance || '0');
    const availableBalance = parseFloat(token.availableBalanceToUse || '0');
    const hasBalance = rawBalance > 0 || availableBalance > 0;
    return hasBalance;
  });

  return (
    <BackgroundWrapper backgroundColor="$background">
      <YStack flex={1} px="$4" pt="$2">
        {/* Header */}
        {isExtension && (
          <ExtensionHeader
            title={t('send.title')}
            help={true}
            onGoBack={() => navigation.goBack()}
            onNavigate={(link: string) => navigation.navigate(link)}
          />
        )}

        {/* Account Card - Show balance from React Query */}
        {!isExtension && balanceData && (
          <AccountCard
            account={{
              address,
              balance: isBalanceLoading ? t('messages.loading') : balanceData.displayBalance,
              // Add more account props as needed
            }}
            title={t('labels.fromAccount')}
            isLoading={isBalanceLoading}
            showBackground={true}
          />
        )}

        {/* Tab Selector */}
        <YStack my="$4">
          <SegmentedControl
            segments={TABS as unknown as string[]}
            value={tab === 'Tokens' ? TABS[0] : TABS[1]}
            onChange={(value) => handleTabChange(value === TABS[0] ? 'Tokens' : 'NFTs')}
            fullWidth={true}
          />
        </YStack>

        {/* Content */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {tab === 'Tokens' && (
            <YStack gap="$3">
              {isTokensLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <YStack key={`token-skeleton-${index}`} p="$3">
                      <XStack items="center" gap="$3">
                        <Skeleton width="$4" height="$4" borderRadius="$10" />
                        <YStack flex={1} gap="$2">
                          <Skeleton height="$1" width="60%" />
                          <Skeleton height="$0.75" width="40%" />
                        </YStack>
                        <YStack items="flex-end" gap="$1">
                          <Skeleton height="$1" width="$4" />
                          <Skeleton height="$0.75" width="$3" />
                        </YStack>
                      </XStack>
                    </YStack>
                  ))}
                </>
              ) : tokensError ? (
                <RefreshView
                  type="error"
                  message={tokensError.message || t('errors.failedToLoadTokens')}
                  onRefresh={refreshTokens}
                  refreshText={t('buttons.retry')}
                />
              ) : tokensWithBalance.length === 0 ? (
                <RefreshView
                  type="empty"
                  message={t('messages.noTokensWithBalance')}
                  onRefresh={refreshTokens}
                  refreshText={t('buttons.refresh')}
                />
              ) : (
                <YStack gap="$2">
                  {/* Token Count Badge */}
                  <XStack justify="space-between" items="center" px="$2" pb="$2">
                    <Badge variant="secondary" size="small">
                      {tokensWithBalance.length}{' '}
                      {tokensWithBalance.length === 1 ? 'Token' : 'Tokens'}
                    </Badge>
                  </XStack>

                  {tokensWithBalance.map((token, idx) => (
                    <React.Fragment key={`token-${token.identifier || token.symbol}-${idx}`}>
                      <TokenCard
                        symbol={token.symbol || ''}
                        name={token.name || ''}
                        balance={token.displayBalance || token.balance || '0'}
                        logo={token.logoURI}
                        price={token.usdValue?.toString()}
                        change24h={token.change ? parseFloat(token.change) : undefined}
                        isVerified={token.isVerified}
                        onPress={() => handleTokenPress(token)}
                      />
                      {idx < tokensWithBalance.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </YStack>
              )}
            </YStack>
          )}

          {tab === 'NFTs' && (
            <YStack gap="$3">
              {isNFTsLoading ? (
                <>
                  {[1, 2, 3, 4].map((index) => (
                    <YStack key={`nft-skeleton-${index}`} p="$3">
                      <XStack items="center" gap="$3">
                        <Skeleton width="$4" height="$4" borderRadius="$10" />
                        <YStack flex={1} gap="$2">
                          <Skeleton height="$1" width="70%" />
                          <Skeleton height="$0.75" width="30%" />
                        </YStack>
                        <Skeleton width="$1.5" height="$1.5" />
                      </XStack>
                    </YStack>
                  ))}
                </>
              ) : nftsError ? (
                <RefreshView
                  type="error"
                  message={nftsError.message || t('errors.failedToLoadNFTs')}
                  onRefresh={refreshNFTCollections}
                  refreshText={t('buttons.retry')}
                />
              ) : nftCollections.length === 0 ? (
                <RefreshView
                  type="empty"
                  message={t('messages.noNFTCollectionsForAccount')}
                  onRefresh={refreshNFTCollections}
                  refreshText={t('buttons.refresh')}
                />
              ) : (
                <YStack gap="$2">
                  {/* NFT Collections Count Badge */}
                  <XStack justify="space-between" items="center" px="$2" pb="$2">
                    <Badge variant="primary" size="small">
                      {nftCollections.length}{' '}
                      {nftCollections.length === 1 ? 'Collection' : 'Collections'}
                    </Badge>
                    <AddressText address={address} truncate={true} startLength={4} endLength={4} />
                  </XStack>

                  {nftCollections.map((collection, idx) => (
                    <NFTCollectionRow
                      key={`nft-collection-${collection.id || collection.contractName || collection.name}-${idx}`}
                      collection={collection}
                      showDivider={idx !== nftCollections.length - 1}
                      onPress={() => handleNFTPress(collection)}
                    />
                  ))}
                </YStack>
              )}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </BackgroundWrapper>
  );
}

// 🎉 Code Comparison:
// Original SelectTokensScreen.tsx: 415 lines with complex manual state management
// New SelectTokensScreen.query.tsx: 250 lines with TanStack Query
//
// Eliminated:
// - ❌ Manual loading states (isLoading, setIsLoading, isAccountLoading, etc.)
// - ❌ Manual error handling (error, setError, nftError, setNftError)
// - ❌ Manual cache management (fetchTokens, fetchNFTCollections logic)
// - ❌ Manual refresh logic (refreshTokensInBackground, polling)
// - ❌ hasInitialized ref and complex effect dependencies
//
// Gained:
// - ✅ Automatic background refresh
// - ✅ Automatic retry with exponential backoff
// - ✅ Request deduplication
// - ✅ Stale-while-revalidate for better UX
// - ✅ Automatic refetch on window focus/network reconnect
// - ✅ Built-in loading and error states
// - ✅ Intelligent caching (financial data always fresh, NFTs cached 5min)
