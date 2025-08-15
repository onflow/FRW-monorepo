import { ChevronRight } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Separator } from '../foundation/Separator';
import type { NFTCollectionRowProps } from '../types';

export function NFTCollectionRow({
  collection,
  showDivider = false,
  onPress,
  ...props
}: NFTCollectionRowProps): React.ReactElement {
  if (!collection) {
    return <YStack {...props} />;
  }

  const count = collection.count && collection.count > 0 ? `${collection.count} Items` : '';

  return (
    <YStack {...props}>
      <XStack
        items="center"
        gap={12}
        paddingVertical={18}
        paddingHorizontal={0}
        width="100%"
        {...(onPress && {
          pressStyle: { opacity: 0.7 },
          onPress: onPress,
          cursor: 'pointer',
        })}
      >
        {/* Collection Avatar */}
        <Avatar
          src={collection.logoURI || collection.logo}
          fallback={collection.name?.charAt(0) || 'N'}
          size={48}
        />

        {/* Collection Info */}
        <YStack flex={1} gap="$0.5">
          <Text color="$color" fontWeight="600" fontSize={16}>
            {collection.name}
          </Text>
          <Text color="rgba(255, 255, 255, 0.8)" fontSize={14}>
            {count}
          </Text>
        </YStack>

        {/* Chevron Icon */}
        <ChevronRight size={24} />
      </XStack>

      {showDivider && <Separator />}
    </YStack>
  );
}
