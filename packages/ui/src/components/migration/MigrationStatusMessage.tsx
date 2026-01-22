import { CheckCircle, AlertTriangle } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack, View } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface MigrationStatusMessageProps {
  /** Status type */
  type: 'success' | 'warning';
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
}

/**
 * MigrationStatusMessage - Displays success or warning status for migration
 */
export function MigrationStatusMessage({
  type,
  title,
  description,
}: MigrationStatusMessageProps): React.ReactElement {
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;
  const iconColor = type === 'success' ? '#00EF8B' : '#FFA500';

  return (
    <XStack
      items="flex-start"
      gap="$3"
      p="$4"
      bg="$bg2"
      rounded="$4"
      borderWidth={1}
      borderColor={type === 'success' ? '$primary' : '$warning'}
    >
      <View width={24} height={24} items="center" justify="center" shrink={0}>
        <Icon size={24} color={iconColor} />
      </View>
      <YStack flex={1} gap="$1">
        <Text fontSize="$3" fontWeight="600" color="$text">
          {title}
        </Text>
        {description && (
          <Text fontSize="$3" fontWeight="400" color="$textSecondary" lineHeight={20}>
            {description}
          </Text>
        )}
      </YStack>
    </XStack>
  );
}
