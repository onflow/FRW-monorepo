import React from 'react';
import { Text, YStack } from 'tamagui';

import type { AvatarProps } from '../types';

export function Avatar({
  src,
  alt,
  size = 40,
  fallback,
  borderColor,
  borderWidth,
}: AvatarProps): React.ReactElement {
  return (
    <YStack
      width={size}
      height={size}
      bg="$bg3"
      items="center"
      justify="center"
      rounded={size / 2}
      overflow="hidden"
      pos="relative"
      borderColor={borderColor}
      borderWidth={borderWidth}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <Text color="$text" fontSize={size * 0.35} fontWeight="600">
          {fallback || alt?.[0]?.toUpperCase() || '?'}
        </Text>
      )}
    </YStack>
  );
}

export { Avatar as UIAvatar };
