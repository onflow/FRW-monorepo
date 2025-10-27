import React from 'react';
import { Input as TamaguiInput, Text, YStack } from 'tamagui';

import type { InputProps } from '../types';

interface UIInputProps extends InputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<TamaguiInput, UIInputProps>(
  ({ label, error, helperText, ...props }, ref): React.ReactElement => {
    return (
      <YStack space="$2">
        {label && (
          <Text fontSize={14} fontWeight="500" color="$textSecondary">
            {label}
          </Text>
        )}

        <TamaguiInput
          ref={ref}
          borderColor={error ? '$error' : '$border'}
          borderWidth={1}
          rounded="$3"
          bg="transparent"
          p="$3"
          height={52}
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
);

Input.displayName = 'Input';

export { Input as UIInput };
