import { bridge, navigation } from '@onflow/frw-context';
import {
  useSendStore,
  useTokenStore,
  useWalletStore,
  walletSelectors,
  useAddressBookStore,
} from '@onflow/frw-stores';
import {
  BackgroundWrapper,
  YStack,
  TokenAmountInput,
  TokenSelectorModal,
  TransactionConfirmationModal,
  ConfirmationDrawer,
  AccountCard,
  ToAccountSection,
  TransactionFeeSection,
  SendArrowDivider,
  StorageWarning,
  ExtensionHeader,
  type TransactionFormData,
  Text,
  Separator,
  XStack,
  View,
  // NFT-related components
  MultipleNFTsPreview,
} from '@onflow/frw-ui';
import { logger, transformAccountForCard, transformAccountForDisplay } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Query-integrated version of SendTokensScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export const SendTokensScreen = (props) => {
  const { t } = useTranslation();
  // Check if we're running in extension platform
  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';
  const [isFreeGasEnabled, setIsFreeGasEnabled] = useState(true);

  // Get send store
  const {
    setSelectedToken,
    setSelectedNFTs,
    setTransactionType,
    transactionType,
    selectedNFTs,
    selectedToken,
    fromAccount,
    toAccount,
    updateFormData,
    executeTransaction,
    isLoading: storeLoading,
    setCurrentStep,
  } = useSendStore();

  // Get token store and wallet store
  const { getTokensForAddress, fetchTokens } = useTokenStore();
  const accounts = useWalletStore(walletSelectors.getAllAccounts);
  const loadAccountsFromBridge = useWalletStore((state) => state.loadAccountsFromBridge);
  const isLoadingWallet = useWalletStore((state) => state.isLoading);

  // Get address book store for setting recent contacts
  const addressBookStore = useAddressBookStore();

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-tokens');
  }, [setCurrentStep]);

  // Check free gas status
  useEffect(() => {
    const checkFreeGasStatus = async () => {
      try {
        const isEnabled = await bridge.isFreeGasEnabled?.();
        setIsFreeGasEnabled(isEnabled ?? true);
      } catch (error) {
        console.error('Failed to check free gas status:', error);
        // Default to enabled if we can't determine the status
        setIsFreeGasEnabled(true);
      }
    };

    checkFreeGasStatus();
  }, []);

  // Initialize wallet accounts on mount (only if not already loaded)
  useEffect(() => {
    if (accounts.length === 0 && !isLoadingWallet) {
      loadAccountsFromBridge();
    }
  }, [loadAccountsFromBridge, accounts.length, isLoadingWallet]);

  // Query for selected account with automatic caching
  const {
    data: selectedAccount,
    isLoading: isLoadingAccount,
    error: accountError,
  } = useQuery({
    queryKey: ['selectedAccount'],
    queryFn: () => bridge.getSelectedAccount(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  // Query for tokens with automatic caching
  const {
    data: tokens = [],
    isLoading: isLoadingTokens,
    error: tokensError,
  } = useQuery({
    queryKey: ['tokens', selectedAccount?.address, network],
    queryFn: async () => {
      if (!selectedAccount?.address) return [];

      // Check if we already have cached data first
      const cachedTokens = getTokensForAddress(selectedAccount.address, network);

      if (!cachedTokens || cachedTokens.length === 0) {
        await fetchTokens(selectedAccount.address, network, false);
      }

      // Get tokens from cache (either existing or newly fetched)
      const coinsData = getTokensForAddress(selectedAccount.address, network);
      return coinsData || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!selectedAccount?.address,
  });

  // Theme-aware styling to match Figma design
  const backgroundColor = '$bgDrawer'; // Main background (surfaceDarkDrawer in dark mode)
  const cardBackgroundColor = '$light10'; // rgba(255, 255, 255, 0.1) from theme
  const contentPadding = 16;
  const usdFee = '$0.02';
  const isAccountIncompatible = false;
  const isBalanceLoading = false;
  const showStorageWarning = true;
  const storageWarningMessage =
    'Account balance will fall below the minimum FLOW required for storage after this transaction.';
  const showEditButtons = true;

  // Internal callback handlers
  const onEditAccountPress = () => {
    // Navigate back to SendTo screen to select a different recipient
    navigation.goBack();
  };
  const onLearnMorePress = () => {
    // Handle learn more press internally
  };

  // Internal state - no more props for data
  const [amount, setAmount] = useState<string>('');
  const [isTokenMode, setIsTokenMode] = useState<boolean>(true);
  const [isTokenSelectorVisible, setIsTokenSelectorVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [transactionFee, setTransactionFee] = useState<string>('~0.001 FLOW');

  // Handler functions - now internal to the screen
  const handleTokenSelect = useCallback(
    (token: any) => {
      setSelectedToken(token);
      setIsTokenSelectorVisible(false);
    },
    [setSelectedToken]
  );

  const handleAmountChange = useCallback((newAmount: string) => {
    setAmount(newAmount);
  }, []);

  const handleToggleInputMode = useCallback(() => {
    setIsTokenMode((prev) => !prev);
  }, []);

  const handleMaxPress = useCallback(() => {
    if (selectedToken?.balance) {
      setAmount(selectedToken.balance.toString());
    }
  }, [selectedToken]);

  const handleSendPress = useCallback(() => {
    setIsConfirmationVisible(true);
  }, []);

  const handleTokenSelectorOpen = useCallback(() => {
    setIsTokenSelectorVisible(true);
  }, []);

  const handleTokenSelectorClose = useCallback(() => {
    setIsTokenSelectorVisible(false);
  }, []);

  const handleConfirmationOpen = useCallback(() => {
    setIsConfirmationVisible(true);
  }, []);

  const handleConfirmationClose = useCallback(() => {
    setIsConfirmationVisible(false);
  }, []);

  const handleNFTRemove = useCallback(
    (nftId: string) => {
      const oldSelectedNFTs = selectedNFTs;
      // Only remove if there's more than 1 NFT selected
      if (oldSelectedNFTs.length > 1) {
        const newSelectedNFTs = oldSelectedNFTs.filter((nft) => nft.id !== nftId);
        setSelectedNFTs(newSelectedNFTs);
      }
    },
    [selectedNFTs, setSelectedNFTs]
  );

  const handleTransactionConfirm = useCallback(async () => {
    if (!selectedToken || !fromAccount || !toAccount || !amount) {
      throw new Error('Missing transaction data');
    }

    setSelectedToken(selectedToken);
    setSelectedNFTs([]);
    setTransactionType('tokens');
    updateFormData({ tokenAmount: amount });

    const result = await executeTransaction();

    // Set the recipient as a recent contact after successful transaction
    if (result && toAccount) {
      try {
        // Convert WalletAccount to Contact format
        const recentContact = {
          id: toAccount.id || toAccount.address,
          name: toAccount.name,
          address: toAccount.address,
          avatar: toAccount.avatar || '',
          isFavorite: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await addressBookStore.setRecentContact(recentContact);
      } catch (error) {
        logger.error('❌ [SendTokensScreen] Error setting recent contact:', error);
      }
    }

    return result;
  }, [
    transactionType,
    selectedToken,
    selectedNFTs,
    fromAccount,
    toAccount,
    amount,
    setSelectedToken,
    setSelectedNFTs,
    setTransactionType,
    updateFormData,
    executeTransaction,
    addressBookStore,
  ]);

  // Calculate if send button should be disabled
  const isSendDisabled = useMemo(() => {
    if (transactionType === 'tokens') {
      return !selectedToken || !fromAccount || !toAccount || parseFloat(amount || '0') <= 0;
    } else {
      return !selectedNFTs.length || !fromAccount || !toAccount;
    }
  }, [transactionType, selectedToken, selectedNFTs, fromAccount, toAccount, amount]);

  // Create form data for transaction confirmation
  const formData: TransactionFormData = useMemo(
    () => ({
      tokenAmount: transactionType === 'tokens' ? amount : selectedNFTs.length.toString(),
      fiatAmount:
        transactionType === 'tokens' && selectedToken?.priceInUSD
          ? (parseFloat(amount || '0') * parseFloat(selectedToken.priceInUSD)).toFixed(2)
          : '0.00',
      isTokenMode,
      transactionFee: transactionFee,
    }),
    [
      transactionType,
      amount,
      selectedToken?.priceInUSD,
      selectedNFTs.length,
      isTokenMode,
      transactionFee,
    ]
  );

  // Calculate overall loading state - only show loading screen for critical data
  // Don't block on wallet store loading if we already have accounts
  const isLoading = isLoadingAccount || (isLoadingWallet && accounts.length === 0);

  // Calculate error state
  const error = useMemo(() => {
    if (accountError) return 'Failed to load account data. Please try refreshing.';
    if (tokensError) return 'Failed to load tokens. Please try refreshing.';
    if (tokens.length === 0 && !isLoadingTokens && selectedAccount) {
      return 'No tokens available. Please ensure your wallet has tokens to send.';
    }
    return null;
  }, [accountError, tokensError, tokens.length, isLoadingTokens, selectedAccount]);

  // Show loading state
  if (isLoading) {
    return (
      <BackgroundWrapper backgroundColor={backgroundColor}>
        {isExtension && <ExtensionHeader title="Send to" help={true} />}
        <YStack flex={1} items="center" justify="center" p="$4">
          <Text>Loading wallet data...</Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  // Show error state
  if (error) {
    return (
      <BackgroundWrapper backgroundColor={backgroundColor}>
        {isExtension && <ExtensionHeader title="Send to" help={true} />}
        <YStack flex={1} items="center" justify="center" p="$4">
          <Text color="$error">{error}</Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper backgroundColor={backgroundColor}>
      {isExtension && (
        <ExtensionHeader
          title={t('send.sendTokens.title', 'Sending')}
          help={true}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}

      <YStack flex={1} p={contentPadding}>
        {/* Scrollable Content */}
        <YStack flex={1} gap="$3">
          <YStack bg={cardBackgroundColor} rounded="$4" p="$3" gap="$1">
            {/* From Account Section */}
            {fromAccount ? (
              <View mb="$2">
                <AccountCard
                  account={transformAccountForCard(fromAccount)}
                  title="From Account"
                  isLoading={isBalanceLoading}
                />
              </View>
            ) : (
              <Text>No account data available</Text>
            )}
            <Separator
              mx="$0"
              my="$0"
              mb="$2"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderWidth={0.5}
            />
            {transactionType === 'tokens' ? (
              /* Token Amount Input Section */
              <YStack gap="$4">
                <TokenAmountInput
                  selectedToken={
                    selectedToken
                      ? {
                          symbol: selectedToken.symbol,
                          name: selectedToken.name,
                          logo: selectedToken.logoURI,
                          logoURI: selectedToken.logoURI,
                          balance: selectedToken.balance?.toString(),
                          price: selectedToken.priceInUSD
                            ? parseFloat(selectedToken.priceInUSD)
                            : undefined,
                          isVerified: selectedToken.isVerified,
                        }
                      : undefined
                  }
                  amount={amount}
                  onAmountChange={handleAmountChange}
                  isTokenMode={isTokenMode}
                  onToggleInputMode={handleToggleInputMode}
                  onTokenSelectorPress={handleTokenSelectorOpen}
                  onMaxPress={handleMaxPress}
                  placeholder="0.00"
                  showBalance={true}
                  showConverter={true}
                  disabled={false}
                />
              </YStack>
            ) : (
              /* NFTs Section */
              selectedNFTs &&
              selectedNFTs.length > 0 && (
                <YStack bg={cardBackgroundColor} rounded="$4" pt={16} px={16} pb={24} gap={12}>
                  {/* NFTs Preview */}
                  <MultipleNFTsPreview
                    nfts={selectedNFTs.map((nft) => ({
                      id: nft.id || '',
                      name: nft.name || '',
                      image: nft.thumbnail || '',
                      collection: nft.collectionName || '',
                      collectionContractName: nft.collectionContractName || '',
                      description: nft.description || '',
                    }))}
                    onRemoveNFT={handleNFTRemove}
                    maxVisibleThumbnails={3}
                    expandable={true}
                  />
                </YStack>
              )
            )}
          </YStack>

          {/* Arrow Down Indicator */}
          <XStack position="relative" height={0} mt="$1">
            <XStack width="100%" position="absolute" t={-40} justify="center">
              <SendArrowDivider variant="arrow" size={48} />
            </XStack>
          </XStack>

          {/* To Account Section */}
          {toAccount && (
            <ToAccountSection
              account={toAccount}
              fromAccount={fromAccount || undefined}
              isAccountIncompatible={isAccountIncompatible}
              onEditPress={onEditAccountPress}
              onLearnMorePress={onLearnMorePress}
              showEditButton={showEditButtons}
              title={t('send.toAccount')}
              isLinked={toAccount.type === 'child' || !!toAccount.parentAddress}
            />
          )}

          {/* Transaction Fee and Storage Warning Section */}
          <YStack gap="$3">
            <TransactionFeeSection
              flowFee={transactionFee}
              usdFee={usdFee}
              isFree={isFreeGasEnabled}
              showCovered={true}
              title="Transaction Fee"
              backgroundColor="transparent"
              borderRadius={16}
              contentPadding={0}
            />

            {showStorageWarning && (
              <StorageWarning
                message={storageWarningMessage}
                showIcon={true}
                title="Storage warning"
                visible={true}
              />
            )}
          </YStack>
        </YStack>

        {/* Send Button - Anchored to bottom */}
        <YStack pt="$4">
          <YStack
            width="100%"
            height={52}
            bg={isSendDisabled ? '#6b7280' : '#FFFFFF'}
            rounded={16}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor={isSendDisabled ? '#6b7280' : '#FFFFFF'}
            opacity={isSendDisabled ? 0.7 : 1}
            pressStyle={{ opacity: 0.9 }}
            onPress={isSendDisabled ? undefined : handleSendPress}
            cursor={isSendDisabled ? 'not-allowed' : 'pointer'}
          >
            <Text fontSize="$4" fontWeight="600" color={isSendDisabled ? '#999' : '#000000'}>
              Next
            </Text>
          </YStack>
        </YStack>

        {/* Token Selector Modal */}
        <TokenSelectorModal
          visible={isTokenSelectorVisible}
          selectedToken={selectedToken}
          tokens={tokens}
          onTokenSelect={handleTokenSelect}
          onClose={handleTokenSelectorClose}
          platform="mobile"
          title="Tokens"
          currency={bridge.getCurrency()}
        />

        {/* Transaction Confirmation Modal/Drawer - Platform specific */}
        {isExtension ? (
          <TransactionConfirmationModal
            visible={isConfirmationVisible}
            transactionType={transactionType}
            selectedToken={selectedToken}
            selectedNFTs={selectedNFTs?.map((nft) => ({
              id: nft.id || '',
              name: nft.name || '',
              image: nft.thumbnail || '',
              collection: nft.collectionName || '',
              collectionContractName: nft.collectionContractName || '',
              description: nft.description || '',
            }))}
            fromAccount={transformAccountForDisplay(fromAccount)}
            toAccount={transformAccountForDisplay(toAccount)}
            formData={formData}
            onConfirm={handleTransactionConfirm}
            onClose={handleConfirmationClose}
          />
        ) : (
          <ConfirmationDrawer
            visible={isConfirmationVisible}
            transactionType={transactionType}
            selectedToken={selectedToken}
            selectedNFTs={selectedNFTs?.map((nft) => ({
              id: nft.id || '',
              name: nft.name || '',
              image: nft.thumbnail || '',
              collection: nft.collectionName || '',
              collectionContractName: nft.collectionContractName || '',
              description: nft.description || '',
            }))}
            fromAccount={transformAccountForDisplay(fromAccount)}
            toAccount={transformAccountForDisplay(toAccount)}
            formData={formData}
            onConfirm={handleTransactionConfirm}
            onClose={handleConfirmationClose}
          />
        )}
      </YStack>
    </BackgroundWrapper>
  );
};
