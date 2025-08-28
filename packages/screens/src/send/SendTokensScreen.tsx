import { bridge, navigation } from '@onflow/frw-context';
import { useSendStore, useTokenStore } from '@onflow/frw-stores';
import {
  type NFTModel,
  type CollectionModel,
  type TokenModel,
} from '@onflow/frw-types';
import {
  BackgroundWrapper,
  YStack,
  View,
  TokenAmountInput,
  TokenSelectorModal,
  TransactionConfirmationModal,
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
  Stack,
  // NFT-related components
  MultipleNFTsPreview,
  SendSectionHeader,
} from '@onflow/frw-ui';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

export const SendTokensScreen = (props) => {
  // Use props for configuration only, fetch data from bridge
  // Get router values from bridge
  // Check if we're running in extension platform
  const isExtension = bridge.getPlatform() === 'extension';

  // Get send store
  const {
    setSelectedToken,
    setSelectedNFTs,
    setTransactionType,
    transactionType,
    selectedNFTs,
    selectedToken,
    fromAccount,
    setFromAccount,
    toAccount,
    updateFormData,
    executeTransaction,
    isLoading: storeLoading,
  } = useSendStore();
  // Get token store
  const { getTokensForAddress, fetchTokens } = useTokenStore();

  // Add a ref to track if we've already initialized
  const hasInitialized = React.useRef(false);
  const network = bridge.getNetwork() || 'mainnet';

  // Default values for internal use
  const backgroundColor = '$background';
  const contentPadding = 20;
  const usdFee = '$0.02';
  const isAccountIncompatible = false;
  const isBalanceLoading = false;
  const showStorageWarning = true;
  const storageWarningMessage =
    'Account balance will fall below the minimum FLOW required for storage after this transaction.';
  const showEditButtons = true;
  const isFeesFree = false;

  // Internal callback handlers
  const onEditAccountPress = () => {
    // Handle edit account press internally
  };
  const onLearnMorePress = () => {
    // Handle learn more press internally
  };

  // Internal state - no more props for data
  const [amount, setAmount] = useState<string>('');
  const [isTokenMode, setIsTokenMode] = useState<boolean>(true);
  const [tokens, setTokens] = useState<TokenModel[]>([]);
  const [isTokenSelectorVisible, setIsTokenSelectorVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [transactionFee, setTransactionFee] = useState<string>('~0.001 FLOW');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nftCollections, setNftCollections] = useState<CollectionModel[]>([]);
  const [availableNFTs, setAvailableNFTs] = useState<NFTModel[]>([]);
  const [isNFTSelectorVisible, setIsNFTSelectorVisible] = useState(false);
  const [isCollectionSelectorVisible, setIsCollectionSelectorVisible] = useState(false);
  // Simple initialization without complex bridge calls
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) {
      return;
    }

    const initializeData = async () => {
      try {
        hasInitialized.current = true;
        setLoading(true);

        // Get current selected account (this is the FROM account - the sender)
        const selectedAccount = await bridge.getSelectedAccount();

        if (selectedAccount) {
          setFromAccount({
            id: selectedAccount.address,
            address: selectedAccount.address,
            name: selectedAccount.name,
            avatar: selectedAccount.avatar || '',
            emojiInfo: selectedAccount.emojiInfo,
            parentAddress: selectedAccount.parentAddress,
            isActive: true,
            type: selectedAccount.type,
          });

          // Get tokens from tokenStore for the selected account
          // Check if we already have cached data first
          const cachedTokens = getTokensForAddress(selectedAccount.address, network);

          if (!cachedTokens || cachedTokens.length === 0) {
            await fetchTokens(selectedAccount.address, network, false);
          }

          // Get tokens from cache (either existing or newly fetched)
          const coinsData = getTokensForAddress(selectedAccount.address, network);

          if (coinsData && coinsData.length > 0) {
            setTokens(coinsData);
          } else {
            setTokens([]);
            setSelectedToken(null);
            setError('No tokens available. Please ensure your wallet has tokens to send.');
          }
        }

        setError(null);
      } catch (err) {
        setError('Failed to load wallet data. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    // Call async initialization
    initializeData();
  }, []);

  // Handler functions - now internal to the screen
  const handleTokenSelect = useCallback((token: any) => {
    setSelectedToken(token);
    setIsTokenSelectorVisible(false);
  }, []);

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

  const handleNFTRemove = useCallback((nftId: string) => {
    setSelectedNFTs((prev) => prev.filter((nft) => nft.id !== nftId));
  }, []);

  const handleTransactionConfirm = useCallback(async () => {
    if (transactionType === 'tokens') {
      if (!selectedToken || !fromAccount || !toAccount || !amount) {
        throw new Error('Missing transaction data');
      }

      setSelectedToken(selectedToken);
      setSelectedNFTs([]);
      setTransactionType('tokens');
      updateFormData({ tokenAmount: amount });
    } else {
      if (!selectedNFTs.length || !fromAccount || !toAccount) {
        throw new Error('Missing NFT transaction data');
      }
      setSelectedToken(null);
      setSelectedNFTs(selectedNFTs);
      setTransactionType(transactionType);
    }

    const result = await executeTransaction();
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

  // Show loading state
  if (loading) {
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
          <Text color="$red500">{error}</Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper backgroundColor={backgroundColor}>
      {isExtension && (
        <ExtensionHeader
          title="Send to"
          help={true}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}
      <YStack flex={1} p="$4">
        <YStack gap={0}>
          <YStack mx="$2" rounded={16} background="$background4" mb="$1">
            {/* From Account Section */}
            {fromAccount && (
              <AccountCard
                account={fromAccount}
                title="From Account"
                isLoading={isBalanceLoading}
              />
            )}
            <Separator mx="$4" my={-1} borderColor="$textTertiary" />
            {transactionType === 'tokens' ? (
              /* Token Amount Input Section */
              <YStack gap="$3">
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
                <YStack bg="rgba(255, 255, 255, 0.1)" rounded="$4" p="$4" gap="$3">
                  {/* Section Header */}
                  <SendSectionHeader
                    title={`Send NFTs (${selectedNFTs.length})`}
                    onEditPress={() => { }}
                    showEditButton={showEditButtons}
                    editButtonText="Edit"
                  />

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
          <XStack position="relative" height={0}>
            <XStack width="100%" position="absolute" t={-35} justify="center">
              <SendArrowDivider variant="text" />
            </XStack>
          </XStack>

          {/* To Account Section */}
          <Stack px="$2">
            {toAccount && (
              <ToAccountSection
                account={toAccount}
                isAccountIncompatible={isAccountIncompatible}
                onEditPress={onEditAccountPress}
                onLearnMorePress={onLearnMorePress}
                showEditButton={showEditButtons}
                title="To account"
              />
            )}
          </Stack>

          {/* Transaction Fee Section */}
          <TransactionFeeSection
            flowFee={transactionFee}
            usdFee={usdFee}
            isFree={isFeesFree}
            showCovered={true}
            title="Transaction Fee"
            backgroundColor="transparent"
            borderRadius={16}
            contentPadding={16}
          />
          <Stack p="$4">
            {showStorageWarning && (
              <StorageWarning
                message={storageWarningMessage}
                showIcon={true}
                title="Storage warning"
                visible={true}
              />
            )}
          </Stack>
        </YStack>

        {/* Send Button */}
        <View p={contentPadding} pt="$2">
          <YStack
            bg={isSendDisabled ? 'rgba(255, 255, 255, 0.2)' : '#007AFF'}
            rounded="$4"
            p="$4"
            items="center"
            opacity={isSendDisabled ? 0.5 : 1}
            pressStyle={{ opacity: 0.8 }}
            onPress={isSendDisabled ? undefined : handleSendPress}
            cursor={isSendDisabled ? 'not-allowed' : 'pointer'}
          >
            <Text fontSize="$4" fontWeight="600" color="$white">
              Send Tokens
            </Text>
          </YStack>
        </View>

        {/* Token Selector Modal */}
        <TokenSelectorModal
          visible={isTokenSelectorVisible}
          selectedToken={selectedToken}
          tokens={tokens}
          onTokenSelect={handleTokenSelect}
          onClose={handleTokenSelectorClose}
        />

        {/* Transaction Confirmation Modal */}
        <TransactionConfirmationModal
          visible={isConfirmationVisible}
          transactionType={transactionType}
          selectedToken={selectedToken}
          fromAccount={fromAccount}
          toAccount={toAccount}
          formData={formData}
          onConfirm={handleTransactionConfirm}
          onClose={handleConfirmationClose}
        />
      </YStack>
    </BackgroundWrapper>
  );
};
