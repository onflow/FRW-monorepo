import { CheckCircle } from '@onflow/frw-icons';
import { Button, Card, Image, Text, YStack } from 'tamagui';

import type { NFTData } from './NFTGrid';

export interface NFTCardProps {
  nft: NFTData;
  selected?: boolean;
  onPress?: () => void;
  onSelect?: () => void;
  showAmount?: boolean;
  aspectRatio?: number;
  size?: 'small' | 'medium' | 'large';
}

export function NFTCard({
  nft,
  selected = false,
  onPress,
  onSelect,
  showAmount = false,
  aspectRatio = 1,
  size = 'medium',
}: NFTCardProps) {
  const padding = size === 'large' ? '$4' : size === 'medium' ? '$3' : '$2';
  const borderRadius = size === 'large' ? '$5' : '$4';
  const imageRadius = size === 'large' ? '$4' : '$3';

  return (
    <Card
      bg="$bg2"
      borderRadius={borderRadius}
      p={padding}
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
      onPress={onPress}
      pos="relative"
      borderColor={selected ? '$primary' : 'transparent'}
      borderWidth={selected ? 2 : 0}
    >
      {/* NFT Image */}
      <YStack
        borderRadius={imageRadius}
        overflow="hidden"
        aspectRatio={aspectRatio}
        bg="$bg3"
        mb="$3"
        pos="relative"
        pressStyle={{ opacity: 0.9 }}
        onPress={onPress}
      >
        <Image
          src={nft.thumbnail || nft.image}
          width="100%"
          height="100%"
          resizeMode="cover"
          fallback={
            <YStack flex={1} items="center" justify="center" bg="$bg3">
              <Text fontSize="$2" color="$textTertiary">
                NFT
              </Text>
            </YStack>
          }
        />

        {/* Amount Badge for ERC1155 tokens */}
        {showAmount && nft.amount && (
          <YStack
            pos="absolute"
            top="$2"
            left="$2"
            bg="$bg1"
            borderRadius="$6"
            px="$2"
            py="$1"
            opacity={0.9}
          >
            <Text fontSize="$2" fontWeight="500" color="$color">
              {nft.amount}
            </Text>
          </YStack>
        )}

        {/* Selection Indicator */}
        {selected && (
          <YStack pos="absolute" top="$2" right="$2" bg="$primary" borderRadius="$6" p="$1">
            <CheckCircle size={20} color="white" />
          </YStack>
        )}

        {/* Selection Overlay */}
        {onSelect && (
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
            pressStyle={{ bg: 'rgba(0,0,0,0.1)' }}
          />
        )}
      </YStack>

      {/* NFT Info */}
      <YStack gap="$1">
        <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>
          {nft.name}
        </Text>

        {nft.collection && (
          <Text fontSize="$3" color="$textSecondary" numberOfLines={1}>
            {nft.collection}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
