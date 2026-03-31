import { Progress, Text, View, YStack } from '@onflow/frw-ui';
import React from 'react';

interface ImportCloudBackupLoadingProgressProps {
  statusText: string;
  progress: number;
  glowTranslateX: number;
}

const PROGRESS_BAR_RADIUS = 6;

export function ImportCloudBackupLoadingProgress({
  statusText,
  progress,
  glowTranslateX,
}: ImportCloudBackupLoadingProgressProps): React.ReactElement {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <YStack gap="$4" width="100%" maxW={339} self="center">
      <Text fontSize={16} lineHeight={19} fontWeight="600" color="$primary" text="center">
        {statusText}
      </Text>

      <View width="100%" height={12} position="relative">
        <Progress
          value={normalizedProgress}
          max={100}
          width="100%"
          height={12}
          rounded={PROGRESS_BAR_RADIUS}
          bg="rgba(255,255,255,0.18)"
          overflow="hidden"
        >
          <Progress.Indicator bg="$primary" rounded={PROGRESS_BAR_RADIUS} transition="quicker" />
        </Progress>
      </View>
    </YStack>
  );
}
