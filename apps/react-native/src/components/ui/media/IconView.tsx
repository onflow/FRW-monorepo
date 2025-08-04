import { Image, View } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

// Constant definitions
const TIMEOUT_DURATION = 3000;

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
 * @param resizeMode - Image resize mode: cover (default), contain, stretch, center, repeat
 * @param size - Badge size (width & height), default 48
 * @param borderRadius - Badge border radius, default 24
 * @param backgroundColor - Badge background color, defaults to theme-aware surface color
 * @returns React component
 */
export function IconView({
  src,
  resizeMode = 'cover',
  size = 48,
  borderRadius = 24,
  backgroundColor,
  fillContainer = false,
}: {
  src: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat';
  size?: number;
  borderRadius?: number;
  backgroundColor?: string;
  fillContainer?: boolean;
}) {
  const { isDark } = useTheme();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageTimeout, setImageTimeout] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use theme-aware background color if not provided
  // For placeholders, we'll use a more neutral color to ensure the green placeholder shows well
  const defaultBackgroundColor = isDark ? 'rgb(26, 26, 26)' : 'rgb(242, 242, 247)';
  const finalBackgroundColor = backgroundColor || defaultBackgroundColor;

  // Use fillContainer prop to determine if should fill container
  const shouldFillContainer = fillContainer;

  const badgeStyle = useMemo(
    () => ({
      width: shouldFillContainer ? '100%' : size,
      height: shouldFillContainer ? '100%' : size,
      borderRadius: borderRadius,
      backgroundColor: '#9CA3AF',
      overflow: 'hidden' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    }),
    [size, borderRadius, shouldFillContainer]
  );

  const svgStyle = useMemo(
    () => ({
      width: shouldFillContainer ? '100%' : size,
      height: shouldFillContainer ? '100%' : size,
      borderRadius: borderRadius,
      backgroundColor: finalBackgroundColor,
    }),
    [size, borderRadius, finalBackgroundColor, shouldFillContainer]
  );

  // Use useMemo to optimize image type detection
  const imageType = useMemo(() => {
    if (!src || src.trim() === '') return 'empty';

    const lowerSrc = src.toLowerCase();
    if (lowerSrc.endsWith('.svg') || lowerSrc.startsWith('data:image/svg+xml')) return 'svg';
    if (lowerSrc.match(/\.(png|jpg|jpeg|gif|webp|bmp|ico)$/)) return 'image';
    return 'unknown';
  }, [src]);

  // Reset all states when src changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [src]);

  // Add timeout for image loading - be more aggressive with unknown types
  useEffect(() => {
    if (imageType === 'image' || imageType === 'unknown') {
      const timeoutMs = imageType === 'unknown' ? 3000 : 5000; // Shorter timeout for unknown types
      const timeoutId = setTimeout(() => {
        if (!imageLoaded) {
          setImageError(true);
        }
      }, timeoutMs);

      return () => clearTimeout(timeoutId);
    }
  }, [src, imageType, imageLoaded]);

  // Return placeholder directly for empty src
  if (imageType === 'empty') {
    return <View style={badgeStyle} />;
  }

  useEffect(() => {
    // Only handle SVG type
    if (imageType !== 'svg') return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const resetStates = () => {
      setImageError(false);
      setImageTimeout(false);
    };

    const handleTimeout = () => {
      if (isMounted) {
        setImageTimeout(true);
      }
    };

    const fetchSvg = async () => {
      try {
        resetStates();
        timeoutId = setTimeout(handleTimeout, TIMEOUT_DURATION);

        let svgText: string;

        if (src.startsWith('data:image/svg+xml;base64,')) {
          // Handle base64 encoded SVG data URLs
          const base64Data = src.replace('data:image/svg+xml;base64,', '');
          svgText = atob(base64Data);
        } else if (src.startsWith('data:image/svg+xml,')) {
          // Handle URL encoded SVG data URLs
          const urlEncodedData = src.replace('data:image/svg+xml,', '');
          svgText = decodeURIComponent(urlEncodedData);
        } else {
          // Handle regular SVG URLs
          const response = await fetch(src);
          if (!response.ok) throw new Error('Failed to fetch SVG');
          svgText = await response.text();
        }

        if (isMounted) {
          clearTimeout(timeoutId);
          setSvgContent(svgText);
        }
      } catch {
        if (isMounted) {
          clearTimeout(timeoutId);
          setImageError(true);
        }
      }
    };

    fetchSvg();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [src, imageType]);

  // SVG processing logic
  if (imageType === 'svg') {
    // Show placeholder when SVG loading fails or times out
    if (!svgContent || imageError || imageTimeout) {
      return <View style={badgeStyle} />;
    }
    return (
      <View style={badgeStyle}>
        <SvgXml
          xml={svgContent}
          width={shouldFillContainer ? '100%' : size}
          height={shouldFillContainer ? '100%' : size}
          style={svgStyle}
        />
      </View>
    );
  }

  // Determine when to show placeholder vs image
  const shouldShowPlaceholder = imageError || (imageType !== 'image' && imageType !== 'unknown');

  return (
    <View style={badgeStyle}>
      {shouldShowPlaceholder ? null : (
        <Image
          source={{ uri: src }}
          style={{
            width: shouldFillContainer ? '100%' : size,
            height: shouldFillContainer ? '100%' : size,
            borderRadius,
          }}
          onLoad={event => {
            // Extra validation to ensure image has actual content
            if (
              event.nativeEvent.source &&
              event.nativeEvent.source.width > 0 &&
              event.nativeEvent.source.height > 0
            ) {
              setImageLoaded(true);
            } else {
              // Image loaded but has no content - treat as error
              setImageError(true);
            }
          }}
          onError={() => {
            setImageError(true);
          }}
          resizeMode={resizeMode}
          fadeDuration={0}
        />
      )}
    </View>
  );
}
