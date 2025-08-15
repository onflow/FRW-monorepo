import { useSendStore, useTokenStore, useWalletStore } from '@onflow/frw-stores';
import { type TokenModel, type CollectionModel, type WalletAccount } from '@onflow/frw-types';
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
} from '@onflow/frw-ui';
import React, { useCallback, useEffect } from 'react';

import { useDemoDataStore } from '../stores/DemoDataStore';
import type { BaseScreenProps, TabType } from '../types';

interface SelectTokensScreenProps extends BaseScreenProps {
  theme?: { isDark: boolean };
}

export function SelectTokensScreen({ navigation, bridge, t }: SelectTokensScreenProps) {
  // Demo data store
  const {
    tokens,
    collections: nftCollections,
    accounts,
    activeAccount,
    isLoadingTokens: isLoading,
    isLoadingNFTs: nftLoading,
    tokensError: error,
    nftsError: nftError,
    fetchTokens: fetchDemoTokens,
    fetchNFTs: fetchDemoNFTs,
    fetchCollections: fetchDemoCollections,
    fetchAccounts: fetchDemoAccounts,
    setActiveAccount,
  } = useDemoDataStore();

  // State management
  const [tab, setTab] = React.useState<TabType>('Tokens');
  const [fromAccount, setLocalFromAccount] = React.useState<WalletAccount | null>(null);
  const [fromAccountBalance, setFromAccountBalance] = React.useState<string>('0 FLOW');
  const [isBalanceLoading, setIsBalanceLoading] = React.useState(false);
  const [isAccountLoading, setIsAccountLoading] = React.useState(true);

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

  // Fetch tokens using demo data
  const fetchTokens = useCallback(
    async (accountAddress?: string, accountType?: string, isRefreshAction = false) => {
      // Use demo data store to fetch tokens
      await fetchDemoTokens(accountAddress);
    },
    [fetchDemoTokens]
  );

  // Fetch NFT collections
  const fetchNFTCollections = useCallback(
    async (accountAddress?: string, accountType?: string, isRefreshAction = false) => {
      // Use demo data store to fetch NFT collections
      await fetchDemoCollections(accountAddress);
      await fetchDemoNFTs(accountAddress);
    },
    [fetchDemoCollections, fetchDemoNFTs]
  );

  // Handle account selection
  const handleAccountSelect = useCallback(
    async (selectedAccount: WalletAccount) => {
      try {
        setLocalFromAccount(selectedAccount);
        setStoreFromAccount(selectedAccount);

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
    <BackgroundWrapper>
      <YStack flex={1} px="$5" pt="$2">
        {/* Account Card */}
        {isAccountLoading ? (
          <YStack
            bg="$bg2"
            rounded="$4"
            p="$4"
            my="$4"
            height={120}
            justify="center"
            items="center"
          >
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
                <YStack gap="$1">
                  {tokensWithBalance.map((token, idx) => (
                    <TokenCard
                      key={`token-${token.identifier || token.symbol}-${idx}`}
                      symbol={token.symbol || ''}
                      name={token.name || ''}
                      balance={`${token.balance || '0'} ${token.symbol || ''}`}
                      logo={token.logoURI}
                      price={token.balanceInUSD ? `$${token.balanceInUSD}` : undefined}
                      change24h={
                        token.change
                          ? parseFloat(token.change.replace('%', '').replace('+', ''))
                          : 5.2
                      }
                      isVerified={token.isVerified || true}
                      onPress={() => handleTokenPress(token)}
                    />
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
                  refreshText={t('buttons.refasresh')}
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
