import { Search, Close } from '@onflow/frw-icons';
import React from 'react';
import { XStack, Input, Stack, useTheme } from 'tamagui';

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
  const theme = useTheme();

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  // Determine if we're in dark mode by checking if text color is light
  const isDarkMode = theme.text?.toString().includes('255'); // White text indicates dark mode
  const iconColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';

  return (
    <XStack
      width={width}
      height={44}
      bg="$bg2"
      borderRadius={16}
      px={16}
      items="center"
      gap={8}
      focusStyle={{
        bg: '$bg3',
      }}
    >
      {/* Search Icon */}
      <Search size={20} color={iconColor} theme="outline" />

      {/* Input Field */}
      <Input
        flex={1}
        unstyled
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="$textSecondary"
        autoCapitalize="none"
        autoCorrect={false}
        color="$text"
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
          color: '$text',
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
          <Close size={12} color={iconColor} theme="outline" />
        </Stack>
      )}
    </XStack>
  );
}
