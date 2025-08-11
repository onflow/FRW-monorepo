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
          backgroundColor: '$background',
          borderRadius: '$4',
          shadowColor: '$shadowColor',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        };
      case 'outlined':
        return {
          backgroundColor: '$background',
          borderColor: '$gray5',
          borderWidth: 1,
          borderRadius: '$4',
        };
      default:
        return {
          backgroundColor: '$background',
          borderRadius: '$4',
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
