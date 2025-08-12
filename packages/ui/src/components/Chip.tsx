import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Text } from '../foundation/Text';
import type { ChipProps } from '../types';

export function Chip({
  variant = 'default',
  size = 'medium',
  selected = false,
  disabled = false,
  onPress,
  onRemove,
  startIcon,
  endIcon,
  children,
  ...props
}: ChipProps): React.ReactElement {
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return {
          height: '$2',
          px: '$2',
          fontSize: '$2',
          borderRadius: '$6',
          iconSize: 12,
        };
      case 'large':
        return {
          height: '$3.5',
          px: '$4',
          fontSize: '$4',
          borderRadius: '$6',
          iconSize: 18,
        };
      default: // medium
        return {
          height: '$2.5',
          px: '$3',
          fontSize: '$3',
          borderRadius: '$6',
          iconSize: 14,
        };
    }
  };

  const getVariantProps = () => {
    if (disabled) {
      return {
        bg: '$bg2',
        borderColor: '$border',
        borderWidth: 1,
        textColor: '$textTertiary',
        pressStyle: {},
        hoverStyle: {},
      };
    }

    if (selected) {
      switch (variant) {
        case 'primary':
          return {
            bg: '$primary',
            borderColor: '$primary',
            borderWidth: 1,
            textColor: '$white',
            pressStyle: { bg: '$primary', opacity: 0.8 },
            hoverStyle: { bg: '$primary', opacity: 0.9 },
          };
        default:
          return {
            bg: '$bg4',
            borderColor: '$border',
            borderWidth: 1,
            textColor: '$text',
            pressStyle: { bg: '$bg3' },
            hoverStyle: { bg: '$bg3' },
          };
      }
    }

    // Unselected state
    switch (variant) {
      case 'primary':
        return {
          bg: 'transparent',
          borderColor: '$primary',
          borderWidth: 1,
          textColor: '$primary',
          pressStyle: { bg: '$primaryLight' },
          hoverStyle: { bg: '$primaryLight' },
        };
      case 'outline':
        return {
          bg: 'transparent',
          borderColor: '$border',
          borderWidth: 1,
          textColor: '$text',
          pressStyle: { bg: '$bg2' },
          hoverStyle: { bg: '$bg2' },
        };
      default:
        return {
          bg: '$bg2',
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: '$text',
          pressStyle: { bg: '$bg3' },
          hoverStyle: { bg: '$bg3' },
        };
    }
  };

  const sizeProps = getSizeProps();
  const variantProps = getVariantProps();

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  return (
    <XStack
      alignItems="center"
      height={sizeProps.height}
      px={sizeProps.px}
      bg={variantProps.bg}
      borderColor={variantProps.borderColor}
      borderWidth={variantProps.borderWidth}
      borderRadius={sizeProps.borderRadius}
      cursor={disabled ? 'not-allowed' : onPress ? 'pointer' : 'default'}
      opacity={disabled ? 0.5 : 1}
      pressStyle={variantProps.pressStyle}
      hoverStyle={variantProps.hoverStyle}
      onPress={handlePress}
      {...props}
    >
      {/* Start Icon */}
      {startIcon && (
        <YStack mr="$1" alignItems="center" justifyContent="center">
          {startIcon}
        </YStack>
      )}

      {/* Content */}
      <Text
        fontSize={sizeProps.fontSize}
        fontWeight="500"
        color={variantProps.textColor}
        numberOfLines={1}
      >
        {children}
      </Text>

      {/* End Icon or Remove Button */}
      {(endIcon || onRemove) && (
        <YStack
          ml="$1"
          alignItems="center"
          justifyContent="center"
          cursor={onRemove ? 'pointer' : 'default'}
          onPress={onRemove}
        >
          {onRemove ? (
            <Text
              fontSize={sizeProps.iconSize}
              color={variantProps.textColor}
              lineHeight={sizeProps.iconSize}
            >
              ✕
            </Text>
          ) : (
            endIcon
          )}
        </YStack>
      )}
    </XStack>
  );
}
