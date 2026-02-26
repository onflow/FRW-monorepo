import { Close } from '@onflow/frw-icons';
import React from 'react';
import { Sheet, View, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Button } from '../foundation/Button';
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
  tokenSectionText = 'Token',
  fromText = 'From',
  claimText,
}) => {
  const ctaLabel = claimText ?? `Claim ${item.symbol}`;

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
      >
        <YStack p="$4" gap="$4">
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

          {/* Token section */}
          <YStack bg="$bg1" rounded="$4" p="$4" gap="$3">
            <Text fontSize={13} color="$text2" fontWeight="400">
              {tokenSectionText}
            </Text>
            <XStack items="center" gap="$3">
              <Avatar src={item.logoURI} fallback={item.symbol[0]} size={40} />
              <YStack flex={1} gap="$0.5">
                <Text fontSize={15} fontWeight="600" color="$text1">
                  {item.name}
                </Text>
                {item.usdValue !== undefined && (
                  <Text fontSize={13} color="$text2">
                    {formatUsd(item.usdValue)}
                  </Text>
                )}
              </YStack>
              <Text fontSize={15} fontWeight="600" color="$text1">
                {item.amount} {item.symbol}
              </Text>
            </XStack>
          </YStack>

          {/* Sender section */}
          <YStack bg="$bg1" rounded="$4" p="$4" gap="$3">
            <Text fontSize={13} color="$text2" fontWeight="400">
              {fromText}
            </Text>
            <XStack items="center" gap="$3">
              <Avatar src={sender.avatar} fallback={sender.name[0]} size={40} />
              <YStack flex={1} gap="$0.5">
                <Text fontSize={15} fontWeight="600" color="$text1">
                  {sender.name}
                </Text>
                <Text fontSize={13} color="$text2">
                  {truncateAddress(sender.address)}
                </Text>
              </YStack>
            </XStack>
          </YStack>

          {/* CTA */}
          <YStack mb="$6">
            <Button variant="inverse" size="large" fullWidth onPress={onConfirm}>
              {ctaLabel}
            </Button>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
