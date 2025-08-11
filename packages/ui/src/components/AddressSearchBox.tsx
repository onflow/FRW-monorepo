import React from 'react';
import { XStack, Input, Button, Text } from 'tamagui';

export interface AddressSearchBoxProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showScanButton?: boolean;
  showClearButton?: boolean;
  onScanPress?: () => void;
  width?: number | string;
  disabled?: boolean;
}

export function AddressSearchBox({
  value,
  onChangeText,
  placeholder = 'Search address...',
  showScanButton = false,
  showClearButton = true,
  onScanPress,
  width = '100%',
  disabled = false,
}: AddressSearchBoxProps): React.ReactElement {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <XStack gap="$2" items="center" w={width}>
      {/* Search Input Container */}
      <XStack
        flex={showScanButton ? 1 : undefined}
        w={showScanButton ? undefined : '100%'}
        bg="$bg2"
        borderRadius="$4"
        px="$3"
        h="$4"
        items="center"
        gap="$2"
        borderWidth={1}
        borderColor="$border"
        focusStyle={{
          borderColor: '$primary',
          shadowColor: '$primary10',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {/* Search Icon */}
        <Text color="$textSecondary" fontSize="$3">
          🔍
        </Text>

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
          fontSize="$4"
          fontWeight="400"
          disabled={disabled}
          bg="transparent"
          borderWidth={0}
          focusStyle={{
            outlineWidth: 0,
          }}
        />

        {/* Clear Button */}
        {showClearButton && value.length > 0 && (
          <Button
            size="$2"
            circular
            bg="transparent"
            borderWidth={0}
            onPress={handleClear}
            pressStyle={{ bg: '$bg3' }}
            hoverStyle={{ bg: '$bg3' }}
            disabled={disabled}
          >
            <Text color="$textSecondary" fontSize="$2">
              ✕
            </Text>
          </Button>
        )}
      </XStack>

      {/* Scan Button */}
      {showScanButton && (
        <Button
          size="$4"
          circular
          bg="$bg2"
          borderWidth={1}
          borderColor="$border"
          onPress={onScanPress}
          pressStyle={{ bg: '$bg3' }}
          hoverStyle={{ bg: '$bg3' }}
          disabled={disabled || !onScanPress}
        >
          <Text color="$text" fontSize="$3">
            📷
          </Text>
        </Button>
      )}
    </XStack>
  );
}
