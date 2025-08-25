import { bridge, navigation } from '@onflow/frw-context';
import { useSendStore } from '@onflow/frw-stores';
import { type WalletAccount } from '@onflow/frw-types';
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
  type TokenModel,
  type TransactionFormData,
  Text,
  Separator,
  XStack,
  Stack,
} from '@onflow/frw-ui';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

export interface SendTokensScreenProps {
  // Configuration props only - no data props
  backgroundColor?: string;
  contentPadding?: number;
  usdFee?: string;
  // Enhanced component props
  isAccountIncompatible?: boolean;
  isBalanceLoading?: boolean;
  showStorageWarning?: boolean;
  storageWarningMessage?: string;
  showEditButtons?: boolean;
  onEditTokenPress?: () => void;
  onEditAccountPress?: () => void;
  onLearnMorePress?: () => void;
  isFeesFree?: boolean;
  // Optional initial values
  initialToAddress?: string;
  initialTokenSymbol?: string;
}

export const SendTokensScreen: React.FC<SendTokensScreenProps> = (props) => {
  // Use props for configuration only, fetch data from bridge
  const {
    backgroundColor = '$background',
    contentPadding = 20,
    usdFee = '$0.02',
    isAccountIncompatible = false,
    isBalanceLoading = false,
    showStorageWarning = true,
    storageWarningMessage = 'Account balance will fall below the minimum FLOW required for storage after this transaction.',
    showEditButtons = true,
    onEditTokenPress,
    onEditAccountPress,
    onLearnMorePress,
    isFeesFree = false,
    initialToAddress,
    initialTokenSymbol,
  } = props;

  // Internal state - no more props for data
  const [selectedToken, setSelectedToken] = useState<TokenModel | null>(null);
  const [fromAccount, setFromAccount] = useState<WalletAccount | null>(null);
  const [toAccount, setToAccount] = useState<WalletAccount | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isTokenMode, setIsTokenMode] = useState<boolean>(true);
  const [tokens, setTokens] = useState<TokenModel[]>([]);
  const [isTokenSelectorVisible, setIsTokenSelectorVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [transactionFee, setTransactionFee] = useState<string>('~0.001 FLOW');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're running in extension platform
  const isExtension = bridge.getPlatform() === 'extension';

  // Get send store
  const {
    setSelectedToken: setStoreSelectedToken,
    setFromAccount: setStoreFromAccount,
    setToAccount: setStoreToAccount,
    updateFormData,
    executeTransaction,
    isLoading: storeLoading,
  } = useSendStore();

  // Simple initialization without complex bridge calls
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Get current selected account (this is the FROM account - the sender)
        const currentAddress = bridge.getSelectedAddress();
        console.log('🔍 Current address from bridge:', currentAddress);

        if (currentAddress) {
          setFromAccount({
            id: currentAddress,
            address: currentAddress,
            name: 'My Account',
            avatar: '',
            emojiInfo: undefined,
            isActive: true,
          });
        }

        // Get coins data from bridge with retry logic
        let coinsData = null;
        let retryCount = 0;
        const maxRetries = 5;

        while (!coinsData && retryCount < maxRetries) {
          try {
            coinsData = await bridge.getCoins();
            console.log(
              `🪙 Got coins data from bridge (attempt ${retryCount + 1}):`,
              coinsData?.length || 0,
              'tokens'
            );

            if (!coinsData && retryCount < maxRetries - 1) {
              console.log('🔄 Coins data not ready, retrying in 500ms...');
              await new Promise((resolve) => setTimeout(resolve, 500));
              retryCount++;
            } else {
              break;
            }
          } catch (error) {
            console.warn(`Failed to get coins from bridge (attempt ${retryCount + 1}):`, error);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        }

        if (coinsData && Array.isArray(coinsData) && coinsData.length > 0) {
          console.log('🪙 Got coins data from bridge:', coinsData);
          const tokenModels: TokenModel[] = coinsData.map((coin: any) => ({
            name: coin.name || 'Unknown Token',
            symbol: coin.symbol || '',
            balance: coin.balance || '0',
            priceInUSD: coin.price || coin.priceInUSD || '0',
            decimals: coin.decimals || 8,
            logoURI: coin.logoURI || coin.icon || '',
            address: coin.address || '',
            isVerified: coin.isVerified || false,
            // Add required properties for getTokenResourceIdentifier
            identifier: coin.identifier || null,
            contractAddress: coin.contractAddress || coin.address || '',
            contractName: coin.contractName || coin.name || '',
          }));
          setTokens(tokenModels);

          // Set initial token based on prop or default to FLOW
          let defaultToken: TokenModel | undefined;
          if (initialTokenSymbol) {
            defaultToken = tokenModels.find(
              (token) => token.symbol.toLowerCase() === initialTokenSymbol.toLowerCase()
            );
          }
          if (!defaultToken) {
            const flowToken = tokenModels.find((token) => token.symbol.toLowerCase() === 'flow');
            defaultToken = flowToken || tokenModels[0];
          }
          if (defaultToken) {
            setSelectedToken(defaultToken);
          }
        } else {
          console.log('🪙 No coins data found');
          setTokens([]);
          setSelectedToken(null);
          setError('No tokens available. Please ensure your wallet has tokens to send.');
        }

        // Set initial recipient if provided
        if (initialToAddress) {
          setToAccount({
            address: initialToAddress,
            name: 'Recipient',
            balance: '0',
            avatar: '',
            emoji: '',
            emojiInfo: null,
          });
        }

        setError(null);
      } catch (err) {
        console.error('Failed to initialize SendTokensScreen data:', err);
        setError('Failed to load wallet data. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    // Call async initialization
    initializeData();
  }, [initialToAddress, initialTokenSymbol]);

  // Handler functions - now internal to the screen
  const handleTokenSelect = useCallback((token: TokenModel) => {
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
      setAmount(selectedToken.balance);
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

  const handleTransactionConfirm = useCallback(async () => {
    try {
      if (!selectedToken || !fromAccount || !toAccount || !amount) {
        throw new Error('Missing transaction data');
      }

      console.log('🔄 Starting transaction...', {
        token: selectedToken.symbol,
        from: fromAccount.address,
        to: toAccount.address,
        amount,
      });

      // Set transaction data in the store
      const parentAddress = await bridge.getParentAddress();
      console.log('🔍 Parent address from bridge:', parentAddress);

      setStoreSelectedToken(selectedToken);
      if (parentAddress) {
        setStoreFromAccount({
          ...fromAccount,
          address: parentAddress, // Override with parent address
        });
      } else {
        setStoreFromAccount(fromAccount);
      }
      setStoreToAccount(toAccount);
      updateFormData({ tokenAmount: amount });

      // Execute transaction using the store
      console.log('🚀 Executing transaction using store executeTransaction...');
      const result = await executeTransaction();
      console.log('✅ Transaction result:', result);

      return result;
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      // Keep modal open and show error - the modal should handle displaying the error
      throw error;
    }
  }, [
    selectedToken,
    fromAccount,
    toAccount,
    amount,
    setStoreSelectedToken,
    setStoreFromAccount,
    setStoreToAccount,
    updateFormData,
    executeTransaction,
  ]);

  // Calculate if send button should be disabled
  const isSendDisabled = useMemo(() => {
    return !selectedToken || !fromAccount || !toAccount || parseFloat(amount || '0') <= 0;
  }, [selectedToken, fromAccount, toAccount, amount]);

  // Create form data for transaction confirmation
  const formData: TransactionFormData = useMemo(
    () => ({
      tokenAmount: amount,
      fiatAmount: selectedToken?.priceInUSD
        ? (parseFloat(amount || '0') * parseFloat(selectedToken.priceInUSD)).toFixed(2)
        : '0.00',
      isTokenMode,
      transactionFee: transactionFee,
    }),
    [amount, selectedToken?.priceInUSD, isTokenMode, transactionFee]
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
          <Text color="$red10">{error}</Text>
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

            {/* Token Amount Input Section */}
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
          transactionType="tokens"
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
