import { Search, Scan, Close } from '@onflow/frw-icons';
import React from 'react';
import { XStack, Input, Button } from 'tamagui';

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
  placeholder = 'Search address',
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
    <XStack gap={17} items="center" w={width}>
      {/* Search Input Container */}
      <XStack
        flex={showScanButton ? 1 : undefined}
        w={showScanButton ? undefined : '100%'}
        bg="rgba(255, 255, 255, 0.1)"
        borderRadius="$4"
        px="$4"
        h={44}
        items="center"
        gap="$2"
        borderWidth={0}
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
          color="$white"
          fontSize={16}
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
            pressStyle={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            hoverStyle={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            disabled={disabled}
          >
            <Close size={16} color="rgba(255, 255, 255, 0.4)" theme="outline" />
          </Button>
        )}
      </XStack>

      {/* Scan Button */}
      {showScanButton && (
        <Button
          w={44}
          h={44}
          circular
          bg="transparent"
          borderWidth={0}
          onPress={onScanPress}
          pressStyle={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          hoverStyle={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          disabled={disabled || !onScanPress}
        >
          <Scan size={24} color="#FFFFFF" theme="outline" />
        </Button>
      )}
    </XStack>
  );
}
