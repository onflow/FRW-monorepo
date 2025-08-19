import { ChevronUp, ChevronDown, Trash } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, ScrollView, Text, Image } from 'tamagui';

import type { NFTData } from './NFTGrid';
import { Button } from '../foundation/Button';

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
    <XStack key={nft.id} items="center" justify="space-between" gap={8}>
      <XStack items="center" gap={8}>
        {/* NFT Image */}
        <YStack borderRadius={16} overflow="hidden" width={53.44} height={53.44} bg="$bg3">
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
        <YStack gap={6} width={201} height={35} justify="center">
          <Text fontSize={14} fontWeight="600" color="rgba(255, 255, 255, 0.8)" numberOfLines={1}>
            {nft.name}
          </Text>

          {nft.collection && (
            <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.8)" numberOfLines={1}>
              {nft.collection}
            </Text>
          )}
        </YStack>
      </XStack>

      {/* Remove Button */}
      {onRemoveNFT && (
        <XStack width={24} height={24} onPress={() => onRemoveNFT(nft.id)} cursor="pointer">
          <Trash size={24} color="#767676" />
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
      width={375}
      bg="#141415"
      borderTopLeftRadius={16}
      borderTopRightRadius={16}
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: -2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
      elevation={8}
      pt={12}
      px={16}
      pb={20}
    >
      <YStack gap={16}>
        {/* Header */}
        <XStack items="center" justify="space-between" pt={10} position="relative">
          <Text fontSize={14} fontWeight="400" color="#FFFFFF">
            {selectedNFTs.length} Selected NFTs
          </Text>

          <XStack
            position="absolute"
            right={0}
            top={10}
            onPress={handleToggleExpanded}
            cursor="pointer"
          >
            {isExpanded ? (
              <ChevronDown size={24} color="#FFFFFF" />
            ) : (
              <ChevronUp size={24} color="#FFFFFF" />
            )}
          </XStack>
        </XStack>

        {/* Expandable Content */}
        {isExpanded && (
          <YStack maxHeight={maxHeight} bg="#141415" borderRadius={16} gap={2} pb={8}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack>
                {selectedNFTs.map((nft, index) => (
                  <React.Fragment key={nft.id}>
                    {renderNFTItem(nft)}
                    {index < selectedNFTs.length - 1 && (
                      <YStack py={8} items="center">
                        <YStack height={1} bg="rgba(255, 255, 255, 0.15)" width={343} />
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
            style={{
              backgroundColor: '#FFFFFF',
              color: '#252B34',
              borderColor: '#FFFFFF',
              borderWidth: 1,
              borderRadius: 16,
            }}
            fontSize={16}
            fontWeight="600"
            lineHeight={1.2}
          >
            Confirm {selectedNFTs.length} NFTs
          </Button>
        )}
      </YStack>
    </YStack>
  );
}
