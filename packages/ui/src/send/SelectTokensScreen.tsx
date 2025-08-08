import { bridge } from '@onflow/frw-context';
import { TokenService } from '@onflow/frw-services';
import { useSendStore, useTokenStore, useWalletStore } from '@onflow/frw-stores';
import {
  addressType,
  WalletType,
  type CollectionModel,
  type TokenInfo,
  type WalletAccount,
} from '@onflow/frw-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Card, ScrollView, Text, View, XStack, YStack } from 'tamagui';

// Navigation interface - each platform implements differently
interface NavigationProp {
  navigate(screen: string, params?: Record<string, unknown>): void;
}

interface SelectTokensScreenProps {
  navigation: NavigationProp;
  t: (key: string, options?: Record<string, unknown>) => string;
}

// Tab options constants and types
export type TabType = 'Tokens' | 'NFTs';

// SelectTokensScreen main component
export function SelectTokensScreen({ navigation, t }: SelectTokensScreenProps): React.ReactElement {
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
    <YStack flex={1} paddingHorizontal="$4" paddingTop="$2" backgroundColor="#121212">
      {/* Header */}
      <XStack justifyContent="center" alignItems="center" paddingVertical="$4" position="relative">
        <Text fontSize={18} fontWeight="700" color="#ffffff" lineHeight={32} letterSpacing={-0.306}>
          Send
        </Text>
        <Button
          position="absolute"
          right={0}
          backgroundColor="transparent"
          borderWidth={0}
          size="$6"
          padding="$0"
          minHeight="auto"
          height="auto"
        >
          <Text fontSize={16} color="#ffffff">
            ✕
          </Text>
        </Button>
      </XStack>

      {/* Account Card */}
      {isAccountLoading ? (
        <Card
          backgroundColor="rgba(255,255,255,0.1)"
          borderRadius="$7"
          padding="$4"
          marginBottom="$5"
          height={120}
          justifyContent="center"
          alignItems="center"
        >
          <Text color="rgba(255,255,255,0.8)">{t('messages.loadingAccount')}</Text>
        </Card>
      ) : (
        <Card
          backgroundColor="rgba(255,255,255,0.1)"
          borderRadius="$7"
          paddingTop="$4"
          paddingBottom="$6"
          paddingHorizontal="$4"
          marginBottom="$5"
        >
          <YStack space="$3">
            <Text
              fontSize={12}
              fontFamily="Inter"
              fontWeight="400"
              color="rgba(255,255,255,0.8)"
              lineHeight={16}
            >
              From Account
            </Text>
            <XStack
              alignItems="center"
              justifyContent="space-between"
              paddingLeft="$1"
              paddingRight={0}
              paddingVertical="$2"
              height={52}
            >
              <XStack space="$4" alignItems="center">
                <Avatar circular size={36} backgroundColor="#d6d6d6">
                  <Avatar.Image src="" />
                  <Avatar.Fallback>
                    <Text
                      fontSize={18}
                      color="#ffffff"
                      fontWeight="600"
                      letterSpacing={-0.252}
                      lineHeight={24}
                    >
                      {fromAccount?.emojiInfo?.emoji || '🐼'}
                    </Text>
                  </Avatar.Fallback>
                </Avatar>
                <YStack space="$0.5" width={151}>
                  <Text
                    fontSize={14}
                    fontFamily="Inter"
                    fontWeight="600"
                    color="#ffffff"
                    letterSpacing={-0.084}
                    lineHeight="1.2"
                  >
                    {fromAccount?.name || 'Panda'}
                  </Text>
                  <Text
                    fontSize={12}
                    fontFamily="Inter"
                    fontWeight="400"
                    color="#b3b3b3"
                    lineHeight="1.4"
                    width="min-content"
                  >
                    {fromAccount?.address || '0x0c666c888d8fb259'}
                  </Text>
                  <Text
                    fontSize={12}
                    fontFamily="Inter"
                    fontWeight="400"
                    color="#b3b3b3"
                    lineHeight="1.4"
                    width="min-content"
                  >
                    {fromAccountBalance || '550.66 FLOW'}
                  </Text>
                </YStack>
              </XStack>
              <Button
                backgroundColor="transparent"
                borderWidth={0}
                size={24}
                padding="$0"
                minHeight={24}
                height={24}
                width={24}
                onPress={() => {
                  console.log('Account selector pressed');
                }}
              >
                <Text fontSize={14} color="#767676">
                  ✎
                </Text>
              </Button>
            </XStack>
          </YStack>
        </Card>
      )}

      {/* Tab Selector */}
      <YStack marginBottom="$5">
        <XStack
          borderWidth={2}
          borderColor="#292929"
          borderRadius={200}
          paddingHorizontal="$1"
          paddingVertical={5}
          space="$2"
          width={178}
          height={43}
          alignItems="center"
          justifyContent="flex-start"
        >
          <Button
            size="$3"
            fontSize={16}
            fontWeight="600"
            backgroundColor={tab === 'Tokens' ? '#242424' : 'transparent'}
            color={tab === 'Tokens' ? 'rgba(255,255,255,0.8)' : '#ffffff'}
            borderWidth={0}
            borderRadius={24}
            letterSpacing={-0.096}
            paddingHorizontal="$1"
            paddingVertical="$1"
            width={90}
            height={33}
            minHeight={33}
            onPress={() => handleTabChange('Tokens')}
          >
            Tokens
          </Button>
          <Button
            fontSize={16}
            fontWeight="600"
            backgroundColor={tab === 'NFTs' ? '#242424' : 'transparent'}
            color={tab === 'NFTs' ? 'rgba(255,255,255,0.8)' : '#ffffff'}
            borderWidth={0}
            borderRadius={0}
            letterSpacing={-0.096}
            padding="$0"
            width={57}
            height={33}
            minHeight={33}
            textAlign="center"
            onPress={() => handleTabChange('NFTs')}
          >
            NFTs
          </Button>
        </XStack>
      </YStack>

      {/* Content */}
      <ScrollView flex={1}>
        {tab === 'Tokens' && (
          <YStack>
            {isLoading ? (
              <YStack space="$0" paddingVertical="$4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <YStack key={`token-skeleton-${index}`}>
                    <XStack
                      alignItems="center"
                      paddingVertical="$4"
                      paddingHorizontal="$0"
                      height={80}
                    >
                      {/* Token icon skeleton */}
                      <Avatar
                        circular
                        size={48}
                        backgroundColor="rgba(255,255,255,0.1)"
                        marginRight="$2"
                      />
                      <YStack flex={1} space="$1">
                        <XStack justifyContent="space-between" alignItems="flex-start">
                          <YStack
                            width="35%"
                            height={16}
                            backgroundColor="rgba(255,255,255,0.1)"
                            borderRadius="$2"
                          />
                          <YStack
                            width="25%"
                            height={16}
                            backgroundColor="rgba(255,255,255,0.1)"
                            borderRadius="$2"
                          />
                        </XStack>
                        <XStack justifyContent="space-between" alignItems="center">
                          <YStack
                            width="30%"
                            height={14}
                            backgroundColor="rgba(255,255,255,0.1)"
                            borderRadius="$2"
                          />
                          <YStack
                            width={36}
                            height={20}
                            backgroundColor="rgba(255,255,255,0.1)"
                            borderRadius="$3"
                          />
                        </XStack>
                      </YStack>
                    </XStack>
                    {index !== 5 && <View height={1} backgroundColor="rgba(255,255,255,0.1)" />}
                  </YStack>
                ))}
              </YStack>
            ) : error ? (
              <YStack padding="$4" alignItems="center" space="$3">
                <Text color="#f04438" textAlign="center">
                  {error}
                </Text>
                <Button
                  backgroundColor="rgba(240,68,56,0.1)"
                  color="#f04438"
                  borderWidth={0}
                  size="$3"
                  onPress={refreshTokens}
                >
                  {t('buttons.retry')}
                </Button>
              </YStack>
            ) : (
              (() => {
                const tokensWithBalance = tokens.filter((token) => {
                  const rawBalance = parseFloat(token.displayBalance || token.balance || '0');
                  const availableBalance = parseFloat(token.availableBalanceToUse || '0');
                  return rawBalance > 0 || availableBalance > 0;
                });

                return tokensWithBalance.length === 0 ? (
                  <YStack padding="$4" alignItems="center" space="$3">
                    <Text color="#ffffff">{t('messages.noTokensWithBalance')}</Text>
                    <Button
                      backgroundColor="rgba(0,239,139,0.1)"
                      color="#00ef8b"
                      borderWidth={0}
                      onPress={refreshTokens}
                    >
                      {t('buttons.refresh')}
                    </Button>
                  </YStack>
                ) : (
                  tokensWithBalance.map((token, idx) => (
                    <YStack key={`token-${token.identifier || token.symbol}-${idx}`}>
                      <XStack
                        alignItems="center"
                        paddingVertical="$4"
                        paddingHorizontal="$0"
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => handleTokenPress(token)}
                        height={80}
                      >
                        {/* Token icon */}
                        <Avatar circular size={48} backgroundColor="#00ef8b" marginRight="$2">
                          <Avatar.Image src="" />
                          <Avatar.Fallback>
                            <Text fontSize={16} color="#ffffff" fontWeight="600">
                              {token.symbol?.charAt(0) || '?'}
                            </Text>
                          </Avatar.Fallback>
                        </Avatar>

                        <YStack flex={1} space="$1">
                          <XStack justifyContent="space-between" alignItems="flex-start">
                            <XStack space="$1" alignItems="flex-start">
                              <Text
                                fontSize={14}
                                fontWeight="600"
                                color="#ffffff"
                                letterSpacing={-0.084}
                                lineHeight="1.2"
                              >
                                {token.symbol}
                              </Text>
                              <Text fontSize={14} color="#41cc5d">
                                ✓
                              </Text>
                            </XStack>
                            <Text fontSize={14} color="#ffffff" lineHeight="1.2">
                              {token.displayBalance || token.balance} {token.symbol}
                            </Text>
                          </XStack>

                          <XStack justifyContent="space-between" alignItems="center">
                            <Text fontSize={14} color="rgba(255,255,255,0.8)" lineHeight="1.2">
                              {token.displayBalance || token.balance} FLOW
                            </Text>
                            <YStack
                              backgroundColor="rgba(0,239,139,0.1)"
                              paddingHorizontal="$1"
                              paddingVertical={4}
                              borderRadius="$3"
                            >
                              <Text
                                fontSize={12}
                                color="#00ef8b"
                                lineHeight="1.4"
                                width={36}
                                textAlign="center"
                              >
                                +5.2%
                              </Text>
                            </YStack>
                          </XStack>
                        </YStack>
                      </XStack>
                      {idx !== tokensWithBalance.length - 1 && (
                        <View height={1} backgroundColor="rgba(255,255,255,0.1)" />
                      )}
                    </YStack>
                  ))
                );
              })()
            )}
          </YStack>
        )}

        {tab === 'NFTs' && (
          <YStack>
            {nftLoading ? (
              <YStack space="$0" paddingVertical="$4">
                {[1, 2, 3, 4].map((index) => (
                  <YStack key={`nft-skeleton-${index}`}>
                    <XStack
                      alignItems="center"
                      paddingVertical="$4"
                      paddingHorizontal="$0"
                      height={80}
                    >
                      <Avatar
                        circular
                        size={48}
                        backgroundColor="rgba(255,255,255,0.1)"
                        marginRight="$2"
                      />
                      <YStack flex={1} space="$2">
                        <YStack
                          width="60%"
                          height={16}
                          backgroundColor="rgba(255,255,255,0.1)"
                          borderRadius="$2"
                        />
                        <YStack
                          width="30%"
                          height={12}
                          backgroundColor="rgba(255,255,255,0.1)"
                          borderRadius="$2"
                        />
                      </YStack>
                      <Text color="rgba(255,255,255,0.3)">›</Text>
                    </XStack>
                    {index !== 4 && <View height={1} backgroundColor="rgba(255,255,255,0.1)" />}
                  </YStack>
                ))}
              </YStack>
            ) : nftError ? (
              <YStack padding="$4" alignItems="center" space="$3">
                <Text color="#f04438">{nftError}</Text>
                <Button
                  backgroundColor="rgba(240,68,56,0.1)"
                  color="#f04438"
                  borderWidth={0}
                  onPress={refreshNFTCollections}
                >
                  {t('buttons.retry')}
                </Button>
              </YStack>
            ) : filteredNFTCollections.length === 0 ? (
              <YStack padding="$4" alignItems="center" space="$3">
                <Text color="#ffffff">{t('messages.noNFTCollectionsForAccount')}</Text>
                <Button
                  backgroundColor="rgba(0,239,139,0.1)"
                  color="#00ef8b"
                  borderWidth={0}
                  onPress={refreshNFTCollections}
                >
                  {t('buttons.refresh')}
                </Button>
              </YStack>
            ) : (
              filteredNFTCollections.map((collection, idx) => (
                <YStack
                  key={`nft-collection-${collection.id || collection.contractName || collection.name}-${idx}`}
                >
                  <XStack
                    alignItems="center"
                    paddingVertical="$4"
                    paddingHorizontal="$0"
                    pressStyle={{ opacity: 0.8 }}
                    onPress={() => handleNFTPress(collection)}
                    height={80}
                  >
                    <Avatar
                      circular
                      size={48}
                      backgroundColor="rgba(255,255,255,0.1)"
                      marginRight="$2"
                    >
                      <Avatar.Image src="" />
                      <Avatar.Fallback>
                        <Text fontSize={24}>🖼️</Text>
                      </Avatar.Fallback>
                    </Avatar>
                    <YStack flex={1} space="$1">
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        color="#ffffff"
                        letterSpacing={-0.084}
                        lineHeight="1.2"
                      >
                        {collection.name || collection.contractName}
                      </Text>
                      <Text fontSize={12} color="#b3b3b3" lineHeight="1.4">
                        {collection.count} {collection.count === 1 ? 'item' : 'items'}
                      </Text>
                    </YStack>
                    <Text fontSize={16} color="#b3b3b3">
                      ›
                    </Text>
                  </XStack>
                  {idx !== filteredNFTCollections.length - 1 && (
                    <View height={1} backgroundColor="rgba(255,255,255,0.1)" />
                  )}
                </YStack>
              ))
            )}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}
