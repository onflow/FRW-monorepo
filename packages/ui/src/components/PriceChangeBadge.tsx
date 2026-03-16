import React from 'react';
import { Text, XStack } from 'tamagui';

import type { PriceChangeBadgeProps } from '../types';

export function PriceChangeBadge({ value }: PriceChangeBadgeProps): React.ReactElement {
  const isPositive = value >= 0;

  return (
    <XStack
      bg={isPositive ? '$success10' : '$error10'}
      rounded="$10"
      px="$1.5"
      py="$0.5"
      items="center"
    >
      <Text fontSize={10} fontWeight="600" color={isPositive ? '$success' : '$error'}>
        {isPositive ? '+' : ''}
        {value.toFixed(1)}%
      </Text>
    </XStack>
  );
}
