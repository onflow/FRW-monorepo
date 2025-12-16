import React from 'react';
import { YStack } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface MigrationInfoBannerProps {
  /** Bold title text */
  title: string;
  /** Description text */
  description: string;
}

/**
 * MigrationInfoBanner - Displays an informational banner for migration
 * Uses a green-tinted background with border to highlight important information
 */
export function MigrationInfoBanner({
  title,
  description,
}: MigrationInfoBannerProps): React.ReactElement {
  return (
    <YStack
      bg="rgba(65, 204, 93, 0.1)"
      borderWidth={1}
      borderColor="$primary"
      rounded="$4"
      p="$4"
      width="100%"
    >
      <Text fontSize="$3" fontWeight="400" color="$text" lineHeight={16.8}>
        <Text fontSize="$3" fontWeight="700" color="$text">
          {title}
        </Text>
        <Text fontSize="$3" fontWeight="400" color="$textSecondary">
          {' '}
          {description}
        </Text>
      </Text>
    </YStack>
  );
}
