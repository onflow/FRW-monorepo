import React from 'react';
import { YStack, type ViewProps } from 'tamagui';

interface GradientBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export function GradientBackground({
  children,
  ...props
}: GradientBackgroundProps): React.ReactElement {
  return (
    <YStack flex={1} bg="$background" overflow="hidden" {...props}>
      {/* Main content */}
      <YStack flex={1} zi={1}>
        {children}
      </YStack>
    </YStack>
  );
}
