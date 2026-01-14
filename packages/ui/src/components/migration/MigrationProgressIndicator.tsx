import React from 'react';

import { LoadingIndicator } from '../LoadingIndicator';

export interface MigrationProgressIndicatorProps {
  /** Number of dots */
  count?: number;
  /** Whether animation is active */
  isAnimating?: boolean;
  /** Size of each dot */
  dotSize?: number;
  /** Gap between dots */
  gap?: number;
  /** Width of the indicator */
  width?: number;
}

/**
 * MigrationProgressIndicator - Animated dots showing migration in progress
 * Uses the shared LoadingIndicator component from ConfirmationDrawer
 */
export function MigrationProgressIndicator({
  count = 6,
  isAnimating = true,
  dotSize = 8,
  gap = 17.8,
  width = 117,
}: MigrationProgressIndicatorProps): React.ReactElement {
  return (
    <LoadingIndicator
      isAnimating={isAnimating}
      width={width}
      height={dotSize}
      count={count}
      dotSize={dotSize}
      gap={gap}
    />
  );
}
