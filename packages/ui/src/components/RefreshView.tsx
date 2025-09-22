import React from 'react';
import { YStack } from 'tamagui';

import { Button } from '../foundation/Button';
import { Text } from '../foundation/Text';
import type { RefreshViewProps } from '../types';

export function RefreshView({
  type = 'empty',
  title,
  message,
  onRefresh,
  refreshText = type === 'error' ? 'Retry' : 'Refresh',
  ...props
}: RefreshViewProps): React.ReactElement {
  return (
    <YStack flex={1} justify="center" items="center" pt="$4" pb="$8" {...props}>
      {title && (
        <Text
          color={type === 'error' ? '$error' : '$textSecondary'}
          text="center"
          mb="$2"
          fontSize="$5"
          fontWeight="600"
        >
          {title}
        </Text>
      )}
      {message && (
        <Text
          color={type === 'error' ? '$error' : '$textSecondary'}
          text="center"
          mb="$3"
          fontSize="$4"
        >
          {message}
        </Text>
      )}
      {onRefresh && (
        <Button size="medium" variant="secondary" onPress={onRefresh}>
          {refreshText}
        </Button>
      )}
    </YStack>
  );
}
