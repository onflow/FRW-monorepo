import React from 'react';
import { YStack, type ViewProps } from 'tamagui';

interface GradientBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * GradientBackground - Simple container for onboarding content
 *
 * Note: The actual gradient visual effect comes from the OnboardingBackground
 * component's background image, not from this component. This is just a
 * content wrapper with proper z-index layering.
 */
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
