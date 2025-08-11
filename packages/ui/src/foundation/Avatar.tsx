import React from 'react';
import { Avatar as TamaguiAvatar, Circle, Text } from 'tamagui';

import type { AvatarProps } from '../types';

export function Avatar({
  src,
  alt,
  size = 40,
  fallback,
  showOnlineIndicator = false,
}: AvatarProps): React.ReactElement {
  return (
    <TamaguiAvatar circular size={size}>
      <TamaguiAvatar.Image accessibilityLabel={alt} src={src} />
      <TamaguiAvatar.Fallback backgroundColor="$gray6" alignItems="center" justifyContent="center">
        <Text color="$gray12" fontSize={size * 0.4} fontWeight="600">
          {fallback || alt?.[0]?.toUpperCase() || '?'}
        </Text>
      </TamaguiAvatar.Fallback>

      {showOnlineIndicator && (
        <Circle
          position="absolute"
          b="$0"
          r="$0"
          size={size * 0.3}
          bg="$green9"
          borderWidth={2}
          borderColor="$background"
        />
      )}
    </TamaguiAvatar>
  );
}

export { Avatar as UIAvatar };
