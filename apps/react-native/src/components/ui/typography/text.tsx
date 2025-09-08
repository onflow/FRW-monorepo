import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

import { useAndroidTextFix } from '@/lib/androidTextFix';
import { cn } from '@/lib/utils';

const textVariants = cva(
  cn(
    'text-foreground text-base',
    Platform.select({
      web: 'select-text',
    })
  ),
  {
    variants: {
      variant: {
        default: '',
        // React Native Reusables semantic variants
        h1: cn(
          'text-center text-4xl font-extrabold tracking-tight',
          Platform.select({ web: 'scroll-m-20 text-balance' })
        ),
        h2: cn(
          'border-border border-b pb-2 text-3xl font-semibold tracking-tight',
          Platform.select({ web: 'scroll-m-20 first:mt-0' })
        ),
        h3: cn('text-2xl font-semibold tracking-tight', Platform.select({ web: 'scroll-m-20' })),
        h4: cn('text-xl font-semibold tracking-tight', Platform.select({ web: 'scroll-m-20' })),
        p: 'mt-3 leading-7 sm:mt-6',
        blockquote: 'mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6',
        code: cn(
          'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'
        ),
        lead: 'text-muted-foreground text-xl',
        large: 'text-lg font-semibold',
        small: 'text-sm font-medium leading-none',
        muted: 'text-muted-foreground text-sm',
        // Original color variants
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
  }
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  blockquote: Platform.select({ web: 'blockquote' as Role }),
  code: Platform.select({ web: 'code' as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = 'default',
  size = 'base',
  weight = 'normal',
  style,
  disableAndroidFix = false,
  children,
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText> & {
    asChild?: boolean;
    disableAndroidFix?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);

  // Detect if text should be bold based on weight or variant
  const isBold =
    weight === 'bold' ||
    weight === 'semibold' ||
    variant === 'h1' ||
    variant === 'h2' ||
    variant === 'h3' ||
    variant === 'h4' ||
    variant === 'large';

  const androidTextFix = useAndroidTextFix(disableAndroidFix, isBold);

  // Add space at the end for Android to prevent cutoff (from Reddit solution)
  // Bold text needs more aggressive spacing
  const processedChildren = React.useMemo(() => {
    if (Platform.OS !== 'android' || disableAndroidFix) {
      return children;
    }

    if (typeof children === 'string') {
      // Bold text gets extra spaces for more aggressive prevention
      const extraSpaces = isBold ? '   ' : ' ';
      return children + extraSpaces;
    }

    return children;
  }, [children, disableAndroidFix, isBold]);

  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn(textVariants({ variant, size, weight }), textClass, className)}
      style={[androidTextFix, style]}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    >
      {processedChildren}
    </Component>
  );
}

export { Text, TextClassContext };
