import { ChevronDown, WalletCard, Close, FlowLogo } from '@onflow/frw-icons';
import { type WalletAccount, type TransactionType, type TokenModel } from '@onflow/frw-types';
import React from 'react';
import { YStack, XStack, View, Sheet } from 'tamagui';

import { MultipleNFTsPreview } from './MultipleNFTsPreview';
import { type NFTSendData } from './NFTSendPreview';
import { Avatar } from '../foundation/Avatar';
import { Button } from '../foundation/Button';
import { Text } from '../foundation/Text';

export interface TransactionFormData {
  tokenAmount: string;
  fiatAmount: string;
  isTokenMode: boolean;
  transactionFee?: string;
}

export interface ConfirmationDrawerProps {
  visible: boolean;
  transactionType: TransactionType;
  selectedToken?: TokenModel | null;
  selectedNFTs?: NFTSendData[];
  fromAccount?: WalletAccount | null;
  toAccount?: WalletAccount | null;
  formData: TransactionFormData;
  onConfirm?: () => Promise<void>;
  onClose: () => void;
  title?: string;
  isSending?: boolean;
}

interface LoadingIndicatorProps {
  isAnimating?: boolean;
  width?: number;
  height?: number;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isAnimating = false,
  width = 117,
  height = 8,
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isAnimating) {
      setActiveIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 6);
    }, 200);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getDotStyle = (index: number) => {
    if (!isAnimating) {
      const opacities = [0.1, 0.2, 0.3, 1, 1, 1];
      const colors = ['#00EF8B', '#00EF8B', '#00EF8B', '#009154', '#00EF8B', '#00EF8B'];
      return {
        bg: colors[index],
        opacity: opacities[index],
      };
    }

    if (index === activeIndex) {
      return {
        bg: '#00EF8B',
        opacity: 1,
      };
    } else if (index === (activeIndex - 1 + 6) % 6) {
      return {
        bg: '#00EF8B',
        opacity: 0.6,
      };
    } else {
      return {
        bg: '#00EF8B',
        opacity: 0.2,
      };
    }
  };

  return (
    <View flex={1} items="center" justify="center">
      <View
        width={width}
        height={height}
        flexDirection="row"
        items="center"
        justify="center"
        gap={17.8}
      >
        {Array.from({ length: 6 }, (_, index) => {
          const style = getDotStyle(index);
          return (
            <View
              key={index}
              width={8}
              height={8}
              borderRadius={4}
              bg={style.bg}
              opacity={style.opacity}
            />
          );
        })}
      </View>
    </View>
  );
};

