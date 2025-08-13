import { CheckCircleFill } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, Text, Image } from 'tamagui';

import type { NFTData } from './NFTGrid';

export interface NFTCardProps {
  nft: NFTData;
  selected?: boolean;
  onPress?: () => void;
  onSelect?: () => void;
  showAmount?: boolean;
  aspectRatio?: number;
  size?: 'small' | 'medium' | 'large';
  collectionAvatar?: string;
  accountEmoji?: string;
  accountAvatar?: string;
}

export function NFTCard({
  nft,
  selected = false,
  onPress,
  onSelect,
  showAmount = false,
  aspectRatio = 1,
  size = 'medium',
  collectionAvatar,
  accountEmoji,
  accountAvatar,
}: NFTCardProps) {
  const width = size === 'large' ? 200 : size === 'medium' ? 164 : 120;

  return (
    <YStack
      width={width}
      gap="$1"
      pressStyle={{ bg: 'transparent' }}
      onPress={onPress}
      pos="relative"
    >
      {/* NFT Image */}
      <YStack
        borderRadius="$4"
        overflow="hidden"
        aspectRatio={aspectRatio}
        bg="$gray3"
        pos="relative"
        pressStyle={{ bg: 'transparent' }}
        s
        onPress={onPress}
      >
        {nft.thumbnail || nft.image ? (
          <Image src={nft.thumbnail || nft.image} width="100%" height="100%" resizeMode="cover" />
        ) : (
          <YStack flex={1} items="center" justify="center" bg="$gray3" borderRadius="$4">
            <Text fontSize="$6" opacity={0.3}>
              🖼️
            </Text>
            <Text fontSize="$2" color="$gray8" mt="$2">
              NFT
            </Text>
          </YStack>
        )}

        {/* Amount Badge for ERC1155 tokens */}
        {showAmount && nft.amount && (
          <YStack
            pos="absolute"
            top="$2"
            left="$2"
            bg="$backgroundTransparent"
            borderRadius="$6"
            px="$2"
            py="$1"
            backdropFilter="blur(8px)"
          >
            <Text fontSize="$2" fontWeight="600" color="$color">
              {nft.amount}
            </Text>
          </YStack>
        )}

        {/* Selection Indicator - top right */}
        {selected && (
          <YStack pos="absolute" top="$0.05" right="$0.25" borderRadius="$6" p="$0.5">
            <CheckCircleFill size={24} color="#00EF8B" />
          </YStack>
        )}

        {/* Selection Overlay */}
        {/* {onSelect && (
          <Button
            pos="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="transparent"
            borderRadius={0}
            onPress={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            pressStyle={{ bg: 'transparent' }}
          />
        )} */}
      </YStack>

      {/* NFT Info */}
      <YStack gap="$0.75">
        {/* NFT Name */}
        <Text fontSize="$5" fontWeight="600" color="$white" numberOfLines={1}>
          {nft.name || 'Unnamed NFT'}
        </Text>

        {/* Collection Info with Account Avatar/Emoji */}
        {nft.collection && (
          <XStack items="center" gap="$2">
            {/* Account Avatar/Emoji - only show if available */}
            {accountEmoji && <Text fontSize="$3">{accountEmoji}</Text>}
            {accountAvatar && (
              <Image src={accountAvatar} width={20} height={20} borderRadius="$6" />
            )}
            {!accountEmoji && !accountAvatar && collectionAvatar && (
              <Image src={collectionAvatar} width={20} height={20} borderRadius="$6" />
            )}

            {/* Collection Name */}
            <Text fontSize="$4" fontWeight="400" color="$gray10" numberOfLines={1} flex={1}>
              {nft.collection}
            </Text>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
