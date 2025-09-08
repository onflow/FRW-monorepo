import { bridge, navigation } from '@onflow/frw-context';
import {
  useSendStore,
  sendSelectors,
  tokenQueryKeys,
  tokenQueries,
  useWalletStore,
  walletSelectors,
} from '@onflow/frw-stores';
import { type CollectionModel, type TokenModel, type WalletAccount } from '@onflow/frw-types';
import {
  AccountSelector,
  BackgroundWrapper,
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
    setFromAccount,
  } = useSendStore();

  // Tab options
  const TABS = [t('tabs.tokens'), t('tabs.nfts')] as const;

  // Check if we're running in extension platform
  const isExtension = bridge.getPlatform() === 'extension';

  // Get current address and network - prioritize fromAccount in send store
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const bridgeAddress = bridge.getSelectedAddress() || '';
  const address = fromAccount?.address || bridgeAddress;
  const network = bridge.getNetwork() || 'mainnet';

  // Get wallet accounts for modal selection
  const accounts = useWalletStore(walletSelectors.getAllAccounts);
  const loadAccountsFromBridge = useWalletStore((state) => state.loadAccountsFromBridge);
  const isLoadingWallet = useWalletStore((state) => state.isLoading);

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

  // 🔥 TanStack Query: Fetch batch balances for all accounts
  const { data: batchBalances, isLoading: isLoadingBatchBalances } = useQuery({
    queryKey: ['batchBalances', accounts.map((acc) => acc.address)],
    queryFn: () => tokenQueries.fetchBatchFlowBalances(accounts.map((acc) => acc.address)),
    enabled: accounts.length > 0,
    staleTime: 30 * 1000, // Use cached balances for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Refresh balances every minute in background
  });

  // Initialize screen
  React.useEffect(() => {
    setCurrentStep('select-tokens');
  }, [setCurrentStep]);

  // Initialize wallet accounts on mount (only if not already loaded)
  React.useEffect(() => {
    if (accounts.length === 0 && !isLoadingWallet) {
      loadAccountsFromBridge();
    }
  }, [loadAccountsFromBridge, accounts.length, isLoadingWallet]);

  // Initialize fromAccount if not set and we have accounts loaded
  React.useEffect(() => {
    if (!fromAccount && accounts.length > 0 && bridgeAddress) {
      const matchingAccount = accounts.find(
        (acc: WalletAccount) =>
          acc.address === bridgeAddress || acc.address?.toLowerCase() === bridgeAddress?.toLowerCase()
      );
      if (matchingAccount) {
        setFromAccount(matchingAccount);
      }
    }
  }, [fromAccount, accounts, bridgeAddress, setFromAccount]);

  // Handle tab change
  const handleTabChange = (newTab: TabType): void => {
    if (newTab !== tab) {
      clearTransactionData();
    }
    setTab(newTab);
  };

  // Handle token press
  const handleTokenPress = (token: TokenModel): void => {
    // Find the current account to set in store
    const account = accounts.find(
      (acc: WalletAccount) =>
        acc.address === address || acc.address?.toLowerCase() === address?.toLowerCase()
    );
    
    // Set store data for SendTo flow
    setSelectedToken(token);
    if (account) {
      setFromAccount(account);
    }
    setTransactionType('tokens');
    setCurrentStep('send-to');
    navigation.navigate('SendTo');
  };

  // Handle NFT press
  const handleNFTPress = (collection: CollectionModel): void => {
    // Find the current account to set in store
    const account = accounts.find(
      (acc: WalletAccount) =>
        acc.address === address || acc.address?.toLowerCase() === address?.toLowerCase()
    );
    
    // Set store data for NFTListScreen
    setSelectedCollection(collection);
    if (account) {
      setFromAccount(account);
    }
    setTransactionType('multiple-nfts');
    navigation.navigate('NFTList', { collection, address });
  };

  // Handle account selection from modal
  const handleAccountSelect = (selectedAccount: any): void => {
    // Find the full account object from our accounts array
    const fullAccount = accounts.find(
      (acc: WalletAccount) => 
        acc.address === selectedAccount.address || 
        acc.address?.toLowerCase() === selectedAccount.address?.toLowerCase()
    );
    
    if (fullAccount) {
      // Update the fromAccount in the send store
      setFromAccount(fullAccount);
      // Clear transaction data since we're switching accounts
      clearTransactionData();
    }
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

  // Create a balance lookup map for efficient access
  const balanceLookup = React.useMemo(() => {
    if (!batchBalances) return new Map<string, string>();

    const lookup = new Map<string, string>();
    batchBalances.forEach(([address, balance]) => {
      lookup.set(address, balance);
    });
    return lookup;
  }, [batchBalances]);

  // Convert wallet accounts to AccountCard format with dynamic balances
  const accountsForModal = React.useMemo(() => {
    return accounts.map((account: WalletAccount) => ({
      name: account.name,
      address: account.address,
      avatar: account.avatar,
      balance: isLoadingBatchBalances
        ? t('messages.loading')
        : balanceLookup.get(account.address) || '0 FLOW',
      emojiInfo: account.emojiInfo,
      parentEmoji: account.parentEmoji,
      type: account.type,
    }));
  }, [accounts, isLoadingBatchBalances, balanceLookup, t]);

  // Get current account data
  const currentAccount = React.useMemo(() => {
    // If we have a fromAccount in send store, use it directly
    if (fromAccount) {
      return {
        name: fromAccount.name || 'Unnamed Account',
        address: fromAccount.address,
        avatar: fromAccount.avatar,
        balance: isBalanceLoading ? t('messages.loading') : balanceData?.displayBalance || '0 FLOW',
        emojiInfo: fromAccount.emojiInfo,
      };
    }

    // Otherwise, find matching account from accounts array
    const account = accounts.find(
      (acc: WalletAccount) =>
        acc.address === address || acc.address?.toLowerCase() === address?.toLowerCase()
    );

    // Debug log to help troubleshoot
    console.log('SelectTokensScreen - Address matching:', {
      currentAddress: address,
      fromAccount: fromAccount ? { address: fromAccount.address, name: fromAccount.name } : null,
      allAccounts: accounts.map((acc) => ({ address: acc.address, name: acc.name })),
      foundAccount: account ? { address: account.address, name: account.name } : null,
    });

    return {
      name: account?.name || account?.username || 'Unnamed Account',
      address: address,
      avatar: account?.avatar,
      balance: isBalanceLoading ? t('messages.loading') : balanceData?.displayBalance || '0 FLOW',
      emojiInfo: account?.emojiInfo,
    };
  }, [accounts, address, fromAccount, isBalanceLoading, balanceData, t]);

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
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

        {/* Account Selector - Show balance from React Query */}
        {!isExtension && balanceData && (
          <YStack bg="rgba(255, 255, 255, 0.1)" borderRadius={16} p={16} pt={16} pb={24} gap={12}>
            <AccountSelector
              currentAccount={currentAccount}
              accounts={accountsForModal}
              onAccountSelect={handleAccountSelect}
              title={t('send.fromAccount')}
              showEditButton={accounts.length > 1}
            />
          </YStack>
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
            <YStack gap="$4">
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
                <YStack gap="$3">
                  {/* Token Count Badge - Hidden as requested */}
                  {/* <XStack justify="space-between" items="center" px="$2" pb="$3">
                    <Badge variant="secondary" size="small">
                      {tokensWithBalance.length}{' '}
                      {tokensWithBalance.length === 1 ? 'Token' : 'Tokens'}
                    </Badge>
                  </XStack> */}

                  {tokensWithBalance.map((token, idx) => (
                    <React.Fragment key={`token-${token.identifier || token.symbol}-${idx}`}>
                      <TokenCard
                        symbol={token.symbol || ''}
                        name={token.name || ''}
                        balance={token.displayBalance || token.balance || '0'}
                        logo={token.logoURI}
                        price={token.priceInUSD?.toString()}
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
            <YStack gap="$4">
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
                <YStack gap="$3">
                  {/* NFT Collections Count Badge - Hidden as requested */}
                  {/* <XStack justify="space-between" items="center" px="$2" pb="$3">
                    <Badge variant="primary" size="small">
                      {nftCollections.length}{' '}
                      {nftCollections.length === 1 ? 'Collection' : 'Collections'}
                    </Badge>
                    <AddressText address={address} truncate={true} startLength={4} endLength={4} />
                  </XStack> */}

                  {nftCollections.map((collection, idx) => (
                    <React.Fragment
                      key={`nft-collection-${collection.id || collection.contractName || collection.name}-${idx}`}
                    >
                      <NFTCollectionRow
                        collection={collection}
                        onPress={() => handleNFTPress(collection)}
                      />
                      {idx < nftCollections.length - 1 && <Divider />}
                    </React.Fragment>
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
