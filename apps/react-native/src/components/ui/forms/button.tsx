import React from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Text } from '../typography/text';

const buttonVariants = cva(
  'flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 active:bg-blue-700',
        destructive: 'bg-red-600 active:bg-red-700',
        outline: 'border border-gray-200 bg-white active:bg-gray-50',
        secondary: 'bg-gray-100 active:bg-gray-200',
        ghost: 'active:bg-gray-100',
        link: 'underline-offset-4 active:underline',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2',
        lg: 'h-14 px-8 py-4',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const textVariants = cva('font-medium text-center', {
  variants: {
    variant: {
      default: 'text-white',
      destructive: 'text-white',
      outline: 'text-gray-900',
      secondary: 'text-gray-900',
      ghost: 'text-gray-900',
      link: 'text-blue-600',
    },
    size: {
      default: 'text-base',
      sm: 'text-sm',
      lg: 'text-lg',
      icon: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ButtonProps extends TouchableOpacityProps, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <TouchableOpacity
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <Text
          className={cn(textVariants({ variant, size }))}
          style={{
            textAlign: 'center',
            textAlignVertical: 'center',
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';
