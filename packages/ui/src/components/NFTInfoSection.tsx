import React from 'react';
import { YStack, XStack, Text, Avatar } from 'tamagui';

export interface NFTInfoSectionProps {
  name: string;
  collection?: string;
  description?: string;
  owner?: {
    name?: string;
    avatar?: string;
    address?: string;
  };
  showOwner?: boolean;
  spacing?: number;
}

export function NFTInfoSection({
  name,
  collection,
  description,
  owner,
  showOwner = false,
  spacing = 16,
}: NFTInfoSectionProps) {
  return (
    <YStack gap="$4">
      {/* Name and Owner */}
      <YStack gap="$2">
        <XStack items="center" justify="space-between">
          <Text fontSize="$7" fontWeight="700" color="$color" flex={1} numberOfLines={2}>
            {name}
          </Text>

          {showOwner && owner && (
            <XStack items="center" gap="$2">
              <Avatar circular size={32}>
                {owner.avatar ? (
                  <Avatar.Image src={owner.avatar} />
                ) : (
                  <Avatar.Fallback bg="$bg3" items="center" justify="center">
                    <Text fontSize="$3" color="$textSecondary">
                      {owner.name?.charAt(0) || '?'}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>
            </XStack>
          )}
        </XStack>

        {collection && (
          <Text fontSize="$4" color="$textSecondary">
            {collection}
          </Text>
        )}
      </YStack>

      {/* Description */}
      {description && (
        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="600" color="$color">
            About
          </Text>
          <Text fontSize="$4" color="$textSecondary" lineHeight="$1">
            {description}
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
