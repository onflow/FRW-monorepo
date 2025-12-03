import React from 'react';
import { XStack, YStack, View } from 'tamagui';

import { Text } from '../../foundation/Text';

interface WarningCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  mb?: string | number;
}

export function WarningCard({
  icon,
  title,
  description,
  mb = '$6',
}: WarningCardProps): React.ReactElement {
  return (
    <XStack gap="$3" p="$4" rounded="$4" borderWidth={1} borderColor="$borderGlass" mb={mb}>
      <View width={24} height={24} items="center" justify="center">
        {icon}
      </View>
      <YStack flex={1} gap="$1">
        <Text fontSize="$4" fontWeight="700" color="$text">
          {title}
        </Text>
        <Text fontSize="$4" color="$textSecondary" lineHeight={17}>
          {description}
        </Text>
      </YStack>
    </XStack>
  );
}
