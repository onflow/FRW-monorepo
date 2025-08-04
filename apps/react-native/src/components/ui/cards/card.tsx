import React from 'react';
import { View, ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-lg bg-white shadow-sm', {
  variants: {
    variant: {
      default: 'bg-white border-gray-200',
      elevated: 'bg-white border-gray-200 shadow-md',
      outline: 'bg-transparent border-gray-300',
    },
    size: {
      default: 'p-4',
      sm: 'p-3',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<View, CardProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <View className={cn(cardVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => {
  return <View className={cn('pb-3', className)} ref={ref} {...props} />;
});

CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => {
  return <View className={cn('py-2', className)} ref={ref} {...props} />;
});

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => {
  return <View className={cn('pt-3', className)} ref={ref} {...props} />;
});

CardFooter.displayName = 'CardFooter';
