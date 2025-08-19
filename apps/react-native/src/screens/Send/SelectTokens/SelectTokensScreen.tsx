import { TokenService } from '@onflow/frw-services';
import { useSendStore, useTokenStore, useWalletStore } from '@onflow/frw-stores';
import {
  addressType,
  type TokenModel,
  WalletType,
  type CollectionModel,
  type WalletAccount,
} from '@onflow/frw-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { useTheme } from '@/contexts/ThemeContext';
import {
  AccountSelectorModal,
  type AccountSelectorModalRef,
  BackgroundWrapper,
  Divider,
  NFTCollectionRow,
  RefreshView,
  SegmentedControl,
  Skeleton,
  Text,
  TokenCard,
} from 'ui';

import { createAccessibleAssetStore } from './store/AccessibleAssetStore';
import { AccountCard } from '../shared/components/AccountCard';

// Tab options constants and types, similar to Swift enum
export type TabType = 'Tokens' | 'NFTs';

// Add call counter outside component to track re-renders
let renderCount = 0;
let useMemoCount = 0;

// SelectTokensScreen main page
const SelectTokensScreen = React.memo(function SelectTokensScreen({
  navigation,
}: {
  navigation: any;
}) {
  renderCount++;
  console.log(`[SelectTokens] Component render #${renderCount} at ${new Date().toISOString()}`);

  const { t } = useTranslation();
  const TABS = [t('tabs.tokens'), t('tabs.nfts')] as const;
  const [tab, setTab] = React.useState<TabType>('Tokens');
  const [tokens, setTokens] = React.useState<TokenModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [nftSearch, setNftSearch] = React.useState('');
  const [fromAccount, setLocalFromAccount] = React.useState<WalletAccount | null>(null);
  const accountSelectorRef = useRef<AccountSelectorModalRef>(null);
  const [, setFromAccountBalance] = React.useState<string>('0 FLOW');
  const [isBalanceLoading, setIsBalanceLoading] = React.useState(false);
  const [isAccountLoading, setIsAccountLoading] = React.useState(true);
  const { isDark } = useTheme();
  const currency = NativeFRWBridge.getCurrency();
  // Send store actions
  const {
    setSelectedToken,
    setTransactionType,
    setCurrentStep,
    clearTransactionData,
    setFromAccount: setStoreFromAccount,
    getAccessibleAssetStore,
    setAccessibleAssetStore,
  } = useSendStore();

  // Initialize and manage accessible asset store for current account
  const initializeAccessibleAssetStore = useCallback(
    async (account: WalletAccount) => {
      if (!account?.address) return;

      // Check if we already have an accessible asset store for this address
      let assetStore = getAccessibleAssetStore(account.address);

      if (!assetStore) {
        // Create new store and associate it with this address
        assetStore = createAccessibleAssetStore();
        setAccessibleAssetStore(account.address, assetStore);
      }

      // For child accounts, fetch accessible IDs
      if (account.type === 'child' && account.parentAddress) {
        try {
          const network = await NativeFRWBridge.getNetwork();
          await assetStore.getState().fetchChildAccountAllowTypes(network || 'mainnet', account);
          console.log('[SelectTokens] Fetched accessible IDs for child account:', account.address);
        } catch (error) {
          console.error('[SelectTokens] Failed to fetch accessible IDs:', error);
        }
      }
    },
    [getAccessibleAssetStore, setAccessibleAssetStore]
  );

  // Function to fetch Flow balance for a specific account (FORCE FRESH ON INITIAL LOAD)
  const fetchAccountBalance = useCallback(
    async (
      accountAddress: string,
      accountType?: string,
      forceFresh: boolean = false
    ): Promise<string> => {
      try {
        // Use cached version instead of direct API calls
        let network;
        try {
          network = await NativeFRWBridge.getNetwork();
        } catch (networkError) {
          console.warn(`[SelectTokens] Failed to get network, using mainnet:`, networkError);
          network = 'mainnet';
        }

        const tokenStore = useTokenStore.getState();

        // For initial load, use fresh data; otherwise use cached
        const result = forceFresh
          ? await tokenStore.getBalance(accountAddress, accountType, { fresh: true })
          : await tokenStore.getAccountBalance(accountAddress, accountType, network || 'mainnet');

        return result.balance;
      } catch (error) {
        console.error(`Failed to fetch cached balance for ${accountAddress}:`, error);
        return '0 FLOW';
      }
    },
    []
  );

  // Update from account balance
  const updateFromAccountBalance = useCallback(
    async (accountAddress: string, accountType?: string, forceFresh: boolean = true) => {
      setIsBalanceLoading(true);
      try {
        const balance = await fetchAccountBalance(accountAddress, accountType, forceFresh);
        setFromAccountBalance(balance);

        // WalletAccount no longer stores balance - balance is managed in local state
        // The balance is already set in setFromAccountBalance(balance) above
      } catch (error) {
        console.error('Failed to update from account balance:', error);
        setFromAccountBalance('0 FLOW');
      } finally {
        setIsBalanceLoading(false);
      }
    },
    [fetchAccountBalance]
  );

  // Fetch tokens from API
  const fetchTokens = useCallback(
    async (accountAddress?: string, accountType?: string, isRefreshAction = false) => {
      if (isRefreshAction) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        // Use provided address or fall back to bridge selected address
        const targetAddress = accountAddress || NativeFRWBridge.getSelectedAddress();
        const network = NativeFRWBridge.getNetwork();

        if (!targetAddress) {
          setTokens([]);
          return;
        }

        // Determine wallet type based on account type from bridge or fallback to address
        let walletType: WalletType;
        if (accountType === 'evm') {
          walletType = WalletType.EVM;
        } else if (accountType === 'main' || accountType === 'child') {
          walletType = WalletType.Flow;
        } else {
          // Fallback to address-based detection
          walletType = addressType(targetAddress);
        }

        // Create TokenService instance for the detected wallet type
        const tokenService = new TokenService(walletType);
        const tokenInfos = await tokenService.getTokenInfo(targetAddress, network, currency.name);
        setTokens(tokenInfos);
      } catch (err: any) {
        console.error('Error fetching tokens:', err);
        setError(err.message || t('errors.failedToLoadTokens'));
        // Show empty state on error
        setTokens([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t]
  );

  // Fetch NFT collections from API (CACHED VERSION)
  const fetchNFTCollections = useCallback(
    async (accountAddress?: string, accountType?: string, isRefreshAction = false) => {
      console.log(
        `[SelectTokens] fetchNFTCollections called for ${accountAddress}, refresh: ${isRefreshAction}`
      );
      if (isRefreshAction) {
        setNftRefreshing(true);
      } else {
        setNftLoading(true);
      }
      setNftError(null);

      try {
        // Use provided address or fall back to bridge selected address
        const targetAddress = accountAddress || NativeFRWBridge.getSelectedAddress();
        const network = NativeFRWBridge.getNetwork();

        if (!targetAddress) {
          setNftCollections([]);
          setNftLoading(false);
          setNftRefreshing(false);
          return;
        }

        // Use token store for NFT collections
        const tokenStore = useTokenStore.getState();

        if (isRefreshAction) {
          // Force refresh cache for pull-to-refresh
          await tokenStore.forceRefresh(targetAddress, network || 'mainnet');
        } else {
          // Ensure data is fetched with force refresh
          await tokenStore.fetchTokens(targetAddress, network || 'mainnet', true);
        }

        const collections =
          tokenStore.getNFTCollectionsForAddress(targetAddress, network || 'mainnet') || [];

        console.log('[SelectTokens] NFT collections fetched', {
          targetAddress,
          network: network || 'mainnet',
          collectionsCount: collections.length,
          isRefreshAction,
        });

        setNftCollections(collections || []);
      } catch (err: any) {
        // Enhanced error handling to prevent 'Property error doesn't exist' issues
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        console.error('[NFT] Failed to fetch cached collections:', errorMessage);
        console.error('[NFT] Full error object:', err);
        setNftError(`Failed to load NFT collections: ${errorMessage}`);
        setNftCollections([]);
      } finally {
        setNftLoading(false);
        setNftRefreshing(false);
      }
    },
    []
  );

  // Handle account selection from the modal
  const handleAccountSelect = useCallback(
    async (selectedAccount: WalletAccount) => {
      try {
        // Update local state immediately
        setLocalFromAccount(selectedAccount);
        setStoreFromAccount(selectedAccount);

        // Set loading state instead of clearing collections immediately
        // This prevents the "No NFT collections found" flash
        setNftLoading(true);
        setNftError(null);

        // Initialize accessible asset store for the new account
        await initializeAccessibleAssetStore(selectedAccount);

        // Fetch balance data from tokenStore (force fresh for account switching)
        await updateFromAccountBalance(selectedAccount.address, selectedAccount.type, true);

        // Refresh token and NFT data for the new account
        await Promise.all([
          fetchTokens(selectedAccount.address, selectedAccount.type),
          fetchNFTCollections(selectedAccount.address, selectedAccount.type),
        ]);
      } catch (error) {
        console.error('Failed to update account:', error);
      }
    },
    [
      setStoreFromAccount,
      updateFromAccountBalance,
      fetchTokens,
      fetchNFTCollections,
      initializeAccessibleAssetStore,
    ]
  );

  // Get walletStore state using the hook (must be called at top level)
  const walletStoreState = useWalletStore();

  // Initialize send flow when screen loads - use already-loaded active account from walletStore
  useEffect(() => {
    console.log(
      `[SelectTokens] useEffect running, walletStore.isLoading: ${walletStoreState.isLoading}`
    );

    // Basic initialization - these should be safe
    setCurrentStep('select-tokens');

    // Get active account from already-initialized walletStore
    const initializeActiveAccount = async () => {
      try {
        // If walletStore isn't loaded yet, wait for it
        if (walletStoreState.isLoading) {
          console.log('[SelectTokens] WalletStore is still loading, waiting...');
          // We'll rely on the effect re-running when walletStoreState changes
          return;
        }

        const activeAccount = walletStoreState.activeAccount;

        if (activeAccount) {
          // Set the active account immediately from store
          setLocalFromAccount(activeAccount);
          setStoreFromAccount(activeAccount);
          setIsAccountLoading(false);

          // Initialize accessible asset store for active account
          await initializeAccessibleAssetStore(activeAccount);

          // Start loading balance and other data in parallel
          const dataPromises = [
            updateFromAccountBalance(activeAccount.address, activeAccount.type),
            fetchTokens(activeAccount.address, activeAccount.type),
            fetchNFTCollections(activeAccount.address, activeAccount.type),
          ];

          // Wait for all data to load
          await Promise.all(dataPromises);
        } else if (walletStoreState.accounts.length > 0) {
          // No active account, use first account
          const firstAccount = walletStoreState.accounts[0];
          setLocalFromAccount(firstAccount);
          setStoreFromAccount(firstAccount);
          setIsAccountLoading(false);

          // Initialize accessible asset store for first account
          await initializeAccessibleAssetStore(firstAccount);

          const dataPromises = [
            updateFromAccountBalance(firstAccount.address, firstAccount.type),
            fetchTokens(firstAccount.address, firstAccount.type),
            fetchNFTCollections(firstAccount.address, firstAccount.type),
          ];
          await Promise.all(dataPromises);
        } else {
          console.log('[SelectTokens] No accounts available in walletStore');
          setIsAccountLoading(false);
        }
      } catch (error) {
        console.error('Error initializing active account:', error);
        setIsAccountLoading(false);
      }
    };

    initializeActiveAccount();
  }, [walletStoreState.isLoading]); // Only depend on loading state to prevent infinite loops

  // Get current accessible asset store for fromAccount
  const getCurrentAssetStore = useCallback(() => {
    if (!fromAccount?.address) return null;
    return getAccessibleAssetStore(fromAccount.address);
  }, [fromAccount?.address, getAccessibleAssetStore]);

  // Check if a token is accessible for child accounts
  const isTokenAccessible = useCallback(
    (token: TokenModel) => {
      // For non-child accounts, all tokens are accessible
      if (fromAccount?.type !== 'child') return true;

      const assetStore = getCurrentAssetStore();
      if (!assetStore) {
        console.log(
          `[SelectTokens] No asset store found for child account ${fromAccount?.address}`
        );
        return true; // Default to accessible if store not available
      }

      const isAllowed = assetStore.getState().isTokenAllowed(token);
      if (!isAllowed) {
        console.log(
          `[SelectTokens] Token ${token.symbol || token.identifier} not accessible for child account`
        );
      }

      return isAllowed;
    },
    [fromAccount?.type, getCurrentAssetStore]
  );

  // Check if an NFT collection is accessible for child accounts
  const isNFTCollectionAccessible = useCallback(
    (collection: any) => {
      // For non-child accounts, all NFT collections are accessible
      if (fromAccount?.type !== 'child') return true;

      const assetStore = getCurrentAssetStore();
      if (!assetStore) {
        console.log(
          `[SelectTokens] No asset store found for child account ${fromAccount?.address}`
        );
        return true; // Default to accessible if store not available
      }

      const isAllowed = assetStore.getState().isCollectionAllowed(collection);
      if (!isAllowed) {
        console.log(
          `[SelectTokens] NFT collection ${collection.name || collection.id} not accessible for child account`
        );
      }

      return isAllowed;
    },
    [fromAccount?.type, getCurrentAssetStore]
  );

  // Clear transaction data when user actively switches between Tokens and NFTs tabs
  // Note: We don't clear on mount to preserve data during navigation
  const handleTabChange = (newTab: TabType) => {
    if (newTab !== tab) {
      clearTransactionData();
    }
    setTab(newTab);
  };

  // NFT collections state
  const [nftCollections, setNftCollections] = useState<any[]>([]);
  const [nftLoading, setNftLoading] = useState(false);
  const [nftRefreshing, setNftRefreshing] = useState(false);
  const [nftError, setNftError] = useState<string | null>(null);

  // Wrapper functions for event handlers (without parameters)
  const refreshTokens = useCallback(() => {
    fetchTokens(fromAccount?.address, fromAccount?.type, true);
  }, [fromAccount, fetchTokens]);

  const refreshNFTCollections = useCallback(() => {
    fetchNFTCollections(fromAccount?.address, fromAccount?.type, true);
  }, [fromAccount, fetchNFTCollections]);

  // Filter NFT collections based on search, exclude empty collections, and check accessibility
  const filteredNFTCollections = React.useMemo(() => {
    useMemoCount++;
    console.log(
      `[SelectTokens] useMemo recalculating #${useMemoCount}, collections.length: ${nftCollections.length}, search: "${nftSearch}"`
    );

    const startTime = performance.now();

    // First filter out collections with 0 items and check accessibility
    const collectionsWithItems = nftCollections.filter((collection: any) => {
      const hasItems = collection.count && collection.count > 0;
      return hasItems;
    });

    // Removed console.log to reduce noise

    // Then apply search filter if search term exists
    if (!nftSearch) {
      return collectionsWithItems;
    }

    const searchFiltered = collectionsWithItems.filter(
      (collection: any) =>
        collection.name?.toLowerCase().includes(nftSearch.toLowerCase()) ||
        collection.contractName?.toLowerCase().includes(nftSearch.toLowerCase()) ||
        collection.contract_name?.toLowerCase().includes(nftSearch.toLowerCase())
    );

    console.log(
      `[SelectTokens] useMemo completed in ${(performance.now() - startTime).toFixed(2)}ms, result count: ${searchFiltered.length}`
    );
    return searchFiltered;
  }, [nftSearch, nftCollections.length, isNFTCollectionAccessible]);

  function handleTokenPress(token: TokenModel) {
    // Check if the token is accessible for child accounts
    if (fromAccount?.type === 'child' && !isTokenAccessible(token)) {
      console.log(
        `[SelectTokens] Token ${token.symbol || token.identifier} not accessible for child account`
      );
      return;
    }
    setSelectedToken(token);
    setTransactionType('tokens');
    setCurrentStep('send-to');
    // Navigate to SendTo screen
    navigation.navigate('SendTo');
  }

  function handleNFTPress(collection: CollectionModel) {
    if (fromAccount?.type === 'child' && !isNFTCollectionAccessible(collection)) {
      console.log(
        `[SelectTokens] NFT collection ${collection.name || collection.id} not accessible for child account`
      );
      return;
    }
    // Navigate to NFTList screen with collection data
    // Use the selected sender account's address instead of the native bridge's address
    const address = fromAccount?.address || NativeFRWBridge.getSelectedAddress();
    navigation.navigate('NFTList', {
      collection,
      address,
    });
  }

  return (
    <BackgroundWrapper>
      <View className="flex-1 px-5 pt-2">
        {isAccountLoading ? (
          <View
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: 16,
              paddingTop: 16,
              paddingHorizontal: 16,
              paddingBottom: 24,
              height: 120,
              marginTop: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text className="text-fg-2">{t('messages.loadingAccount')}</Text>
          </View>
        ) : (
          <AccountCard
            account={
              fromAccount ||
              ({
                name: t('messages.loading'),
                address: '0x...',
                emojiInfo: { emoji: '👤' },
              } as any)
            }
            title={t('labels.fromAccount')}
            showEditButton={true}
            onEditPress={() => {
              console.log('[SelectTokens] Edit button pressed, calling present()');
              accountSelectorRef.current?.present();
            }}
            isLoading={isBalanceLoading}
            showBackground={true}
          />
        )}
        {/* SegmentedControl */}
        <View className="mt-5 mb-2">
          <SegmentedControl
            segments={TABS as unknown as string[]}
            value={tab === 'Tokens' ? TABS[0] : TABS[1]}
            onChange={v => handleTabChange(v === TABS[0] ? 'Tokens' : 'NFTs')}
          />
        </View>
        {/* Token or NFT list */}
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={tab === 'Tokens' ? isRefreshing : nftRefreshing}
              onRefresh={tab === 'Tokens' ? refreshTokens : refreshNFTCollections}
              tintColor={isDark ? '#FFFFFF' : '#000000'}
            />
          }
        >
          {tab === 'Tokens' && (
            <>
              {isLoading ? (
                <View className="py-4">
                  {[1, 2, 3, 4, 5].map(index => (
                    <View
                      key={`token-skeleton-${index}`}
                      className="flex-row items-center py-4 px-1"
                    >
                      {/* Token icon skeleton */}
                      <Skeleton
                        isDark={isDark}
                        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16 }}
                      />
                      <View className="flex-1">
                        {/* Token name skeleton */}
                        <Skeleton
                          isDark={isDark}
                          style={{ height: 16, width: 80, marginBottom: 8 }}
                        />
                        {/* Token balance skeleton */}
                        <Skeleton isDark={isDark} style={{ height: 12, width: 128 }} />
                      </View>
                      <View className="items-end">
                        {/* USD value skeleton */}
                        <Skeleton
                          isDark={isDark}
                          style={{ height: 16, width: 64, marginBottom: 4 }}
                        />
                        {/* Change percentage skeleton */}
                        <Skeleton isDark={isDark} style={{ height: 12, width: 48 }} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : error ? (
                <RefreshView
                  type="error"
                  message={error}
                  onRefresh={refreshTokens}
                  refreshText={t('buttons.retry')}
                />
              ) : isRefreshing ? (
                <View></View>
              ) : (
                (() => {
                  const tokensWithBalance = tokens.filter(token => {
                    // Check raw token balance first (most reliable)
                    const rawBalance = parseFloat(token.displayBalance || token.balance || '0');

                    // For tokens with 0 raw balance, also check if there's any available balance
                    const availableBalance = parseFloat(token.availableBalanceToUse || '0');

                    const hasBalance = rawBalance > 0 || availableBalance > 0;

                    return hasBalance;
                  });

                  return tokensWithBalance.length === 0 ? (
                    <RefreshView
                      type="empty"
                      message={t('messages.noTokensWithBalance')}
                      onRefresh={refreshTokens}
                      refreshText={t('buttons.refresh')}
                    />
                  ) : (
                    tokensWithBalance.map((token, idx) => (
                      <React.Fragment key={`token-${token.identifier || token.symbol}-${idx}`}>
                        <TokenCard
                          token={token}
                          currency={currency}
                          onPress={() => handleTokenPress(token)}
                          isAccessible={isTokenAccessible(token)}
                        />
                        {idx !== tokensWithBalance.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  );
                })()
              )}
            </>
          )}
          {tab === 'NFTs' && (
            <>
              {/* NFT Search Bar */}
              {/* <View style={{ marginTop: 12, marginBottom: 16 }}>
                    <AddressSearchBox
                      value={nftSearch}
                      onChangeText={setNftSearch}
                      placeholder={t('placeholders.searchCollections')}
                      showScanButton={false}
                    />
                  </View> */}

              {nftLoading ? (
                <View className="py-4">
                  {[1, 2, 3, 4].map(index => (
                    <View key={`nft-skeleton-${index}`} className="flex-row items-center py-3 px-1">
                      {/* Collection icon skeleton */}
                      <Skeleton
                        isDark={isDark}
                        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16 }}
                      />
                      <View className="flex-1">
                        {/* Collection name skeleton */}
                        <Skeleton
                          isDark={isDark}
                          style={{ height: 16, width: 112, marginBottom: 8 }}
                        />
                        {/* Item count skeleton */}
                        <Skeleton isDark={isDark} style={{ height: 12, width: 64 }} />
                      </View>
                      {/* Chevron skeleton */}
                      <Skeleton isDark={isDark} style={{ width: 24, height: 24 }} />
                    </View>
                  ))}
                </View>
              ) : nftError ? (
                <RefreshView
                  type="error"
                  message={nftError}
                  onRefresh={refreshNFTCollections}
                  refreshText={t('buttons.retry')}
                />
              ) : nftRefreshing ? (
                <View></View>
              ) : filteredNFTCollections.length === 0 ? (
                nftSearch ? (
                  <RefreshView
                    type="empty"
                    message={t('messages.noCollectionsMatchSearch', { search: nftSearch })}
                    onRefresh={() => setNftSearch('')}
                    refreshText={t('buttons.clearSearch')}
                    className="py-8"
                  />
                ) : (
                  <RefreshView
                    type="empty"
                    message={t('messages.noNFTCollectionsForAccount')}
                    onRefresh={refreshNFTCollections}
                    refreshText={t('buttons.refresh')}
                    className="py-8"
                  />
                )
              ) : (
                filteredNFTCollections.map((collection, idx) => (
                  <NFTCollectionRow
                    key={`nft-collection-${
                      collection.id || collection.contractName || collection.name
                    }-${idx}`}
                    collection={collection}
                    showDivider={idx !== filteredNFTCollections.length - 1}
                    isAccessible={isNFTCollectionAccessible(collection)}
                    onPress={() => handleNFTPress(collection)}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>

      {/* Account Selector Modal */}
      <AccountSelectorModal
        ref={accountSelectorRef}
        onAccountSelect={handleAccountSelect}
        currentAccount={fromAccount}
      />
    </BackgroundWrapper>
  );
});

export default SelectTokensScreen;
