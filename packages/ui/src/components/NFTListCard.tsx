// import { ChevronRight } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { NFTCover } from './NFTCover';
import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';
import type { NFTListCardProps } from '../types';

export function NFTListCard({
  nft,
  selected = false,
  onPress,
  onDetailPress,
  account,
  showAmount = false,
  selectionIcon,
  ...props
}: NFTListCardProps): React.ReactElement {
  return (
    <YStack
      width="100%"
      backgroundColor="rgba(255, 255, 255, 0.05)"
      borderRadius="$4"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
      position="relative"
      padding="$3"
      pressStyle={{
        opacity: 0.8,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
      }}
      onPress={onPress}
      cursor="pointer"
      {...props}
    >
      <XStack gap="$3" alignItems="center">
        {/* NFT Image */}
        <YStack
          borderRadius="$3"
          overflow="hidden"
          width={60}
          height={60}
          backgroundColor="$gray3"
          pressStyle={{ opacity: 0.9 }}
          onPress={onDetailPress}
          cursor="pointer"
          position="relative"
        >
          <NFTCover src={nft.thumbnail || nft.image} size="100%" borderRadius="$3" />

          {/* Amount Badge for ERC1155 tokens */}
          {showAmount && nft.amount && (
            <YStack
              position="absolute"
              top={4}
              right={4}
              backgroundColor="rgba(0, 0, 0, 0.7)"
              borderRadius={12}
              paddingHorizontal={6}
              paddingVertical={2}
            >
              <Text fontSize={10} fontWeight="600" color="$white">
                {nft.amount}
              </Text>
            </YStack>
          )}
        </YStack>

        {/* NFT Content */}
        <YStack flex={1} gap="$1.5">
          {/* NFT Title */}
          <Text fontSize="$4" fontWeight="600" color="$white" numberOfLines={1}>
            {nft.name || 'Unnamed NFT'}
          </Text>

          {/* Account Info */}
          {account && (
            <XStack alignItems="center" gap="$2">
              <Avatar src={account.avatar} fallback={account.name?.charAt(0) || '?'} size={16} />
              <Text fontSize="$2" color="$textSecondary" numberOfLines={1}>
                {account.name}
              </Text>
            </XStack>
          )}
        </YStack>

        {/* Right Chevron Icon */}
        <XStack width={24} height={24} alignItems="center" justifyContent="center" opacity={0.6}>
          {/* <ChevronRight size={16} color="rgba(255, 255, 255, 0.6)" /> */}
          ChevronRight
        </XStack>
      </XStack>

      {/* Selection Icon */}
      {selectionIcon && (
        <YStack
          position="absolute"
          top="$2"
          right="$2"
          pressStyle={{ opacity: 0.8 }}
          onPress={onPress}
          cursor="pointer"
        >
          {selectionIcon}
        </YStack>
      )}
    </YStack>
  );
}
