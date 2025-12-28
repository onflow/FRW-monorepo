import React from 'react';
import { XStack, YStack, View } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface TipCardProps {
  /** Icon to display on the left */
  icon: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text (optional) */
  description?: string;
  /** Optional margin bottom */
  mb?: string | number;
}

/**
 * TipCard - Reusable card component for displaying tips/info with an icon
 * Used in backup flow and other informational screens
 * Supports title-only mode when description is empty or not provided
 */
export function TipCard({ icon, title, description, mb }: TipCardProps): React.ReactElement {
  const hasDescription = description && description.length > 0;

  return (
    <XStack
      gap="$3"
      p="$4"
      rounded="$4"
      bg="$bgGlass"
      items={hasDescription ? 'flex-start' : 'center'}
      mb={mb}
    >
      <View
        width={24}
        height={24}
        items="center"
        justify="center"
        mt={hasDescription ? '$0.5' : undefined}
      >
        {icon}
      </View>
      <YStack flex={1} gap={hasDescription ? '$1' : undefined}>
        <Text
          fontSize="$4"
          fontWeight={hasDescription ? '700' : '400'}
          color="$text"
          lineHeight={hasDescription ? undefined : 20}
        >
          {title}
        </Text>
        {hasDescription && (
          <Text fontSize="$3" color="$textSecondary" lineHeight={17}>
            {description}
          </Text>
        )}
      </YStack>
    </XStack>
  );
}
