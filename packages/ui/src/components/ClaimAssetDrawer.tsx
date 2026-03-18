import { Close, VerifiedToken } from '@onflow/frw-icons';
import type { WalletAccount } from '@onflow/frw-types';
import React, { useState } from 'react';
import { Image } from 'react-native';
import { Sheet, View, XStack, YStack, useTheme } from 'tamagui';

import { AccountSelector } from './AccountSelector';
import { ConfirmationAnimationSection } from './ConfirmationAnimationSection';
import { HoldToSendButton } from './HoldToSendButton';
import { PriceChangeBadge } from './PriceChangeBadge';
import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';

export interface ClaimAssetNFTPreview {
  id: string;
  name: string;
  thumbnail?: string;
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
  /** When set, renders NFT collection layout instead of token layout */
  nftItems?: ClaimAssetNFTPreview[];
}

export interface ClaimAssetDrawerProps {
  visible: boolean;
  item: ClaimAssetItem;
  receiver: WalletAccount;
  allReceivers: WalletAccount[];
  onReceiverChange?: (account: WalletAccount) => void;
  onConfirm?: () => void;
  onClose: () => void;
  // Translation props
  titleText?: string;
  receiverSectionText?: string;
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

function formatTokenAmount(amount: string): string {
  if (!amount.includes('.')) return amount;
  return amount.replace(/\.?0+$/, '');
}

export const ClaimAssetDrawer: React.FC<ClaimAssetDrawerProps> = ({
  visible,
  item,
  receiver,
  allReceivers,
  onReceiverChange,
  onConfirm,
  onClose,
  titleText = 'Claim asset',
  receiverSectionText = 'To',
  claimText = 'Claim',
  warningText = 'By accepting this token you will automatically accept future deposits into this account',
}) => {
  const theme = useTheme();
  const [errorSignal, setErrorSignal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState<WalletAccount>(receiver);

  const handleAccountSelect = (account: WalletAccount) => {
    setSelectedReceiver(account);
    onReceiverChange?.(account);
  };

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
        testID="claim-drawer"
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
              testID="claim-drawer-close"
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
          <YStack mb="$2">
            <ConfirmationAnimationSection imageUri={item.logoURI} transactionType="tokens" />
          </YStack>

          {/* Asset card — FT or NFT layout */}
          {item.nftItems && item.nftItems.length > 0 ? (
            <NFTCollectionCard item={item} />
          ) : (
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
                    {formatTokenAmount(item.amount)} {item.symbol}
                  </Text>
                  {item.usdValue !== undefined && (
                    <Text fontSize={13} color="$text2">
                      {formatUsd(item.usdValue)}
                    </Text>
                  )}
                </YStack>
              </XStack>
            </YStack>
          )}

          {/* Receiver card — hidden for NFT claims */}
          {!item.nftItems && (
            <YStack bg="$bg1" rounded="$4" px="$4" py="$3">
              <AccountSelector
                currentAccount={selectedReceiver}
                accounts={allReceivers}
                onAccountSelect={handleAccountSelect}
                title=""
                showEditButton={false}
                actionIcon="edit"
                hideBalance
              />
            </YStack>
          )}

          {/* Warning text */}
          <Text fontSize={14} color="$text2" text="center" px="$2" lineHeight={20}>
            {warningText}
          </Text>

          {/* CTA */}
          <View pb="$8" testID="claim-drawer-confirm">
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

// ---------------------------------------------------------------------------
// NFT Collection Card — shows collection name, symbol, and thumbnail previews
// ---------------------------------------------------------------------------

const MAX_PREVIEW = 3;

function NFTCollectionCard({ item }: { item: ClaimAssetItem }): React.ReactElement {
  const nfts = item.nftItems ?? [];
  const showItems = nfts.slice(0, MAX_PREVIEW);
  const remaining = nfts.length > MAX_PREVIEW ? nfts.length - MAX_PREVIEW : 0;

  return (
    <YStack bg="$bg1" rounded="$4" px="$4" py="$3" gap="$3">
      {/* Collection name row */}
      <XStack items="center" justify="space-between">
        <Text fontSize={15} fontWeight="600" color="$text1">
          {item.name}
        </Text>
        <Text fontSize={13} color="$text2">
          {item.symbol}
        </Text>
      </XStack>

      {/* NFT thumbnail previews — max 3 items with size cap */}
      <XStack gap="$2" justify="center">
        {showItems.map((nft, idx) => {
          const isLastWithOverlay = remaining > 0 && idx === MAX_PREVIEW - 1;
          return (
            <YStack
              key={nft.id}
              flex={1}
              aspectRatio={1}
              maxW={100}
              maxH={100}
              rounded="$3"
              overflow="hidden"
              bg="$bg3"
            >
              {nft.thumbnail ? (
                <Image
                  source={{ uri: nft.thumbnail }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 } as any}
                  resizeMode="cover"
                />
              ) : (
                <YStack flex={1} items="center" justify="center">
                  <Text fontSize={20} color="$text2">
                    {nft.name?.[0] ?? '?'}
                  </Text>
                </YStack>
              )}
              {isLastWithOverlay && (
                <YStack
                  pos="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="rgba(0,0,0,0.55)"
                  rounded="$3"
                  items="center"
                  justify="center"
                >
                  <Text fontSize={18} fontWeight="700" color="white">
                    +{remaining}
                  </Text>
                </YStack>
              )}
            </YStack>
          );
        })}
      </XStack>
    </YStack>
  );
}
