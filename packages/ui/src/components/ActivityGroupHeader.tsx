import React from 'react';
import { Text, XStack } from 'tamagui';

import type { ActivityGroupHeaderProps } from '../types';

/**
 * ActivityGroupHeader displays a date header for a group of activity items
 * Examples: "Today", "Yesterday", "May 28, 2025"
 */
export function ActivityGroupHeader({ title }: ActivityGroupHeaderProps): React.ReactElement {
  return (
    <XStack pt="$3" pb="$1" px="$4">
      <Text fontSize={12} fontWeight="400" color="$text2">
        {title}
      </Text>
    </XStack>
  );
}
