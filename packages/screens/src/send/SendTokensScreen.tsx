import { type WalletAccount } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  YStack,
  ScrollView,
  View,
  TokenAmountInput,
  TokenSelectorModal,
  TransactionConfirmationModal,
  AccountCard,
  ToAccountSection,
  TransactionFeeSection,
  SendArrowDivider,
  SendSectionHeader,
  StorageWarning,
  type TokenModel,
  type TransactionFormData,
  Text,
} from '@onflow/frw-ui';
import React from 'react';

export interface SendTokensScreenProps {
  selectedToken: TokenModel | null;
  fromAccount: WalletAccount | null;
  toAccount: WalletAccount | null;
  amount: string;
  isTokenMode?: boolean;
  tokens?: TokenModel[];
  isTokenSelectorVisible?: boolean;
  isConfirmationVisible?: boolean;
  onTokenSelect?: (token: TokenModel) => void;
  onAmountChange?: (amount: string) => void;
  onToggleInputMode?: () => void;
  onMaxPress?: () => void;
  onSendPress?: () => void;
  onTokenSelectorOpen?: () => void;
  onTokenSelectorClose?: () => void;
  onConfirmationOpen?: () => void;
  onConfirmationClose?: () => void;
  onTransactionConfirm?: () => Promise<void>;
  backgroundColor?: string;
  contentPadding?: number;
  transactionFee?: string;
  usdFee?: string;
  // New props for enhanced components
  isAccountIncompatible?: boolean;
  isBalanceLoading?: boolean;
  showStorageWarning?: boolean;
  storageWarningMessage?: string;
  showEditButtons?: boolean;
  onEditTokenPress?: () => void;
  onEditAccountPress?: () => void;
  onLearnMorePress?: () => void;
  isFeesFree?: boolean;
}

export const SendTokensScreen: React.FC<SendTokensScreenProps> = ({
  selectedToken,
  fromAccount,
  toAccount,
  amount,
  isTokenMode = true,
  tokens = [],
  isTokenSelectorVisible = false,
  isConfirmationVisible = false,
  onTokenSelect,
  onAmountChange,
  onToggleInputMode,
  onMaxPress,
  onSendPress,
  onTokenSelectorOpen,
  onTokenSelectorClose,
  onConfirmationOpen,
  onConfirmationClose,
  onTransactionConfirm,
  backgroundColor = '$background',
  contentPadding = 20,
  transactionFee,
  usdFee = '$0.02',
  // New props
  isAccountIncompatible = false,
  isBalanceLoading = false,
  showStorageWarning = false,
  storageWarningMessage = 'Account balance will fall below the minimum FLOW required for storage after this transaction.',
  showEditButtons = true,
  onEditTokenPress,
  onEditAccountPress,
  onLearnMorePress,
  isFeesFree = false,
}) => {
  // Calculate if send button should be disabled
  const isSendDisabled =
    !selectedToken || !fromAccount || !toAccount || parseFloat(amount || '0') <= 0;

  // Create form data for transaction confirmation
  const formData: TransactionFormData = {
    tokenAmount: amount,
    fiatAmount: selectedToken?.priceInUSD
      ? (parseFloat(amount || '0') * parseFloat(selectedToken.priceInUSD)).toFixed(2)
      : '0.00',
    isTokenMode,
    transactionFee: transactionFee || '~0.001 FLOW',
  };

  return (
    <BackgroundWrapper backgroundColor={backgroundColor}>
      <YStack flex={1}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack p={contentPadding} gap="$4">
            {/* From Account Section */}
            {fromAccount && (
              <AccountCard
                account={fromAccount}
                title="From Account"
                isLoading={isBalanceLoading}
              />
            )}

            {/* Token Amount Input Section */}
            <YStack bg="rgba(255, 255, 255, 0.1)" rounded="$4" p="$4" gap="$3">
              <SendSectionHeader
                title="Send Tokens"
                onEditPress={onEditTokenPress}
                showEditButton={showEditButtons && !!onEditTokenPress}
                editButtonText="Change"
              />
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
                onMaxPress={onMaxPress}
                placeholder="0.00"
                showBalance={true}
                showConverter={true}
                disabled={false}
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

            {/* Arrow Down Indicator */}
            <SendArrowDivider variant="text" />

            {/* To Account Section */}
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

            {/* Transaction Fee Section */}
            <TransactionFeeSection
              flowFee={transactionFee || '0.001 FLOW'}
              usdFee={usdFee}
              isFree={isFeesFree}
              showCovered={true}
              title="Transaction Fee"
              backgroundColor="rgba(255, 255, 255, 0.1)"
              borderRadius={16}
              contentPadding={16}
            />
          </YStack>
        </ScrollView>

        {/* Send Button */}
        <View p={contentPadding} pt="$2">
          <YStack
            bg={isSendDisabled ? 'rgba(255, 255, 255, 0.2)' : '#007AFF'}
            rounded="$4"
            p="$4"
            items="center"
            opacity={isSendDisabled ? 0.5 : 1}
            pressStyle={{ opacity: 0.8 }}
            onPress={isSendDisabled ? undefined : onSendPress}
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
          onTokenSelect={onTokenSelect || (() => {})}
          onClose={onTokenSelectorClose || (() => {})}
        />

        {/* Transaction Confirmation Modal */}
        <TransactionConfirmationModal
          visible={isConfirmationVisible}
          transactionType="tokens"
          selectedToken={selectedToken}
          fromAccount={fromAccount}
          toAccount={toAccount}
          formData={formData}
          onConfirm={onTransactionConfirm}
          onClose={onConfirmationClose || (() => {})}
        />
      </YStack>
    </BackgroundWrapper>
  );
};
