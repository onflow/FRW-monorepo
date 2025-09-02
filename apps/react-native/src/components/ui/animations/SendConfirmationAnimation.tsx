import type { NFTModel } from '@onflow/frw-types';
import { convertedSVGURL, getNFTCover } from '@onflow/frw-utils';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { type ViewStyle, Platform, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

import sendConfirmationAnimationDynamic from '@/assets/animations/send-confirmation-noblur.json';
import sendConfirmationAnimationStatic from '@/assets/animations/send-confirmation.json';
import { injectImageWithFallbacks } from '@/utils/lottie-image-injection';

import { AnimationErrorBoundary } from './AnimationErrorBoundary';

/**
 * SEND CONFIRMATION ANIMATION
 * ==========================
 *
 * Theme-Aware Preload Strategy (Fixed for Android Token Flash):
 * 1. Theme Selection: Choose light/dark animation based on current theme
 * 2. Preload & Prepare: Load and inject correct token image before showing animation
 * 3. Silent Preparation: Keep area empty while preparing to avoid any visual artifacts
 * 4. Ready Display: Show animation only when correct token image is loaded
 *
 * This approach ensures:
 * - Theme consistency - uses appropriate colors for light/dark mode
 * - No token flash - users never see wrong token image
 * - Correct token from start - animation shows intended token immediately
 * - Graceful fallback - works even if dynamic injection fails
 * - Android optimized - prevents Flow token appearing before actual token
 */

interface SendConfirmationAnimationProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  autoPlay?: boolean;
  loop?: boolean;
  selectedToken?: { symbol?: string; name?: string; logoURI?: string; identifier?: string };
  selectedNFTs?: NFTModel[];
  transactionType?: string;
  onAnimationReady?: (isReady: boolean) => void;
}

