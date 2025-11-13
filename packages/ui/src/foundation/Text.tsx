import React from 'react';
import { Text as TamaguiText } from 'tamagui';

import type { TextProps } from '../types';

export interface UITextProps extends TextProps {
  variant?: 'heading' | 'body' | 'caption' | 'label';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}

export function Text({
  variant = 'body',
  weight = 'normal',
  children,
  ...props
}: UITextProps): React.JSX.Element {
  const getVariantProps = (): Record<string, unknown> => {
    switch (variant) {
      case 'heading':
        return { fontSize: 24, fontWeight: '600', lineHeight: 32 };
      case 'body':
        return { fontSize: 16, fontWeight: '400', lineHeight: 24 };
      case 'caption':
        return { fontSize: 12, fontWeight: '400', lineHeight: 16 };
      case 'label':
        return { fontSize: 14, fontWeight: '500', lineHeight: 20 };
      default:
        return {};
    }
  };

  const getWeightValue = (): number => {
    switch (weight) {
      case 'light':
        return 300;
      case 'medium':
        return 500;
      case 'semibold':
        return 600;
      case 'bold':
        return 700;
      default:
        return 400;
    }
  };

  return (
    <TamaguiText {...getVariantProps()} fontWeight={getWeightValue() as any} {...props}>
      {children}
    </TamaguiText>
  );
}

export { Text as UIText };
