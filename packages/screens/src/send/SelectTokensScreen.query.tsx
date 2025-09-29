import { bridge, navigation, logger } from '@onflow/frw-context';
import {
  useSendStore,
  tokenQueryKeys,
  tokenQueries,
  useWalletStore,
  walletSelectors,
  accessibleAssetQueryKeys,
  accessibleAssetQueries,
  accessibleAssetHelpers,
} from '@onflow/frw-stores';
import { type CollectionModel, type TokenModel, type WalletAccount } from '@onflow/frw-types';
import {
  AccountSelector,
  BackgroundWrapper,
  ExtensionHeader,
  NFTCollectionRow,
  RefreshView,
  ScrollView,
  SegmentedControl,
  Skeleton,
  TokenCard,
  XStack,
  YStack,
  useTheme,
} from '@onflow/frw-ui';
import { isDarkMode } from '@onflow/frw-utils';
import { validateEvmAddress, validateFlowAddress } from '@onflow/frw-workflow';
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
    setFromAccount,
    setSelectedToken,
    setTransactionType,
    setCurrentStep,
    clearTransactionData,
    setSelectedCollection,
    setNavigationSource,
  } = useSendStore();

  // Tab options
  const TABS = [t('tabs.tokens'), t('tabs.nfts')] as const;

  // Check if we're running in extension platform
  const isExtension = bridge.getPlatform() === 'extension';

  // Get current address and network
  const selectedAddress = bridge.getSelectedAddress();
  const [currentAccount, setCurrentAccount] = React.useState<WalletAccount | null>(null);
  const network = bridge.getNetwork() || 'mainnet';
  // Load current account on mount
  const loadCurrentAccount = React.useCallback(async () => {
    try {
      const account = await bridge.getSelectedAccount();
      setCurrentAccount(account);
      setFromAccount(account);
    } catch (error) {
      logger.error('Failed to load current account:', error);
    }
  }, []);

  // Update current account when selected address changes
  React.useEffect(() => {
    if (selectedAddress) {
      loadCurrentAccount();
    }
  }, [selectedAddress, loadCurrentAccount]);

  // Get wallet accounts for modal selection
  const accounts = useWalletStore(walletSelectors.getAllAccounts);
  const loadAccountsFromBridge = useWalletStore((state) => state.loadAccountsFromBridge);
  const isLoadingWallet = useWalletStore((state) => state.isLoading);

  // Get effective address with proper reactive updates
  const effectiveAddress = React.useMemo(() => {
    const debugAddress = bridge.getDebugAddress();
    const currentAddress = currentAccount?.address || '';

    logger.debug('SelectTokensScreen effectiveAddress calculated:', {
      debugAddress,
      currentAddress,
      willUse: debugAddress ? debugAddress : currentAddress,
    });

    if (debugAddress) {
      if (validateEvmAddress(debugAddress) || validateFlowAddress(debugAddress)) {
        return debugAddress.trim();
      }
    }
    return currentAddress;
  }, [currentAccount?.address]);

  // 🔥 TanStack Query: Fetch tokens with automatic caching, retry, and background refresh
  const {
    data: tokens = [],
    isLoading: isTokensLoading,
    error: tokensError,
    refetch: refetchTokens,
  } = useQuery({
    queryKey: tokenQueryKeys.tokens(effectiveAddress, network),
    queryFn: () => {
      logger.debug('SelectTokensScreen fetching tokens for address:', effectiveAddress);
      return tokenQueries.fetchTokens(effectiveAddress, network);
    },
    enabled: !!effectiveAddress && tab === 'Tokens',
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
    queryKey: tokenQueryKeys.nfts(effectiveAddress, network),
    queryFn: () => {
      logger.debug('SelectTokensScreen fetching NFTs for address:', effectiveAddress);
      return tokenQueries.fetchNFTCollections(effectiveAddress, network);
    },
    enabled: !!effectiveAddress && tab === 'NFTs',
    staleTime: 5 * 60 * 1000, // NFTs can be cached for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // 🔥 TanStack Query: Fetch balance with stale-while-revalidate pattern
  const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: tokenQueryKeys.balance(effectiveAddress, network),
    queryFn: () => {
      logger.debug('SelectTokensScreen fetching balance for address:', effectiveAddress);
      return tokenQueries.fetchBalance(effectiveAddress, undefined, network);
    },
    enabled: !!effectiveAddress,
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

  // 🔥 TanStack Query: Fetch accessible IDs for child accounts only
  const { data: accessibleIds, refetch: refetchAccessibleIds } = useQuery({
    queryKey: accessibleAssetQueryKeys.allowTypes(
      currentAccount?.parentAddress || '',
      currentAccount?.address || '',
      network
    ),
    queryFn: () =>
      accessibleAssetQueries.fetchChildAccountAllowTypes(
        currentAccount?.parentAddress || '',
        currentAccount?.address || '',
        network
      ),
    enabled:
      currentAccount?.type === 'child' &&
      !!currentAccount?.parentAddress &&
      !!currentAccount?.address, // Only fetch for child accounts
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes as access permissions don't change frequently
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // For regular accounts, all assets are accessible by default
  const effectiveAccessibleIds = currentAccount?.type === 'child' ? accessibleIds : null;

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
      (acc: WalletAccount) => acc.address?.toLowerCase() === currentAccount?.address?.toLowerCase()
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
    // Set store data for NFTListScreen
    setSelectedCollection(collection);
    if (currentAccount) {
      setFromAccount(currentAccount);
    } else {
      const account = accounts.find(
        (acc: WalletAccount) => acc.address?.toLowerCase() === selectedAddress?.toLowerCase()
      );
      if (account) {
        setFromAccount(account);
      }
    }
    setTransactionType('multiple-nfts');
    // Set navigation source to track that user came from RN select tokens screen
    setNavigationSource('rn-select-tokens');
    navigation.navigate('NFTList', { collection, address: effectiveAddress });
  };

  // Handle account selection from modal
  const handleAccountSelect = (selectedAccount: WalletAccount): void => {
    // Switch to the selected account
    setCurrentAccount(selectedAccount);
    setFromAccount(selectedAccount);
    clearTransactionData();
    refreshAll();
  };

  // Refresh functions - TanStack Query makes this super simple!
  const refreshTokens = useCallback(() => {
    refetchTokens();
    refetchAccessibleIds();
  }, [refetchTokens, refetchAccessibleIds]);

  const refreshNFTCollections = useCallback(() => {
    refetchNFTs();
    refetchAccessibleIds();
  }, [refetchNFTs, refetchAccessibleIds]);

  const refreshAll = useCallback(() => {
    refetchTokens();
    refetchNFTs();
    refetchAccessibleIds();
  }, [refetchTokens, refetchNFTs, refetchAccessibleIds]);

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
    return accounts.map((account) => ({
      ...account,
      balance: balanceLookup.get(account.address) || account.balance || '0 FLOW',
    }));
  }, [accounts, balanceLookup]);

  const theme = useTheme();
  const isCurrentlyDarkMode = isDarkMode(theme);
  const dividerColor = isCurrentlyDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const cardBackgroundColor = isCurrentlyDarkMode ? '$light10' : '$bg2';

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
      {isExtension && (
        <ExtensionHeader
          title={t('send.title')}
          help={false}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}
      <YStack flex={1}>
        {/* Header */}

        {/* Account Selector - Show balance from React Query */}
        {!isExtension && currentAccount && (
          <YStack bg={cardBackgroundColor} rounded="$4" p={16} gap={12}>
            <AccountSelector
              currentAccount={{
                ...currentAccount,
                balance: balanceData?.balance || currentAccount.balance || '0 FLOW',
              }}
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
          />
        </YStack>

        {/* Content */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {tab === 'Tokens' && (
            <YStack gap="$4">
              {isTokensLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <YStack key={`token-skeleton-${index}`} p="$3" height={72}>
                      <XStack items="center" gap="$3">
                        <Skeleton width="$12" height="$12" borderRadius="$6" />
                        <YStack flex={1} gap="$2">
                          <Skeleton height="$3" width="60%" />
                          <Skeleton height="$2" width="40%" />
                        </YStack>
                        <YStack items="flex-end" gap="$2">
                          <Skeleton height="$3" width="$20" />
                          <Skeleton height="$2" width="$18" />
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
                  {tokensWithBalance.map((token, idx) => (
                    <React.Fragment key={`token-${token.identifier || token.symbol}-${idx}`}>
                      <TokenCard
                        token={token}
                        currency={bridge.getCurrency()}
                        isVerified={token.isVerified}
                        onPress={() => handleTokenPress(token)}
                        isAccessible={accessibleAssetHelpers.isTokenAllowed(
                          token,
                          effectiveAccessibleIds
                        )}
                        inaccessibleText={t('send.inaccessible')}
                      />
                      {idx < tokensWithBalance.length - 1 && (
                        <YStack mt={'$2'} mb={'$2'} height={1} bg={dividerColor} w="100%" ml={0} />
                      )}
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
                    <YStack key={`nft-skeleton-${index}`} p="$3" height={72}>
                      <XStack items="center" gap="$3">
                        <Skeleton width="$12" height="$12" borderRadius="$6" />
                        <YStack flex={1} gap="$2">
                          <Skeleton height="$3" width="60%" />
                          <Skeleton height="$2" width="40%" />
                        </YStack>
                        <YStack items="flex-end" gap="$2">
                          <Skeleton height="$3" width="$20" />
                          <Skeleton height="$2" width="$1" />
                        </YStack>
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
                <YStack gap="$1">
                  {nftCollections.map((collection, idx) => (
                    <React.Fragment
                      key={`nft-collection-${collection.id || collection.contractName || collection.name}-${idx}`}
                    >
                      <NFTCollectionRow
                        collection={collection}
                        onPress={() => handleNFTPress(collection)}
                        isAccessible={accessibleAssetHelpers.isCollectionAllowed(
                          collection,
                          effectiveAccessibleIds
                        )}
                        inaccessibleText={t('send.inaccessible')}
                      />
                      {idx < nftCollections.length - 1 && (
                        <YStack mt={'$2'} mb={'$2'} height={1} bg={dividerColor} w="100%" ml={0} />
                      )}
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
