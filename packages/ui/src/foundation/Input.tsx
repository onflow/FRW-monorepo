import React from 'react';
import { Input as TamaguiInput, Text, YStack } from 'tamagui';

import type { InputProps } from '../types';

interface UIInputProps extends InputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, ...props }: UIInputProps): React.ReactElement {
  return (
    <YStack space="$2">
      {label && (
        <Text fontSize={14} fontWeight="500" color="$gray11">
          {label}
        </Text>
      )}

      <TamaguiInput
        borderColor={error ? '$red8' : '$gray5'}
        borderWidth={1}
        rounded="$3"
        bg="$background"
        p="$3"
        fontSize={16}
        color="$gray12"
        placeholderTextColor="$gray9"
        focusStyle={{
          borderColor: error ? '$red9' : '$blue7',
          borderWidth: 2,
        }}
        hoverStyle={{
          borderColor: error ? '$red8' : '$gray6',
        }}
        {...props}
      />

      {(error || helperText) && (
        <Text fontSize={12} color={error ? '$red10' : '$gray10'}>
          {error || helperText}
        </Text>
      )}
    </YStack>
  );
}

export { Input as UIInput };
