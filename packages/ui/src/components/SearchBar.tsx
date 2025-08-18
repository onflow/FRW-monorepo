import { Search } from '@onflow/frw-icons';
import React from 'react';
import { XStack, Input } from 'tamagui';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  width?: number | string;
  disabled?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search address',
  width = '100%',
  disabled = false,
}: SearchBarProps): React.ReactElement {
  return (
    <XStack
      width={width}
      height={44}
      bg="rgba(255, 255, 255, 0.1)"
      borderRadius={16}
      px={16}
      items="center"
      gap={8}
      focusStyle={{
        bg: 'rgba(255, 255, 255, 0.15)',
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
        lineHeight={24}
        disabled={disabled}
        bg="transparent"
        borderWidth={0}
        focusStyle={{
          outlineWidth: 0,
          color: '#FFFFFF',
        }}
      />
    </XStack>
  );
}
