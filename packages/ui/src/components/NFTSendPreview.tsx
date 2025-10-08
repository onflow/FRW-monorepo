import { Edit } from '@onflow/frw-icons';
import type { NFTTransactionData } from '@onflow/frw-types';
import React, { useState } from 'react';
import { YStack, XStack, Image, View } from 'tamagui';

import { Text } from '../foundation/Text';

export interface NFTSendPreviewProps {
  nft: NFTTransactionData;
  onEditPress?: () => void;
  showEditButton?: boolean;
  sectionTitle?: string;
  imageSize?: number;
  backgroundColor?: string;
  borderRadius?: any;
  contentPadding?: string;
}

export const NFTSendPreview: React.FC<NFTSendPreviewProps> = ({
  nft,
  onEditPress,
  showEditButton = true,
  sectionTitle = 'Send NFTs',
  imageSize = 76,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  borderRadius = '$4',
  contentPadding = '$4',
}) => {
  const [imageError, setImageError] = useState(false);

  // Get the best available image URL
  const imageUrl = nft.thumbnail || nft.postMedia?.image || '';
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
        <Text fontSize="$3" fontWeight="400" color="$color" opacity={0.8} flex={1}>
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
            <View width={imageSize} height={imageSize} overflow="hidden" rounded="$4">
              <Image
                source={{ uri: imageUrl }}
                width="100%"
                height="100%"
                onError={() => setImageError(true)}
              />
            </View>
          ) : (
            <YStack
              flex={1}
              items="center"
              justify="center"
              bg="$light5"
              rounded="$4"
              borderWidth="$0.25"
              borderColor="$text3"
            ></YStack>
          )}
        </View>

        {/* NFT Details */}
        <YStack flex={1} gap="$1">
          {/* Collection Name with EVM Badge */}
          <XStack items="center" gap="$2">
            <Text
              fontSize={14}
              fontWeight="600"
              color="$color"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {nft.collectionName || ''}
            </Text>

            {/* EVM Badge - Only show for EVM NFTs */}
            {(nft.type === 'evm' || nft.evmAddress) && (
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
            color="$color"
            opacity={0.8}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {nft.name}
          </Text>

          {/* ERC1155 Total Amount */}
          {nft.contractType === 'ERC1155' && nft.amount && Number(nft.amount) > 0 && (
            <Text fontSize={12} fontWeight="400" color="$color" opacity={0.6} numberOfLines={1}>
              ({Number(nft.amount).toLocaleString()} Tokens)
            </Text>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
};
