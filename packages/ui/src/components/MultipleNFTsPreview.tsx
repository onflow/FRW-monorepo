import { ChevronDown, ChevronUp, Trash, Edit } from '@onflow/frw-icons';
import { isDarkMode } from '@onflow/frw-utils';
import React, { useState } from 'react';
import { YStack, XStack, ScrollView, Image, View, useTheme } from 'tamagui';

import { type NFTSendData } from './NFTSendPreview';
import { Text } from '../foundation/Text';

export interface MultipleNFTsPreviewProps {
  nfts: NFTSendData[];
  onRemoveNFT?: (nftId: string) => void;
  onEditPress?: () => void;
  showEditButton?: boolean;
  sectionTitle?: string;
  maxVisibleThumbnails?: number;
  expandable?: boolean;
  thumbnailSize?: number;
  backgroundColor?: string;
  borderRadius?: string | number;
  contentPadding?: string;
  unnamedNFTText?: string;
  unknownCollectionText?: string;
  noNFTsSelectedText?: string;
}

interface NFTThumbnailProps {
  nft: NFTSendData;
  size: number;
  showOverlay?: boolean;
  overlayText?: string;
}

const NFTThumbnail: React.FC<NFTThumbnailProps> = ({
  nft,
  size,
  showOverlay = false,
  overlayText,
}) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = nft.image || nft.thumbnail;
  const displayImage = imageUrl && !imageError;

  // Theme-aware placeholder background
  const theme = useTheme();
  const isCurrentlyDarkMode = isDarkMode(theme);
  const placeholderBackground = isCurrentlyDarkMode ? '$light10' : '$gray7';

  return (
    <View
      width={size}
      height={size}
      rounded={14.4}
      bg="rgba(255, 255, 255, 0.05)"
      items="center"
      justify="center"
      overflow="hidden"
      position="relative"
    >
      {displayImage ? (
        <View width="100%" height="100%" overflow="hidden" rounded={14.4}>
          <Image src={imageUrl} width="100%" height="100%" onError={() => setImageError(true)} />
        </View>
      ) : (
        <View flex={1} bg={placeholderBackground} rounded={14.4} />
      )}

      {/* Overlay */}
      {showOverlay && (
        <>
          <View
            position="absolute"
            bg="rgba(0, 0, 0, 0.6)"
            rounded={14.4}
            style={{ top: -0.5, left: 0, right: 0, bottom: 0 }}
          />
          <Text position="absolute" fontSize={21.6} fontWeight="700" color="$white" opacity={1}>
            {overlayText}
          </Text>
        </>
      )}
    </View>
  );
};

interface ExpandedNFTItemProps {
  nft: NFTSendData;
  onRemove?: (nftId: string) => void;
  unnamedNFTText?: string;
  unknownCollectionText?: string;
}

const ExpandedNFTItem: React.FC<ExpandedNFTItemProps> = ({
  nft,
  onRemove,
  unnamedNFTText = 'Unnamed NFT',
  unknownCollectionText = 'Unknown Collection',
}) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = nft.image || nft.thumbnail;
  const displayImage = imageUrl && !imageError;

  // Theme-aware placeholder background
  const theme = useTheme();
  const isCurrentlyDarkMode = isDarkMode(theme);
  const placeholderBackground = isCurrentlyDarkMode ? '$light10' : '$gray7';

  return (
    <XStack items="center" gap={8} height={71}>
      {/* NFT Image */}
      <View
        width={53.44}
        height={53.44}
        rounded={16}
        bg="$light5"
        items="center"
        justify="center"
        overflow="hidden"
      >
        {displayImage ? (
          <View width={53.44} height={53.44} overflow="hidden" rounded={16}>
            <Image
              source={{ uri: imageUrl }}
              width="100%"
              height="100%"
              onError={() => setImageError(true)}
            />
          </View>
        ) : (
          <View flex={1} bg={placeholderBackground} rounded={16} />
        )}
      </View>

      {/* NFT Details */}
      <YStack flex={1} justify="center" gap={2}>
        <Text fontSize={14} fontWeight="600" color="$color" numberOfLines={1}>
          {nft.name || unnamedNFTText}
        </Text>
        <Text fontSize={14} fontWeight="400" color="$color" numberOfLines={1}>
          {nft.collection || unknownCollectionText}
        </Text>
      </YStack>

      {/* Remove Button */}
      {onRemove && (
        <XStack
          width={24}
          height={24}
          items="center"
          justify="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => onRemove(nft.id)}
          cursor="pointer"
        >
          <Trash size={24} color="#767676" theme="outline" />
        </XStack>
      )}
    </XStack>
  );
};

