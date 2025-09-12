import React from 'react';
import { YStack, XStack, Text } from 'tamagui';

import { Avatar } from '../foundation/Avatar';

export interface NFTInfoSectionProps {
  name: string;
  collection?: string;
  description?: string;
  owner?: {
    name?: string;
    avatar?: string;
    address?: string;
    emojiInfo?: { emoji: string; name: string; color: string };
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
              {/* Account Avatar/Emoji - same logic as NFTCard */}
              {owner.emojiInfo?.emoji ? (
                <YStack
                  width={24}
                  height={24}
                  bg={owner.emojiInfo?.color || '$warning'}
                  rounded={12}
                  items="center"
                  justify="center"
                >
                  <Text fontSize={12} fontWeight="600">
                    {owner.emojiInfo.emoji}
                  </Text>
                </YStack>
              ) : owner.avatar ? (
                <Avatar
                  src={owner.avatar}
                  fallback={owner.name?.charAt(0) || '🐼'}
                  bgColor="$bg3"
                  size={24}
                />
              ) : (
                <Avatar
                  src={undefined}
                  fallback={owner.name?.charAt(0) || '🐼'}
                  bgColor="$bg3"
                  size={24}
                />
              )}
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
