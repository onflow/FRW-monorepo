import React from 'react';
import { XStack, Text } from 'tamagui';

export interface NFTPropertyTagProps {
  label: string;
  value: string;
  variant?: 'default' | 'compact';
  backgroundColor?: string;
  textColor?: string;
  labelColor?: string;
}

export function NFTPropertyTag({
  label,
  value,
  variant = 'default',
  backgroundColor,
  textColor,
  labelColor,
}: NFTPropertyTagProps) {
  const padding = variant === 'compact' ? '$2' : '$3';
  const fontSize = variant === 'compact' ? '$2' : '$3';

  return (
    <XStack
      items="center"
      gap="$1"
      bg={backgroundColor || '$bg2'}
      borderRadius="$6"
      px={padding}
      py="$1.5"
    >
      <Text fontSize={fontSize} color={labelColor || '$textSecondary'}>
        {label}:
      </Text>
      <Text fontSize={fontSize} fontWeight="500" color={textColor || '$color'}>
        {value}
      </Text>
    </XStack>
  );
}
