import React from 'react';
import { XStack, View } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface MigrationFeatureItemProps {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Feature description text */
  description: string;
  /** Whether this is the last item (removes bottom border) */
  isLast?: boolean;
}

/**
 * MigrationFeatureItem - Displays a feature item in the migration info screen
 * Shows an icon and description with a divider line
 */
export function MigrationFeatureItem({
  icon,
  description,
  isLast = false,
}: MigrationFeatureItemProps): React.ReactElement {
  return (
    <XStack
      items="flex-start"
      justify="space-between"
      px="$0"
      py="$4"
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor="$borderGlass"
      width="100%"
    >
      <XStack gap="$3.5" flex={1} items="flex-start">
        <View width={20} height={20} items="center" justify="center" shrink={0}>
          {icon}
        </View>
        <Text fontSize="$3" fontWeight="400" color="$textSecondary" lineHeight={16.8} flex={1}>
          {description}
        </Text>
      </XStack>
    </XStack>
  );
}
