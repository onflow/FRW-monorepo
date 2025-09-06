import { ChevronUp, ChevronDown, Trash } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, ScrollView, Text, Image } from 'tamagui';

import type { NFTData } from './NFTGrid';
import { Button } from '../foundation/Button';

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
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedNFTs.length === 0) {
    return null;
  }

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderNFTItem = (nft: NFTData) => (
    <XStack key={nft.id} items="center" justify="space-between" gap="$2">
      <XStack items="center" gap="$2" onPress={() => onNFTPress(nft.id)} cursor="pointer">
        {/* NFT Image */}
        <YStack borderRadius="$4" overflow="hidden" width="$13" height="$13" bg="$background4">
          <Image
            src={nft.thumbnail || nft.image}
            width="100%"
            height="100%"
            resizeMode="cover"
            fallback={
              <YStack flex={1} items="center" justify="center" bg="$bg1">
                <Text fontSize="$2" color="$textTertiary">
                  NFT
                </Text>
              </YStack>
            }
          />
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
          width="$6"
          height="$6"
          items="center"
          justify="center"
          onPress={() => onRemoveNFT(nft.id)}
          cursor="pointer"
          pressStyle={{ opacity: 0.7 }}
        >
          <Trash size={20} color="#767676" theme="outline" />
        </XStack>
      )}
    </XStack>
  );

  return (
    <YStack
      pos="absolute"
      bottom={0}
      left={0}
      right={0}
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
    >
      <YStack gap="$4">
        {/* Header */}
        <XStack items="center" justify="space-between" pt="$2.5" position="relative">
          <Text fontSize="$3.5" fontWeight="400" color="$text">
            {selectedNFTs.length} Selected NFT{selectedNFTs.length === 1 ? '' : 's'}
          </Text>

          <XStack
            position="absolute"
            right={0}
            top="$2.5"
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
          <YStack
            maxH={maxHeight}
            minH={30 + selectedNFTs.length * 50}
            bg="$backgroundStrong"
            borderRadius="$4"
            gap="$0.5"
            pb="$2"
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack>
                {selectedNFTs.map((nft, index) => (
                  <React.Fragment key={nft.id}>
                    {renderNFTItem(nft)}
                    {index < selectedNFTs.length - 1 && (
                      <YStack py="$2" items="center" width="100%">
                        <YStack height="$0.25" bg="$background4" width="100%" />
                      </YStack>
                    )}
                  </React.Fragment>
                ))}
              </YStack>
            </ScrollView>
          </YStack>
        )}

        {/* Action Button */}
        {onContinue && (
          <Button
            variant="secondary"
            size="large"
            fullWidth
            disabled={selectedNFTs.length === 0}
            onPress={onContinue}
            bg="$white"
            borderColor="$bg1"
            borderWidth="$0.25"
            borderRadius="$4"
          >
            <Text fontSize="$5" fontWeight="600" color="$black">
              Confirm {selectedNFTs.length} NFT{selectedNFTs.length === 1 ? '' : 's'}
            </Text>
          </Button>
        )}
      </YStack>
    </YStack>
  );
}