export const SendConfirmationAnimation: React.FC<SendConfirmationAnimationProps> = ({
  width = 399,
  height = 148,
  style,
  autoPlay = true,
  loop = true,
  selectedToken,
  selectedNFTs,
  transactionType,
  onAnimationReady,
}) => {
  const animationRef = useRef<LottieView>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [animationError, setAnimationError] = useState(false);
  const [injectionResult, setInjectionResult] = useState<{
    method: 'base64' | 'url' | 'failed' | null;
    success: boolean;
  }>({ method: null, success: false });
  const [currentAnimationSource, setCurrentAnimationSource] = useState<any>(null);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  
  const { isDark } = useTheme();

  // Determine what to show based on transaction type and available data
  const isFlowToken = selectedToken?.symbol === 'FLOW' || selectedToken?.name === 'FLOW' || !selectedToken?.logoURI;
  const shouldShowFlowLogo = (!selectedToken && !transactionType?.includes('nft')) || isFlowToken;

  // Get image URI - for NFT transactions, prioritize collection square image
  const getImageUri = () => {
    if (transactionType?.includes('nft') && selectedNFTs && selectedNFTs.length > 0) {
      const firstNFT = selectedNFTs[0];

      // Try collection images first (these provide better branding)
      // Apply SVG conversion to ensure compatibility with React Native Image component
      const collectionSquareImage = firstNFT.collectionSquareImage?.trim();
      const collectionBannerImage = firstNFT.collectionBannerImage?.trim();
      // Note: NFTModel doesn't have nested collection object, all properties are flattened

      if (collectionSquareImage) {
        return convertedSVGURL(collectionSquareImage);
      }
      if (collectionBannerImage) {
        return convertedSVGURL(collectionBannerImage);
      }

      // Fallback to NFT-specific images using the standard utility
      const nftCover = getNFTCover(firstNFT);
      if (nftCover?.trim()) {
        return nftCover;
      }

      // Final fallback - sometimes NFT images are directly available
      // Apply SVG conversion to ensure compatibility
      const thumbnail = firstNFT.thumbnail?.trim();
      const postMediaImage = firstNFT.postMedia?.image?.trim();

      if (thumbnail) {
        return convertedSVGURL(thumbnail);
      }
      if (postMediaImage) {
        return convertedSVGURL(postMediaImage);
      }

      return null;
    }
    const tokenLogoURI = selectedToken?.logoURI?.trim();
    return tokenLogoURI ? convertedSVGURL(tokenLogoURI) : null;
  };

  const imageUri = getImageUri();

  // Preload and prepare animation to avoid token image flash
  useEffect(() => {
    const prepareAnimation = async () => {
      // Use single animation source
      const baseAnimation = sendConfirmationAnimationDynamic;
      const staticAnimation = sendConfirmationAnimationStatic;
      
      try {
        console.log('[SendConfirmationAnimation] Platform:', Platform.OS);
        console.log(`[SendConfirmationAnimation] Preparing animation`);

        setIsAnimationReady(false);
        setCurrentAnimationSource(null);

        // Validate that the base animation data exists and is valid
        if (!baseAnimation || typeof baseAnimation !== 'object') {
          console.warn('[SendConfirmationAnimation] Invalid dynamic animation data, using static');
          setCurrentAnimationSource(staticAnimation);
          setIsAnimationReady(true);
          return;
        }

        // If we have an image to inject, prepare it first to avoid flash
        if (imageUri && !imageLoadError && !shouldShowFlowLogo) {
          console.log('[SendConfirmationAnimation] Preloading and injecting image for:', imageUri);

          // Use dynamic animation with token injection for both themes
          const result = await injectImageWithFallbacks(baseAnimation, 'image_0', imageUri);

          setInjectionResult({
            method: result.method,
            success: result.success,
          });

          console.log(`[SendConfirmationAnimation] Injection result on ${Platform.OS}:`, {
            method: result.method,
            success: result.success,
          });

          if (result.success) {
            console.log('[SendConfirmationAnimation] ✅ Animation ready with injected token image');
            setCurrentAnimationSource(result.animationData);
          } else {
            console.log(
              '[SendConfirmationAnimation] ⚠️ Image injection failed, using dynamic base animation'
            );
            setCurrentAnimationSource(baseAnimation);
          }
        } else {
          // No image to inject, use appropriate animation
          if (shouldShowFlowLogo) {
            console.log('[SendConfirmationAnimation] Using static animation for Flow logo');
            setCurrentAnimationSource(staticAnimation);
          } else {
            console.log(
              '[SendConfirmationAnimation] Using dynamic animation without image injection'
            );
            setCurrentAnimationSource(baseAnimation);
          }
          setInjectionResult({ method: null, success: false });
        }

        setIsAnimationReady(true);
      } catch (error) {
        console.error(
          '[SendConfirmationAnimation] Animation preparation failed, using static:',
          error
        );
        setCurrentAnimationSource(staticAnimation);
        setIsAnimationReady(true);
      }
    };

    prepareAnimation();
  }, [imageUri, imageLoadError, shouldShowFlowLogo, isDark]);

  // Reset error state when imageUri changes
  useEffect(() => {
    setImageLoadError(false);
    setAnimationError(false);
  }, [imageUri]);

  // Notify parent when animation ready state changes
  useEffect(() => {
    onAnimationReady?.(isAnimationReady);
  }, [isAnimationReady, onAnimationReady]);

  return (
    <AnimationErrorBoundary>
      <View style={[{ width, height, position: 'relative', overflow: 'visible' }, style]}>
        {/* Lottie Animation - Show only when ready with correct token */}
        {isAnimationReady && currentAnimationSource && !animationError ? (
          <LottieView
            ref={animationRef}
            source={currentAnimationSource}
            autoPlay={autoPlay}
            loop={loop}
            style={{
              width,
              height,
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 1,
            }}
            resizeMode="contain"
            // iOS-specific fixes for animation issues
            enableMergePathsAndroidForKitKatAndAbove={false}
            enableSafeModeAndroid={Platform.OS === 'android'}
            cacheComposition={true}
            useNativeLooping={Platform.OS === 'ios'}
            speed={1.0}
            onAnimationFailure={error => {
              console.log(
                '[SendConfirmationAnimation] Animation failed on',
                Platform.OS,
                ':',
                error
              );
              setAnimationError(true);
            }}
            onAnimationFinish={isCancelled => {
              console.log(
                '[SendConfirmationAnimation] Animation finished on',
                Platform.OS,
                ', cancelled:',
                isCancelled
              );
            }}
            onAnimationLoaded={() => {
              console.log(
                '[SendConfirmationAnimation] Animation loaded successfully on',
                Platform.OS
              );
            }}
          />
        ) : null}

        {/* No overlay needed - dynamic injection handles everything */}
      </View>
    </AnimationErrorBoundary>
  );
};
