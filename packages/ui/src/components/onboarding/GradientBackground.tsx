import { GreenCircleBlur, TealCircleBlur } from '@onflow/frw-icons';
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
      {/* Green circle with blur from SVG */}
      <YStack pos="absolute" t={124} l={-95} w={376} h={603}>
        <GreenCircleBlur width={376} height={603} />
      </YStack>

      {/* Teal circle with blur from SVG */}
      <YStack pos="absolute" t={228} l={191} w={376} h={603}>
        <TealCircleBlur width={376} height={603} />
      </YStack>

      {/* Main content */}
      <YStack flex={1} zi={1}>
        {children}
      </YStack>
    </YStack>
  );
}
