import {
  YStack,
  ScrollView,
  View,
  TokenAmountInput,
  TokenSelectorModal,
  TransactionConfirmationModal,
  type TokenModel,
  type WalletAccount,
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
    <YStack flex={1} bg={backgroundColor}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack p={contentPadding} gap="$4">
          {/* From Account Section */}
          {fromAccount && (
            <YStack bg="$gray1" rounded="$4" p="$4">
              <Text fontSize="$3" fontWeight="600" color="$gray11" mb="$2">
                From Account
              </Text>
              <Text fontSize="$4" fontWeight="600" color="$color">
                {fromAccount.name || fromAccount.address}
              </Text>
              {fromAccount.name && (
                <Text fontSize="$3" color="$gray11" mt="$1">
                  {fromAccount.address}
                </Text>
              )}
            </YStack>
          )}

          {/* Token Amount Input Section */}
          <YStack bg="$gray1" rounded="$4" p="$4">
            <TokenAmountInput
              selectedToken={selectedToken}
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

          {/* To Account Section */}
          {toAccount && (
            <YStack bg="$gray1" rounded="$4" p="$4">
              <Text fontSize="$3" fontWeight="600" color="$gray11" mb="$2">
                To Account
              </Text>
              <Text fontSize="$4" fontWeight="600" color="$color">
                {toAccount.name || toAccount.address}
              </Text>
              {toAccount.name && (
                <Text fontSize="$3" color="$gray11" mt="$1">
                  {toAccount.address}
                </Text>
              )}
            </YStack>
          )}

          {/* Transaction Fee Section */}
          <YStack bg="$gray1" rounded="$4" p="$4">
            <Text fontSize="$3" fontWeight="600" color="$gray11" mb="$2">
              Network Fee
            </Text>
            <Text fontSize="$4" color="$color">
              {transactionFee || '~0.001 FLOW'}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Send Button */}
      <View p={contentPadding} pt="$2">
        <YStack
          bg={isSendDisabled ? '$gray8' : '$blue9'}
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
        onTokenSelect={onTokenSelect}
        onClose={onTokenSelectorClose}
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
        onClose={onConfirmationClose}
      />
    </YStack>
  );
};
