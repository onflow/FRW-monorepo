import { Close, ConfirmDialogBg, FlowLogo, VerifiedToken } from '@onflow/frw-icons';
import {
  type AccountDisplayData,
  type TokenModel,
  type TransactionType,
  type NFTTransactionData,
} from '@onflow/frw-types';
import React from 'react';
import { Sheet, Spinner, View, XStack, YStack } from 'tamagui';

import { AddressText } from './AddressText';
import { ConfirmationAnimation } from './ConfirmationAnimation';
import { HoldToSendButton } from './HoldToSendButton';
import { MultipleNFTsPreview } from './MultipleNFTsPreview';
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
  selectedNFTs?: NFTTransactionData[];
  fromAccount?: AccountDisplayData | null;
  toAccount?: AccountDisplayData | null;
  formData: TransactionFormData;
  onConfirm?: () => Promise<void>;
  onClose: () => void;
  title?: string;
  isSending?: boolean;
  isExtension?: boolean;
  // Translation props
  summaryText?: string;
  sendTokensText?: string;
  sendNFTsText?: string;
  sendSNFTsText?: string; // For semi-fungible NFTs (ERC1155)
  sendingText?: string;
  confirmSendText?: string;
  holdToSendText?: string;
  unknownAccountText?: string;
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
  // Translation props with defaults
  summaryText = 'Summary',
  sendTokensText = 'Send Tokens',
  sendNFTsText = 'Send NFTs',
  sendSNFTsText = 'Send sNFTs', // Default for semi-fungible NFTs
  sendingText = 'Sending...',
  confirmSendText = 'Confirm send',
  holdToSendText = 'Hold to send',
  unknownAccountText = 'Unknown',
}) => {
  const [internalIsSending, setInternalIsSending] = React.useState(false);
  const [errorSignal, setErrorSignal] = React.useState(false);
  const [isLongPressing, setIsLongPressing] = React.useState(false);

  // Determine if we're sending ERC1155 NFTs (semi-fungible)
  const isERC1155 = React.useMemo(() => {
    return selectedNFTs?.length === 1 && selectedNFTs[0].contractType === 'ERC1155';
  }, [selectedNFTs]);

  // Determine if we're sending multiple NFTs
  const isMultipleNFTs = React.useMemo(() => {
    return selectedNFTs ? selectedNFTs.length > 1 : false;
  }, [selectedNFTs]);

  // Dynamic section title based on transfer type
  const nftSectionTitle = React.useMemo(() => {
    if (isMultipleNFTs) {
      return sendNFTsText;
    } else if (isERC1155) {
      return sendSNFTsText;
    } else {
      return sendNFTsText;
    }
  }, [isMultipleNFTs, isERC1155, sendNFTsText, sendSNFTsText]);

  // Theme-aware button colors using helper function
  const isCurrentlyDarkMode = isDarkMode(theme);

  const buttonBackgroundColor = isCurrentlyDarkMode
    ? theme.white?.val || '#FFFFFF'
    : theme.black?.val || '#000000';
  const buttonTextColor = isCurrentlyDarkMode
    ? theme.black?.val || '#000000'
    : theme.white?.val || '#FFFFFF';

  // Theme-aware close icon color - use theme's color value directly
  const closeIconColor = theme.color?.val || '#000000';

  // Theme-aware card background color - same as SendTokensScreen
  const cardBackgroundColor = isCurrentlyDarkMode ? '$light10' : '$bg2';

  // Theme-aware background colors for badges
  const badgeBackgroundColor =
    theme.white10?.val ||
    (isCurrentlyDarkMode ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.05)');

  const handleConfirm = async () => {
    try {
      setInternalIsSending(true);
      await onConfirm?.();
    } catch (error) {
      // Trigger HoldToSendButton error state (rising edge)
      setErrorSignal(true);
      setTimeout(() => setErrorSignal(false), 50);
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
        enterStyle={{ y: 1000 }}
        exitStyle={{ y: 1000 }}
        overflow="scroll"
      >
        <YStack p="$4" gap="$4">
          {/* Header */}
          <XStack items="center" width="100%">
            {isExtension ? (
              <>
                <View flex={1} items="center">
                  <Text fontSize="$5" fontWeight="700" color="$text" text="center">
                    {title || summaryText}
                  </Text>
                </View>

                <XStack
                  width={32}
                  height={32}
                  items="center"
                  justify="center"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={onClose}
                  cursor="pointer"
                >
                  <Close size={24} color="#767676" />
                </XStack>
              </>
            ) : (
              <>
                <View width={32} height={32} />

                <View flex={1} items="center">
                  <Text fontSize="$5" fontWeight="700" color="$text" text="center">
                    {title || summaryText}
                  </Text>
                </View>

                <XStack
                  width={32}
                  height={32}
                  items="center"
                  justify="center"
                  rounded="$4"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={onClose}
                  cursor="pointer"
                >
                  <Close size={24} color="#767676" />
                </XStack>
              </>
            )}
          </XStack>

          {/* Transaction Visual - Enhanced Lottie Animation */}
          <View
            height={120}
            width="100%"
            items="center"
            justify="center"
            my="$2"
            position="relative"
          >
            {/* Background Gradient - Centered on Animation */}
            <View
              position="absolute"
              t={0}
              l={0}
              r={0}
              b={0}
              items="center"
              justify="center"
              opacity={0.15}
              style={{ zIndex: -1 }}
            >
              <ConfirmDialogBg width={600} height={600} color="url(#confirm-dialog-bg_svg__a)" />
            </View>

            <ConfirmationAnimation
              width={400}
              height={150}
              imageUri={
                transactionType !== 'tokens' && selectedNFTs && selectedNFTs.length > 0
                  ? selectedNFTs[0].thumbnail || selectedToken?.logoURI
                  : selectedToken?.logoURI
              }
              transactionType={transactionType}
              autoPlay
              loop
            />
          </View>

          {/* Accounts Row */}
          <XStack items="center" justify="space-between" width="100%" gap="$2" px="$2">
            <YStack flex={1} items="center" gap="$2" maxW={100}>
              <Avatar
                src={fromAccount?.avatarSrc}
                fallback={fromAccount?.avatarFallback || 'A'}
                bgColor={fromAccount?.avatarBgColor}
                size={36}
              />
              <YStack items="center" gap="$1">
                <Text fontSize="$3" fontWeight="600" color="$text">
                  {fromAccount?.name || unknownAccountText}
                </Text>
                {fromAccount?.address && (
                  <AddressText address={fromAccount.address} fontSize="$2" color="$textSecondary" />
                )}
              </YStack>
            </YStack>

            <LoadingIndicator isAnimating={internalIsSending} width={90} />

            <YStack flex={1} items="center" gap="$2" maxW={100}>
              <Avatar
                src={toAccount?.avatarSrc}
                fallback={toAccount?.avatarFallback || 'A'}
                bgColor={toAccount?.avatarBgColor}
                size={36}
              />
              <YStack items="center" gap="$1">
                <Text fontSize="$3" fontWeight="600" color="$text">
                  {toAccount?.name || unknownAccountText}
                </Text>
                {toAccount?.address && (
                  <AddressText address={toAccount.address} fontSize="$2" color="$textSecondary" />
                )}
              </YStack>
            </YStack>
          </XStack>

          {/* Transaction Details Card */}
          {transactionType !== 'tokens' && selectedNFTs ? (
            <YStack bg="$bg1" rounded="$4" p="$4" gap="$3" width="100%" minH={132}>
              <Text fontSize="$2" color="$textSecondary" fontWeight="400">
                {nftSectionTitle}
              </Text>
              <MultipleNFTsPreview
                nfts={selectedNFTs}
                maxVisibleThumbnails={3}
                expandable={false}
                thumbnailSize={60}
                backgroundColor="transparent"
                borderRadius={14.4}
                contentPadding="0"
              />

              {selectedNFTs.length === 1 &&
                selectedNFTs[0].contractType === 'ERC1155' &&
                selectedNFTs[0].selectedQuantity && (
                  <XStack
                    bg="$subtleBg10"
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
                      color="$text"
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
            <YStack bg="$bg1" rounded="$4" p="$4" gap="$3" width="100%" minH={132}>
              <Text fontSize="$2" color="$textSecondary" fontWeight="400">
                {sendTokensText}
              </Text>

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
                  <Text fontSize="$6" fontWeight="500" color="$text">
                    {(() => {
                      const amount = parseFloat(formData.tokenAmount);
                      if (isNaN(amount)) return formData.tokenAmount;
                      return parseFloat(amount.toFixed(8)).toString();
                    })()}
                  </Text>
                </XStack>

                <View
                  bg="$subtleBg10"
                  rounded="$10"
                  px="$2"
                  py="$1"
                  flexDirection="row"
                  items="center"
                  gap="$0.5"
                  height={32}
                  minW={60}
                >
                  <Text fontSize="$2" fontWeight="600" color="$text" letterSpacing={-0.072}>
                    {selectedToken?.symbol || 'FLOW'}
                  </Text>
                  <VerifiedToken size={10} color="#41CC5D" />
                </View>
              </XStack>

              <XStack justify="flex-start" width="100%">
                <Text fontSize="$3" color="$textSecondary" fontWeight="400">
                  ${formData.fiatAmount || '0.69'}
                </Text>
              </XStack>
            </YStack>
          )}

          {/* Confirm Button */}
          {isExtension ? (
            <YStack
              mb={'$10'}
              bg="$text"
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
                  <Spinner size="small" color="$bg" />
                  <Text fontSize="$5" fontWeight="600" color="$bg">
                    {sendingText}
                  </Text>
                </XStack>
              ) : (
                <Text fontSize="$5" fontWeight="600" color="$bg">
                  {confirmSendText}
                </Text>
              )}
            </YStack>
          ) : (
            <View mb={'$10'}>
              <HoldToSendButton
                onPress={handleConfirm}
                stopSignal={internalIsSending}
                errorSignal={errorSignal}
                holdToSendText={holdToSendText}
              />
            </View>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

// Re-export types for consistency
export type { TokenModel, WalletAccount } from '@onflow/frw-types';
