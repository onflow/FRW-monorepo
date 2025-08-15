import { ChevronDown, ChevronUp, Close, Edit } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, ScrollView, Image, View } from 'tamagui';

import { type NFTSendData } from './NFTSendPreview';
import { Text } from '../foundation/Text';

export interface MultipleNFTsPreviewProps {
  nfts: NFTSendData[];
  onRemoveNFT?: (nftId: string) => void;
  onEditPress?: () => void;
  maxVisibleThumbnails?: number;
  expandable?: boolean;
  thumbnailSize?: number;
  sectionTitle?: string;
  showTopDivider?: boolean;
}

interface NFTThumbnailProps {
  nft: NFTSendData;
  size: number;
  showOverlay?: boolean;
  overlayText?: string;
  borderRadius?: number;
}

const NFTThumbnail: React.FC<NFTThumbnailProps> = ({
  nft,
  size,
  showOverlay = false,
  overlayText,
  borderRadius = 14.4,
}) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = nft.image || nft.thumbnail;
  const displayImage = imageUrl && !imageError;

  return (
    <View
      width={size}
      height={size}
      rounded={borderRadius}
      bg="rgba(255, 255, 255, 0.05)"
      alignItems="center"
      justifyContent="center"
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
        <YStack alignItems="center" justifyContent="center" gap={4}>
          <YStack
            width={16}
            height={16}
            bg="rgba(255, 255, 255, 0.1)"
            rounded={4}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={8} color="rgba(255, 255, 255, 0.6)">
              🖼️
            </Text>
          </YStack>
          <Text fontSize={8} color="rgba(255, 255, 255, 0.6)">
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
            bg="rgba(0, 0, 0, 0.2)"
            rounded={borderRadius}
          />
          <Text position="absolute" fontSize={21.6} fontWeight="700" color="$white" opacity={0.6}>
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

const ExpandedNFTItem: React.FC<ExpandedNFTItemProps> = ({ nft, onRemove, itemHeight = 71 }) => {
  return (
    <XStack alignItems="center" gap={12} width="100%" height={71} px={0} py={0}>
      {/* NFT Thumbnail */}
      <NFTThumbnail nft={nft} size={53.44} borderRadius={16} />

      {/* NFT Details */}
      <YStack justifyContent="center" gap={6} flex={1} minWidth={0}>
        <Text
          fontSize={14}
          fontWeight="600"
          color="rgba(255, 255, 255, 0.8)"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {nft.name || 'Unnamed NFT'}
        </Text>
        <Text
          fontSize={14}
          fontWeight="400"
          color="rgba(255, 255, 255, 0.8)"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {nft.collection || 'Unknown Collection'}
        </Text>
      </YStack>

      {/* Remove Button */}
      {onRemove && (
        <XStack
          width={32}
          height={32}
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.8 }}
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
  onEditPress,
  maxVisibleThumbnails = 3,
  expandable = true,
  thumbnailSize = 77.33,
  sectionTitle = 'Send NFTs',
  showTopDivider = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCount = nfts.length;
  const visibleNFTs = nfts.slice(0, maxVisibleThumbnails);
  const remainingCount = Math.max(0, totalCount - maxVisibleThumbnails);
  const showOverlay = remainingCount > 0;

  if (isExpanded) {
    return (
      <YStack
        bg="rgba(255, 255, 255, 0.1)"
        rounded={16}
        p={16}
        pb={30}
        gap={12}
        width="100%"
        style={{ maxWidth: 400 }}
      >
        {/* Optional Top Divider for component composition */}
        {showTopDivider && <View height={1} bg="rgba(255, 255, 255, 0.1)" width="100%" />}

        {/* Send NFTs Header */}
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={12} fontWeight="400" color="rgba(255, 255, 255, 0.8)">
            {sectionTitle}
          </Text>
          {onEditPress && (
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

        {/* NFT Count and Collapse Button */}
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={20} fontWeight="500" color="$white" lineHeight="0.8em">
            {totalCount} NFT{totalCount !== 1 ? 's' : ''}
          </Text>
          {expandable && (
            <XStack
              alignItems="center"
              gap={4}
              pressStyle={{ opacity: 0.8 }}
              onPress={() => setIsExpanded(false)}
              cursor="pointer"
            >
              <ChevronUp size={24} color="rgba(255, 255, 255, 0.8)" />
            </XStack>
          )}
        </XStack>

        {/* Expanded List */}
        <ScrollView maxHeight={300} showsVerticalScrollIndicator={false}>
          <YStack gap={12}>
            {nfts.map((nft, index) => (
              <YStack key={nft.id} gap={8}>
                <ExpandedNFTItem nft={nft} onRemove={onRemoveNFT} />
                {/* Divider */}
                {index < nfts.length - 1 && (
                  <View height={1} bg="rgba(255, 255, 255, 0.1)" width="100%" />
                )}
              </YStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  return (
    <YStack
      bg="rgba(255, 255, 255, 0.1)"
      rounded={16}
      p={16}
      pb={30}
      gap={12}
      width="100%"
      style={{ maxWidth: 400 }}
    >
      {/* Optional Top Divider for component composition */}
      {showTopDivider && <View height={1} bg="rgba(255, 255, 255, 0.1)" width="100%" />}

      {/* Send NFTs Header */}
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize={12} fontWeight="400" color="rgba(255, 255, 255, 0.8)">
          {sectionTitle}
        </Text>
        {onEditPress && (
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

      {/* NFT Thumbnails Row */}
      <XStack alignItems="center" gap={14.4} width="100%">
        <XStack alignItems="center" gap={9}>
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
        {expandable && (
          <XStack
            alignItems="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => setIsExpanded(true)}
            cursor="pointer"
          >
            <ChevronDown size={21.6} color="#767676" />
          </XStack>
        )}
      </XStack>
    </YStack>
  );
};
