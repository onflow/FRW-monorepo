import React from 'react';
import { XStack, YStack, Text, View } from 'tamagui';

export interface WarningCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function WarningCard({ icon, title, description }: WarningCardProps): React.ReactElement {
  return (
    <XStack
      gap="$3"
      p="$4"
      rounded="$4"
      bg="$bgGlass"
      borderWidth={1}
      borderColor="$borderGlass"
      items="flex-start"
    >
      <View width={24} height={24} items="center" justify="center" mt="$0.5">
        {icon}
      </View>
      <YStack flex={1} gap="$1">
        <Text fontSize="$4" fontWeight="700" color="$text">
          {title}
        </Text>
        <Text fontSize="$3" color="$textSecondary" lineHeight={17}>
          {description}
        </Text>
      </YStack>
    </XStack>
  );
}