export const ConfirmationDrawer: React.FC<ConfirmationDrawerProps> = ({
  visible,
  transactionType,
  selectedToken,
  selectedNFTs,
  fromAccount,
  toAccount,
  formData,
  onConfirm,
  onClose,
  title = 'Summary',
  isSending = false,
}) => {
  const [internalIsSending, setInternalIsSending] = React.useState(false);

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

  return (
    <Sheet modal open={visible} onOpenChange={onClose} snapPointsMode="fit" dismissOnSnapToBottom>
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        bg="rgba(0,0,0,0.5)"
      />

      <Sheet.Handle bg="$gray8" />

      <Sheet.Frame bg="$bgDrawer" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <YStack p="$4" gap="$4">
          {/* Header */}
          <XStack items="center" justify="space-between" width="100%">
            <View w={32} h={32} />

            <Text fontSize="$5" fontWeight="700" color="$white" textAlign="center">
              {title}
            </Text>

            <XStack
              w={32}
              h={32}
              items="center"
              justify="center"
              borderRadius="$4"
              pressStyle={{ bg: '$gray3' }}
              onPress={onClose}
              cursor="pointer"
            >
              <Close size={20} color="$white" />
            </XStack>
          </XStack>

          {/* Transaction Visual */}
          <View
            height={120}
            width="100%"
            position="relative"
            items="center"
            justify="center"
            my="$2"
          >
            {/* Gradient Background Circle */}
            <View
              position="absolute"
              width={300}
              height={300}
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: 150,
                opacity: 0.1,
                background:
                  'radial-gradient(27.35% 27.35% at 50% 50%, #00EF8B 25.48%, rgba(0, 239, 139, 0.00) 100%)',
              }}
            />

            <View items="center" justify="center" position="relative" style={{ zIndex: 10 }}>
              <View transform={[{ rotate: '344.558deg' }]}>
                <WalletCard width={80} height={90} />
              </View>
            </View>
          </View>

          {/* Accounts Row */}
          <XStack items="center" justify="space-between" width="100%" gap="$2" px="$2">
            {/* From Account */}
            <YStack flex={1} items="center" gap="$2" maxW={100}>
              <Avatar
                src={fromAccount?.avatar}
                fallback={(fromAccount as any)?.emoji || fromAccount?.name?.charAt(0) || 'A'}
                size={36}
              />
              <YStack items="center" gap="$1">
                <Text fontSize="$3" fontWeight="600" color="$white" textAlign="center">
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

            {/* Loading Indicator */}
            <LoadingIndicator isAnimating={internalIsSending} width={90} />

            {/* To Account */}
            <YStack flex={1} items="center" gap="$2" maxW={100}>
              <Avatar
                src={toAccount?.avatar}
                fallback={(toAccount as any)?.emoji || toAccount?.name?.charAt(0) || 'A'}
                size={36}
              />
              <YStack items="center" gap="$1">
                <Text fontSize="$3" fontWeight="600" color="$white" textAlign="center">
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
          {transactionType !== 'tokens' && selectedNFTs ? (
            <YStack bg="$light10" rounded="$4" p="$4" gap="$3" width="100%" minH={120}>
              <MultipleNFTsPreview
                nfts={selectedNFTs}
                sectionTitle={`Send ${selectedNFTs.length} NFT${selectedNFTs.length !== 1 ? 's' : ''}`}
                maxVisibleThumbnails={3}
                expandable={false}
                thumbnailSize={60}
                backgroundColor="transparent"
                borderRadius={14.4}
                contentPadding={0}
              />
            </YStack>
          ) : (
            <YStack bg="$light10" rounded="$4" p="$4" gap="$3" width="100%" minH={120}>
              <Text fontSize="$2" color="$light80" fontFamily="Inter" fontWeight="400">
                Send Tokens
              </Text>

              {/* Token Amount */}
              <XStack items="center" justify="space-between" width="100%">
                <XStack items="center" gap="$3">
                  {selectedToken?.logoURI ? (
                    <Avatar
                      src={selectedToken.logoURI}
                      fallback={selectedToken.symbol?.charAt(0) || 'A'}
                      size={32}
                    />
                  ) : (
                    <FlowLogo size={32} />
                  )}
                  <Text fontSize="$6" fontWeight="500" color="$white" fontFamily="Inter">
                    {formData.tokenAmount}
                  </Text>
                </XStack>

                <View
                  bg="$light10"
                  rounded="$10"
                  px="$2.5"
                  py="$1"
                  flexDirection="row"
                  items="center"
                  gap="$1"
                  height={32}
                  minW={60}
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
                <Text
                  fontSize="$3"
                  color="$light80"
                  fontFamily="Inter"
                  fontWeight="400"
                  textAlign="left"
                >
                  ${formData.fiatAmount || '0.69'}
                </Text>
              </XStack>
            </YStack>
          )}

          {/* Confirm Button */}
          <Button
            width="100%"
            height={52}
            bg="$white"
            rounded="$4"
            onPress={handleConfirm}
            disabled={internalIsSending}
            opacity={internalIsSending ? 0.7 : 1}
          >
            <Text fontSize="$4" fontWeight="600" color="$black">
              {internalIsSending ? 'Sending...' : 'Confirm'}
            </Text>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

// Re-export types for consistency
export type { TokenModel, WalletAccount } from '@onflow/frw-types';
