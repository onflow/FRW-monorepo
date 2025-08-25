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
        gap="$4.5"
        py="$4.5"
        px="$0"
        width="100%"
        justify="space-between"
        {...(onPress && {
          pressStyle: { opacity: 0.7 },
          onPress: onPress,
          cursor: 'pointer',
        })}
      >
        <XStack items="center" gap="$4.5" flex={1}>
          {/* Collection Avatar */}
          <Avatar
            src={collection.logoURI || collection.logo}
            fallback={collection.name?.charAt(0) || 'N'}
            size="$13"
          />

          {/* Collection Info */}
          <YStack flex={1} gap="$1">
            <Text color="$color" fontWeight="600" fontSize="$5">
              {collection.name}
            </Text>
            <Text color="$textSecondary" fontSize="$4">
              {count}
            </Text>
          </YStack>
        </XStack>
        {/* Chevron Icon */}
        <ChevronRight size={24} />
      </XStack>

      {showDivider && <Separator borderColor="$bg1" />}
    </YStack>
  );
}
