import React from 'react';
import { XStack, View } from 'tamagui';

export interface MigrationProgressIndicatorProps {
  /** Number of dots */
  count?: number;
  /** Whether animation is active */
  isAnimating?: boolean;
  /** Size of each dot */
  dotSize?: number;
  /** Gap between dots */
  gap?: number;
}

/**
 * MigrationProgressIndicator - Animated dots showing migration in progress
 */
export function MigrationProgressIndicator({
  count = 6,
  isAnimating = true,
  dotSize = 6,
  gap = 10.35,
}: MigrationProgressIndicatorProps): React.ReactElement {
  return (
    <XStack items="center" justify="center" gap={gap} width={87.75} height={6}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          width={dotSize}
          height={dotSize}
          bg="$primary"
          rounded={dotSize / 2}
          opacity={isAnimating ? 0.3 : 1}
          animation={isAnimating ? 'pulse' : undefined}
          animationDelay={isAnimating ? index * 100 : undefined}
        />
      ))}
    </XStack>
  );
}
