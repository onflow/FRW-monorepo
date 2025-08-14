import React from 'react';
import { XStack, YStack, Avatar, Text } from 'tamagui';

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
  const avatarSize = size === 'large' ? 80 : size === 'medium' ? 64 : 48;
  const nameSize = size === 'large' ? '$7' : size === 'medium' ? '$6' : '$5';
  const spacing = size === 'large' ? '$5' : size === 'medium' ? '$4' : '$3';

  return (
    <XStack items="center" gap="$1" p="$3" minHeight={avatarSize + 24}>
      {/* Collection Avatar */}
      <Avatar circular size={avatarSize}>
        {image ? (
          <Avatar.Image src={image} />
        ) : (
          <Avatar.Fallback bg="$bg3" items="center" justify="center">
            <Text fontSize="$4" color="$textSecondary" fontWeight="600">
              {name.charAt(0).toUpperCase()}
            </Text>
          </Avatar.Fallback>
        )}
      </Avatar>

      {/* Collection Info */}
      <YStack flex={1} gap="$0.75">
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
