import type { ComponentProps } from 'react';
import { Card as TamaguiCard } from 'tamagui';

type CardProps = ComponentProps<typeof TamaguiCard> & {
  variant?: 'default' | 'elevated' | 'outlined';
};

export function Card({ variant = 'default', children, ...props }: CardProps): React.ReactElement {
  const getVariantProps = (): Record<string, unknown> => {
    switch (variant) {
      case 'elevated':
        return {
          bg: '$bg',
          rounded: '$4',
          shadowColor: '$shadow',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        };
      case 'outlined':
        return {
          bg: '$bg',
          borderColor: '$border',
          borderWidth: 1,
          rounded: '$4',
        };
      default:
        return {
          bg: '$bg',
          rounded: '$4',
        };
    }
  };

  return (
    <TamaguiCard {...getVariantProps()} {...props}>
      {children}
    </TamaguiCard>
  );
}

export { Card as UICard };
