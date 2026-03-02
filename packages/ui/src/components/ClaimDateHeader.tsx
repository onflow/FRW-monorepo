import React from 'react';
import { Text, XStack } from 'tamagui';

import type { ClaimDateHeaderProps } from '../types';

export function ClaimDateHeader({ date }: ClaimDateHeaderProps): React.ReactElement {
  return (
    <XStack px="$4" pt="$3" pb="$1">
      <Text fontSize={12} color="$text2">
        {date}
      </Text>
    </XStack>
  );
}
