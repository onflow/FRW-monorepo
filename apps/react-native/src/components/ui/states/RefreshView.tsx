import React from 'react';
import { View } from 'react-native';

import { Button, Text } from 'ui';

export type StateType = 'empty' | 'error';

interface RefreshViewProps {
  type?: StateType;
  message: string;
  onRefresh?: () => void;
  refreshText?: string;
  className?: string;
  buttonClassName?: string;
}

export const RefreshView: React.FC<RefreshViewProps> = ({
  type = 'empty',
  message,
  onRefresh,
  refreshText = type === 'error' ? 'Retry' : 'Refresh',
  className = '',
  buttonClassName = '',
}) => {
  const textColorClass = type === 'error' ? 'text-error' : 'text-fg-2';

  return (
    <View className={`flex-1 justify-center items-center py-8 ${className}`}>
      <Text className={`${textColorClass} text-center mb-4`}>{message}</Text>
      {onRefresh && (
        <Button onPress={onRefresh} size="sm" className={`mt-0 ${buttonClassName}`}>
          <Text className="text-white">{refreshText}</Text>
        </Button>
      )}
    </View>
  );
};
