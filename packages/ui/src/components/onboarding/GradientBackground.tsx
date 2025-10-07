import React from 'react';
import { View, YStack } from 'tamagui';
import type { ViewProps } from 'tamagui';

interface GradientBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export function GradientBackground({
  children,
  ...props
}: GradientBackgroundProps): React.ReactElement {
  return (
    <YStack flex={1} bg="$background" overflow="hidden" {...props}>
      {/* Green ellipse blur */}
      <View
        pos="absolute"
        w={306}
        h={306}
        rounded={999}
        bg="rgba(53, 233, 126, 0.4)"
        top={124}
        left={-95}
        style={{
          filter: 'blur(200px)',
        }}
      />

      {/* Teal ellipse blur */}
      <View
        pos="absolute"
        w={306}
        h={306}
        rounded={999}
        bg="rgba(19, 158, 141, 0.4)"
        top={228}
        left={191}
        style={{
          filter: 'blur(200px)',
        }}
      />

      {/* Main content */}
      <YStack flex={1} zIndex={1}>
        {children}
      </YStack>
    </YStack>
  );
}