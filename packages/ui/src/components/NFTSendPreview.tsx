import { Edit } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, Image, View } from 'tamagui';

import { Text } from '../foundation/Text';

export interface NFTSendData {
  id: string;
  name: string;
  image?: string;
  thumbnail?: string;
  collection: string;
  collectionContractName?: string;
  description?: string;
}

export interface NFTSendPreviewProps {
  nft: NFTSendData;
  onEditPress?: () => void;
  showEditButton?: boolean;
  sectionTitle?: string;
  imageSize?: number;
  backgroundColor?: string;
  borderRadius?: string | number;
  contentPadding?: number;
  showEvmChip?: boolean;
}

export const NFTSendPreview: React.FC<NFTSendPreviewProps> = ({
  nft,
  onEditPress,
  showEditButton = true,
  sectionTitle = 'Send NFTs',
  imageSize = 92.17,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  borderRadius = 16,
  contentPadding = 16,
  showEvmChip = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Get the best available image URL
  const imageUrl = nft.image || nft.thumbnail;
  const displayImage = imageUrl && !imageError;

  return (
    <YStack
      bg="rgba(255, 255, 255, 0.1)"
      rounded="$4"
      padding={contentPadding}
      paddingBottom={30}
      gap={12}
      width="100%"
      style={{ maxWidth: 343 }}
    >
      {/* Section Header */}
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap={8}>
          <Text fontSize={12} fontWeight="500" color="$white">
            {sectionTitle}
          </Text>
          {showEvmChip && (
            <View
              bg="#627EEA"
              rounded={18}
              px={8}
              py={0}
              height={16}
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize={9}
                fontWeight="400"
                color="$white"
                letterSpacing={0.16}
                lineHeight={16}
              >
                EVM
              </Text>
            </View>
          )}
        </XStack>
        {showEditButton && onEditPress && (
          <XStack
            alignItems="center"
            gap={4}
            pressStyle={{ opacity: 0.8 }}
            onPress={onEditPress}
            cursor="pointer"
          >
            <Edit size={24} color="rgba(255, 255, 255, 0.8)" />
          </XStack>
        )}
      </XStack>

      {/* NFT Preview */}
      <XStack gap={12} alignItems="flex-start">
        {/* NFT Image */}
        <View
          width={imageSize}
          height={imageSize}
          rounded="$4"
          bg="rgba(255, 255, 255, 0.05)"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          {displayImage ? (
            <Image
              source={{ uri: imageUrl }}
              width={imageSize}
              height={imageSize}
              onError={() => setImageError(true)}
            />
          ) : (
            <YStack alignItems="center" justifyContent="center" gap={4}>
              <YStack
                width={24}
                height={24}
                bg="rgba(255, 255, 255, 0.1)"
                rounded="$2"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={12} color="rgba(255, 255, 255, 0.6)">
                  🖼️
                </Text>
              </YStack>
              <Text fontSize={12} color="rgba(255, 255, 255, 0.6)" textAlign="center">
                NFT
              </Text>
            </YStack>
          )}
        </View>

        {/* NFT Details */}
        <YStack flex={1} gap={4}>
          {/* Collection Name */}
          <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.8)" numberOfLines={1}>
            {nft.collection || 'Unknown Collection'}
          </Text>

          {/* NFT Name */}
          <Text fontSize={20} fontWeight="500" color="$white" numberOfLines={2} lineHeight="$1">
            {nft.name || 'Unnamed NFT'}
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );
};
