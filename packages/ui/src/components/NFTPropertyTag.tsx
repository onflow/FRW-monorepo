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
  const paddingX = variant === 'compact' ? '$2' : '$3';
  const paddingY = variant === 'compact' ? '$1' : '$1.5';

  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      gap="$1"
      bg={backgroundColor || '$bg2'}
      borderRadius={100}
      px={paddingX}
      py={paddingY}
      maxWidth="100%"
      overflow="hidden"
      backdropFilter="blur(10px)"
    >
      <Text
        fontSize="$4"
        fontWeight="400"
        color={labelColor || '$textSecondary'}
        opacity={0.4}
        flexShrink={0}
      >
        {label}:
      </Text>
      <Text
        fontSize="$4"
        fontWeight="500"
        color={textColor || '$color'}
        numberOfLines={1}
        flex={1}
        overflow="hidden"
      >
        {value}
      </Text>
    </XStack>
  );
}
