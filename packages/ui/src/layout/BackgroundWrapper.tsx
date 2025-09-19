import { YStack } from 'tamagui';

import type { BackgroundWrapperProps } from '../types';

export function BackgroundWrapper({
  children,
  backgroundColor = '$background',
  ...rest
}: BackgroundWrapperProps): React.ReactElement {
  return (
    <YStack flex={1} px="$4" pb="$4" bg={backgroundColor as any} minH="100vh" {...rest}>
      {children}
    </YStack>
  );
}

export { BackgroundWrapper as UIBackgroundWrapper };
