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
  Button,
  SegmentedControl,
  Skeleton,
  Text,
  TokenCard,
  YStack,
  XStack,
  ScrollView,
} from '@onflow/frw-ui';
import React, { useCallback, useEffect, useState } from 'react';

import type { BaseScreenProps, TabType } from '../types';

interface SelectTokensScreenProps extends BaseScreenProps {
  theme?: { isDark: boolean };
}

export function SelectTokensScreen({
  navigation,
  bridge,
  t,
  theme = { isDark: false },
}: SelectTokensScreenProps) {
  // State management
  const [tab, setTab] = React.useState<TabType>('Tokens');
  const [tokens, setTokens] = React.useState<TokenModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fromAccount, setLocalFromAccount] = React.useState<WalletAccount | null>(null);
  const [fromAccountBalance, setFromAccountBalance] = React.useState<string>('0 FLOW');
  const [isBalanceLoading, setIsBalanceLoading] = React.useState(false);
  const [isAccountLoading, setIsAccountLoading] = React.useState(true);

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
  } = useSendStore();

  const walletStoreState = useWalletStore();

  // Tab options
  const TABS = [t('tabs.tokens'), t('tabs.nfts')] as const;

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

  // Update account balance
  const updateFromAccountBalance = useCallback(
    async (accountAddress: string, accountType?: string, forceFresh: boolean = true) => {
      setIsBalanceLoading(true);
      try {
        const balance = await fetchAccountBalance(accountAddress, accountType, forceFresh);
        setFromAccountBalance(balance);
      } catch (error) {
        console.error('Failed to update account balance:', error);
        setFromAccountBalance('0 FLOW');
      } finally {
        setIsBalanceLoading(false);
      }
    },
    [fetchAccountBalance]
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
          setIsAccountLoading(false);

          await Promise.all([
            updateFromAccountBalance(activeAccount.address, activeAccount.type),
            fetchTokens(activeAccount.address, activeAccount.type),
            fetchNFTCollections(activeAccount.address, activeAccount.type),
          ]);
        } else {
          setIsAccountLoading(false);
        }
      } catch (error) {
        console.error('Error initializing account:', error);
        setIsAccountLoading(false);
      }
    };

    initializeActiveAccount();
  }, [walletStoreState.isLoading]);

  // Handle tab change
  const handleTabChange = (newTab: TabType) => {
    if (newTab !== tab) {
      clearTransactionData();
    }
    setTab(newTab);
  };

  // Handle token press
  const handleTokenPress = (token: TokenModel) => {
    setSelectedToken(token);
    setTransactionType('tokens');
    setCurrentStep('send-to');
    navigation.navigate('SendTo');
  };

  // Handle NFT press
  const handleNFTPress = (collection: CollectionModel) => {
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
    return rawBalance > 0 || availableBalance > 0;
  });

  return (
    <BackgroundWrapper backgroundColor="#121212">
      <YStack flex={1} paddingHorizontal="$4" paddingTop="$2">
        {/* Header */}
        <XStack
          justifyContent="center"
          alignItems="center"
          paddingVertical="$4"
          position="relative"
        >
          <Text
            fontSize={18}
            fontWeight="700"
            color="#ffffff"
            lineHeight={32}
            letterSpacing={-0.306}
          >
            {t('send.title')}
          </Text>
        </XStack>

        {/* Account Card */}
        {isAccountLoading ? (
          <YStack
            backgroundColor="rgba(255, 255, 255, 0.1)"
            borderRadius="$4"
            padding="$4"
            marginVertical="$4"
            height={120}
            justifyContent="center"
            alignItems="center"
          >
            <Text color="$gray10">{t('messages.loadingAccount')}</Text>
          </YStack>
        ) : fromAccount ? (
          <YStack
            backgroundColor="rgba(255, 255, 255, 0.1)"
            borderRadius="$4"
            padding="$4"
            marginVertical="$4"
          >
            <XStack alignItems="center" justifyContent="space-between">
              <YStack flex={1}>
                <Text fontSize={14} color="$gray11" marginBottom="$1">
                  {t('labels.fromAccount')}
                </Text>
                <Text fontSize={16} fontWeight="600" color="#ffffff">
                  {fromAccount.name}
                </Text>
                <Text fontSize={14} color="$gray10" marginTop="$1">
                  {isBalanceLoading ? t('messages.loading') : fromAccountBalance}
                </Text>
              </YStack>
              <Button variant="secondary" size="small" onPress={() => {}}>
                {t('buttons.edit')}
              </Button>
            </XStack>
          </YStack>
        ) : null}

        {/* Tab Selector */}
        <YStack marginVertical="$4">
          <SegmentedControl
            options={TABS as unknown as string[]}
            selectedIndex={tab === 'Tokens' ? 0 : 1}
            onChange={(index) => handleTabChange(index === 0 ? 'Tokens' : 'NFTs')}
          />
        </YStack>

        {/* Content */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {tab === 'Tokens' && (
            <YStack space="$3">
              {isLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <YStack key={`token-skeleton-${index}`} padding="$3">
                      <XStack alignItems="center" space="$3">
                        <Skeleton width={48} height={48} borderRadius={24} />
                        <YStack flex={1} space="$2">
                          <Skeleton height={16} width="60%" />
                          <Skeleton height={12} width="40%" />
                        </YStack>
                        <YStack alignItems="flex-end" space="$1">
                          <Skeleton height={16} width={60} />
                          <Skeleton height={12} width={40} />
                        </YStack>
                      </XStack>
                    </YStack>
                  ))}
                </>
              ) : error ? (
                <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
                  <Text color="$red10" marginBottom="$4">
                    {error}
                  </Text>
                  <Button variant="secondary" onPress={refreshTokens}>
                    {t('buttons.retry')}
                  </Button>
                </YStack>
              ) : tokensWithBalance.length === 0 ? (
                <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
                  <Text color="$gray10" marginBottom="$4">
                    {t('messages.noTokensWithBalance')}
                  </Text>
                  <Button variant="secondary" onPress={refreshTokens}>
                    {t('buttons.refresh')}
                  </Button>
                </YStack>
              ) : (
                tokensWithBalance.map((token, idx) => (
                  <TokenCard
                    key={`token-${token.identifier || token.symbol}-${idx}`}
                    symbol={token.symbol || ''}
                    name={token.name || ''}
                    balance={token.displayBalance || token.balance || '0'}
                    logo={token.icon}
                    price={token.usdValue?.toString()}
                    change24h={token.change ? parseFloat(token.change) : undefined}
                    onPress={() => handleTokenPress(token)}
                  />
                ))
              )}
            </YStack>
          )}

          {tab === 'NFTs' && (
            <YStack space="$3">
              {nftLoading ? (
                <>
                  {[1, 2, 3, 4].map((index) => (
                    <YStack key={`nft-skeleton-${index}`} padding="$3">
                      <XStack alignItems="center" space="$3">
                        <Skeleton width={48} height={48} borderRadius={24} />
                        <YStack flex={1} space="$2">
                          <Skeleton height={16} width="70%" />
                          <Skeleton height={12} width="30%" />
                        </YStack>
                        <Skeleton width={24} height={24} />
                      </XStack>
                    </YStack>
                  ))}
                </>
              ) : nftError ? (
                <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
                  <Text color="$red10" marginBottom="$4">
                    {nftError}
                  </Text>
                  <Button variant="secondary" onPress={refreshNFTCollections}>
                    {t('buttons.retry')}
                  </Button>
                </YStack>
              ) : nftCollections.length === 0 ? (
                <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
                  <Text color="$gray10" marginBottom="$4">
                    {t('messages.noNFTCollectionsForAccount')}
                  </Text>
                  <Button variant="secondary" onPress={refreshNFTCollections}>
                    {t('buttons.refresh')}
                  </Button>
                </YStack>
              ) : (
                nftCollections.map((collection, idx) => (
                  <YStack
                    key={`nft-collection-${collection.id || collection.contractName || collection.name}-${idx}`}
                    backgroundColor="rgba(255, 255, 255, 0.05)"
                    borderRadius="$3"
                    padding="$3"
                    pressStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    onPress={() => handleNFTPress(collection)}
                  >
                    <XStack alignItems="center" space="$3">
                      <YStack
                        width={48}
                        height={48}
                        backgroundColor="$gray6"
                        borderRadius="$3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize={18}>🖼️</Text>
                      </YStack>
                      <YStack flex={1}>
                        <Text fontSize={16} fontWeight="600" color="#ffffff">
                          {collection.name || collection.contractName}
                        </Text>
                        <Text fontSize={14} color="$gray10">
                          {collection.count} {t('labels.items')}
                        </Text>
                      </YStack>
                      <Text fontSize={16} color="$gray8">
                        ›
                      </Text>
                    </XStack>
                  </YStack>
                ))
              )}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </BackgroundWrapper>
  );
}
