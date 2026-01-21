import React from 'react';
import { Text, XStack } from 'tamagui';

import type { ActivityGroupHeaderProps } from '../types';

/**
 * ActivityGroupHeader displays a date header for a group of activity items
 * Examples: "Today", "Yesterday", "May 28, 2025"
 */
export function ActivityGroupHeader({ title }: ActivityGroupHeaderProps): React.ReactElement {
  return (
    <XStack py="$3" px="$4">
      <Text fontSize={13} fontWeight="600" color="$text2" letterSpacing={0.2}>
        {title}
      </Text>
    </XStack>
  );
}
