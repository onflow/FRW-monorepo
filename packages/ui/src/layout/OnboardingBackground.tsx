import React from 'react';
import { YStack, Image, type ViewProps } from 'tamagui';

import { fullBackgroundLight } from '../assets/images';

interface OnboardingBackgroundProps extends ViewProps {
  children: React.ReactNode;
  showDecorations?: boolean;
  useBackgroundImage?: boolean;
}

export function OnboardingBackground({
  children,
  showDecorations = true,
  useBackgroundImage = true,
  ...props
}: OnboardingBackgroundProps): React.ReactElement {
  // Only fullBackgroundLight is available on this branch
  const backgroundSource = fullBackgroundLight;

  return (
    <YStack flex={1} bg="$background" position="relative" {...props}>
      {/* Background Image */}
      {useBackgroundImage && (
        <Image
          source={backgroundSource}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
      )}

      {/* Main content */}
      <YStack flex={1} style={{ zIndex: 2 }}>
        {children}
      </YStack>
    </YStack>
  );
}
