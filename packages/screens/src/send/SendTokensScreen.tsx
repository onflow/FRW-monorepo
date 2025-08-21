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
  StorageWarning,
  type TokenModel,
  type TransactionFormData,
  Text,
  Separator,
  Stack,
  ScrollView,
} from '@onflow/frw-ui';
import React from 'react';

export interface SendTokensScreenProps {
  // Core data
  selectedToken: TokenModel | null;
  fromAccount: WalletAccount | null;
  toAccount: WalletAccount | null;
  amount: string;
  tokens?: TokenModel[];

  // Input configuration
  isTokenMode?: boolean;

  // Modal states
  isTokenSelectorVisible?: boolean;
  isConfirmationVisible?: boolean;

  // Event handlers
  onTokenSelect?: (token: TokenModel) => void;
  onAmountChange?: (amount: string) => void;
  onToggleInputMode?: () => void;
  onSendPress?: () => void;
  onTokenSelectorOpen?: () => void;
  onTokenSelectorClose?: () => void;
  onConfirmationOpen?: () => void;
  onConfirmationClose?: () => void;
  onTransactionConfirm?: () => Promise<void>;
  onEditAccountPress?: () => void;
  onLearnMorePress?: () => void;

  // Styling
  contentPadding?: number;

  // Transaction details
  transactionFee?: string;
  usdFee?: string;
  isFeesFree?: boolean;

  // UI states
  isAccountIncompatible?: boolean;
  isBalanceLoading?: boolean;
  showStorageWarning?: boolean;
  storageWarningMessage?: string;
  showEditButtons?: boolean;
}

export const SendTokensScreen: React.FC<SendTokensScreenProps> = ({
  // Core data
  selectedToken,
  fromAccount,
  toAccount,
  amount,
  isTokenMode = true,
  tokens = [],

  // Modal states
  isTokenSelectorVisible = false,
  isConfirmationVisible = false,

  // Event handlers
  onTokenSelect,
  onAmountChange,
  onToggleInputMode,
  onSendPress,
  onTokenSelectorOpen,
  onTokenSelectorClose,
  onConfirmationClose,
  onTransactionConfirm,

  // Styling
  contentPadding = 20,

  // Transaction details
  transactionFee,
  usdFee = '$0.02',
  isFeesFree = false,

  // UI states
  isAccountIncompatible = false,
  isBalanceLoading = false,
  showStorageWarning = true,
  storageWarningMessage = 'Account balance will fall below the minimum FLOW required for storage after this transaction.',
  showEditButtons = true,
  onEditAccountPress,
  onLearnMorePress,
}) => {
  // Helper functions
  const handleTokenSelect =
    onTokenSelect ||
    ((_token: TokenModel): void => {
      /* no-op */
    });
  const handleTokenSelectorClose =
    onTokenSelectorClose ||
    ((): void => {
      /* no-op */
    });
  const handleConfirmationClose =
    onConfirmationClose ||
    ((): void => {
      /* no-op */
    });

  // Computed values
  const isSendDisabled =
    !selectedToken || !fromAccount || !toAccount || parseFloat(amount || '0') <= 0;

  const formData: TransactionFormData = {
    tokenAmount: amount,
    fiatAmount: selectedToken?.priceInUSD
      ? (parseFloat(amount || '0') * parseFloat(selectedToken.priceInUSD)).toFixed(2)
      : '0.00',
    isTokenMode,
    transactionFee: transactionFee || '~0.001 FLOW',
  };

  const tokenInputData = selectedToken
    ? {
        symbol: selectedToken.symbol,
        name: selectedToken.name,
        logo: selectedToken.logoURI,
        logoURI: selectedToken.logoURI,
        balance: selectedToken.balance?.toString(),
        price: selectedToken.priceInUSD ? parseFloat(selectedToken.priceInUSD) : undefined,
        isVerified: selectedToken.isVerified,
      }
    : undefined;

  return (
    <BackgroundWrapper>
      <YStack flex={1}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack p={contentPadding}>
            {/* Main Transaction Card */}
            <YStack bg="rgb(49, 49, 49)" rounded="$5" overflow="hidden">
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
                  onAmountChange={onAmountChange}
                  isTokenMode={isTokenMode}
                  onToggleInputMode={onToggleInputMode}
                  onTokenSelectorPress={onTokenSelectorOpen}
                  placeholder="0.00"
                  showBalance={true}
                  showConverter={true}
                  disabled={false}
                />
              </YStack>
            </YStack>

            {/* To Account Section */}
            <Stack>
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
              flowFee={transactionFee || '0.001 FLOW'}
              usdFee={usdFee}
              isFree={isFeesFree}
              showCovered={true}
              title="Transaction Fee"
              backgroundColor="black"
              borderRadius={16}
              contentPadding={16}
            />
          </YStack>

          {/* Storage Warning */}
          {showStorageWarning && (
            <StorageWarning
              message={storageWarningMessage}
              showIcon={true}
              title="Storage warning"
              visible={true}
            />
          )}
        </ScrollView>

        {/* Send Button */}
        <View p={contentPadding} pt="$2">
          <YStack
            bg={isSendDisabled ? 'rgba(255, 255, 255, 0.2)' : 'white'}
            rounded="$4"
            p="$1"
            items="center"
            opacity={isSendDisabled ? 0.5 : 1}
            pressStyle={{ opacity: 0.8 }}
            onPress={isSendDisabled ? undefined : onSendPress}
            cursor={isSendDisabled ? 'not-allowed' : 'pointer'}
          >
            <Text fontSize="$4" fontWeight="600" color={isSendDisabled ? '$white' : 'black'}>
              Send Tokens
            </Text>
          </YStack>
        </View>

        {/* Modals */}
        <TokenSelectorModal
          visible={isTokenSelectorVisible}
          selectedToken={selectedToken}
          tokens={tokens}
          onTokenSelect={handleTokenSelect}
          onClose={handleTokenSelectorClose}
        />

        <TransactionConfirmationModal
          visible={isConfirmationVisible}
          transactionType="tokens"
          selectedToken={selectedToken}
          fromAccount={fromAccount}
          toAccount={toAccount}
          formData={formData}
          onConfirm={onTransactionConfirm}
          onClose={handleConfirmationClose}
        />
      </YStack>
    </BackgroundWrapper>
  );
};
