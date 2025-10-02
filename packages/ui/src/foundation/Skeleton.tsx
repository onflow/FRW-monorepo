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
      rounded={borderRadius as any}
      bg="$subtleBg10"
      animation={animated ? 'lazy' : undefined}
      animateOnly={['opacity']}
      opacity={animated ? 0.8 : 1}
      // Simple pulse animation using Tamagui's built-in animations
      {...(animated && {
        '$theme-light': {
          bg: '$subtleBg10',
        },
        '$theme-dark': {
          bg: '$subtleBg10',
        },
      })}
      {...rest}
    />
  );
}

export { Skeleton as UISkeleton };
