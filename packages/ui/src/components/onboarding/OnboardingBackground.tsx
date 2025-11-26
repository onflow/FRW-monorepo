import React from 'react';
import { YStack, Image, type ViewProps } from 'tamagui';

import { fullBackground } from '../../assets/images';

interface OnboardingBackgroundProps extends ViewProps {
  children: React.ReactNode;
  showDecorations?: boolean;
  useBackgroundImage?: boolean;
  backgroundImage?: any; // Custom background image (optional, defaults to fullBackground)
}

export function OnboardingBackground({
  children,
  showDecorations = true,
  useBackgroundImage = true,
  backgroundImage,
  ...props
}: OnboardingBackgroundProps): React.ReactElement {
  const selectedBackground = backgroundImage ?? fullBackground;

  return (
    <YStack flex={1} bg="$background" position="relative" {...props}>
      {/* Background Image */}
      {useBackgroundImage && (
        <Image
          source={selectedBackground}
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
