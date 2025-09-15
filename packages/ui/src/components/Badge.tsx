import React from 'react';
import { XStack } from 'tamagui';

import { Text } from '../foundation/Text';
import type { BadgeProps } from '../types';

export function Badge({
  variant = 'default',
  size = 'medium',
  children,
  ...props
}: BadgeProps): React.ReactElement {
  // Size configurations
  const sizeConfig = {
    small: { height: '$2.5', px: '$1', fontSize: 8, rounded: 16 },
    medium: { height: 24, px: 12, fontSize: 13, rounded: 6 },
    large: { height: 32, px: 16, fontSize: 14, rounded: 8 },
  };

  // Variant configurations
  const variantConfig = {
    default: { bg: '$bg2', textColor: '$textSecondary' },
    primary: { bg: '$primary10', textColor: '$primary' },
    secondary: { bg: '$bg3', textColor: '$textSecondary' },
    success: { bg: '$success10', textColor: '$success' },
    warning: { bg: '$warning10', textColor: '$warning' },
    error: { bg: '$error10', textColor: '$error' },
    outline: { bg: 'transparent', textColor: '$textSecondary' },
    evm: { bg: '$accentEVM', textColor: '$white' },
  };

  const sizeProps = sizeConfig[size];
  const variantProps = variantConfig[variant];

  return (
    <XStack
      items="center"
      justify="center"
      h={sizeProps.height}
      px={sizeProps.px}
      bg={variantProps.bg}
      rounded={sizeProps.rounded}
      borderWidth={variant === 'outline' ? 1 : 0}
      borderColor={variant === 'outline' ? '$border' : 'transparent'}
      {...props}
    >
      <Text
        fontSize={sizeProps.fontSize}
        fontWeight="500"
        color={variantProps.textColor}
        numberOfLines={1}
      >
        {children}
      </Text>
    </XStack>
  );
}
