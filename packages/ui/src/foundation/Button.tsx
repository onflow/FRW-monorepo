import React from 'react';
import { Button as TamaguiButton, Spinner } from 'tamagui';

import type { ButtonProps } from '../types';

interface UIButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  loading?: boolean;
  loadingText?: string;
}

export function Button({
  variant = 'primary',
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  ...props
}: UIButtonProps): React.ReactElement {
  const getVariantProps = (): Record<string, unknown> => {
    switch (variant) {
      case 'primary':
        return {
          bg: '$primaryColor',
          color: '$white',
          borderColor: '$primaryColor',
          hoverStyle: { bg: '$primaryColor' },
          pressStyle: { bg: '$primaryColor' },
        };
      case 'secondary':
        return {
          bg: '$surface2',
          color: '$text1',
          borderColor: '$borderColor',
          hoverStyle: { bg: '$surface3' },
          pressStyle: { bg: '$surface4' },
        };
      case 'ghost':
        return {
          bg: 'transparent',
          color: '$text2',
          borderColor: 'transparent',
          hoverStyle: { bg: '$surface2' },
          pressStyle: { bg: '$surface3' },
        };
      case 'outline':
        return {
          bg: 'transparent',
          color: '$primaryColor',
          borderColor: '$borderColor',
          borderWidth: 1,
          hoverStyle: { bg: '$surface1' },
          pressStyle: { bg: '$surface2' },
        };
      default:
        return {};
    }
  };

  return (
    <TamaguiButton
      {...getVariantProps()}
      disabled={disabled || loading}
      opacity={disabled ? 0.5 : 1}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="small" color="currentColor" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </TamaguiButton>
  );
}

export { Button as UIButton };
