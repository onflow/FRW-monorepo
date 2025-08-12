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
        <Text fontSize={14} fontWeight="500" color="$textSecondary">
          {label}
        </Text>
      )}

      <TamaguiInput
        borderColor={error ? '$error' : '$border'}
        borderWidth={1}
        rounded="$3"
        bg="$bg"
        p="$3"
        fontSize={16}
        color="$text"
        placeholderTextColor="$placeholder"
        focusStyle={{
          borderColor: error ? '$error' : '$primary',
          borderWidth: 2,
        }}
        hoverStyle={{
          borderColor: error ? '$error' : '$borderHover',
        }}
        {...props}
      />

      {(error || helperText) && (
        <Text fontSize={12} color={error ? '$error' : '$textSecondary'}>
          {error || helperText}
        </Text>
      )}
    </YStack>
  );
}

export { Input as UIInput };
