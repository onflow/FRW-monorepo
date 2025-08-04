import { IconView } from './IconView';
import { useState } from 'react';
import { View } from 'react-native';
/**
 * Badge component - Supports SVG and image display with loading states and placeholder
 *
 * Features:
 * - Supports SVG and PNG/JPG/WEBP/GIF image formats
 * - Supports image links without file extensions
 * - SVG loading timeout handling (3 seconds)
 * - Shows placeholder when image loading fails
 * - Automatically handles network errors and timeouts
 * - Shows default image when src is empty
 * - Light gray background
 *
 * @param src - URL address of the image or SVG
 * @returns React component
 */
export function NFTCover({ src }: { src: string }) {
  // Regular image processing
  const [badgeSize, setBadgeSize] = useState(0);
  return (
    <View
      style={{ flex: 1 }}
      className="bg-sf-1 rounded-2xl overflow-hidden aspect-square"
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        const size = Math.min(width, height);
        if (size !== badgeSize) setBadgeSize(size);
      }}
    >
      {badgeSize > 0 && <IconView src={src} size={badgeSize} key={badgeSize} borderRadius={16} />}
    </View>
  );
}
