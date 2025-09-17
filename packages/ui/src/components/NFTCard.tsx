import { CheckCircle, ChevronRight } from '@onflow/frw-icons';
import { YStack, XStack, Text, Image, View } from 'tamagui';

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
  accountName?: string;
  accountColor?: string;
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
  accountName,
  accountColor,
}: NFTCardProps) {
  const width = size === 'large' ? '$50' : size === 'medium' ? '100%' : '$30';
  const imageHeight = size === 'large' ? '$50' : size === 'medium' ? '$41' : '$30';
  return (
    <YStack
      width={width as any}
      gap="$1.5"
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
      onPress={onPress}
      position="relative"
      cursor="pointer"
    >
      {/* NFT Image */}
      <YStack
        w="100%"
        h={imageHeight}
        rounded="$4"
        overflow="hidden"
        aspectRatio={aspectRatio}
        bg="$surface2"
        position="relative"
      >
        {nft.thumbnail || nft.image ? (
          <Image src={nft.thumbnail || nft.image} width="100%" height="100%" objectFit="cover" />
        ) : (
          <YStack flex={1} items="center" justify="center" bg="$surface2" rounded="$4"></YStack>
        )}

        {/* ERC1155 Badge - top left corner */}
        {nft.contractType === 'ERC1155' && nft.amount && (
          <View
            position="absolute"
            top={8}
            left={8}
            backgroundColor="#D9D9D9"
            width={22.26}
            height={22.26}
            borderRadius={11.13}
            alignItems="center"
            justifyContent="center"
            zIndex={1}
          >
            <Text fontSize={14} fontWeight="600" color="#000000" lineHeight={19.6}>
              {nft.amount}
            </Text>
          </View>
        )}

        {/* Selection Indicator - top right corner */}
        <YStack
          w="$6"
          h="$6"
          zIndex={1}
          position="absolute"
          top="$2"
          right="$2"
          onPress={(e) => {
            e?.stopPropagation?.();
            onSelect(nft.id);
          }}
          pressStyle={{ opacity: 0.8 }}
          cursor="pointer"
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
                width={16}
                height={16}
                bg={accountColor ? (accountColor as any) : '$warning'}
                rounded={8}
                items="center"
                justify="center"
              >
                <Text fontSize={10} fontWeight="600">
                  {accountEmoji}
                </Text>
              </YStack>
            )}
            {accountAvatar && <Image src={accountAvatar} width="$5" height="$5" rounded="$6" />}

            {/* From Account Name */}
            <Text fontSize="$4" fontWeight="400" color="$textSecondary" numberOfLines={1} flex={1}>
              {accountName || nft.collection}
            </Text>

            {/* Right Chevron */}
            <YStack justify="center">
              <ChevronRight size={24} color="rgba(255, 255, 255, 0.6)" />
            </YStack>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
