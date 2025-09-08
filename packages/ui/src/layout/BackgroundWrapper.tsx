import { YStack } from 'tamagui';

import type { BackgroundWrapperProps } from '../types';

export function BackgroundWrapper({
  children,
  backgroundColor = '$background',
}: BackgroundWrapperProps): React.ReactElement {
  return (
    <YStack flex={1} bg={backgroundColor as any} minH="100vh">
      {children}
    </YStack>
  );
}

export { BackgroundWrapper as UIBackgroundWrapper };
