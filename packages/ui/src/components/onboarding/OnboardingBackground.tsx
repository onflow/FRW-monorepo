import React from 'react';
import { View, YStack, styled } from 'tamagui';
import type { ViewProps } from 'tamagui';

// Styled decorative circle component
const DecorativeCircle = styled(View, {
  pos: 'absolute',
  rounded: 999,
  borderWidth: 2,
  borderColor: '$primary',
  opacity: 0.4,
});

interface OnboardingBackgroundProps extends ViewProps {
  children: React.ReactNode;
  showDecorations?: boolean;
}

export function OnboardingBackground({
  children,
  showDecorations = true,
  ...props
}: OnboardingBackgroundProps): React.ReactElement {
  return (
    <YStack flex={1} bg="$background" {...props}>
      {/* Gradient overlay */}
      <View
        pos="absolute"
        top={0}
        left={0}
        right={0}
        h={400}
        opacity={0.2}
        bg="$primary"
        style={{
          background: 'linear-gradient(180deg, $primary 0%, transparent 100%)',
        }}
      />

      {/* Decorative circles */}
      {showDecorations && (
        <>
          <DecorativeCircle
            w={309}
            h={309}
            top={345}
            left={69}
            style={{
              borderImage: 'linear-gradient(180deg, rgba(0, 239, 139, 1) 0%, rgba(0, 239, 139, 0) 100%) 1',
              borderWidth: 3,
              filter: 'blur(7.5px)',
            }}
          />
          <DecorativeCircle
            w={309}
            h={309}
            top={345}
            left={69}
            style={{
              borderImage: 'linear-gradient(180deg, rgba(0, 239, 139, 1) 0%, rgba(0, 239, 139, 0) 100%) 1',
              borderWidth: 2,
            }}
          />
        </>
      )}

      {/* Main content */}
      <YStack flex={1} zIndex={1}>
        {children}
      </YStack>
    </YStack>
  );
}