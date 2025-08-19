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
  spacing = 18,
}: NFTInfoSectionProps) {
  return (
    <YStack gap={spacing}>
      {/* Name and Collection */}
      <YStack gap={7}>
        <XStack alignItems="center" justifyContent="space-between">
          <Text
            fontSize={24}
            fontWeight="600"
            lineHeight={24}
            letterSpacing={-0.006}
            color="$color"
            flex={1}
            numberOfLines={2}
          >
            {name}
          </Text>

          {showOwner && owner && (
            <XStack alignItems="center" gap={4}>
              <Avatar circular size={24}>
                {owner.avatar ? (
                  <Avatar.Image src={owner.avatar} />
                ) : (
                  <Avatar.Fallback bg="$bg3" alignItems="center" justifyContent="center">
                    <Text fontSize={18} fontWeight="600" color="$textSecondary">
                      {owner.name?.charAt(0) || '🐼'}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>
            </XStack>
          )}
        </XStack>

        {collection && (
          <Text fontSize={14} fontWeight="400" lineHeight={19.6} color="$color" opacity={0.6}>
            {collection}
          </Text>
        )}
      </YStack>

      {/* Description */}
      {description && (
        <YStack gap={8}>
          <Text fontSize={14} fontWeight="500" lineHeight={19.6} color="$color">
            About
          </Text>
          <Text
            fontSize={14}
            fontWeight="300"
            lineHeight={20}
            letterSpacing={-0.006}
            color="$color"
            opacity={0.6}
          >
            {description}
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
