import { CheckCircle, ChevronRight } from '@onflow/frw-icons';
import { YStack, XStack, Text, Image } from 'tamagui';

import type { NFTData } from './NFTGrid';

export interface NFTCardProps {
  nft: NFTData;
  selected?: boolean;
  onPress?: () => void;
  onSelect?: (string) => void;
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
  onSelect = (id: string) => {},
  aspectRatio = 1,
  size = 'medium',
  collectionAvatar,
  accountEmoji,
  accountAvatar,
}: NFTCardProps) {
  const width = size === 'large' ? '$50' : size === 'medium' ? 160 : '$30';
  const height = size === 'large' ? '$50' : size === 'medium' ? 200 : '$30';
  return (
    <YStack
      width={width}
      height={height}
      gap="$1.5"
      pressStyle={{ bg: 'transparent' }}
      onPress={onPress}
      position="relative"
    >
      {/* NFT Image */}
      <YStack
        w={width}
        h={height}
        rounded="$4"
        overflow="hidden"
        aspectRatio={aspectRatio}
        bg="$surface2"
        position="relative"
        pressStyle={{ bg: 'transparent' }}
        onPress={onPress}
      >
        {nft.thumbnail || nft.image ? (
          <Image src={nft.thumbnail || nft.image} width="100%" height="100%" objectFit="cover" />
        ) : (
          <YStack flex={1} items="center" justify="center" bg="$surface2" rounded="$4">
            <Text fontSize="$6" opacity={0.3}>
              🖼️
            </Text>
            <Text fontSize="$2" color="$textSecondary" mt="$2">
              NFT
            </Text>
          </YStack>
        )}

        {/* Selection Indicator - top right corner */}

        <YStack
          w="$6"
          h="$6"
          zIndex="$2"
          position="absolute"
          top="$2"
          right="$2"
          onPress={() => onSelect(nft.id)}
        >
          <CheckCircle size={20} color={selected ? '#00EF8B' : 'gray'} theme="filled" />
        </YStack>
      </YStack>

      {/* NFT Info */}
      <YStack gap="$-0.75">
        {/* NFT Name */}
        <Text fontSize="$4" fontWeight="600" color="$text" numberOfLines={1}>
          {nft.name && nft.name.length > 18
            ? `${nft.name.slice(0, 18)}...`
            : nft.name || 'Unnamed NFT'}
        </Text>

        {/* Collection Info with Account Avatar/Emoji */}
        {nft.collection && (
          <XStack items="center" gap="$1">
            {/* Account Avatar/Emoji - only show if available */}
            {accountEmoji && (
              <YStack
                width="$4"
                height="$4"
                bg="$warning"
                rounded="$12"
                items="center"
                justify="center"
              >
                <Text fontSize="$2" fontWeight="600">
                  {accountEmoji}
                </Text>
              </YStack>
            )}
            {accountAvatar && <Image src={accountAvatar} width="$5" height="$5" rounded="$6" />}
            {!accountEmoji && !accountAvatar && collectionAvatar && (
              <Image src={collectionAvatar} width="$5" height="$5" rounded="$6" />
            )}

            {/* Collection Name */}
            <Text fontSize="$4" fontWeight="400" color="$textSecondary" numberOfLines={1} flex={1}>
              {nft.collection}
            </Text>

            {/* Right Chevron */}
            <YStack justify="center">
              <ChevronRight size={24} />
            </YStack>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
