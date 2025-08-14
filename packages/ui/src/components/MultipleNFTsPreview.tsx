import { ChevronDown, ChevronUp, Close } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, ScrollView, Image, View } from 'tamagui';

import { type NFTSendData } from './NFTSendPreview';
import { Button } from '../foundation/Button';
import { Text } from '../foundation/Text';

export interface MultipleNFTsPreviewProps {
  nfts: NFTSendData[];
  onRemoveNFT?: (nftId: string) => void;
  maxVisibleThumbnails?: number;
  expandable?: boolean;
  thumbnailSize?: number;
  backgroundColor?: string;
  borderRadius?: string | number;
  contentPadding?: number;
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

  return (
    <View
      width={size}
      height={size}
      rounded="$4"
      bg="$gray6"
      items="center"
      justify="center"
      overflow="hidden"
      position="relative"
    >
      {displayImage ? (
        <Image
          source={{ uri: imageUrl }}
          width={size}
          height={size}
          onError={() => setImageError(true)}
        />
      ) : (
        <YStack items="center" justify="center" gap="$1">
          <YStack width={16} height={16} bg="$gray8" rounded="$2" items="center" justify="center">
            <Text fontSize="$1" color="$gray11">
              🖼️
            </Text>
          </YStack>
          <Text fontSize="$1" color="$gray11">
            NFT
          </Text>
        </YStack>
      )}

      {/* Overlay */}
      {showOverlay && (
        <>
          <View
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.5)"
            rounded="$4"
          />
          <Text position="absolute" fontSize="$4" fontWeight="700" color="$white" opacity={0.8}>
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
  itemHeight?: number;
}

const ExpandedNFTItem: React.FC<ExpandedNFTItemProps> = ({ nft, onRemove, itemHeight = 70 }) => {
  return (
    <XStack items="center" gap="$3" p="$2" minHeight={itemHeight}>
      {/* NFT Thumbnail */}
      <NFTThumbnail nft={nft} size={60} />

      {/* NFT Details */}
      <YStack flex={1} gap="$1" justify="center">
        <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>
          {nft.name || 'Unnamed NFT'}
        </Text>
        <Text fontSize="$3" color="$gray11" numberOfLines={1}>
          {nft.collection || 'Unknown Collection'}
        </Text>
      </YStack>

      {/* Remove Button */}
      {onRemove && (
        <Button
          size="$2"
          variant="ghost"
          circular
          onPress={() => onRemove(nft.id)}
          icon={<Close size={16} color="$gray11" />}
        />
      )}
    </XStack>
  );
};

export const MultipleNFTsPreview: React.FC<MultipleNFTsPreviewProps> = ({
  nfts,
  onRemoveNFT,
  maxVisibleThumbnails = 3,
  expandable = true,
  thumbnailSize = 80,
  backgroundColor = 'transparent',
  borderRadius = '$4',
  contentPadding = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCount = nfts.length;
  const visibleNFTs = nfts.slice(0, maxVisibleThumbnails);
  const remainingCount = Math.max(0, totalCount - maxVisibleThumbnails);
  const showOverlay = remainingCount > 0;

  if (isExpanded) {
    return (
      <YStack bg={backgroundColor} rounded={borderRadius} p={contentPadding} gap="$3">
        {/* Header */}
        <XStack items="center" justify="space-between">
          <Text fontSize="$5" fontWeight="500" color="$color">
            {totalCount} NFT{totalCount !== 1 ? 's' : ''}
          </Text>
          {expandable && (
            <Button
              size="$2"
              variant="ghost"
              onPress={() => setIsExpanded(false)}
              icon={<ChevronUp size={20} />}
            />
          )}
        </XStack>

        {/* Expanded List */}
        <ScrollView maxHeight={300} showsVerticalScrollIndicator={false}>
          <YStack gap="$2">
            {nfts.map((nft, index) => (
              <YStack key={nft.id}>
                <ExpandedNFTItem nft={nft} onRemove={onRemoveNFT} />
                {/* Divider */}
                {index < nfts.length - 1 && <View height={1} bg="$gray6" mx="$2" />}
              </YStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  return (
    <YStack bg={backgroundColor} rounded={borderRadius} p={contentPadding}>
      <XStack items="center" justify="space-between">
        {/* NFT Thumbnails */}
        <XStack items="center" gap="$2">
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

        {/* Expand Button */}
        {expandable && totalCount > maxVisibleThumbnails && (
          <Button
            size="$2"
            variant="ghost"
            onPress={() => setIsExpanded(true)}
            icon={<ChevronDown size={20} />}
          />
        )}
      </XStack>

      {/* Summary Text */}
      <Text fontSize="$3" color="$gray11" mt="$2">
        {totalCount} NFT{totalCount !== 1 ? 's' : ''} selected
      </Text>
    </YStack>
  );
};
