import React from 'react';
import { YStack, Image, type ViewProps, useThemeName } from 'tamagui';

import { fullBackground, fullBackgroundLight } from '../../assets/images';

interface OnboardingBackgroundProps extends ViewProps {
  children: React.ReactNode;
  showDecorations?: boolean;
  useBackgroundImage?: boolean;
  backgroundImage?: any; // Custom background image (optional, defaults to theme-aware full_bg)
}

export function OnboardingBackground({
  children,
  showDecorations = true,
  useBackgroundImage = true,
  backgroundImage,
  ...props
}: OnboardingBackgroundProps): React.ReactElement {
  const themeName = useThemeName();

  // Use theme-aware background if no custom image provided
  // Check if current theme is dark by checking the theme name
  const isDark = themeName.includes('dark');
  const defaultBackgroundImage = isDark ? fullBackground : fullBackgroundLight;
  const selectedBackground = backgroundImage ?? defaultBackgroundImage;

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
