import { convertedSVGURL } from '@onflow/frw-utils';
import React from 'react';
import { Image, Text, YStack } from 'tamagui';

import type { AvatarProps } from '../types';

export function Avatar({
  src,
  alt,
  size = 40,
  fallback,
  bgColor,
  borderColor,
  borderWidth,
  borderRadius,
  style,
}: AvatarProps): React.ReactElement {
  return (
    <YStack
      width={size}
      height={size}
      bg={bgColor || '$bg3'}
      items="center"
      justify="center"
      rounded={borderRadius || size / 2}
      overflow="hidden"
      position="relative"
      borderColor={borderColor as any}
      borderWidth={borderWidth}
      style={style}
    >
      {src ? (
        <Image
          src={convertedSVGURL(src)}
          alt={alt}
          width="100%"
          height="100%"
          objectFit="cover"
          borderRadius={borderRadius || size / 2}
          position="absolute"
        />
      ) : (
        <Text color="$text" fontSize={size * 0.5} fontWeight="600">
          {fallback || alt?.[0]?.toUpperCase() || '?'}
        </Text>
      )}
    </YStack>
  );
}

export { Avatar as UIAvatar };
