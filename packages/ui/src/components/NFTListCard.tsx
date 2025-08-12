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
      backgroundColor="$gray2"
      borderRadius={8}
      position="relative"
      padding={4}
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
      cursor="pointer"
      {...props}
    >
      {/* NFT Image */}
      <YStack
        borderRadius={8}
        overflow="hidden"
        aspectRatio={1}
        backgroundColor="$gray3"
        marginBottom={8}
        pressStyle={{ opacity: 0.9 }}
        onPress={onDetailPress}
        cursor="pointer"
      >
        <NFTCover src={nft.thumbnail || nft.image} size="100%" borderRadius="$3" />

        {/* Amount Badge for ERC1155 tokens */}
        {showAmount && nft.amount && (
          <YStack
            position="absolute"
            top={8}
            left={8}
            backgroundColor="$gray2"
            borderRadius={24}
            paddingHorizontal={8}
            paddingVertical={4}
          >
            <Text fontSize={12} fontWeight="500" color="$gray12">
              {nft.amount}
            </Text>
          </YStack>
        )}
      </YStack>

      {/* NFT Title */}
      <Text fontSize={16} fontWeight="600" color="$gray12" numberOfLines={1}>
        {nft.name}
      </Text>

      {/* Account Info */}
      {account && (
        <XStack alignItems="center" marginTop={4}>
          <Avatar src={account.avatar} fallback={account.name?.charAt(0) || '?'} size={20} />
          <Text fontSize={14} color="$gray11" marginLeft={8} numberOfLines={1}>
            {account.name}
          </Text>
        </XStack>
      )}

      {/* Selection Icon */}
      {selectionIcon && (
        <YStack
          position="absolute"
          top={10}
          right={10}
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
