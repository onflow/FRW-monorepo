import { CheckCircle, ChevronRight } from '@onflow/frw-icons';
import { YStack, XStack, Text, Image } from 'tamagui';

import type { NFTData } from './NFTGrid';

export interface NFTCardProps {
  nft: NFTData;
  selected?: boolean;
  onPress?: () => void;
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
      gap={7}
      pressStyle={{ bg: 'transparent' }}
      onPress={onPress}
      position="relative"
    >
      {/* NFT Image */}
      <YStack
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
        {selected && (
          <YStack position="absolute" top="$0.5" right="$0.5">
            <CheckCircle size={20} color="#00EF8B" theme="filled" />
          </YStack>
        )}
      </YStack>

      {/* NFT Info */}
      <YStack gap={-3}>
        {/* NFT Name */}
        <Text fontSize="$5" fontWeight="600" color="$white" numberOfLines={1}>
          {nft.name || 'Unnamed NFT'}
        </Text>

        {/* Collection Info with Account Avatar/Emoji */}
        {nft.collection && (
          <XStack items="center" gap={4}>
            {/* Account Avatar/Emoji - only show if available */}
            {accountEmoji && (
              <YStack
                width={15.36}
                height={15.36}
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
            {accountAvatar && <Image src={accountAvatar} width={20} height={20} rounded="$6" />}
            {!accountEmoji && !accountAvatar && collectionAvatar && (
              <Image src={collectionAvatar} width={20} height={20} rounded="$6" />
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
