import { Close } from '@onflow/frw-icons';
import { WalletType, type WalletAccount } from '@onflow/frw-types';
import React, { useState } from 'react';
import { Sheet, View, XStack, YStack } from 'tamagui';

import { AccountSelector } from './AccountSelector';
import { ConfirmationAnimationSection } from './ConfirmationAnimationSection';
import { HoldToSendButton } from './HoldToSendButton';
import { MultipleNFTsPreview } from './MultipleNFTsPreview';
import { Text } from '../foundation/Text';

export interface ClaimNFTAssetDrawerProps {
  visible: boolean;
  collectionName: string;
  collectionSymbol: string;
  collectionLogoURI?: string;
  isVerified?: boolean;
  nftItems: { id: string; name: string; image?: string; thumbnail?: string }[];
  totalCount: number;
  receiver: WalletAccount;
  allReceivers: WalletAccount[];
  onReceiverChange?: (account: WalletAccount) => void;
  onConfirm?: () => void;
  onClose: () => void;
  titleText?: string;
  claimText?: string;
  warningText?: string;
}

export const ClaimNFTAssetDrawer: React.FC<ClaimNFTAssetDrawerProps> = ({
  visible,
  collectionName,
  collectionSymbol,
  collectionLogoURI,
  isVerified: _isVerified,
  nftItems,
  totalCount: _totalCount,
  receiver,
  allReceivers,
  onReceiverChange,
  onConfirm,
  onClose,
  titleText = 'Claim assets',
  claimText = 'Claim',
  warningText = 'By accepting this NFT collection you will automatically accept future deposits of it as well',
}) => {
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

  const nftTransactionItems = nftItems.map((n) => ({
    ...n,
    collectionName,
    type: WalletType.Flow,
  }));

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
          <YStack mb="$2">
            <ConfirmationAnimationSection imageUri={collectionLogoURI} transactionType="tokens" />
          </YStack>

          {/* Collection card */}
          <YStack bg="$bg1" rounded="$4" px="$4" py="$3">
            {/* Name row */}
            <XStack items="center" justify="space-between">
              <Text fontSize={15} fontWeight="600" color="$text1">
                {collectionName}
              </Text>
              <Text fontSize={13} color="$text2">
                {collectionSymbol}
              </Text>
            </XStack>

            {/* NFT preview - same style as send workflow */}
            <MultipleNFTsPreview
              nfts={nftTransactionItems}
              showEditButton={false}
              expandable={false}
              contentPadding="$0"
              bottomPadding="$2"
            />
          </YStack>

          {/* Receiver card */}
          <YStack bg="$bg1" rounded="$4" px="$4" py="$3">
            <AccountSelector
              currentAccount={selectedReceiver}
              accounts={allReceivers}
              onAccountSelect={handleAccountSelect}
              title=""
              showEditButton={allReceivers.length > 1}
              actionIcon="edit"
            />
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
