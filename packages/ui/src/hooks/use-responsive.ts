import { useWindowDimensions, Platform } from 'react-native';

interface ResponsiveValues {
  /** Whether the device is a tablet (iPad) */
  isTablet: boolean;
  /** Maximum content width for readable text on larger screens */
  contentMaxWidth: number | undefined;
  /** Scale factor for animations (1.0 on phone, larger on tablet) */
  animationScale: number;
  /** Current screen width */
  screenWidth: number;
  /** Current screen height */
  screenHeight: number;
}

/**
 * useResponsive - Hook for responsive layout values on iOS
 *
 * Provides device type detection and responsive sizing utilities for iPad support.
 * On iPad, content is constrained to a readable width and animations are scaled up.
 *
 * @example
 * ```tsx
 * const { isTablet, contentMaxWidth, animationScale } = useResponsive();
 *
 * <YStack maxW={contentMaxWidth} alignSelf="center">
 *   <ShieldAnimation
 *     width={300 * animationScale}
 *     height={375 * animationScale}
 *   />
 * </YStack>
 * ```
 */
export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  // iPad detection using Platform.isPad (most reliable) or width threshold
  // Width >= 768 catches iPad in portrait mode and larger tablets
  const isTablet =
    Platform.OS === 'ios' &&
    ((Platform as unknown as { isPad?: boolean }).isPad === true || width >= 768);

  // Content max width: 500px on iPad for optimal readability
  // undefined on phone means full width (respecting parent padding)
  const contentMaxWidth = isTablet ? 500 : undefined;

  // Animation scale: 1.3x on iPad for better visual presence on larger screens
  const animationScale = isTablet ? 1.3 : 1.0;

  return {
    isTablet,
    contentMaxWidth,
    animationScale,
    screenWidth: width,
    screenHeight: height,
  };
}
