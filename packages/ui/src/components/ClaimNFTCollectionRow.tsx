import { ChevronRight } from '@onflow/frw-icons';
import React from 'react';
import { Text, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Separator } from '../foundation/Separator';
import type { ClaimNFTCollectionRowProps } from '../types';

export function ClaimNFTCollectionRow({
  name,
  logoURI,
  itemCount,
  isLast,
}: ClaimNFTCollectionRowProps): React.ReactElement {
  return (
    <YStack>
      <XStack px="$4" py="$3" items="center" gap="$3">
        <Avatar src={logoURI} alt={name} fallback={name[0]} size={48} />
        <YStack flex={1} gap="$1">
          <Text fontSize={17} fontWeight="600" color="$text1" numberOfLines={1}>
            {name}
          </Text>
          <Text fontSize={14} color="$text2">
            {itemCount} Items
          </Text>
        </YStack>
        <ChevronRight size={24} color="#767676" theme="outline" />
      </XStack>
      {!isLast && <Separator mx="$4" borderColor="$borderGlass" borderWidth={0.5} />}
    </YStack>
  );
}
