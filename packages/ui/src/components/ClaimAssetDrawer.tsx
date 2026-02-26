import { Close, VerifiedToken } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { Sheet, View, XStack, YStack, useTheme } from 'tamagui';

import { ConfirmationAnimationSection } from './ConfirmationAnimationSection';
import { HoldToSendButton } from './HoldToSendButton';
import { PriceChangeBadge } from './PriceChangeBadge';
import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';

export interface ClaimAssetSender {
  name: string;
  address: string;
  avatar?: string;
}

export interface ClaimAssetItem {
  name: string;
  symbol: string;
  logoURI?: string;
  amount: string;
  usdValue?: number;
  price?: number;
  priceChange24h?: number;
  isVerified?: boolean;
}

export interface ClaimAssetDrawerProps {
  visible: boolean;
  item: ClaimAssetItem;
  sender: ClaimAssetSender;
  onConfirm?: () => void;
  onClose: () => void;
  // Translation props
  titleText?: string;
  tokenSectionText?: string;
  fromText?: string;
  claimText?: string;
  warningText?: string;
}

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toPrecision(7)}`;
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const ClaimAssetDrawer: React.FC<ClaimAssetDrawerProps> = ({
  visible,
  item,
  sender,
  onConfirm,
  onClose,
  titleText = 'Claim asset',
  tokenSectionText = 'Receive',
  fromText = 'From',
  claimText = 'Claim',
  warningText = 'By accepting this token you will automatically accept future deposits into this account',
}) => {
  const theme = useTheme();
  const [errorSignal, setErrorSignal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsClaiming(true);
      await onConfirm?.();
    } catch {
      setErrorSignal(true);
      setTimeout(() => setErrorSignal(false), 50);
    } finally {
      setIsClaiming(false);
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
      <Sheet.Frame
        bg="$bgDrawer"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        animation="lazy"
        enterStyle={{ y: 1000 }}
        exitStyle={{ y: 1000 }}
        overflow="hidden"
      >
        <YStack p="$4" gap="$3" style={{ zIndex: 1 }}>
          {/* Header */}
          <XStack items="center" width="100%">
            <View w={32} h={32} />
            <View flex={1} items="center">
              <Text fontSize={17} fontWeight="700" color="$text1" text="center">
                {titleText}
              </Text>
            </View>
            <XStack
              w={32}
              h={32}
              items="center"
              justify="center"
              rounded="$4"
              pressStyle={{ opacity: 0.8 }}
              onPress={onClose}
              cursor="pointer"
            >
              <Close size={24} color="#767676" />
            </XStack>
          </XStack>

          {/* Animation */}
          <ConfirmationAnimationSection imageUri={item.logoURI} transactionType="tokens" />

          {/* Token card */}
          <YStack bg="$bg1" rounded="$4" px="$4" py="$3" gap="$2">
            <XStack items="center" gap="$3">
              <Avatar src={item.logoURI} fallback={item.symbol[0]} size={40} />

              {/* Name + price row */}
              <YStack flex={1} gap="$1">
                <XStack items="center" gap="$1.5">
                  <Text fontSize={15} fontWeight="600" color="$text1">
                    {item.name}
                  </Text>
                  {item.isVerified && (
                    <VerifiedToken size={14} color={theme.success?.val ?? '#41CC5D'} />
                  )}
                </XStack>
                <XStack items="center" gap="$1.5">
                  {item.price !== undefined && (
                    <Text fontSize={13} color="$text2">
                      {formatPrice(item.price)}
                    </Text>
                  )}
                  {item.priceChange24h !== undefined && (
                    <PriceChangeBadge value={item.priceChange24h} />
                  )}
                </XStack>
              </YStack>

              {/* Amount + USD */}
              <YStack items="flex-end" gap="$1">
                <Text fontSize={15} fontWeight="600" color="$text1">
                  {item.amount} {item.symbol}
                </Text>
                {item.usdValue !== undefined && (
                  <Text fontSize={13} color="$text2">
                    {formatUsd(item.usdValue)}
                  </Text>
                )}
              </YStack>
            </XStack>
          </YStack>

          {/* Sender card */}
          <YStack bg="$bg1" rounded="$4" px="$4" py="$3" gap="$2">
            <XStack items="center" gap="$3">
              <Avatar src={sender.avatar} fallback={sender.name[0]} size={40} />
              <YStack flex={1} gap="$1">
                <Text fontSize={15} fontWeight="600" color="$text1">
                  {sender.name}
                </Text>
                <Text fontSize={13} color="$text2">
                  {truncateAddress(sender.address)}
                </Text>
              </YStack>
            </XStack>
          </YStack>

          {/* Warning text */}
          <Text fontSize={14} color="$text2" text="center" px="$2" lineHeight={20}>
            {warningText}
          </Text>

          {/* CTA */}
          <View pb="$8">
            <HoldToSendButton
              onPress={handleConfirm}
              stopSignal={isClaiming}
              errorSignal={errorSignal}
              holdToSendText={claimText}
            />
          </View>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
