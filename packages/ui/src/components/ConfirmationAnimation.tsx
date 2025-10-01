import React, { useEffect, useRef, useState } from 'react';
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
  const [currentAnimationSource, setCurrentAnimationSource] = useState<any>(null);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Prepare animation with placeholder-first strategy
  useEffect(() => {
    const prepareAnimation = async () => {
      try {
        console.log('[ConfirmationAnimation] 🚀 Preparing animation with imageUri:', imageUri);
        setIsAnimationReady(false);

        // Validate animation data
        if (!sendConfirmationAnimation || typeof sendConfirmationAnimation !== 'object') {
          console.warn('[ConfirmationAnimation] ❌ Invalid animation data');
          setIsAnimationReady(true);
          return;
        }

        // Step 1: Always start with placeholder (Flow logo) for immediate display
        console.log('[ConfirmationAnimation] 📍 Step 1: Showing placeholder animation immediately');
        const placeholderResult = await injectImageWithFallbacks(
          sendConfirmationAnimation,
          'image_0', // Standard Lottie image layer ID
          '' // Empty string will trigger base64 placeholder
        );

        setCurrentAnimationSource(placeholderResult.animationData);
        setIsAnimationReady(true);

        // Step 2: If we have a real image URI, replace it dynamically
        if (imageUri && !imageLoadError) {
          console.log('[ConfirmationAnimation] 📍 Step 2: Loading actual token image:', imageUri);

          // Delay slightly to ensure placeholder is visible first
          setTimeout(async () => {
            try {
              const realImageResult = await injectImageWithFallbacks(
                sendConfirmationAnimation,
                'image_0',
                imageUri
              );

              console.log('[ConfirmationAnimation] 🎯 Image injection result:', {
                success: realImageResult.success,
                method: realImageResult.method,
              });

              if (realImageResult.success) {
                console.log(
                  '[ConfirmationAnimation] ✅ Replacing placeholder with real token image'
                );
                setCurrentAnimationSource(realImageResult.animationData);
              } else {
                console.log('[ConfirmationAnimation] ⚠️ Real image failed, keeping placeholder');
              }
            } catch (error) {
              console.error('[ConfirmationAnimation] 💥 Real image injection failed:', error);
            }
          }, 100); // Small delay to ensure placeholder shows first
        } else {
          console.log('[ConfirmationAnimation] 📍 No imageUri provided, keeping placeholder');
        }
      } catch (error) {
        console.error('[ConfirmationAnimation] 💥 Animation preparation failed:', error);
        setCurrentAnimationSource(sendConfirmationAnimation);
        setIsAnimationReady(true);
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
          console.warn('[ConfirmationAnimation] Animation failed:', error);
          setImageLoadError(true);
        }}
        onAnimationLoaded={() => {
          console.log('[ConfirmationAnimation] Animation loaded successfully');
        }}
      />
    </View>
  );
};
