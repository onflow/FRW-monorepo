import { Search, Close } from '@onflow/frw-icons';
import React from 'react';
import { XStack, Input, Stack } from 'tamagui';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  width?: number | string;
  disabled?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search address',
  width = '100%',
  disabled = false,
}: SearchBarProps): React.ReactElement {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <XStack
      width={width}
      height={44}
      bg="$light10"
      borderRadius={16}
      px={16}
      items="center"
      gap={8}
      focusStyle={{
        bg: '$light25',
      }}
    >
      {/* Search Icon */}
      <Search size={20} color="rgba(255, 255, 255, 0.4)" theme="outline" />

      {/* Input Field */}
      <Input
        flex={1}
        unstyled
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        autoCapitalize="none"
        autoCorrect={false}
        color="rgba(255, 255, 255, 0.4)"
        fontSize={16}
        fontWeight={400}
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
        lineHeight={20}
        textAlignVertical="center"
        disabled={disabled}
        bg="transparent"
        borderWidth={0}
        focusStyle={{
          outlineWidth: 0,
          color: '$white',
        }}
      />

      {/* Clear Button - only show when there's text */}
      {value.length > 0 && (
        <Stack
          onPress={handleClear}
          p={0}
          bg="transparent"
          width={20}
          height={20}
          items="center"
          justify="center"
          cursor={disabled ? 'default' : 'pointer'}
          opacity={disabled ? 0.3 : 0.6}
          hoverStyle={{
            opacity: disabled ? 0.3 : 1,
          }}
          pressStyle={{
            opacity: disabled ? 0.3 : 0.8,
          }}
        >
          <Close size={12} color="rgba(255, 255, 255, 0.4)" theme="outline" />
        </Stack>
      )}
    </XStack>
  );
}
