import React from 'react';
import { XStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface PercentageChangeBadgeProps {
  /** The percentage change value */
  value: number;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Custom props */
  [key: string]: any;
}

export function PercentageChangeBadge({
  value,
  size = 'small',
  ...props
}: PercentageChangeBadgeProps): React.ReactElement {
  const isPositive = value >= 0;

  // Size configurations
  const sizeConfig = {
    small: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontSize: 11,
      minWidth: 40,
      borderRadius: 8,
    },
    medium: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 12,
      minWidth: 48,
      borderRadius: 10,
    },
  };

  const sizeProps = sizeConfig[size];

  return (
    <XStack
      backgroundColor={isPositive ? 'rgba(65, 204, 93, 0.1)' : 'rgba(255, 86, 86, 0.1)'}
      borderRadius={sizeProps.borderRadius}
      paddingHorizontal={sizeProps.paddingHorizontal}
      paddingVertical={sizeProps.paddingVertical}
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <Text
        color={isPositive ? '#41CC5D' : '#FF5656'}
        fontSize={sizeProps.fontSize}
        fontWeight="500"
        textAlign="center"
      >
        {isPositive ? '+' : ''}
        {value.toFixed(1)}%
      </Text>
    </XStack>
  );
}
