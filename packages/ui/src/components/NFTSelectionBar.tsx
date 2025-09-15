import { ChevronUp, ChevronDown, Trash } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, ScrollView, Text, Image } from 'tamagui';

import type { NFTData } from './NFTGrid';

export interface NFTSelectionBarProps {
  selectedNFTs: NFTData[];
  onRemoveNFT?: (id: string) => void;
  onNFTPress?: (id: string) => void;
  onContinue?: () => void;
  continueText?: string;
  isEditing?: boolean;
  maxHeight?: string;
}

export function NFTSelectionBar({
  selectedNFTs,
  onRemoveNFT,
  onContinue,
  onNFTPress = (id: string) => {},
  continueText = 'Continue',
  isEditing = false,
  maxHeight = '$20',
}: NFTSelectionBarProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded so trash icons are visible

  if (selectedNFTs.length === 0) {
    console.log('🔍 NFTSelectionBar: No selected NFTs, returning null');
    return null;
  }

  const handleToggleExpanded = () => {
    console.log('🔄 Toggling selection bar expanded:', !isExpanded);
    setIsExpanded(!isExpanded);
  };

  const renderNFTItem = (nft: NFTData) => {
    return (
      <XStack key={nft.id} items="center" justify="space-between" gap="$2" width="100%">
        <XStack
          items="center"
          gap="$2"
          onPress={() => onNFTPress(nft.id)}
          cursor="pointer"
          flex={1}
        >
          {/* NFT Image */}
          <YStack
            rounded="$4"
            overflow="hidden"
            minW="$13"
            minH="$13"
            w="$13"
            h="$13"
            bg="$background4"
            flexShrink={0}
          >
            <Image src={nft.thumbnail || nft.image} width="$13" height="$13" objectFit="cover" />
          </YStack>

          {/* NFT Info */}
          <YStack gap="$1.5" flex={1} justify="center">
            <Text fontSize="$4" fontWeight="600" color="$text2" numberOfLines={1}>
              {nft.name}
            </Text>

            {nft.collection && (
              <Text fontSize="$4" fontWeight="400" color="$text2" numberOfLines={1}>
                {nft.collection}
              </Text>
            )}
          </YStack>
        </XStack>

        {/* Remove Button */}
        {onRemoveNFT && (
          <XStack
            minWidth={32}
            minHeight={32}
            items="center"
            justify="center"
            bg="$red"
            borderRadius="$2"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => {
              console.log('🗑️ Trash icon clicked for NFT:', nft.id);
              onRemoveNFT(nft.id);
            }}
            cursor="pointer"
          >
            <Trash size={24} color="rgba(255, 255, 255, 0.5)" theme="outline" />
          </XStack>
        )}
      </XStack>
    );
  };

  return (
    <YStack
      pos="absolute"
      b="$0"
      l="$0"
      r="$0"
      width="100%"
      bg="$bg2"
      borderTopLeftRadius="$4"
      borderTopRightRadius="$4"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: -2 }}
      shadowOpacity={0.1}
      shadowRadius="$2"
      elevation={8}
      pt="$3"
      px="$4"
      pb="$5"
      maxH="75vh"
    >
      <YStack gap="$4" flex={1}>
        {/* Header */}
        <XStack items="center" justify="space-between" pt="$2.5" position="relative">
          <Text fontSize="$4" fontWeight="400" color="$text">
            {selectedNFTs.length} Selected NFT{selectedNFTs.length === 1 ? '' : 's'}
          </Text>

          <XStack
            pos="absolute"
            r="$0"
            t="$2.5"
            width="$6"
            height="$6"
            items="center"
            justify="center"
            onPress={handleToggleExpanded}
            cursor="pointer"
            pressStyle={{ opacity: 0.7 }}
          >
            {isExpanded ? (
              <ChevronDown size={20} color="#FFFFFF" theme="outline" />
            ) : (
              <ChevronUp size={20} color="#FFFFFF" theme="outline" />
            )}
          </XStack>
        </XStack>

        {/* Expandable Content */}
        {isExpanded && (
          <YStack maxH="65vh" bg="$backgroundStrong" rounded="$4" gap="$0.5" flex={1}>
            <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: '65vh' }} p="$2">
              <YStack gap="$2">
                {selectedNFTs.map((nft, index) => (
                  <React.Fragment key={nft.id}>
                    {renderNFTItem(nft)}
                    {index < selectedNFTs.length - 1 && (
                      <YStack py="$1" items="center" width="100%">
                        <YStack height="$0.25" bg="$background4" width="100%" />
                      </YStack>
                    )}
                  </React.Fragment>
                ))}
              </YStack>
            </ScrollView>
          </YStack>
        )}

        {/* Action Button - Always visible at bottom */}
        {onContinue && (
          <YStack
            data-testid={'confirm'}
            shrink={0}
            bg="#FFFFFF"
            rounded="$4"
            height={56}
            items="center"
            justify="center"
            disabled={selectedNFTs.length === 0}
            onPress={onContinue}
          >
            <Text fontSize="$5" fontWeight="600" color="#000000">
              Confirm {selectedNFTs.length} NFT{selectedNFTs.length === 1 ? '' : 's'}
            </Text>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
}
