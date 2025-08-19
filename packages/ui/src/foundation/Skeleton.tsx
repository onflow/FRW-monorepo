import React from 'react';
import { View } from 'tamagui';

import type { SkeletonProps } from '../types';

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  animated = true,
  ...rest
}: SkeletonProps): React.ReactElement {
  return (
    <View
      width={width as any}
      height={height as any}
      rounded={borderRadius}
      bg="$gray6"
      animation={animated ? 'lazy' : undefined}
      animateOnly={['opacity']}
      opacity={animated ? 0.8 : 1}
      // Simple pulse animation using Tamagui's built-in animations
      {...(animated && {
        '$theme-light': {
          bg: '$gray5',
        },
        '$theme-dark': {
          bg: '$gray7',
        },
      })}
      {...rest}
    />
  );
}

export { Skeleton as UISkeleton };
