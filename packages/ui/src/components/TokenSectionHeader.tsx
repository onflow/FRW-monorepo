import React from 'react';
import { Text, XStack } from 'tamagui';

import type { TokenSectionHeaderProps } from '../types';

export function TokenSectionHeader({ letter }: TokenSectionHeaderProps): React.ReactElement {
  return (
    <XStack pl="$4" pt="$4" pb="$2">
      <Text fontSize={12} fontWeight="500" color="$text2" letterSpacing={0.5}>
        {letter}
      </Text>
    </XStack>
  );
}
