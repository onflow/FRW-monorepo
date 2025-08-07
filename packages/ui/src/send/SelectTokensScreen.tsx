import { TokenService } from '@onflow/frw-services';
import { useSendStore, useTokenStore, useWalletStore } from '@onflow/frw-stores';
import {
  addressType,
  type TokenInfo,
  WalletType,
  type CollectionModel,
  type WalletAccount,
} from '@onflow/frw-types';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { YStack, XStack, Text, H4, Button, Card, Separator, Spinner, ScrollView } from 'tamagui';

// Platform-agnostic interfaces
interface PlatformBridge {
  getSelectedAddress(): string | null;
  getNetwork(): string;
}

interface NavigationProp {
  navigate(screen: string, params?: Record<string, unknown>): void;
}

interface SelectTokensScreenProps {
  navigation: NavigationProp;
  bridge: PlatformBridge;
  t: (key: string, options?: Record<string, unknown>) => string;
}

// Tab options constants and types
export type TabType = 'Tokens' | 'NFTs';

// SelectTokensScreen main component
export function SelectTokensScreen({
  navigation,
  bridge,
  t,
}: SelectTokensScreenProps): React.ReactElement {
  const [tab, setTab] = useState<TabType>('Tokens');
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nftSearch, setNftSearch] = useState('');
  const [fromAccount, setLocalFromAccount] = useState<WalletAccount | null>(null);
  const [fromAccountBalance, setFromAccountBalance] = useState<string>('0 FLOW');
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isAccountLoading, setIsAccountLoading] = useState(true);

  // Send store actions
  const {
    setSelectedToken,
    setTransactionType,
    setCurrentStep,
    clearTransactionData,
    setFromAccount: setStoreFromAccount,
  } = useSendStore();

  // Function to fetch Flow balance for a specific account
  const fetchAccountBalance = useCallback(
    async (
      accountAddress: string,
      accountType?: string,
      forceFresh: boolean = false
    ): Promise<string> => {
      try {
        let network;
        try {
          network = bridge.getNetwork();
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
    [bridge]
  );

  // Update from account balance
  const updateFromAccountBalance = useCallback(
    async (accountAddress: string, accountType?: string, forceFresh: boolean = true) => {
      setIsBalanceLoading(true);
      try {
        const balance = await fetchAccountBalance(accountAddress, accountType, forceFresh);
        setFromAccountBalance(balance);
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
        const targetAddress = accountAddress || bridge.getSelectedAddress();
        const network = bridge.getNetwork();

        if (!targetAddress) {
          setTokens([]);
          return;
        }

        // Determine wallet type based on account type or address
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
        const tokenInfos = await tokenService.getTokenInfo(targetAddress, network);
        setTokens(tokenInfos);
      } catch (err: any) {
        console.error('Error fetching tokens:', err);
        setError(err.message || t('errors.failedToLoadTokens'));
        setTokens([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [bridge, t]
  );

  // NFT collections state
  const [nftCollections, setNftCollections] = useState<any[]>([]);
  const [nftLoading, setNftLoading] = useState(false);
  const [nftRefreshing, setNftRefreshing] = useState(false);
  const [nftError, setNftError] = useState<string | null>(null);

  // Fetch NFT collections from API
  const fetchNFTCollections = useCallback(
    async (accountAddress?: string, accountType?: string, isRefreshAction = false) => {
      if (isRefreshAction) {
        setNftRefreshing(true);
      } else {
        setNftLoading(true);
      }
      setNftError(null);

      try {
        const targetAddress = accountAddress || bridge.getSelectedAddress();
        const network = bridge.getNetwork();

        if (!targetAddress) {
          setNftCollections([]);
          setNftLoading(false);
          setNftRefreshing(false);
          return;
        }

        // Use token store for NFT collections
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
        console.error('[NFT] Failed to fetch cached collections:', errorMessage);
        setNftError(`Failed to load NFT collections: ${errorMessage}`);
        setNftCollections([]);
      } finally {
        setNftLoading(false);
        setNftRefreshing(false);
      }
    },
    [bridge]
  );

  // Handle account selection
  const handleAccountSelect = useCallback(
    async (selectedAccount: WalletAccount) => {
      try {
        setLocalFromAccount(selectedAccount);
        setStoreFromAccount(selectedAccount);

        setNftLoading(true);
        setNftError(null);

        await updateFromAccountBalance(selectedAccount.address, selectedAccount.type, true);

        await Promise.all([
          fetchTokens(selectedAccount.address, selectedAccount.type),
          fetchNFTCollections(selectedAccount.address, selectedAccount.type),
        ]);
      } catch (error) {
        console.error('Failed to update account:', error);
      }
    },
    [setStoreFromAccount, updateFromAccountBalance, fetchTokens, fetchNFTCollections]
  );

  // Get walletStore state
  const walletStoreState = useWalletStore();

  // Initialize when screen loads
  useEffect(() => {
    setCurrentStep('select-tokens');

    const initializeActiveAccount = async () => {
      try {
        if (walletStoreState.isLoading) {
          return;
        }

        const activeAccount = walletStoreState.activeAccount;

        if (activeAccount) {
          setLocalFromAccount(activeAccount);
          setStoreFromAccount(activeAccount);
          setIsAccountLoading(false);

          const dataPromises = [
            updateFromAccountBalance(activeAccount.address, activeAccount.type),
            fetchTokens(activeAccount.address, activeAccount.type),
            fetchNFTCollections(activeAccount.address, activeAccount.type),
          ];

          await Promise.all(dataPromises);
        } else if (walletStoreState.accounts.length > 0) {
          const firstAccount = walletStoreState.accounts[0];
          setLocalFromAccount(firstAccount);
          setStoreFromAccount(firstAccount);
          setIsAccountLoading(false);

          const dataPromises = [
            updateFromAccountBalance(firstAccount.address, firstAccount.type),
            fetchTokens(firstAccount.address, firstAccount.type),
            fetchNFTCollections(firstAccount.address, firstAccount.type),
          ];
          await Promise.all(dataPromises);
        } else {
          setIsAccountLoading(false);
        }
      } catch (error) {
        console.error('Error initializing active account:', error);
        setIsAccountLoading(false);
      }
    };

    initializeActiveAccount();
  }, [walletStoreState.isLoading]);

  // Clear transaction data when switching tabs
  const handleTabChange = (newTab: TabType) => {
    if (newTab !== tab) {
      clearTransactionData();
    }
    setTab(newTab);
  };

  // Event handlers
  const refreshTokens = useCallback(() => {
    fetchTokens(fromAccount?.address, fromAccount?.type, true);
  }, [fromAccount, fetchTokens]);

  const refreshNFTCollections = useCallback(() => {
    fetchNFTCollections(fromAccount?.address, fromAccount?.type, true);
  }, [fromAccount, fetchNFTCollections]);

  // Filter NFT collections
  const filteredNFTCollections = useMemo(() => {
    const collectionsWithItems = nftCollections.filter(
      (collection: any) => collection.count && collection.count > 0
    );

    if (!nftSearch) {
      return collectionsWithItems;
    }

    return collectionsWithItems.filter(
      (collection: any) =>
        collection.name?.toLowerCase().includes(nftSearch.toLowerCase()) ||
        collection.contractName?.toLowerCase().includes(nftSearch.toLowerCase()) ||
        collection.contract_name?.toLowerCase().includes(nftSearch.toLowerCase())
    );
  }, [nftSearch, nftCollections]);

  function handleTokenPress(token: TokenInfo) {
    setSelectedToken(token);
    setTransactionType('tokens');
    setCurrentStep('send-to');
    navigation.navigate('SendTo');
  }

  function handleNFTPress(collection: CollectionModel) {
    const address = fromAccount?.address || bridge.getSelectedAddress();
    navigation.navigate('NFTList', {
      collection,
      address,
    });
  }

  return (
    <YStack flex={1} padding="$4" backgroundColor="$background">
      {/* Account Card */}
      {isAccountLoading ? (
        <Card padding="$4" marginBottom="$4">
          <XStack space="$2" alignItems="center">
            <Spinner size="small" />
            <Text>{t('messages.loadingAccount')}</Text>
          </XStack>
        </Card>
      ) : (
        <Card padding="$4" marginBottom="$4">
          <YStack space="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <H4>{t('labels.fromAccount')}</H4>
              <Button
                size="$2"
                variant="outlined"
                onPress={() => {
                  // Handle account selector modal
                  console.log('Account selector pressed');
                }}
              >
                {t('buttons.edit')}
              </Button>
            </XStack>
            <XStack space="$3" alignItems="center">
              <Text fontSize="$6">{fromAccount?.emojiInfo?.emoji || '👤'}</Text>
              <YStack flex={1}>
                <Text fontWeight="bold">{fromAccount?.name || t('messages.loading')}</Text>
                <Text color="$gray10" fontSize="$2">
                  {fromAccount?.address || '0x...'}
                </Text>
                <XStack space="$2" alignItems="center">
                  {isBalanceLoading ? (
                    <Spinner size="small" />
                  ) : (
                    <Text color="$gray11">{fromAccountBalance}</Text>
                  )}
                </XStack>
              </YStack>
            </XStack>
          </YStack>
        </Card>
      )}

      {/* Tab Selector */}
      <XStack space="$2" marginBottom="$4">
        <Button
          flex={1}
          variant={tab === 'Tokens' ? 'outlined' : undefined}
          onPress={() => handleTabChange('Tokens')}
        >
          {t('tabs.tokens')}
        </Button>
        <Button
          flex={1}
          variant={tab === 'NFTs' ? 'outlined' : undefined}
          onPress={() => handleTabChange('NFTs')}
        >
          {t('tabs.nfts')}
        </Button>
      </XStack>

      {/* Content */}
      <ScrollView flex={1}>
        {tab === 'Tokens' && (
          <YStack space="$2">
            {isLoading ? (
              <YStack space="$3" padding="$4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <Card key={`token-skeleton-${index}`} padding="$3">
                    <XStack space="$3" alignItems="center">
                      <YStack width={48} height={48} backgroundColor="$gray5" borderRadius="$4" />
                      <YStack flex={1} space="$2">
                        <YStack
                          width="40%"
                          height={16}
                          backgroundColor="$gray5"
                          borderRadius="$2"
                        />
                        <YStack
                          width="60%"
                          height={12}
                          backgroundColor="$gray5"
                          borderRadius="$2"
                        />
                      </YStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            ) : error ? (
              <Card padding="$4">
                <YStack space="$3" alignItems="center">
                  <Text color="$red10">{error}</Text>
                  <Button onPress={refreshTokens}>{t('buttons.retry')}</Button>
                </YStack>
              </Card>
            ) : (
              (() => {
                const tokensWithBalance = tokens.filter((token) => {
                  const rawBalance = parseFloat(token.displayBalance || token.balance || '0');
                  const availableBalance = parseFloat(token.availableBalanceToUse || '0');
                  return rawBalance > 0 || availableBalance > 0;
                });

                return tokensWithBalance.length === 0 ? (
                  <Card padding="$4">
                    <YStack space="$3" alignItems="center">
                      <Text>{t('messages.noTokensWithBalance')}</Text>
                      <Button onPress={refreshTokens}>{t('buttons.refresh')}</Button>
                    </YStack>
                  </Card>
                ) : (
                  tokensWithBalance.map((token, idx) => (
                    <YStack key={`token-${token.identifier || token.symbol}-${idx}`}>
                      <Card
                        padding="$3"
                        pressStyle={{ scale: 0.98 }}
                        onPress={() => handleTokenPress(token)}
                      >
                        <XStack space="$3" alignItems="center">
                          <YStack
                            width={48}
                            height={48}
                            backgroundColor="$gray5"
                            borderRadius="$4"
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Text fontSize="$6">{token.symbol?.charAt(0) || '?'}</Text>
                          </YStack>
                          <YStack flex={1} space="$1">
                            <Text fontWeight="bold">{token.symbol}</Text>
                            <Text color="$gray11" fontSize="$2">
                              {token.displayBalance || token.balance} {token.symbol}
                            </Text>
                          </YStack>
                          {(token as any).usdValue && (
                            <YStack alignItems="flex-end">
                              <Text fontWeight="bold">${(token as any).usdValue}</Text>
                              {(token as any).changePercentage && (
                                <Text
                                  fontSize="$2"
                                  color={
                                    (token as any).changePercentage > 0 ? '$green10' : '$red10'
                                  }
                                >
                                  {(token as any).changePercentage > 0 ? '+' : ''}
                                  {(token as any).changePercentage}%
                                </Text>
                              )}
                            </YStack>
                          )}
                        </XStack>
                      </Card>
                      {idx !== tokensWithBalance.length - 1 && <Separator marginVertical="$1" />}
                    </YStack>
                  ))
                );
              })()
            )}
          </YStack>
        )}

        {tab === 'NFTs' && (
          <YStack space="$2">
            {nftLoading ? (
              <YStack space="$3" padding="$4">
                {[1, 2, 3, 4].map((index) => (
                  <Card key={`nft-skeleton-${index}`} padding="$3">
                    <XStack space="$3" alignItems="center">
                      <YStack width={48} height={48} backgroundColor="$gray5" borderRadius="$4" />
                      <YStack flex={1} space="$2">
                        <YStack
                          width="60%"
                          height={16}
                          backgroundColor="$gray5"
                          borderRadius="$2"
                        />
                        <YStack
                          width="30%"
                          height={12}
                          backgroundColor="$gray5"
                          borderRadius="$2"
                        />
                      </YStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            ) : nftError ? (
              <Card padding="$4">
                <YStack space="$3" alignItems="center">
                  <Text color="$red10">{nftError}</Text>
                  <Button onPress={refreshNFTCollections}>{t('buttons.retry')}</Button>
                </YStack>
              </Card>
            ) : filteredNFTCollections.length === 0 ? (
              <Card padding="$4">
                <YStack space="$3" alignItems="center">
                  <Text>{t('messages.noNFTCollectionsForAccount')}</Text>
                  <Button onPress={refreshNFTCollections}>{t('buttons.refresh')}</Button>
                </YStack>
              </Card>
            ) : (
              filteredNFTCollections.map((collection, idx) => (
                <YStack
                  key={`nft-collection-${collection.id || collection.contractName || collection.name}-${idx}`}
                >
                  <Card
                    padding="$3"
                    pressStyle={{ scale: 0.98 }}
                    onPress={() => handleNFTPress(collection)}
                  >
                    <XStack space="$3" alignItems="center">
                      <YStack
                        width={48}
                        height={48}
                        backgroundColor="$gray5"
                        borderRadius="$4"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text fontSize="$4">🖼️</Text>
                      </YStack>
                      <YStack flex={1} space="$1">
                        <Text fontWeight="bold">{collection.name || collection.contractName}</Text>
                        <Text color="$gray11" fontSize="$2">
                          {collection.count} {collection.count === 1 ? 'item' : 'items'}
                        </Text>
                      </YStack>
                      <Text color="$gray11">›</Text>
                    </XStack>
                  </Card>
                  {idx !== filteredNFTCollections.length - 1 && <Separator marginVertical="$1" />}
                </YStack>
              ))
            )}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}
