import React from 'react';
import { View } from 'tamagui';

import type { SkeletonProps } from '../types';

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  animated = true,
}: SkeletonProps): React.ReactElement {
  return (
    <View
      width={width as any}
      height={height as any}
      rounded={borderRadius}
      bg="$bg4"
      animation={animated ? 'lazy' : undefined}
      animateOnly={['opacity']}
      opacity={animated ? 0.6 : 1}
      // Simple pulse animation using Tamagui's built-in animations
      {...(animated && {
        '$theme-light': {
          bg: '$bg3',
        },
        '$theme-dark': {
          bg: '$bg2',
        },
      })}
    />
  );
}

export { Skeleton as UISkeleton };
