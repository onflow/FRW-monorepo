import { navigation } from '@onflow/frw-context';
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
  SegmentedControl,
  Skeleton,
  Text,
  TokenCard,
  YStack,
  XStack,
  ScrollView,
  RefreshView,
  NFTCollectionRow,
  AccountCard,
  Badge,
  AddressText,
  Divider,
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
}

export function SelectTokensScreen({ bridge }: SelectTokensScreenProps) {
  // navigation is imported directly from ServiceContext
  const { t } = useTranslation();
  // State management
  const [tab, setTab] = React.useState<TabType>('Tokens');
  const [tokens, setTokens] = React.useState<TokenModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
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
      setIsLoading(true);
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
        const tokenInfos = await tokenService.getTokenInfo(targetAddress, network, currency.name);
        setTokens(tokenInfos);
      } catch (err: any) {
        console.error('Error fetching tokens:', err);
        setError(err.message || t('errors.failedToLoadTokens'));
        setTokens([]);
      } finally {
        setIsLoading(false);
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
    const hasBalance = rawBalance > 0 || availableBalance > 0;
    return hasBalance;
  });

  return (
    <BackgroundWrapper backgroundColor="$background">
      <YStack flex={1} px="$4" pt="$2">
        {/* Header */}
        <XStack justify="center" items="center" py="$4" pos="relative">
          <Text fontSize="$6" fontWeight="700" color="$color" lineHeight="$2" letterSpacing="$-1">
            {t('send.title')}
          </Text>
        </XStack>

        {/* Account Card */}
        {isAccountLoading ? (
          <YStack bg="$bg2" rounded="$4" p="$4" my="$4" h="$10" justify="center" items="center">
            <Text color="$textSecondary">{t('messages.loadingAccount')}</Text>
          </YStack>
        ) : fromAccount ? (
          <AccountCard
            account={{
              ...fromAccount,
              balance: isBalanceLoading ? t('messages.loading') : fromAccountBalance,
            }}
            title={t('labels.fromAccount')}
            isLoading={isBalanceLoading}
            showBackground={true}
          />
        ) : null}

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
                        logo={token.icon}
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
                  {/* NFT Collections Count Badge */}
                  <XStack justify="space-between" items="center" px="$2" pb="$2">
                    <Badge variant="primary" size="small">
                      {nftCollections.length}{' '}
                      {nftCollections.length === 1 ? 'Collection' : 'Collections'}
                    </Badge>
                    {fromAccount && (
                      <AddressText
                        address={fromAccount.address}
                        truncate={true}
                        startLength={4}
                        endLength={4}
                      />
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
      </YStack>
    </BackgroundWrapper>
  );
}
