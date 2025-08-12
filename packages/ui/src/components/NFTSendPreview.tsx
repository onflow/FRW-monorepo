import { Edit } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, Image, View } from 'tamagui';

import { Button } from '../foundation/Button';
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
}

export const NFTSendPreview: React.FC<NFTSendPreviewProps> = ({
  nft,
  onEditPress,
  showEditButton = true,
  sectionTitle = 'Send NFT',
  imageSize = 92,
  backgroundColor = '$gray1',
  borderRadius = '$4',
  contentPadding = 16,
}) => {
  const [imageError, setImageError] = useState(false);

  // Get the best available image URL
  const imageUrl = nft.image || nft.thumbnail;
  const displayImage = imageUrl && !imageError;

  return (
    <YStack bg={backgroundColor} rounded={borderRadius} p={contentPadding} gap="$3">
      {/* Section Header */}
      <XStack items="center" justify="space-between">
        <Text fontSize="$3" fontWeight="600" color="$gray11">
          {sectionTitle}
        </Text>
        {showEditButton && onEditPress && (
          <Button size="$2" variant="ghost" onPress={onEditPress} icon={<Edit size={16} />}>
            Edit
          </Button>
        )}
      </XStack>

      {/* NFT Preview */}
      <XStack gap="$4" items="center">
        {/* NFT Image */}
        <View
          width={imageSize}
          height={imageSize}
          rounded="$4"
          bg="$gray6"
          items="center"
          justify="center"
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
            <YStack items="center" justify="center" gap="$2">
              <YStack
                width={24}
                height={24}
                bg="$gray8"
                rounded="$2"
                items="center"
                justify="center"
              >
                <Text fontSize="$2" color="$gray11">
                  🖼️
                </Text>
              </YStack>
              <Text fontSize="$2" color="$gray11" textAlign="center">
                NFT
              </Text>
            </YStack>
          )}
        </View>

        {/* NFT Details */}
        <YStack flex={1} gap="$2" justify="center">
          {/* Collection Name */}
          <YStack>
            <Text fontSize="$3" fontWeight="600" color="$color" numberOfLines={1}>
              {nft.collection || 'Unknown Collection'}
            </Text>
          </YStack>

          {/* NFT Name */}
          <YStack>
            <Text fontSize="$5" fontWeight="500" color="$gray11" numberOfLines={2}>
              {nft.name || 'Unnamed NFT'}
            </Text>
          </YStack>

          {/* Description (if available) */}
          {nft.description && (
            <YStack mt="$1">
              <Text fontSize="$2" color="$gray10" numberOfLines={2}>
                {nft.description}
              </Text>
            </YStack>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
};
