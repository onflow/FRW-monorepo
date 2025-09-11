import { ChevronDown, WalletCard, Close, FlowLogo, VerifiedToken } from '@onflow/frw-icons';
import { type TransactionType, type TokenModel, type AccountDisplayData } from '@onflow/frw-types';
import React from 'react';
import { YStack, XStack, View } from 'tamagui';

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

export interface TransactionConfirmationModalProps {
  visible: boolean;
  transactionType: TransactionType;
  selectedToken?: TokenModel | null;
  selectedNFTs?: NFTSendData[];
  fromAccount?: AccountDisplayData | null;
  toAccount?: AccountDisplayData | null;
  formData: TransactionFormData;
  onConfirm?: () => Promise<void>;
  onClose: () => void;
  title?: string;
  backgroundColor?: string;
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
    }, 200); // Animation speed: 200ms per dot

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getDotStyle = (index: number) => {
    if (!isAnimating) {
      // Static state - show gradient as designed
      const opacities = [0.1, 0.2, 0.3, 1, 1, 1];
      const colors = ['#00EF8B', '#00EF8B', '#00EF8B', '#009154', '#00EF8B', '#00EF8B'];
      return {
        bg: colors[index],
        opacity: opacities[index],
      };
    }

    // Animated state - highlight active dot
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

export const TransactionConfirmationModal: React.FC<TransactionConfirmationModalProps> = ({
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
  backgroundColor = '$background',
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
      position="fixed"
      bg="$background"
      items="center"
      justify="flex-start"
      width="100%"
      style={{
        top: 56,
        left: 0,
        right: 0,
        bottom: 0,
        height: 'calc(100% - 56px)',
        zIndex: 1000,
      }}
    >
      <XStack
        items="center"
        justify="space-between"
        width="100%"
        height={48}
        paddingHorizontal="$4"
        backgroundColor="$background"
      >
        <View w={32} h={32} />

        {/* Center title - Summary */}
        <View flex={1} items="center" justify="center" px="$2">
          <Text fontSize={16} fontWeight="700" color="$white" textAlign="center">
            {title}
          </Text>
        </View>

        {/* Close button in top right */}
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            zIndex: 1001,
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <Close size={20} color="#ffffff" />
        </button>
      </XStack>

      {/* Main content with padding */}
      <YStack flex={1} items="center" justify="space-between" px="$4" pt="$4" pb={16} w="100%">
        {/* Top content */}
        <YStack items="center" justify="flex-start" gap="$4" w="100%">
          <View
            height={120}
            width="100%"
            position="relative"
            items="center"
            justify="center"
            marginTop="$2"
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
              style={{
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View transform={[{ rotate: '344.558deg' }]}>
                {/* Wallet Card Icon */}
                <WalletCard width={114.62} height={129.195} />
              </View>
            </View>
          </View>

          {/* Accounts Row */}
          <XStack
            items="center"
            justify="space-between"
            width="100%"
            gap="$2"
            paddingHorizontal="$2"
          >
            {/* From Account */}
            <YStack flex={1} items="center" gap="$1" maxW={130}>
              <Avatar
                src={fromAccount?.avatarSrc}
                fallback={fromAccount?.emojiInfo?.emoji || fromAccount?.avatarFallback || 'A'}
                bgColor={fromAccount?.avatarBgColor}
                size={36}
              />
              <YStack items="center" gap="$1">
                <Text fontSize="$3" fontWeight="600" color="$color" ta="center">
                  {fromAccount?.name || 'Unknown'}
                </Text>
                <Text fontSize="$2" color="$gray11" ta="center">
                  {fromAccount?.address
                    ? fromAccount.address.length < 20
                      ? fromAccount.address
                      : `${fromAccount.address.slice(0, 6)}...${fromAccount.address.slice(-4)}`
                    : ''}
                </Text>
              </YStack>
            </YStack>

            {/* Loading Indicator */}
            <LoadingIndicator isAnimating={internalIsSending} />

            {/* To Account */}
            <YStack flex={1} items="center" gap="$1" maxW={130}>
              <Avatar
                src={toAccount?.avatar}
                fallback={toAccount?.emojiInfo?.emoji || toAccount?.avatarFallback || 'A'}
                bgColor={toAccount?.avatarBgColor}
                size={36}
              />
              <YStack items="center" gap="$1">
                <Text fontSize="$3" fontWeight="600" color="$color" ta="center">
                  {toAccount?.name || 'Unknown'}
                </Text>
                <Text fontSize="$2" color="$gray11" ta="center">
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
            <YStack bg="$light10" borderRadius="$4" padding="$4" gap="$3" width="100%" height={141}>
              {/* NFT Transaction Details */}
              <MultipleNFTsPreview
                nfts={selectedNFTs}
                sectionTitle={`Send ${selectedNFTs.length} NFT${selectedNFTs.length !== 1 ? 's' : ''}`}
                maxVisibleThumbnails={3}
                expandable={false}
                thumbnailSize={77.33}
                backgroundColor="transparent"
                borderRadius={14.4}
                contentPadding={0}
              />
            </YStack>
          ) : (
            <YStack bg="$light10" borderRadius="$4" padding="$4" gap="$3" width="100%" height={141}>
              {/* Token Transaction Details */}
              <Text fontSize="$2" color="$light80" fontFamily="Inter" fontWeight="400">
                Send Tokens
              </Text>

              {/* Token Amount */}
              <XStack items="center" justify="space-between" width="100%">
                <View
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                  {selectedToken?.logoURI ? (
                    <Avatar
                      src={selectedToken.logoURI}
                      fallback={selectedToken.symbol?.charAt(0) || 'A'}
                      size={35.2}
                    />
                  ) : (
                    <FlowLogo size={35.2} />
                  )}
                  <Text fontSize={28} fontWeight="500" color="$white" fontFamily="Inter">
                    {(() => {
                      const amount = parseFloat(formData.tokenAmount);
                      if (isNaN(amount)) return formData.tokenAmount;
                      // Round to at most 8 decimal places
                      return parseFloat(amount.toFixed(8)).toString();
                    })()}
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
                  <VerifiedToken size={10} />
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
        </YStack>

        {/* Confirm Button - fixed at bottom */}
        <Button
          width="100%"
          height={52}
          bg="$white"
          borderRadius="$4"
          onPress={handleConfirm}
          disabled={internalIsSending}
          opacity={internalIsSending ? 0.7 : 1}
        >
          <Text fontSize="$4" fontWeight="600" color="$black">
            {internalIsSending ? 'Sending...' : 'Confirm'}
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
};

// Re-export types for Storybook usage
export type { TokenModel, WalletAccount } from '@onflow/frw-types';
