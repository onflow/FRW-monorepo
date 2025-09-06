import { Avatar } from '../foundation/Avatar';
import { XStack, YStack, Text } from 'tamagui';

export interface CollectionHeaderProps {
  name: string;
  image?: string;
  description?: string;
  itemCount?: number;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function CollectionHeader({
  name,
  image,
  description,
  itemCount,
  isLoading = false,
  size = 'medium',
}: CollectionHeaderProps) {
  const nameSize = size === 'large' ? '$7' : size === 'medium' ? '$6' : '$5';

  return (
    <XStack items="center" gap="$1" p="$3">
      {/* Collection Avatar */}
      <Avatar
            src={image}
            alt= {name.charAt(0).toUpperCase()}
            fallback= {name.charAt(0).toUpperCase()}
            size={48}
          />

      {/* Collection Info */}
      <YStack flex={1} ml="$3" gap="$0.75">
        <Text fontSize={nameSize} fontWeight="700" color="$color" lineHeight="$1" numberOfLines={2}>
          {name}
        </Text>

        {!isLoading && itemCount !== undefined && (
          <Text fontSize="$4" fontWeight="500" color="$textSecondary">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        )}

        {description && (
          <Text
            fontSize="$3"
            fontWeight="400"
            color="$textTertiary"
            numberOfLines={2}
            lineHeight="$1"
          >
            {description}
          </Text>
        )}
      </YStack>
    </XStack>
  );
}
