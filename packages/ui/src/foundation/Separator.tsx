import type { ComponentProps } from 'react';
import { Separator as TamaguiSeparator } from 'tamagui';

type SeparatorProps = ComponentProps<typeof TamaguiSeparator> & {
  variant?: 'default' | 'strong';
};

export function Separator({ variant = 'default', ...props }: SeparatorProps): React.ReactElement {
  return (
    <TamaguiSeparator
      borderColor={variant === 'strong' ? '$textSecondary' : '$dark10'}
      borderWidth={1}
      {...props}
    />
  );
}

export { Separator as UISeparator };
