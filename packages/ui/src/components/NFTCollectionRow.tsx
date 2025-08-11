import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Separator } from '../foundation/Separator';
import { Text } from '../foundation/Text';
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

  const count = collection.count && collection.count > 0 ? `${collection.count} items` : '';

  return (
    <YStack {...props}>
      <XStack
        ai="center"
        py="$4"
        px="$0"
        w="100%"
        gap="$4"
        pressStyle={{ opacity: 0.7 }}
        onPress={onPress}
        cursor="pointer"
      >
        {/* Collection Avatar */}
        <Avatar
          src={collection.logoURI || collection.logo}
          fallback={collection.name?.charAt(0) || 'N'}
          size={54}
        />

        {/* Collection Info */}
        <YStack f={1} ml="$0.5" gap="$1">
          <Text color="$text" fontWeight="600" fontSize="$4">
            {collection.name}
          </Text>
          <Text color="$textSecondary" fontSize="$3">
            {count}
          </Text>
        </YStack>

        {/* Arrow Icon Placeholder - would need to be passed as a prop or use a Tamagui icon */}
        <Text color="$textSecondary" fontSize="$4">
          →
        </Text>
      </XStack>

      {showDivider && <Separator />}
    </YStack>
  );
}
