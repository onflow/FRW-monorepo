import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useAndroidTextFix } from '@/lib/androidTextFix';
import { cn } from '@/lib/utils';

const textVariants = cva('text-base text-gray-900', {
  variants: {
    variant: {
      default: 'text-gray-900',
      muted: 'text-gray-500',
      destructive: 'text-red-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      primary: 'text-blue-600',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'base',
    weight: 'normal',
  },
});

export interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {
  disableAndroidFix?: boolean;
}

export const Text = React.forwardRef<RNText, TextProps>(
  ({ className, variant, size, weight, style, disableAndroidFix = false, ...props }, ref) => {
    const androidTextFix = useAndroidTextFix(disableAndroidFix);

    return (
      <RNText
        className={cn(textVariants({ variant, size, weight, className }))}
        style={[androidTextFix, style]}
        ref={ref}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';
