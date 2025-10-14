import React from 'react';
import { View, YStack, Image } from 'tamagui';
import type { ViewProps } from 'tamagui';

// Import the background image
const backgroundImage = require('../../assets/images/onboarding/full_bg.png');

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
  return (
    <YStack flex={1} bg="$background" position="relative" {...props}>
      {/* Background Image */}
      {useBackgroundImage && (
        <Image
          source={backgroundImage}
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