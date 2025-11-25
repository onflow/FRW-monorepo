import React from 'react';
import { XStack, Text } from 'tamagui';

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
  variant?: 'success' | 'warning';
}

export function FeatureItem({
  icon,
  text,
  variant = 'success',
}: FeatureItemProps): React.ReactElement {
  const color = variant === 'success' ? '$primary' : '$error';

  return (
    <XStack items="center" gap="$2">
      {icon}
      <Text fontSize="$3" color={color} lineHeight="$4.25">
        {text}
      </Text>
    </XStack>
  );
}
