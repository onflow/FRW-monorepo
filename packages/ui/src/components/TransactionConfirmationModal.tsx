import { X, ArrowRight } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, Button, View } from 'tamagui';

import { type TokenModel } from './TokenSelectorModal';
import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';

export interface WalletAccount {
  address: string;
  name?: string;
  avatar?: string;
  type?: string;
}

export interface TransactionFormData {
  tokenAmount: string;
  fiatAmount: string;
  isTokenMode: boolean;
  transactionFee?: string;
}

export interface TransactionConfirmationModalProps {
  visible: boolean;
  transactionType: 'tokens' | 'nfts';
  selectedToken?: TokenModel | null;
  fromAccount?: WalletAccount | null;
  toAccount?: WalletAccount | null;
  formData: TransactionFormData;
  onConfirm?: () => Promise<void>;
  onClose: () => void;
  title?: string;
  backgroundColor?: string;
  isLoading?: boolean;
}

export const TransactionConfirmationModal: React.FC<TransactionConfirmationModalProps> = ({
  visible,
  transactionType,
  selectedToken,
  fromAccount,
  toAccount,
  formData,
  onConfirm,
  onClose,
  title = 'Confirm Transaction',
  backgroundColor = '$background',
  isLoading = false,
}) => {
  // Handle transaction confirmation
  const handleConfirm = async () => {
    try {
      await onConfirm?.();
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  if (!visible) return null;

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="$backgroundTransparent"
      items="center"
      justify="center"
      zIndex={1000}
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
    >
      <YStack
        bg={backgroundColor}
        rounded="$4"
        p="$4"
        minW={360}
        maxW="90%"
        shadowColor="$shadowColor"
        shadowOpacity={0.25}
        shadowRadius="$4"
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <XStack items="center" justify="space-between" mb="$4">
          <Text fontSize="$5" fontWeight="600" color="$color">
            {title}
          </Text>
          <Button
            size="$2"
            variant="ghost"
            circular
            onPress={onClose}
            icon={<X size={20} />}
            disabled={isLoading}
          />
        </XStack>

        {/* Transaction Details */}
        <YStack gap="$4" mb="$4">
          {/* Accounts Row */}
          <XStack items="center" gap="$3">
            {/* From Account */}
            <YStack flex={1} gap="$2" bg="$gray2" rounded="$3" p="$3">
              <Text fontSize="$2" color="$gray11" fontWeight="600">
                FROM
              </Text>
              <XStack items="center" gap="$2">
                <Avatar
                  src={fromAccount?.avatar}
                  fallback={fromAccount?.name?.charAt(0) || 'A'}
                  size={24}
                />
                <YStack flex={1}>
                  <Text fontSize="$3" fontWeight="500" color="$color" numberOfLines={1}>
                    {fromAccount?.name || 'Unknown'}
                  </Text>
                  <Text fontSize="$2" color="$gray11" numberOfLines={1}>
                    {fromAccount?.address
                      ? `${fromAccount.address.slice(0, 6)}...${fromAccount.address.slice(-4)}`
                      : ''}
                  </Text>
                </YStack>
              </XStack>
            </YStack>

            {/* Arrow */}
            <ArrowRight size={20} color="$gray10" />

            {/* To Account */}
            <YStack flex={1} gap="$2" bg="$gray2" rounded="$3" p="$3">
              <Text fontSize="$2" color="$gray11" fontWeight="600">
                TO
              </Text>
              <XStack items="center" gap="$2">
                <Avatar
                  src={toAccount?.avatar}
                  fallback={toAccount?.name?.charAt(0) || 'A'}
                  size={24}
                />
                <YStack flex={1}>
                  <Text fontSize="$3" fontWeight="500" color="$color" numberOfLines={1}>
                    {toAccount?.name || 'Unknown'}
                  </Text>
                  <Text fontSize="$2" color="$gray11" numberOfLines={1}>
                    {toAccount?.address
                      ? `${toAccount.address.slice(0, 6)}...${toAccount.address.slice(-4)}`
                      : ''}
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </XStack>

          {/* Transaction Amount */}
          {transactionType === 'tokens' && selectedToken && (
            <YStack bg="$gray2" rounded="$3" p="$3" gap="$2">
              <Text fontSize="$2" color="$gray11" fontWeight="600">
                AMOUNT
              </Text>
              <XStack items="center" gap="$3">
                <Avatar
                  src={selectedToken.logoURI}
                  fallback={selectedToken.symbol.charAt(0)}
                  size={32}
                />
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600" color="$color">
                    {formData.tokenAmount} {selectedToken.symbol}
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    ≈ ${formData.fiatAmount} USD
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          )}

          {/* Transaction Fee */}
          <XStack items="center" justify="space-between" py="$2">
            <Text fontSize="$3" color="$gray11">
              Network Fee
            </Text>
            <Text fontSize="$3" fontWeight="500" color="$color">
              {formData.transactionFee || '~0.001 FLOW'}
            </Text>
          </XStack>

          {/* Total */}
          {transactionType === 'tokens' && <View height={1} bg="$gray6" />}
        </YStack>

        {/* Action Buttons */}
        <XStack gap="$3">
          <Button flex={1} variant="secondary" onPress={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            flex={1}
            onPress={handleConfirm}
            disabled={isLoading}
            opacity={isLoading ? 0.7 : 1}
          >
            {isLoading ? 'Confirming...' : 'Confirm'}
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
};