export const MultipleNFTsPreview: React.FC<MultipleNFTsPreviewProps> = ({
  nfts,
  onRemoveNFT,
  onEditPress,
  showEditButton = true,
  sectionTitle = 'Send NFTs',
  maxVisibleThumbnails = 3,
  expandable = true,
  thumbnailSize = 77.33,
  backgroundColor = 'transparent',
  borderRadius = 14.4,
  contentPadding = '$0',
  unnamedNFTText = 'Unnamed NFT',
  unknownCollectionText = 'Unknown Collection',
  noNFTsSelectedText = 'No NFTs selected',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCount = nfts.length;
  const visibleNFTs = nfts.slice(0, maxVisibleThumbnails);
  const remainingCount = Math.max(0, totalCount - maxVisibleThumbnails);
  const showOverlay = remainingCount > 0;

  // Handle empty state
  if (totalCount === 0) {
    return (
      <YStack bg={backgroundColor} borderRadius={borderRadius} padding={contentPadding} gap={12}>
        {/* Empty State */}
        <XStack items="center" justify="center" gap={8} width={304} height={thumbnailSize}>
          <Text fontSize={14} color="$textMuted" fontWeight="400">
            {noNFTsSelectedText}
          </Text>
        </XStack>
      </YStack>
    );
  }

  if (isExpanded) {
    return (
      <YStack
        mt={'$2'}
        bg={backgroundColor}
        borderRadius={borderRadius}
        padding={contentPadding}
        pb="$7"
        gap="$3"
      >
        {/* Section Header */}
        <XStack items="center" justify="space-between" gap={15} width="100%">
          {/* NFT Count */}
          <Text fontSize={20} fontWeight="500" color="$color" lineHeight={24}>
            {totalCount} NFT{totalCount !== 1 ? 's' : ''}
          </Text>

          {/* Action Buttons */}
          <XStack items="center" gap={12}>
            {showEditButton && onEditPress && (
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
            )}
            {expandable && (
              <XStack
                width={24}
                height={24}
                items="center"
                justify="center"
                onPress={() => setIsExpanded(false)}
                cursor="pointer"
              >
                <ChevronUp size={24} color="#767676" theme="outline" />
              </XStack>
            )}
          </XStack>
        </XStack>

        {/* Expanded List */}
        <ScrollView height="auto" showsVerticalScrollIndicator={false}>
          <YStack gap="$2">
            {nfts.map((nft, index) => (
              <YStack key={nft.id}>
                <ExpandedNFTItem
                  nft={nft}
                  onRemove={onRemoveNFT}
                  unnamedNFTText={unnamedNFTText}
                  unknownCollectionText={unknownCollectionText}
                />
                {/* Divider */}
                {index < nfts.length - 1 && <View height={1} bg="$gray6" marginHorizontal="$2" />}
              </YStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  return (
    <YStack
      mt={'$2'}
      bg={backgroundColor}
      borderRadius={borderRadius}
      padding={contentPadding}
      pb="$7"
      gap={12}
    >
      {/* Section Header */}
      {showEditButton && onEditPress && (
        <XStack items="center" justify="flex-end" gap={15} width="100%">
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

      {/* NFT Preview Row */}
      <XStack items="center" justify="space-between" gap={8} width="100%">
        {/* NFT Thumbnails */}
        <XStack items="center" gap={8}>
          {visibleNFTs.map((nft, index) => {
            const isLast = index === visibleNFTs.length - 1;
            const shouldShowOverlay = isLast && showOverlay;

            return (
              <NFTThumbnail
                key={nft.id}
                nft={nft}
                size={thumbnailSize}
                showOverlay={shouldShowOverlay}
                overlayText={`+${remainingCount}`}
              />
            );
          })}
        </XStack>

        {/* Expand Button at the end */}
        {expandable && (
          <XStack
            width={24}
            height={24}
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setIsExpanded(true)}
            cursor="pointer"
          >
            <ChevronDown size={24} color="#767676" theme="outline" />
          </XStack>
        )}
      </XStack>
    </YStack>
  );
};
