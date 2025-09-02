import React from 'react';
import { Image, Text, YStack } from 'tamagui';

import type { AvatarProps } from '../types';

export function Avatar({
  src,
  alt,
  size = 40,
  fallback,
  borderColor,
  borderWidth,
  style,
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
      borderColor={borderColor as any}
      borderWidth={borderWidth}
      style={style}
    >
      {src ? (
        <Image src={src} alt={alt} width={size} height={size} objectFit="cover" />
      ) : (
        <Text color="$text" fontSize="$4" fontWeight="600">
          {fallback || alt?.[0]?.toUpperCase() || '?'}
        </Text>
      )}
    </YStack>
  );
}

export { Avatar as UIAvatar };
