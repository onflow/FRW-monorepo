import React from 'react';
import { YStack, Image, type ViewProps, useThemeName } from 'tamagui';

import {
  fullBackgroundLight,
  getStartedBackground,
  getStartedBackgroundLight,
} from '../../assets/images';

interface OnboardingBackgroundProps extends ViewProps {
  children: React.ReactNode;
  showDecorations?: boolean;
  useBackgroundImage?: boolean;
  variant?: 'default' | 'getStarted'; // Specify which background to use
}

export function OnboardingBackground({
  children,
  showDecorations = true,
  useBackgroundImage = true,
  variant = 'default',
  ...props
}: OnboardingBackgroundProps): React.ReactElement {
  const themeName = useThemeName();
  const isDark = themeName.includes('dark');

  // Select background based on variant and theme
  const backgroundSource =
    variant === 'getStarted'
      ? isDark
        ? getStartedBackground
        : getStartedBackgroundLight
      : fullBackgroundLight;

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
