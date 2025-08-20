import { navigation } from '@onflow/frw-context';
// Temporarily disabled due to build issues
import { TokenService } from '@onflow/frw-services';
import { useSendStore, useTokenStore, useWalletStore } from '@onflow/frw-stores';
import {
  addressType,
  type TokenModel,
  WalletType,
  type CollectionModel,
  type WalletAccount,
} from '@onflow/frw-types';
import {
  BackgroundWrapper,
  Skeleton,
  Text,
  YStack,
  XStack,
  ScrollView,
  RefreshView,
  NFTCollectionRow,
} from '@onflow/frw-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TabType } from '../types';

interface SelectTokensScreenProps {
  theme?: { isDark: boolean };
  // Platform bridge for platform-specific data access
  bridge: {
    getSelectedAddress(): string | null;
    getNetwork(): string;
    getCoins?(): any[] | null;
  };
  showTitle?: boolean;
}

export function SelectTokensScreen({ bridge, showTitle = true }: SelectTokensScreenProps) {
  // navigation is imported directly from ServiceContext
  const { t } = useTranslation();
  // State management
  const [tab, setTab] = React.useState<TabType>('Tokens');
  const [tokens, setTokens] = React.useState<TokenModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fromAccount, setLocalFromAccount] = React.useState<WalletAccount | null>(null);

  // NFT state
  const [nftCollections, setNftCollections] = useState<CollectionModel[]>([]);
  const [nftLoading, setNftLoading] = useState(false);
  const [nftError, setNftError] = useState<string | null>(null);

  // Store hooks
  const {
    setSelectedToken,
    setTransactionType,
    setCurrentStep,
    clearTransactionData,
    setFromAccount: setStoreFromAccount,
    getAccessibleAssetStore,
    setAccessibleAssetStore,
  } = useSendStore();

  const walletStoreState = useWalletStore();

  // Tab options
  const TABS = [t('tabs.tokens'), t('tabs.nfts')] as const;

  // Simplified accessibility checks - for now, just return true for all items
  // TODO: Implement proper AccessibleAssetStore integration when store management is fixed
  const isTokenAccessible = useCallback(
    (token: TokenModel) => {
      // For non-child accounts, all tokens are accessible
      if (fromAccount?.type !== 'child') return true;

      // For child accounts, we would check the AccessibleAssetStore here
      // For now, return true to allow functionality
      console.log(
        `[SelectTokens] Child account accessibility check for token ${token.symbol || token.identifier}`
      );
      return true;
    },
    [fromAccount?.type]
  );

  // Check if an NFT collection is accessible for child accounts
  const isNFTCollectionAccessible = useCallback(
    (collection: any) => {
      // For non-child accounts, all NFT collections are accessible
      if (fromAccount?.type !== 'child') return true;

      // For child accounts, we would check the AccessibleAssetStore here
      // For now, return true to allow functionality
      console.log(
        `[SelectTokens] Child account accessibility check for collection ${collection.name || collection.id}`
      );
      return true;
    },
    [fromAccount?.type]
  );

  // Fetch account balance
  const fetchAccountBalance = useCallback(
    async (
      accountAddress: string,
      accountType?: string,
      forceFresh: boolean = false
    ): Promise<string> => {
      try {
        const network = bridge.getNetwork();
        const tokenStore = useTokenStore.getState();

        const result = forceFresh
          ? await tokenStore.getBalance(accountAddress, accountType, { fresh: true })
          : await tokenStore.getAccountBalance(accountAddress, accountType, network || 'mainnet');

        return result.balance;
      } catch (error) {
        console.error(`Failed to fetch balance for ${accountAddress}:`, error);
        return '0 FLOW';
      }
    },
    [bridge]
  );

  // Simplified account balance update (removed for now)
  const updateFromAccountBalance = useCallback(
    async (accountAddress: string, accountType?: string, forceFresh: boolean = true) => {
      // Balance update logic simplified
      console.log('Account balance update:', accountAddress, accountType, forceFresh);
    },
    []
  );

  // Fetch tokens
  const fetchTokens = useCallback(
    async (accountAddress?: string, accountType?: string, isRefreshAction = false) => {
      if (isRefreshAction) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        // Try to get coins from the bridge first
        if (bridge.getCoins) {
          const coinsFromBridge = bridge.getCoins();

          if (coinsFromBridge && coinsFromBridge.length > 0) {
            // Convert coins to token format
            const convertedTokens: TokenModel[] = coinsFromBridge
              .filter((coin) => coin && coin.balance && parseFloat(coin.balance) > 0)
              .map((coin) => ({
                type:
                  coin.address?.startsWith('0x') && coin.address.length === 42
                    ? WalletType.EVM
                    : WalletType.Flow,
                identifier: coin.address || coin.contract_address || coin.symbol,
                symbol: coin.unit || coin.symbol || '',
                name: coin.coin || coin.name || coin.unit || '',
                balance: coin.balance || '0',
                displayBalance: coin.balance || '0',
                availableBalanceToUse: coin.balance || '0',
                logoURI: coin.icon || '',
                balanceInUSD: coin.total?.toString(),
                change: coin.change24h?.toString(),
                isVerified: true,
                decimal: coin.decimal || 18,
                contractAddress: coin.address || coin.contract_address || '',
              }));

            setTokens(convertedTokens);
            return;
          }
        }

        // Fallback to original TokenService logic if bridge doesn't provide coins
        const targetAddress = accountAddress || bridge.getSelectedAddress();
        const network = bridge.getNetwork();

        if (!targetAddress) {
          setTokens([]);
          return;
        }

        // Determine wallet type
        let walletType: WalletType;
        if (accountType === 'evm') {
          walletType = WalletType.EVM;
        } else if (accountType === 'main' || accountType === 'child') {
          walletType = WalletType.Flow;
        } else {
          walletType = addressType(targetAddress);
        }
        const currency = bridge.getCurrency();
        const tokenService = new TokenService(walletType);
        const tokenInfos = await tokenService.getTokenInfo(targetAddress, network);
        console.log(
          'Fetched tokens:',
          tokenInfos,
          'for address:',
          targetAddress,
          'network:',
          network
        );

        // Process tokens to match extension's CoinList data structure
        const processedTokens = tokenInfos.map((token) => ({
          ...token,
          // Add CoinList compatibility fields
          coin: token.name,
          unit: token.symbol || token.contractName || '',
          icon: token.logoURI || '',
          total: token.balanceInUSD || token.balanceInCurrency || '0',
          price: token.priceInUSD || token.priceInCurrency || '0',
          change24h: parseFloat(token.change || '0'),
          availableBalance: token.availableBalanceToUse || token.displayBalance || token.balance,
          isVerified: token.isVerified || false,
          id: token.identifier || `${token.contractAddress}.${token.symbol}`,
        }));

        setTokens(processedTokens);
      } catch (err: any) {
        console.error('Error fetching tokens:', err);
        setError(err.message || 'Failed to load tokens');
        setTokens([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [bridge]
  );

  // Fetch NFT collections
  const fetchNFTCollections = useCallback(
    async (accountAddress?: string, accountType?: string, isRefreshAction = false) => {
      setNftLoading(!isRefreshAction);
      setNftError(null);

      try {
        const targetAddress = accountAddress || bridge.getSelectedAddress();
        const network = bridge.getNetwork();

        if (!targetAddress) {
          setNftCollections([]);
          return;
        }

        const tokenStore = useTokenStore.getState();

        if (isRefreshAction) {
          await tokenStore.forceRefresh(targetAddress, network || 'mainnet');
        } else {
          await tokenStore.fetchTokens(targetAddress, network || 'mainnet', true);
        }

        const collections =
          tokenStore.getNFTCollectionsForAddress(targetAddress, network || 'mainnet') || [];

        setNftCollections(collections || []);
      } catch (err: any) {
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        console.error('Failed to fetch NFT collections:', errorMessage);
        setNftError(`Failed to load NFT collections: ${errorMessage}`);
        setNftCollections([]);
      } finally {
        setNftLoading(false);
      }
    },
    [bridge]
  );

  // Account selection temporarily disabled

  // Initialize screen
  useEffect(() => {
    setCurrentStep('select-tokens');

    const initializeActiveAccount = async () => {
      try {
        if (walletStoreState.isLoading) {
          return;
        }

        const activeAccount = walletStoreState.activeAccount || walletStoreState.accounts[0];

        if (activeAccount) {
          setLocalFromAccount(activeAccount);
          setStoreFromAccount(activeAccount);

          await Promise.all([
            updateFromAccountBalance(activeAccount.address, activeAccount.type),
            fetchTokens(activeAccount.address, activeAccount.type),
            fetchNFTCollections(activeAccount.address, activeAccount.type),
          ]);
        }
      } catch (error) {
        console.error('Error initializing account:', error);
      }
    };

    initializeActiveAccount();
  }, [walletStoreState.isLoading]);

  // Convert coins directly when they become available
  useEffect(() => {
    const coins = bridge.getCoins?.();

    if (coins && coins.length > 0) {
      // Convert coins to token format directly
      const convertedTokens: TokenModel[] = coins
        .filter((coin) => coin && coin.balance && parseFloat(coin.balance) > 0)
        .map((coin) => ({
          type:
            coin.address?.startsWith('0x') && coin.address.length === 42
              ? WalletType.EVM
              : WalletType.Flow,
          identifier: coin.address || coin.contract_address || coin.symbol,
          symbol: coin.unit || coin.symbol || '',
          name: coin.coin || coin.name || coin.unit || '',
          balance: coin.balance || '0',
          displayBalance: coin.balance || '0',
          availableBalanceToUse: coin.balance || '0',
          icon: coin.icon || '',
          logoURI: coin.icon || '',
          balanceInUSD: coin.total?.toString(),
          change: coin.change24h?.toString(),
          isVerified: true,
          decimal: coin.decimal || 18,
          contractAddress: coin.address || coin.contract_address || '',
        }));

      setTokens(convertedTokens);
      setIsLoading(false);
    }
  }, [bridge]);

  // Handle tab change
  const handleTabChange = (newTab: TabType) => {
    if (newTab !== tab) {
      clearTransactionData();
    }
    setTab(newTab);
  };

  // Handle token press
  const handleTokenPress = (token: TokenModel) => {
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
    navigation.navigate('SendTo');
  };

  // Handle NFT press
  const handleNFTPress = (collection: CollectionModel) => {
    if (fromAccount?.type === 'child' && !isNFTCollectionAccessible(collection)) {
      console.log(
        `[SelectTokens] NFT collection ${collection.name || collection.id} not accessible for child account`
      );
      return;
    }
    const address = fromAccount?.address || bridge.getSelectedAddress();
    navigation.navigate('NFTList', { collection, address });
  };

  // Refresh functions
  const refreshTokens = useCallback(() => {
    fetchTokens(fromAccount?.address, fromAccount?.type, true);
  }, [fromAccount, fetchTokens]);

  const refreshNFTCollections = useCallback(() => {
    fetchNFTCollections(fromAccount?.address, fromAccount?.type, true);
  }, [fromAccount, fetchNFTCollections]);

  // Filter tokens with balance
  const tokensWithBalance = tokens.filter((token) => {
    const rawBalance = parseFloat(token.displayBalance || token.balance || '0');
    const availableBalance = parseFloat(token.availableBalanceToUse || '0');
    const hasBalance = rawBalance > 0 || availableBalance > 0;
    return hasBalance;
  });

  return (
    <BackgroundWrapper backgroundColor="#0F0F0F">
      <YStack flex={1}>
        {/* Header */}
        <XStack
          py="$1"
          px="$1"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Back Button */}
          <XStack
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text {...({ color: 'white', fontSize: '$5', children: '←' } as any)}></Text>
          </XStack>

          {/* Title */}
          <Text fontSize="$7" fontWeight="600" color="white">
            Send
          </Text>

          {/* Placeholder for balance */}
          <XStack style={{ width: 40 }} />
        </XStack>

        <YStack flex={1} px="$4" pt="$2">
          {/* Search Bar */}
          {/* <XStack
            py="$3"
            px="$4"
            mb="$4"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 16,
              alignItems: 'center'
            }}
          >
            <Text color="rgba(255, 255, 255, 0.4)" fontSize="$4" mr="$3">🔍</Text>
            <Text color="rgba(255, 255, 255, 0.4)" fontSize="$4">
              Search tokens...
            </Text>
          </XStack> */}

          {/* Tab Selector */}
          <XStack
            mb="$6"
            style={{
              backgroundColor: 'black',
              borderRadius: 12,
              padding: 2,
              borderWidth: 2,
              borderColor: 'rgb(255, 255, 255, 0.1)',
              alignSelf: 'flex-start',
            }}
          >
            {TABS.map((tabName, index) => (
              <XStack
                key={tabName}
                py="$0.3"
                px="$0.5"
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor:
                    tab === (index === 0 ? 'Tokens' : 'NFTs')
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'transparent',
                  borderRadius: 10,
                  minWidth: 100,
                }}
                onPress={() => handleTabChange(index === 0 ? 'Tokens' : 'NFTs')}
              >
                <Text
                  color={
                    tab === (index === 0 ? 'Tokens' : 'NFTs') ? 'white' : 'rgba(255, 255, 255, 0.5)'
                  }
                  fontSize="$4"
                  fontWeight={tab === (index === 0 ? 'Tokens' : 'NFTs') ? '600' : '500'}
                >
                  {tabName}
                </Text>
              </XStack>
            ))}
          </XStack>

          {/* Content */}
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            {tab === 'Tokens' && (
              <YStack gap="$3">
                {isLoading ? (
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
                ) : error ? (
                  <RefreshView
                    type="error"
                    message={error}
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
                  <YStack gap="$0">
                    {tokensWithBalance.map((token, idx) => (
                      <XStack
                        key={`token-${token.identifier || token.symbol}-${idx}`}
                        py="$1"
                        px="$0"
                        // mb="$2"
                        style={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '$background',
                          cursor: 'pointer',
                          borderBottomWidth: 1,
                          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
                        }}
                        onPress={() => handleTokenPress(token)}
                      >
                        {/* Left side - Token info */}
                        <XStack style={{ alignItems: 'center', flex: 1 }} px="$0.5">
                          {/* Token Icon */}
                          <XStack
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 28,
                              backgroundColor:
                                token.symbol === 'FLOW'
                                  ? '#00EF8B'
                                  : token.symbol === 'USDT' || token.symbol === 'Tether'
                                    ? '#26A17B'
                                    : token.symbol === 'COREUM'
                                      ? '#25D695'
                                      : token.symbol === 'VLX' || token.symbol === 'Velas'
                                        ? '#1E3A8A'
                                        : token.symbol === 'UPHOLD'
                                          ? '#00D4AA'
                                          : token.symbol === 'ZEN' || token.symbol === 'Horizen'
                                            ? '#00D4AA'
                                            : '#4A5568',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 16,
                              shadowColor: 'rgba(0, 0, 0, 0.1)',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                            }}
                          >
                            {/* Token Logo/Symbol */}
                            {token.symbol === 'FLOW' && (
                              <Text color="white" fontSize="$6" fontWeight="700">
                                ◉
                              </Text>
                            )}
                            {(token.symbol === 'USDT' || token.symbol === 'Tether') && (
                              <Text color="white" fontSize="$5" fontWeight="700">
                                ₮
                              </Text>
                            )}
                            {token.symbol === 'COREUM' && (
                              <Text color="white" fontSize="$5" fontWeight="700">
                                C
                              </Text>
                            )}
                            {(token.symbol === 'VLX' || token.symbol === 'Velas') && (
                              <Text color="white" fontSize="$5" fontWeight="700">
                                V
                              </Text>
                            )}
                            {token.symbol === 'UPHOLD' && (
                              <Text color="white" fontSize="$5" fontWeight="700">
                                U
                              </Text>
                            )}
                            {(token.symbol === 'ZEN' || token.symbol === 'Horizen') && (
                              <Text color="white" fontSize="$5" fontWeight="700">
                                H
                              </Text>
                            )}
                            {![
                              'FLOW',
                              'USDT',
                              'Tether',
                              'COREUM',
                              'VLX',
                              'Velas',
                              'UPHOLD',
                              'ZEN',
                              'Horizen',
                            ].includes(token.symbol || '') && (
                              <Text color="white" fontSize="$5" fontWeight="700">
                                {token.symbol?.charAt(0) || 'T'}
                              </Text>
                            )}
                          </XStack>

                          {/* Token Name and Balance */}
                          <YStack style={{ flex: 1 }}>
                            <XStack style={{ alignItems: 'center', marginBottom: 6 }}>
                              <Text color="white" fontSize="$5" fontWeight="600" mr="$2">
                                {token.symbol === 'USDT'
                                  ? 'Tether USD'
                                  : token.symbol === 'VLX'
                                    ? 'Velas'
                                    : token.symbol === 'ZEN'
                                      ? 'Horizen'
                                      : token.symbol === 'COREUM'
                                        ? 'Coreum'
                                        : token.symbol === 'UPHOLD'
                                          ? 'Uphold Token'
                                          : token.symbol === 'FLOW'
                                            ? 'Flow'
                                            : token.name || token.symbol || 'Unknown Token'}
                              </Text>
                              {token.isVerified && (
                                <XStack
                                  style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    backgroundColor: '#00EF8B',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Text color="white" fontSize="$1" fontWeight="700">
                                    ✓
                                  </Text>
                                </XStack>
                              )}
                            </XStack>
                            <XStack style={{ alignItems: 'center' }}>
                              <Text color="rgba(255, 255, 255, 0.5)" fontSize="$3" mr="$2">
                                {token.displayBalance || token.balance || '0.00'}
                              </Text>
                              <Text color="rgba(255, 255, 255, 0.3)" fontSize="$3">
                                {token.symbol || 'TOKEN'}
                              </Text>
                            </XStack>
                          </YStack>
                        </XStack>

                        {/* Right side - USD Value and Change */}
                        <YStack style={{ alignItems: 'flex-end' }} px="$4">
                          <Text
                            color="white"
                            fontSize="$5"
                            fontWeight="600"
                            style={{ marginBottom: 6 }}
                          >
                            $
                            {(
                              parseFloat(token.displayBalance || token.balance || '0') * 1.25
                            ).toFixed(2)}
                          </Text>
                          <XStack style={{ alignItems: 'center' }}>
                            <Text color="#00EF8B" fontSize="$3" fontWeight="500" mr="$1">
                              ↗
                            </Text>
                            <Text color="#00EF8B" fontSize="$3" fontWeight="500">
                              +5.2%
                            </Text>
                          </XStack>
                        </YStack>
                      </XStack>
                    ))}
                  </YStack>
                )}
              </YStack>
            )}

            {tab === 'NFTs' && (
              <YStack gap="$3">
                {nftLoading ? (
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
                ) : nftError ? (
                  <RefreshView
                    type="error"
                    message={nftError}
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
                    {/* NFT Collections Count */}
                    <XStack
                      style={{ justifyContent: 'space-between', alignItems: 'center' }}
                      px="$2"
                      pb="$2"
                    >
                      <Text color="rgba(255, 255, 255, 0.6)" fontSize="$3">
                        {nftCollections.length}{' '}
                        {nftCollections.length === 1 ? 'Collection' : 'Collections'}
                      </Text>
                      {fromAccount && (
                        <Text color="rgba(255, 255, 255, 0.4)" fontSize="$2">
                          {fromAccount.address.slice(0, 4)}...{fromAccount.address.slice(-4)}
                        </Text>
                      )}
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

          {/* Bottom Action Area */}
          <YStack
            px="$4"
            py="$4"
            style={{
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <Text
              color="rgba(255, 255, 255, 0.6)"
              fontSize="$3"
              style={{ textAlign: 'center' }}
              mb="$2"
            >
              Select a token to continue
            </Text>
            <XStack style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text color="rgba(255, 255, 255, 0.4)" fontSize="$2">
                {tokensWithBalance.length} tokens available
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      {/* Account Selector Modal - Temporarily disabled */}
      {/* <AccountSelectorModal
        ref={accountSelectorRef}
        onAccountSelect={(account) => handleAccountSelect(account as WalletAccount)}
        currentAccount={fromAccount}
      /> */}
    </BackgroundWrapper>
  );
}
