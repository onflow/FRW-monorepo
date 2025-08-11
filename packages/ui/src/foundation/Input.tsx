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
        <Text fontSize={14} fontWeight="500" color="$text2">
          {label}
        </Text>
      )}

      <TamaguiInput
        borderColor={error ? '$errorColor' : '$borderColor'}
        borderWidth={1}
        rounded="$3"
        bg="$background"
        p="$3"
        fontSize={16}
        color="$color"
        placeholderTextColor="$placeholderColor"
        focusStyle={{
          borderColor: error ? '$errorColor' : '$primaryColor',
          borderWidth: 2,
        }}
        hoverStyle={{
          borderColor: error ? '$errorColor' : '$borderColorHover',
        }}
        {...props}
      />

      {(error || helperText) && (
        <Text fontSize={12} color={error ? '$errorColor' : '$text2'}>
          {error || helperText}
        </Text>
      )}
    </YStack>
  );
}

export { Input as UIInput };
