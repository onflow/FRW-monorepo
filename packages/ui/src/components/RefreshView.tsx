import React from 'react';
import { YStack } from 'tamagui';

import { Button } from '../foundation/Button';
import { Text } from '../foundation/Text';
import type { RefreshViewProps } from '../types';

export function RefreshView({
  type = 'empty',
  message,
  onRefresh,
  refreshText = type === 'error' ? 'Retry' : 'Refresh',
  ...props
}: RefreshViewProps): React.ReactElement {
  return (
    <YStack flex={1} justify="center" items="center" pt="$4" pb="$8" {...props}>
      <Text
        color={type === 'error' ? '$error' : '$textSecondary'}
        text="center"
        mb="$3"
        fontSize="$4"
      >
        {message}
      </Text>
      {onRefresh && (
        <Button variant="outline" onPress={onRefresh}>
          <Text>{refreshText}</Text>
        </Button>
      )}
    </YStack>
  );
}
