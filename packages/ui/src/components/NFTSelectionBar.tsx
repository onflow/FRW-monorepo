import { ChevronUp, ChevronDown, Trash } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, ScrollView, Text, Button, Image } from 'tamagui';

import type { NFTData } from './NFTGrid';

export interface NFTSelectionBarProps {
  selectedNFTs: NFTData[];
  onRemoveNFT?: (id: string) => void;
  onContinue?: () => void;
  continueText?: string;
  isEditing?: boolean;
  maxHeight?: number;
}

export function NFTSelectionBar({
  selectedNFTs,
  onRemoveNFT,
  onContinue,
  continueText = 'Continue',
  isEditing = false,
  maxHeight = 300,
}: NFTSelectionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedNFTs.length === 0) {
    return null;
  }

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderNFTItem = (nft: NFTData) => (
    <XStack key={nft.id} items="center" justify="space-between" py="$3" px="$2">
      <XStack items="center" gap="$3" flex={1}>
        {/* NFT Image */}
        <YStack borderRadius="$4" overflow="hidden" width={54} height={54} bg="$bg3">
          <Image
            src={nft.thumbnail || nft.image}
            width="100%"
            height="100%"
            resizeMode="cover"
            fallback={
              <YStack flex={1} items="center" justify="center" bg="$bg3">
                <Text fontSize="$2" color="$textTertiary">
                  NFT
                </Text>
              </YStack>
            }
          />
        </YStack>

        {/* NFT Info */}
        <YStack gap="$1" flex={1}>
          <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>
            {nft.name}
          </Text>

          {nft.collection && (
            <Text fontSize="$3" color="$textSecondary" numberOfLines={1}>
              {nft.collection}
            </Text>
          )}
        </YStack>
      </XStack>

      {/* Remove Button */}
      {onRemoveNFT && (
        <Button
          size="$3"
          variant="ghost"
          circular
          icon={Trash}
          onPress={() => onRemoveNFT(nft.id)}
          color="$textSecondary"
        />
      )}
    </XStack>
  );

  return (
    <YStack
      pos="absolute"
      bottom={0}
      left={0}
      right={0}
      bg="$bg1"
      borderTopLeftRadius="$5"
      borderTopRightRadius="$5"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: -2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
      elevation={8}
    >
      {/* Header */}
      <XStack
        items="center"
        justify="space-between"
        px="$4"
        py="$3"
        borderBottomWidth={isExpanded ? 1 : 0}
        borderBottomColor="$borderColor"
      >
        <Text fontSize="$5" fontWeight="600" color="$color">
          {selectedNFTs.length} Selected
        </Text>

        <Button
          size="$3"
          variant="ghost"
          circular
          icon={isExpanded ? ChevronDown : ChevronUp}
          onPress={handleToggleExpanded}
          color="$textSecondary"
        />
      </XStack>

      {/* Expandable Content */}
      {isExpanded && (
        <YStack maxHeight={maxHeight}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack px="$4" py="$2">
              {selectedNFTs.map((nft, index) => (
                <React.Fragment key={nft.id}>
                  {renderNFTItem(nft)}
                  {index < selectedNFTs.length - 1 && (
                    <YStack height={1} bg="$borderColor" mx="$2" opacity={0.5} />
                  )}
                </React.Fragment>
              ))}
            </YStack>
          </ScrollView>
        </YStack>
      )}

      {/* Action Button */}
      {onContinue && (
        <YStack px="$4" py="$4">
          <Button
            size="$4"
            bg="$primary"
            color="white"
            fontWeight="600"
            onPress={onContinue}
            disabled={selectedNFTs.length === 0}
            opacity={selectedNFTs.length === 0 ? 0.5 : 1}
          >
            {continueText}
          </Button>
        </YStack>
      )}
    </YStack>
  );
}
