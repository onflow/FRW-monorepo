import { logger } from '@onflow/frw-utils';
import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { View } from 'tamagui';

import LottieView from './LottieView';
import sendConfirmationAnimation from '../assets/animations/send-confirmation-noblur.json';
import { injectImageWithFallbacks } from '../utils/lottie-image-injection';

interface ConfirmationAnimationProps {
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  imageUri?: string;
  transactionType?: string;
  onAnimationReady?: (isReady: boolean) => void;
}

/**
 * Enhanced Lottie animation for transaction confirmations
 * Features:
 * - Dynamic token image injection with base64 placeholder fallback
 * - Theme-aware animations
 * - Graceful error handling
 * - Preload strategy to prevent image flashing
 */
export const ConfirmationAnimation: React.FC<ConfirmationAnimationProps> = ({
  width = 115,
  height = 130,
  autoPlay = true,
  loop = true,
  imageUri,
  transactionType,
  onAnimationReady,
}) => {
  // Unified ref; concrete type differs per platform implementation
  const animationRef = useRef<any>(null);
  // Track if component is still mounted to prevent state updates on unmounted component
  const isMountedRef = useRef(true);
  // Track timeout to cancel on unmount
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentAnimationSource, setCurrentAnimationSource] = useState<any>(null);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Prepare animation with placeholder-first strategy and enhanced error handling
  useEffect(() => {
    const prepareAnimation = async () => {
      try {
        logger.debug('[ConfirmationAnimation] 🚀 Preparing animation with imageUri:', imageUri);

        // Check if still mounted before updating state
        if (!isMountedRef.current) return;
        setIsAnimationReady(false);

        // Validate animation data
        if (!sendConfirmationAnimation || typeof sendConfirmationAnimation !== 'object') {
          logger.warn('[ConfirmationAnimation] ❌ Invalid animation data');
          if (isMountedRef.current) setIsAnimationReady(true);
          return;
        }

        // Step 1: Always start with placeholder (Flow logo) for immediate display
        logger.debug(
          '[ConfirmationAnimation] 📍 Step 1: Showing placeholder animation immediately'
        );
        const placeholderResult = await injectImageWithFallbacks(
          sendConfirmationAnimation,
          'image_0', // Standard Lottie image layer ID
          '' // Empty string will trigger base64 placeholder
        );

        // Check if still mounted before updating state
        if (!isMountedRef.current) return;

        if (placeholderResult.success && placeholderResult.animationData) {
          setCurrentAnimationSource(placeholderResult.animationData);
          setIsAnimationReady(true);
        } else {
          logger.warn(
            '[ConfirmationAnimation] ⚠️ Placeholder injection failed, using original animation'
          );
          setCurrentAnimationSource(sendConfirmationAnimation);
          setIsAnimationReady(true);
        }

        // Step 2: If we have a real image URI, replace it dynamically
        if (imageUri && !imageLoadError) {
          logger.debug('[ConfirmationAnimation] 📍 Step 2: Loading actual token image:', imageUri);

          // Check if it's an SVG on Android to skip early and avoid crashes
          const isSVGOnAndroid =
            Platform.OS === 'android' &&
            (imageUri.includes('data:image/svg+xml') ||
              imageUri.toLowerCase().includes('.svg') ||
              imageUri.includes('<svg'));

          if (isSVGOnAndroid) {
            logger.info(
              '[ConfirmationAnimation] 🛡️ Skipping SVG on Android to prevent crash, keeping placeholder'
            );
            return;
          }

          // Delay slightly to ensure placeholder is visible first
          // Store timeout ref so we can cancel on unmount
          timeoutRef.current = setTimeout(async () => {
            // Check if still mounted before proceeding
            if (!isMountedRef.current) return;

            try {
              const realImageResult = await injectImageWithFallbacks(
                sendConfirmationAnimation,
                'image_0',
                imageUri
              );

              // Check if still mounted before updating state
              if (!isMountedRef.current) return;

              logger.debug('[ConfirmationAnimation] 🎯 Image injection result:', {
                success: realImageResult.success,
                method: realImageResult.method,
              });

              if (realImageResult.success && realImageResult.animationData) {
                logger.debug(
                  '[ConfirmationAnimation] ✅ Replacing placeholder with real token image'
                );
                setCurrentAnimationSource(realImageResult.animationData);
              } else {
                logger.debug('[ConfirmationAnimation] ⚠️ Real image failed, keeping placeholder');
              }
            } catch (error) {
              logger.error('[ConfirmationAnimation] 💥 Real image injection failed:', error);
              if (isMountedRef.current) setImageLoadError(true);
            }
          }, 100); // Small delay to ensure placeholder shows first
        } else {
          logger.debug('[ConfirmationAnimation] 📍 No imageUri provided, keeping placeholder');
        }
      } catch (error) {
        logger.error('[ConfirmationAnimation] 💥 Animation preparation failed:', error);
        // Fallback to original animation without any injection
        if (isMountedRef.current) {
          setCurrentAnimationSource(sendConfirmationAnimation);
          setIsAnimationReady(true);
          setImageLoadError(true);
        }
      }
    };

    prepareAnimation();
  }, [imageUri, imageLoadError]);

  // Reset error state when token changes
  useEffect(() => {
    setImageLoadError(false);
  }, [imageUri]);

  // Notify parent when animation ready state changes
  useEffect(() => {
    onAnimationReady?.(isAnimationReady);
  }, [isAnimationReady, onAnimationReady]);

  // Track mounted state and cleanup animation when component unmounts to prevent IllegalStateException on Android
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      // Mark as unmounted first to prevent any pending async operations from updating state
      isMountedRef.current = false;

      // Cancel any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (Platform.OS === 'android' && animationRef.current) {
        try {
          // Pause and reset animation before unmounting
          if (typeof animationRef.current.pause === 'function') {
            animationRef.current.pause();
          }
          if (typeof animationRef.current.reset === 'function') {
            animationRef.current.reset();
          }
        } catch (error) {
          logger.warn('[ConfirmationAnimation] Error during cleanup:', error);
        }
      }
    };
  }, []);

  if (!isAnimationReady || !currentAnimationSource) {
    // Show empty space while preparing to avoid flash
    return <View width={width} height={height} items="center" justify="center" opacity={0} />;
  }

  return (
    <View
      width={width}
      height={height}
      items="center"
      justify="center"
      position="relative"
      overflow="visible"
    >
      <LottieView
        ref={animationRef}
        source={currentAnimationSource}
        autoPlay={autoPlay}
        loop={loop}
        style={{
          width,
          height,
        }}
        resizeMode="contain"
        // React Native optimizations
        enableMergePathsAndroidForKitKatAndAbove={false}
        cacheComposition={true}
        speed={1.0}
        onAnimationFailure={(error) => {
          logger.warn('[ConfirmationAnimation] Animation failed:', error);
          if (isMountedRef.current) {
            setImageLoadError(true);

            // Additional safety: Reset to placeholder animation on failure
            if (Platform.OS === 'android') {
              logger.warn(
                '[ConfirmationAnimation] Resetting to safe placeholder animation after failure'
              );
              // Use a timeout but check mounted state before updating
              setTimeout(() => {
                if (isMountedRef.current) {
                  setCurrentAnimationSource(sendConfirmationAnimation);
                }
              }, 50);
            }
          }
        }}
        onAnimationLoaded={() => {
          // Android-specific: Set images folder to prevent IllegalStateException
          if (
            Platform.OS === 'android' &&
            animationRef.current &&
            typeof animationRef.current.setImagesFolder === 'function'
          ) {
            animationRef.current.setImagesFolder('');
          }
        }}
      />
    </View>
  );
};
