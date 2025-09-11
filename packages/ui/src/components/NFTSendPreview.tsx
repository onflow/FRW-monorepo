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
  type?: 'evm' | 'flow'; // determines if EVM badge should show
}

export interface NFTSendPreviewProps {
  nft: NFTSendData;
  onEditPress?: () => void;
  showEditButton?: boolean;
  sectionTitle?: string;
  imageSize?: string;
  backgroundColor?: string;
  borderRadius?: any;
  contentPadding?: string;
}

export const NFTSendPreview: React.FC<NFTSendPreviewProps> = ({
  nft,
  onEditPress,
  showEditButton = true,
  sectionTitle = 'Send NFTs',
  imageSize = '$19',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  borderRadius = '$4',
  contentPadding = '$4',
}) => {
  const [imageError, setImageError] = useState(false);

  // Get the best available image URL
  const imageUrl = nft.image || nft.thumbnail;
  const displayImage = imageUrl && !imageError;

  return (
    <YStack
      bg={backgroundColor}
      rounded={borderRadius}
      pt={contentPadding}
      px={contentPadding}
      pb="$7"
      gap="$3"
      width="100%"
    >
      {/* Section Header */}
      <XStack items="center" justify="space-between" gap="$3.5" width="100%">
        <Text fontSize="$3" fontWeight="400" opacity={0.8} flex={1}>
          {sectionTitle}
        </Text>
        {showEditButton && onEditPress && (
          <XStack items="center" justify="flex-end" gap="$4">
            <XStack
              width="$6"
              height="$6"
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
      <XStack gap="$4" items="center" width="100%">
        {/* NFT Image */}
        <View width={imageSize} height={imageSize} rounded="$4" overflow="hidden" bg="$bg1">
          {displayImage ? (
            <Image
              src={imageUrl}
              width={imageSize}
              height={imageSize}
              onError={() => setImageError(true)}
              objectFit="cover"
            />
          ) : (
            <YStack
              flex={1}
              items="center"
              justify="center"
              bg="$light5"
              rounded="$4"
              borderWidth="$0.25"
              borderColor="$text3"
            >
              <View
                width="$8"
                height="$8"
                bg="$light10"
                rounded="$2"
                items="center"
                justify="center"
              >
                <View width="$4" height="$4" opacity={0.2} rounded="$1" />
              </View>
              <Text fontSize="$2.5" opacity={0.4} mt="$2" fontWeight="500">
                NFT
              </Text>
            </YStack>
          )}
        </View>

        {/* NFT Details */}
        <YStack flex={1} gap="$1">
          {/* Collection Name with EVM Badge */}
          <XStack items="center" gap="$2">
            <Text
              fontSize={14}
              fontWeight="600"
              color="$white"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {nft.collection}
            </Text>

            {/* EVM Badge - Only show for EVM NFTs */}
            {nft.type === 'evm' && (
              <XStack
                bg="$accentEVM"
                rounded="$4"
                px={4}
                items="center"
                justify="center"
                height={16}
              >
                <Text
                  fontSize={8}
                  fontWeight="400"
                  color="$white"
                  lineHeight={9.7}
                  letterSpacing={0.128}
                >
                  EVM
                </Text>
              </XStack>
            )}
          </XStack>

          {/* NFT Name */}
          <Text
            fontSize={14}
            fontWeight="400"
            color="rgba(255, 255, 255, 0.8)"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {nft.name}
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );
};
