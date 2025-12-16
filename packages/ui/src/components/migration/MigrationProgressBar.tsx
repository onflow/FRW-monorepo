import React from 'react';
import { YStack, View, XStack } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface MigrationProgressBarProps {
  /** Current progress (0-100) */
  progress: number;
  /** Current step label */
  currentStep?: string;
  /** Total time estimate */
  timeEstimate?: string;
}

/**
 * MigrationProgressBar - Shows migration progress with percentage and time
 */
export function MigrationProgressBar({
  progress,
  currentStep,
  timeEstimate,
}: MigrationProgressBarProps): React.ReactElement {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <YStack gap="$2" width="100%">
      {/* Progress info */}
      <XStack items="center" justify="space-between" width="100%">
        <Text fontSize="$3" fontWeight="400" color="$text">
          {currentStep || 'Migrating...'}
        </Text>
        {timeEstimate && (
          <Text fontSize="$2" fontWeight="400" color="$textSecondary">
            {timeEstimate}
          </Text>
        )}
      </XStack>

      {/* Progress bar container */}
      <YStack width="100%" height={6} bg="$bg2" rounded={3} overflow="hidden" position="relative">
        {/* Progress fill */}
        <View
          width={`${clampedProgress}%`}
          height="100%"
          bg="$primary"
          position="absolute"
          left={0}
          top={0}
          animation="quick"
        />
      </YStack>
    </YStack>
  );
}
