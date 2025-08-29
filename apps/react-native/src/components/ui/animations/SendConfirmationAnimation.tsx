import type { NFTModel } from '@onflow/frw-types';
import { convertedSVGURL, getNFTCover } from '@onflow/frw-utils';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { type ViewStyle, Platform, View } from 'react-native';

import sendConfirmationAnimationDynamic from '@/assets/animations/send-confirmation-dynamic.json';
import sendConfirmationAnimationStatic from '@/assets/animations/send-confirmation.json';
import { injectImageWithFallbacks } from '@/utils/lottie-image-injection';

import { AnimationErrorBoundary } from './AnimationErrorBoundary';

/**
 * SEND CONFIRMATION ANIMATION
 * ==========================
 *
 * Progressive Loading Strategy:
 * 1. Static First: Immediately show static Lottie animation (no delay)
 * 2. Dynamic Upgrade: Async prepare dynamic version with injected images
 * 3. Seamless Switch: Replace with dynamic version when ready
 *
 * This approach ensures:
 * - Zero delay - users see animation immediately
 * - Enhanced experience - dynamic images appear when ready
 * - Graceful fallback - works even if dynamic injection fails
 * - iOS optimized - Buffer-based base64 encoding for reliability
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
}) => {
  const animationRef = useRef<LottieView>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [animationError, setAnimationError] = useState(false);
  const [injectionResult, setInjectionResult] = useState<{
    method: 'base64' | 'url' | 'failed' | null;
    success: boolean;
  }>({ method: null, success: false });
  const [currentAnimationSource, setCurrentAnimationSource] = useState<any>(
    sendConfirmationAnimationStatic
  );

  // Determine what to show based on transaction type and available data
  const shouldShowFlowLogo = !selectedToken && !transactionType?.includes('nft');

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

  // Progressive loading: Start with static, upgrade to dynamic when ready
  useEffect(() => {
    // Step 1: Always start with static animation (immediate, no delay)
    console.log('[SendConfirmationAnimation] Starting with static animation');
    setCurrentAnimationSource(sendConfirmationAnimationStatic);

    // Step 2: Async prepare dynamic version in background
    const prepareDynamicVersion = async () => {
      try {
        console.log('[SendConfirmationAnimation] Platform:', Platform.OS);
        console.log('[SendConfirmationAnimation] Preparing dynamic version in background');

        const baseAnimation = sendConfirmationAnimationDynamic;

        // Validate that the base animation data exists and is valid
        if (!baseAnimation || typeof baseAnimation !== 'object') {
          console.warn(
            '[SendConfirmationAnimation] Invalid dynamic animation data, staying with static'
          );
          return; // Keep using static
        }

        // If we have an image to inject, use the advanced injection method
        if (imageUri && !imageLoadError && !shouldShowFlowLogo) {
          console.log('[SendConfirmationAnimation] Attempting image injection for:', imageUri);

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
            console.log(
              '[SendConfirmationAnimation] ✅ Upgrading to dynamic animation with injected image'
            );
            setCurrentAnimationSource(result.animationData);
          } else {
            console.log(
              '[SendConfirmationAnimation] ⚠️ Image injection failed, but upgrading to dynamic base animation'
            );
            setCurrentAnimationSource(baseAnimation);
          }
        } else {
          // No image to inject, but can still upgrade to dynamic animation
          console.log(
            '[SendConfirmationAnimation] Upgrading to dynamic animation without image injection'
          );
          setCurrentAnimationSource(baseAnimation);
          setInjectionResult({ method: null, success: false });
        }
      } catch (error) {
        console.error(
          '[SendConfirmationAnimation] Dynamic preparation failed, keeping static:',
          error
        );
        // Keep using static animation - no setAnimationError(true)
      }
    };

    // Start background preparation (non-blocking)
    prepareDynamicVersion();
  }, [imageUri, imageLoadError, shouldShowFlowLogo]);

  // Reset error state when imageUri changes
  useEffect(() => {
    setImageLoadError(false);
    setAnimationError(false);
    // Reset to static animation when imageUri changes
    setCurrentAnimationSource(sendConfirmationAnimationStatic);
  }, [imageUri]);

  return (
    <AnimationErrorBoundary>
      <View style={[{ width, height, position: 'relative', overflow: 'visible' }, style]}>
        {/* No loading state needed - static animation shows immediately */}

        {/* Lottie Animation - Progressive: Static → Dynamic */}
        {!animationError ? (
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
        ) : (
          // Simple fallback when animation fails to load
          <View
            style={{
              width,
              height,
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: '#10b981',
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: 'white',
                  borderRadius: 12,
                }}
              />
            </View>
          </View>
        )}

        {/* No overlay needed - dynamic injection handles everything */}
      </View>
    </AnimationErrorBoundary>
  );
};
