import React from 'react';
import { XStack, YStack, Text, View } from 'tamagui';
// FlowLogo will be passed as a prop to avoid circular dependencies

interface OnboardingHeaderProps {
  showLogo?: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  logoText?: string;
}

export function OnboardingHeader({
  showLogo = true,
  title,
  subtitle,
  icon,
  logoText = 'Flow wallet'
}: OnboardingHeaderProps): React.ReactElement {
  return (
    <YStack items="center" gap="$3">
      {showLogo && (
        <XStack items="center" gap="$3" mb="$2">
          <View w={32} h={32} bg="$primary" rounded="$3" items="center" justify="center">
            {icon || (
              <Text fontSize="$5" fontWeight="700" color="$black">F</Text>
            )}
          </View>
          <Text fontSize="$5" fontWeight="600" color="$text">
            {logoText}
          </Text>
        </XStack>
      )}

      <Text
        fontSize={40}
        lineHeight={48}
        fontWeight="700"
        color="$text"
        text="center"
        px="$4"
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          fontSize="$4"
          lineHeight={20}
          color="$textSecondary"
          text="center"
          px="$4"
        >
          {subtitle}
        </Text>
      )}
    </YStack>
  );
}