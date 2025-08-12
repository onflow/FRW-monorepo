import React, { useState } from 'react';
import { Image, YStack } from 'tamagui';

import { Text } from '../foundation/Text';
import type { NFTCoverProps } from '../types';

export function NFTCover({
  src,
  size = 200,
  borderRadius = '$4',
  fallbackIcon = '🖼️',
  ...props
}: NFTCoverProps): React.ReactElement {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const sizeNumber = typeof size === 'number' ? size : parseInt(size?.toString() || '200', 10);
  const iconSize = Math.min(sizeNumber * 0.3, 48);

  return (
    <YStack
      width={size}
      height={size}
      backgroundColor="$gray3"
      borderRadius={borderRadius}
      overflow="hidden"
      alignItems="center"
      justifyContent="center"
      position="relative"
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          width={size}
          height={size}
          objectFit="cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <YStack
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          backgroundColor="$gray4"
        >
          <Text fontSize={iconSize}>{fallbackIcon}</Text>
        </YStack>
      )}
    </YStack>
  );
}
