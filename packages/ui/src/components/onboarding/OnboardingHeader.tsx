import { FlowLogo } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack, Text, View } from 'tamagui';

interface OnboardingHeaderProps {
  showLogo?: boolean;
  title: string;
  subtitle?: string;
  logoText?: string;
}

export function OnboardingHeader({
  showLogo = true,
  title,
  subtitle,
  logoText = 'Flow wallet',
}: OnboardingHeaderProps): React.ReactElement {
  return (
    <YStack items="center" gap="$3">
      {showLogo && (
        <XStack items="center" gap="$3" mb="$2">
          <View w={32} h={32} bg="$primary" rounded={999} items="center" justify="center">
            <FlowLogo size={32} />
          </View>
          <Text fontSize="$5" fontWeight="700" color="$text">
            {logoText}
          </Text>
        </XStack>
      )}

      <Text fontSize="$10" lineHeight="$12" fontWeight="700" color="$text" text="center" px="$4">
        {title}
      </Text>

      {subtitle && (
        <Text fontSize="$4" lineHeight="$5" color="$textSecondary" text="center" px="$4">
          {subtitle}
        </Text>
      )}
    </YStack>
  );
}
