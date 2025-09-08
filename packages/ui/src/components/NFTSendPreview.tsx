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
}) => {
  const [imageError, setImageError] = useState(false);

  // Get the best available image URL
  const imageUrl = nft.image || nft.thumbnail;
  const displayImage = imageUrl && !imageError;

  return (
    <YStack
      bg="$light10"
      rounded={16}
      pt={contentPadding}
      px={contentPadding}
      pb={30}
      gap={12}
      width={343}
    >
      {/* Section Header */}
      <XStack items="center" justify="space-between" gap={15} width="100%">
        <Text fontSize={12} fontWeight="400" color="$light80" lineHeight={16} width={69}>
          {sectionTitle}
        </Text>
        {showEditButton && onEditPress && (
          <XStack items="center" justify="flex-end" gap={16}>
            <XStack
              width={24}
              height={24}
              items="center"
              justify="center"
              pressStyle={{ opacity: 0.7 }}
              onPress={onEditPress}
              cursor="pointer"
            >
              <Edit size={24} color="#767676" theme="outline" />
            </XStack>
          </XStack>
        )}
      </XStack>

      {/* NFT Preview */}
      <XStack gap={16} items="center" width={286} height={92}>
        {/* NFT Image */}
        <View width={imageSize} height={imageSize} rounded={16} overflow="hidden" bg="$light5">
          {displayImage ? (
            <Image
              source={{ uri: imageUrl }}
              width={imageSize}
              height={imageSize}
              onError={() => setImageError(true)}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <YStack
              flex={1}
              items="center"
              justify="center"
              bg="$light5"
              rounded={16}
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              <View
                width={32}
                height={32}
                bg="$light10"
                rounded={8}
                items="center"
                justify="center"
              >
                <View width={16} height={16} bg="rgba(255, 255, 255, 0.2)" rounded={4} />
              </View>
              <Text fontSize={10} color="rgba(255, 255, 255, 0.4)" mt={8} fontWeight="500">
                NFT
              </Text>
            </YStack>
          )}
        </View>

        {/* NFT Details */}
        <YStack width={169} height={50} gap={4}>
          {/* Collection and Badge Row */}
          <XStack items="center" gap={8} width={169}>
            {/* Collection Icon and Name */}
            <View width={21.15} height={21.15} items="center" justify="center">
              <Text fontSize={14} fontWeight="600" color="#FFFFFF">
                🏀
              </Text>
            </View>
            <Text
              fontSize={14}
              fontWeight="600"
              color="$white"
              lineHeight={20}
              numberOfLines={1}
              flex={1}
            >
              {nft.collection || 'NBA Top Shot'}
            </Text>

            {/* EVM Badge */}
            <View
              width={36}
              height={16}
              bg="#627EEA"
              rounded={17.61}
              items="center"
              justify="center"
            >
              <Text
                fontSize={9}
                fontWeight="400"
                color="$white"
                lineHeight={16}
                letterSpacing={0.16}
              >
                EVM
              </Text>
            </View>
          </XStack>

          {/* NFT Name */}
          <Text
            fontSize={20}
            fontWeight="500"
            color="$light80"
            lineHeight={16}
            width={169}
            height={32}
            numberOfLines={2}
          >
            {nft.name || 'Spring Tide #1'}
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );
};