import { WalletCard, Close, FlowLogo, VerifiedToken } from '@onflow/frw-icons';
import { type TransactionType, type TokenModel, type AccountDisplayData } from '@onflow/frw-types';
import React from 'react';
import { Platform, Image as RNImage } from 'react-native';
import { YStack, XStack, View, Sheet, useTheme, Spinner } from 'tamagui';

import { AddressText } from './AddressText';
import { MultipleNFTsPreview } from './MultipleNFTsPreview';
import { type NFTSendData } from './NFTSendPreview';
// import { LottieAnimation } from './LottieAnimation';
import { Avatar } from '../foundation/Avatar';
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
  fromAccount?: AccountDisplayData | null;
  toAccount?: AccountDisplayData | null;
  formData: TransactionFormData;
  onConfirm?: () => Promise<void>;
  onClose: () => void;
  title?: string;
  isSending?: boolean;
  isExtension?: boolean;
  sendStaticImage?: any;
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
              backgroundColor={style.bg}
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
  isExtension = false,
  sendStaticImage,
}) => {
  const theme = useTheme();
  const [internalIsSending, setInternalIsSending] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setInternalIsSending(true);
      await onConfirm?.();
    } catch (error) {
      //
    } finally {
      setInternalIsSending(false);
    }
  };

  return (
    <Sheet
      modal
      open={visible}
      onOpenChange={onClose}
      snapPointsMode={!isExtension ? 'fit' : undefined}
      dismissOnSnapToBottom
      snapPoints={isExtension ? [91] : undefined}
      animation={isExtension ? 'quick' : 'lazy'}
    >
      <Sheet.Overlay
        animation={isExtension ? 'quick' : 'lazy'}
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        bg="rgba(0,0,0,0.5)"
      />
      {!isExtension && <Sheet.Handle bg="$gray8" />}
      <Sheet.Frame
        bg="$bgDrawer"
        borderTopLeftRadius={isExtension ? 0 : '$6'}
        borderTopRightRadius={isExtension ? 0 : '$6'}
        animation={isExtension ? 'quick' : 'lazy'}
        enterStyle={{ y: '100%' }}
        exitStyle={{ y: '100%' }}
      >
        <YStack p="$4" gap="$4">
          {/* Header */}
          <XStack items="center" width="100%">
            {isExtension ? (
              <>
                <View flex={1} items="center">
                  <Text fontSize="$5" fontWeight="700" color="$white" textAlign="center">
                    {title}
                  </Text>
                </View>

                <XStack
                  w={32}
                  h={32}
                  items="center"
                  justify="center"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={onClose}
                  cursor="pointer"
                >
                  <Close size={15} color={theme.white.val} />
                </XStack>
              </>
            ) : (
              <>
                <View w={32} h={32} />

                <View flex={1} items="center">
                  <Text fontSize="$5" fontWeight="700" color="$white" textAlign="center">
                    {title}
                  </Text>
                </View>

                <XStack
                  w={32}
                  h={32}
                  items="center"
                  justify="center"
                  borderRadius="$4"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={onClose}
                  cursor="pointer"
                >
                  <Close size={15} color={theme.white.val} />
                </XStack>
              </>
            )}
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
            {/* Gradient Background Circle - Platform specific */}
            {typeof window !== 'undefined' ? (
              // Web version with CSS gradient
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
            ) : (
              // React Native version - simple colored circle
              <View
                position="absolute"
                width={300}
                height={300}
                borderRadius={150}
                bg="#00EF8B"
                opacity={0.05}
                style={
                  {
                    // top: '50%',
                    // left: '50%',
                    // transform: [{ translateX: -150 }, { translateY: -150 }],
                  }
                }
              />
            )}

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
              {/* Wallet Card Icon */}
              {Platform.OS !== 'web' && sendStaticImage ? (
                <RNImage
                  source={sendStaticImage}
                  style={{ width: 114.62, height: 129.195 }}
                  resizeMode="contain"
                />
              ) : (
                <WalletCard width={114.62} height={129.195} />
              )}
            </View>
          </View>

          {/* Accounts Row */}
          <XStack items="center" justify="space-between" width="100%" gap="$2" px="$2">
            {/* From Account */}
            <YStack flex={1} items="center" gap="$2" maxW={100}>
              <Avatar
                src={fromAccount?.avatarSrc}
                fallback={fromAccount?.avatarFallback || 'A'}
                bgColor={fromAccount?.avatarBgColor}
                size={36}
              />
              <YStack items="center" gap="$1">
                <Text fontSize="$3" fontWeight="600" color="$white">
                  {fromAccount?.name || 'Unknown'}
                </Text>
                {fromAccount?.address && (
                  <AddressText address={fromAccount.address} fontSize="$2" color="$textSecondary" />
                )}
              </YStack>
            </YStack>

            {/* Loading Indicator */}
            <LoadingIndicator isAnimating={internalIsSending} width={90} />

            {/* To Account */}
            <YStack flex={1} items="center" gap="$2" maxW={100}>
              <Avatar
                src={toAccount?.avatarSrc}
                fallback={toAccount?.avatarFallback || 'A'}
                bgColor={toAccount?.avatarBgColor}
                size={36}
              />
              <YStack items="center" gap="$1">
                <Text fontSize="$3" fontWeight="600" color="$white">
                  {toAccount?.name || 'Unknown'}
                </Text>
                {toAccount?.address && (
                  <AddressText address={toAccount.address} fontSize="$2" color="$textSecondary" />
                )}
              </YStack>
            </YStack>
          </XStack>

          {/* Transaction Details Card */}
          {transactionType !== 'tokens' && selectedNFTs ? (
            <YStack bg="$light10" rounded="$4" p="$4" gap="$3" width="100%" minH={132}>
              <Text fontSize="$2" color="$light80" fontWeight="400">
                Send NFTs
              </Text>
              <MultipleNFTsPreview
                nfts={selectedNFTs}
                maxVisibleThumbnails={3}
                expandable={false}
                thumbnailSize={60}
                backgroundColor="transparent"
                borderRadius={14.4}
                contentPadding={0}
              />

              {/* ERC1155 Quantity Display - Read-only */}
              {selectedNFTs.length === 1 &&
                selectedNFTs[0].contractType === 'ERC1155' &&
                selectedNFTs[0].selectedQuantity && (
                  <XStack
                    bg="rgba(255, 255, 255, 0.1)"
                    rounded="$10"
                    items="center"
                    justify="center"
                    px="$2.5"
                    py="$1"
                    width="100%"
                    mt="$2"
                  >
                    <Text
                      fontSize={18}
                      fontWeight="600"
                      color="$white"
                      letterSpacing={-0.072}
                      text="center"
                      flex={1}
                      numberOfLines={1}
                      lineHeight={22}
                    >
                      {selectedNFTs[0].selectedQuantity.toLocaleString()}
                    </Text>
                  </XStack>
                )}
            </YStack>
          ) : (
            <YStack bg="$light10" rounded="$4" p="$4" gap="$3" width="100%" minH={132}>
              <Text fontSize="$2" color="$light80" fontWeight="400">
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
                  <Text fontSize="$6" fontWeight="500" color="$white">
                    {(() => {
                      const amount = parseFloat(formData.tokenAmount);
                      if (isNaN(amount)) return formData.tokenAmount;
                      // Round to at most 8 decimal places
                      return parseFloat(amount.toFixed(8)).toString();
                    })()}
                  </Text>
                </XStack>

                <View
                  bg="$light10"
                  rounded="$10"
                  px="$2"
                  py="$1"
                  flexDirection="row"
                  items="center"
                  gap="$0.5"
                  height={32}
                  minW={60}
                >
                  <Text fontSize="$2" fontWeight="600" color="$white" letterSpacing={-0.072}>
                    {selectedToken?.symbol || 'FLOW'}
                  </Text>
                  <VerifiedToken size={10} color="#41CC5D" />
                </View>
              </XStack>

              {/* Fiat Amount */}
              <XStack justify="flex-start" width="100%">
                <Text fontSize="$3" color="$light80" fontWeight="400">
                  ${formData.fiatAmount || '0.69'}
                </Text>
              </XStack>
            </YStack>
          )}

          {/* Confirm Button */}
          <YStack
            mb={'$10'}
            bg="#FFFFFF"
            rounded="$4"
            height={56}
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.9 }}
            onPress={internalIsSending ? undefined : handleConfirm}
            cursor={internalIsSending ? 'not-allowed' : 'pointer'}
          >
            {internalIsSending ? (
              <XStack items="center" gap="$2">
                <Spinner size="small" color="$black" />
                <Text fontSize="$5" fontWeight="600" color="$black">
                  Sending...
                </Text>
              </XStack>
            ) : (
              <Text fontSize="$5" fontWeight="600" color="$black">
                {isExtension ? 'Confirm send' : 'Hold to send'}
              </Text>
            )}
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

// Re-export types for consistency
export type { TokenModel, WalletAccount } from '@onflow/frw-types';
