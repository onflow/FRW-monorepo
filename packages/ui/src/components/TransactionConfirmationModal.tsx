import { ChevronRight, ChevronDown, WalletCard, Close } from '@onflow/frw-icons';
import { type WalletAccount } from '@onflow/frw-types';
import React from 'react';
import { YStack, XStack, View } from 'tamagui';

import { type TokenModel } from './TokenSelectorModal';
import { Avatar } from '../foundation/Avatar';
import { Button } from '../foundation/Button';
import { Text } from '../foundation/Text';

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
  isSending?: boolean;
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
  title = 'Summary',
  backgroundColor = '$background',
  isLoading = false,
  isSending = false,
}) => {
  // Internal sending state
  const [internalIsSending, setInternalIsSending] = React.useState(false);

  // Handle transaction confirmation
  const handleConfirm = async () => {
    try {
      setInternalIsSending(true);
      await onConfirm?.();
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setInternalIsSending(false);
    }
  };

  if (!visible) return null;

  return (
    <YStack
      position="absolute"
      bg="$background"
      items="center"
      justify="flex-start"
      paddingHorizontal="$4"
      paddingVertical="$0"
      gap="$4"
      width="100%"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <XStack
        items="center"
        justify="flex-end"
        width="100%"
        height={36}
        paddingHorizontal="$4"
        paddingVertical="$1"
      >
        <Button onPress={onClose} backgroundColor="transparent" borderWidth={0} padding="$2">
          <Close size={32} color="$color" />
        </Button>
      </XStack>

      <View
        height={170}
        width="100%"
        position="relative"
        items="center"
        justify="center"
        marginTop="$4"
      >
        {/* Gradient Background Circle */}
        <View
          position="absolute"
          width={728}
          height={728}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '728.088px',
            opacity: 0.1,
            background:
              'radial-gradient(27.35% 27.35% at 50% 50%, #00EF8B 25.48%, rgba(0, 239, 139, 0.00) 100%)',
          }}
        />

        <View
          width={0}
          height={0}
          items="center"
          justify="center"
          position="relative"
          style={{ zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <View transform={[{ rotate: '344.558deg' }]}>
            {/* Wallet Card Icon */}
            <WalletCard width={114.62} height={129.195} />
          </View>
        </View>
      </View>

      {/* Accounts Row */}
      <XStack items="center" justify="space-between" width="100%" gap="$2" paddingHorizontal="$2">
        {/* From Account */}
        <YStack flex={1} items="center" gap="$1" maxW={130}>
          <Avatar
            src={fromAccount?.avatar}
            fallback={(fromAccount as any)?.emoji || fromAccount?.name?.charAt(0) || 'A'}
            size={36}
          />
          <YStack items="center" gap="$1">
            <Text fontSize="$3" fontWeight="600" color="$color" textAlign="center">
              {fromAccount?.name || 'Unknown'}
            </Text>
            <Text fontSize="$2" color="$gray11" textAlign="center">
              {fromAccount?.address
                ? fromAccount.address.length < 20
                  ? fromAccount.address
                  : `${fromAccount.address.slice(0, 6)}...${fromAccount.address.slice(-4)}`
                : ''}
            </Text>
          </YStack>
        </YStack>

        {/* Flow Arrow */}
        <View flex={1} items="center" justify="center">
          <View
            width={117}
            height="$2"
            bg="$gray2"
            borderRadius="$1"
            items="center"
            justify="center"
          >
            <ChevronRight size={12} color="$gray10" />
          </View>
        </View>

        {/* To Account */}
        <YStack flex={1} items="center" gap="$1" maxW={130}>
          {/* Debug logging */}
          {console.log('TransactionConfirmationModal toAccount:', toAccount)}
          {console.log('TransactionConfirmationModal toAccount.emoji:', (toAccount as any)?.emoji)}
          <Avatar
            src={toAccount?.avatar}
            fallback={(toAccount as any)?.emoji || toAccount?.name?.charAt(0) || 'A'}
            size={36}
          />
          <YStack items="center" gap="$1">
            <Text fontSize="$3" fontWeight="600" color="$color" textAlign="center">
              {toAccount?.name || 'Unknown'}
            </Text>
            <Text fontSize="$2" color="$gray11" textAlign="center">
              {toAccount?.address
                ? toAccount.address.length < 20
                  ? toAccount.address
                  : `${toAccount.address.slice(0, 6)}...${toAccount.address.slice(-4)}`
                : ''}
            </Text>
          </YStack>
        </YStack>
      </XStack>

      {/* Transaction Details Card */}
      <YStack bg="$light10" borderRadius="$4" padding="$4" gap="$3" width="100%" height={141}>
        {/* Transaction Type */}
        <Text fontSize="$2" color="$light80" fontFamily="Inter" fontWeight="400">
          Send Tokens
        </Text>

        {/* Token Amount */}
        <XStack items="center" justify="space-between" width="100%">
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {selectedToken?.logoURI ? (
              <Avatar
                src={selectedToken.logoURI}
                fallback={selectedToken.symbol.charAt(0)}
                size={35.2}
              />
            ) : (
              <FlowLogo size={35.2} />
            )}
            <Text fontSize={28} fontWeight="500" color="$white" fontFamily="Inter">
              {formData.tokenAmount}
            </Text>
          </View>
          <View
            bg="$light10"
            borderRadius="$10"
            paddingHorizontal="$2.5"
            paddingVertical="$1"
            flexDirection="row"
            items="center"
            gap="$1"
            height={35}
            width={77}
          >
            <Text
              fontSize="$2"
              fontWeight="600"
              color="$white"
              fontFamily="Inter"
              letterSpacing={-0.072}
            >
              {selectedToken?.symbol || 'FLOW'}
            </Text>
            <ChevronDown size={10} color="$white" />
          </View>
        </XStack>

        {/* Fiat Amount */}
        <XStack justify="flex-start" width="100%">
          <Text fontSize="$3" color="$light80" fontFamily="Inter" fontWeight="400" textAlign="left">
            ${formData.fiatAmount || '0.69'}
          </Text>
        </XStack>
      </YStack>

      {/* Confirm Button */}
      <Button
        width="100%"
        height={52}
        bg="$white"
        borderRadius="$4"
        onPress={handleConfirm}
        disabled={isLoading || internalIsSending}
        opacity={isLoading || internalIsSending ? 0.7 : 1}
      >
        <Text fontSize="$4" fontWeight="600" color="$black">
          {internalIsSending ? 'Sending...' : isLoading ? 'Confirming...' : 'Confirm send'}
        </Text>
      </Button>
    </YStack>
  );
};
