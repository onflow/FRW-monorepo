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
          bg: '$blue10',
          color: '$white1',
          borderColor: '$blue10',
          hoverStyle: { bg: '$blue11' },
          pressStyle: { bg: '$blue9' },
        };
      case 'secondary':
        return {
          bg: '$gray2',
          color: '$gray12',
          borderColor: '$gray6',
          hoverStyle: { bg: '$gray3' },
          pressStyle: { bg: '$gray4' },
        };
      case 'ghost':
        return {
          bg: 'transparent',
          color: '$gray11',
          borderColor: 'transparent',
          hoverStyle: { bg: '$gray2' },
          pressStyle: { bg: '$gray3' },
        };
      case 'outline':
        return {
          bg: 'transparent',
          color: '$blue10',
          borderColor: '$blue8',
          borderWidth: 1,
          hoverStyle: { bg: '$blue2' },
          pressStyle: { bg: '$blue3' },
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
