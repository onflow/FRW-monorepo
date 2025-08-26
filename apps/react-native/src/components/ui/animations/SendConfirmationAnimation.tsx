import type { NFTModel } from '@onflow/frw-types';
import { getNFTCover, convertedSVGURL } from '@onflow/frw-utils';
import LottieView from 'lottie-react-native';
import React, { useRef, useEffect, useState } from 'react';
import { type ViewStyle, View, Image } from 'react-native';
import { Animated, Easing } from 'react-native';

import sendConfirmationAnimationDynamic from '@/assets/animations/send-confirmation-dynamic.json';
import sendConfirmationAnimationStatic from '@/assets/animations/send-confirmation.json';
import { injectImageWithFallbacks } from '@/utils/lottie-image-injection';

import { AnimationErrorBoundary } from './AnimationErrorBoundary';

/**
 * DYNAMIC LOTTIE ANIMATION APPROACH
 * ================================
 *
 * Current Implementation:
 * - Uses send-confirmation-dynamic.json which includes an image asset placeholder (image_0)
 * - Still uses overlay approach due to lottie-react-native limitations for runtime asset injection
 * - Matches exact positioning, timing, and rotation from the dynamic animation's image layer
 *
 * The Dynamic Animation Asset Structure:
 * - Asset: {"id": "image_0", "w": 500, "h": 500, "u": "images/", "p": "img_0.png", "e": 0}
 * - Image Layer: {"ind": 7, "ty": 2, "refId": "image_0"} with precise positioning data
 * - Animation frames: 0->25->59 with positions [795.706,349.752] -> [829.597,172] -> [795.706,349.752]
 * - Rotation: -5° -> -19° -> -5°, Scale: 46% of 500x500px asset
 *
 * Current Status (Experimental):
 * - Attempts runtime JSON modification to inject image URIs into asset references
 * - Falls back to precise overlay positioning if asset injection doesn't work
 * - Logs experiments to console for debugging
 *
 * How to test if asset injection works:
 * 1. Check console logs for "EXPERIMENTAL: Injecting image URI into Lottie JSON"
 * 2. If image appears in animation without overlay visible, asset injection worked
 * 3. If overlay is still visible, lottie-react-native doesn't support runtime assets
 *
 * Future Improvement Opportunities:
 * 1. Monitor lottie-react-native updates for runtime asset replacement support
 * 2. Custom native bridge for true asset injection if needed
 * 3. Alternative: Pre-generate animation variants with common assets
 *
 * Benefits of current approach vs previous:
 * - Uses animation file designed for dynamic content
 * - Exact positioning match with built-in image layer
 * - Foundation ready for true asset injection when supported
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
  loop = false,
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
  const [isInjectionReady, setIsInjectionReady] = useState(false);

  // Determine what to show based on transaction type and available data
  const isNFTTransaction = transactionType?.includes('nft');
  const isFlowToken = selectedToken?.symbol === 'FLOW' || selectedToken?.name === 'FLOW';
  const shouldShowFlowLogo = !selectedToken && !isNFTTransaction;

  // Get image URI - for NFT transactions, prioritize collection square image
  const getImageUri = () => {
    if (isNFTTransaction && selectedNFTs && selectedNFTs.length > 0) {
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

  // Create dynamic animation JSON with proper image injection
  const [dynamicAnimationData, setDynamicAnimationData] = useState<any>(null);

  // Handle async image injection
  useEffect(() => {
    const createAnimationWithInjection = async () => {
      try {
        // Enable dynamic animation for true image injection
        const baseAnimation = sendConfirmationAnimationDynamic;

        // Validate that the base animation data exists and is valid
        if (!baseAnimation || typeof baseAnimation !== 'object') {
          console.warn('[SendConfirmationAnimation] Invalid base animation data, using fallback');
          setDynamicAnimationData(sendConfirmationAnimationStatic);
          return;
        }

        // If we have an image to inject, use the advanced injection method
        if (imageUri && !imageLoadError && !shouldShowFlowLogo) {
          const result = await injectImageWithFallbacks(baseAnimation, 'image_0', imageUri);

          setInjectionResult({
            method: result.method,
            success: result.success,
          });

          if (result.success) {
            setDynamicAnimationData(result.animationData);
          } else {
            console.log(
              '[SendConfirmationAnimation] ❌ Image injection FAILED, using static animation'
            );
            setDynamicAnimationData(sendConfirmationAnimationStatic);
          }
          setIsInjectionReady(true);
        } else {
          // No image to inject, use dynamic animation as-is
          console.log(
            '[SendConfirmationAnimation] Using dynamic animation without image injection'
          );
          setDynamicAnimationData(baseAnimation);
          setInjectionResult({ method: null, success: false });
          setIsInjectionReady(true);
        }
      } catch (error) {
        console.error(
          '[SendConfirmationAnimation] Failed to create dynamic animation data:',
          error
        );
        setAnimationError(true);
        setDynamicAnimationData(sendConfirmationAnimationStatic);
        setIsInjectionReady(true);
      }
    };

    createAnimationWithInjection();
  }, [imageUri, imageLoadError, shouldShowFlowLogo, isFlowToken]);

  // Determine if overlay will be shown based on injection success
  // If image injection succeeded, we don't need the overlay!
  const willShowOverlay =
    !injectionResult.success &&
    ((isNFTTransaction && selectedNFTs && selectedNFTs.length > 0) ||
      (imageUri && !imageLoadError && !shouldShowFlowLogo));

  // Reset error state when imageUri changes
  useEffect(() => {
    setImageLoadError(false);
    setAnimationError(false);
    setIsInjectionReady(false);

    if (isNFTTransaction && selectedNFTs && selectedNFTs.length > 0) {
      const firstNFT = selectedNFTs[0];
    }
  }, [
    imageUri,
    isNFTTransaction,
    selectedNFTs,
    imageLoadError,
    transactionType,
    shouldShowFlowLogo,
    isFlowToken,
    willShowOverlay,
  ]);

  // Animation values for the token overlay
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (autoPlay && isInjectionReady) {
      const animationDuration = 2000;

      // Follow the Flow coin animation exactly for all overlays
      // Extract exact timing from Lottie animation: 60 frames at 29.97fps ≈ 2 seconds

      // Image animation extracted from dynamic Lottie JSON:
      // Original animation canvas: 1500x816, image moves from [795.706,349.752] to [829.597,172] to [795.706,349.752]
      // Image scale: 46% of original 500x500px asset, so final size is 230x230px in Lottie coordinate space
      // Our canvas: 399x148, so we need to scale coordinates
      const scaleX = 399 / 1500; // 0.266
      const scaleY = 148 / 816; // 0.181

      // Image positions from dynamic Lottie keyframes (on 1500x816 canvas) - VERIFIED FROM DYNAMIC ANIMATION
      const lottieStartX = 795.706;
      const lottiePeakX = 829.597;
      const lottieStartY = 349.752;
      const lottiePeakY = 172;

      // Scale to our display size (399x148)
      const scaledStartX = lottieStartX * scaleX; // ~211.6px from left
      const scaledPeakX = lottiePeakX * scaleX; // ~220.7px from left
      const scaledStartY = lottieStartY * scaleY; // ~63.4px from top
      const scaledPeakY = lottiePeakY * scaleY; // ~31.1px from top

      // Our overlay is positioned with transform origin at center (50%, 50%)
      // So we need to convert absolute positions to relative offsets from center
      const centerX = width / 2; // 199.5px
      const centerY = height / 2; // 74px

      // The dynamic animation has exact positioning - use precise offsets for perfect alignment
      // Since we're matching the exact same coordinates as the built-in image layer
      const relativeStartX = scaledStartX - centerX - 8; // Fine-tuned for perfect alignment
      const relativePeakX = scaledPeakX - centerX - 8;
      const relativeStartY = scaledStartY - centerY - 6; // Fine-tuned for perfect alignment
      const relativePeakY = scaledPeakY - centerY - 6;

      // Timing based on exact frame positions but adjusted for better coverage: 0->25->59 frames
      const firstPhaseRatio = 25 / 60; // 0.417 (41.7% of total time) - going up
      const secondPhaseRatio = 26 / 60; // 0.433 (43.3% of total time) - coming down much faster

      // Set initial positions - matching dynamic animation exactly
      translateX.setValue(relativeStartX);
      translateY.setValue(relativeStartY);
      rotation.setValue(-5); // Exact value from dynamic animation
      scale.setValue(1);

      // Create animated sequences
      const horizontalAnimation = Animated.sequence([
        Animated.timing(translateX, {
          toValue: relativePeakX,
          duration: animationDuration * firstPhaseRatio,
          easing: Easing.bezier(0.667, 0.658, 0.333, 0),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: relativeStartX,
          duration: animationDuration * secondPhaseRatio,
          easing: Easing.bezier(0.667, 1, 0.333, 0.686),
          useNativeDriver: true,
        }),
      ]);

      const verticalAnimation = Animated.sequence([
        Animated.timing(translateY, {
          toValue: relativePeakY,
          duration: animationDuration * firstPhaseRatio,
          easing: Easing.bezier(0.667, 0.658, 0.333, 0),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: relativeStartY,
          duration: animationDuration * secondPhaseRatio,
          easing: Easing.bezier(0.667, 1, 0.333, 0.686),
          useNativeDriver: true,
        }),
      ]);

      const rotationAnimation = Animated.sequence([
        Animated.timing(rotation, {
          toValue: -19,
          duration: animationDuration * firstPhaseRatio,
          easing: Easing.bezier(0.833, 1, 0.167, 0),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -5,
          duration: animationDuration * secondPhaseRatio,
          easing: Easing.bezier(0.833, 1, 0.519, 0),
          useNativeDriver: true,
        }),
      ]);

      // Run all animations in parallel
      Animated.parallel([horizontalAnimation, verticalAnimation, rotationAnimation]).start();
    }
  }, [autoPlay, isInjectionReady, translateX, translateY, rotation, scale, width, height]);

  const animatedTokenStyle = {
    transform: [
      { translateX },
      { translateY },
      {
        rotate: rotation.interpolate({
          inputRange: [-360, 360],
          outputRange: ['-360deg', '360deg'],
        }),
      },
      { scale },
    ],
  };

  return (
    <AnimationErrorBoundary>
      <View style={[{ width, height, position: 'relative', overflow: 'visible' }, style]}>
        {/* Loading state - show transparent background until injection is ready */}
        {!isInjectionReady && (
          <View
            style={{
              width,
              height,
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: 'transparent',
              zIndex: 10,
            }}
          />
        )}

        {/* Static background for NFT transactions */}
        {isNFTTransaction && isInjectionReady && (
          <View
            style={{
              width,
              height,
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: 'transparent',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        )}

        {/* Lottie Animation Background */}
        {!animationError && dynamicAnimationData && isInjectionReady ? (
          <LottieView
            ref={animationRef}
            source={dynamicAnimationData}
            autoPlay={autoPlay && isInjectionReady}
            loop={loop}
            style={{
              width,
              height,
              position: 'absolute',
              top: 0,
              left: 0,
              // When true injection works, show at full opacity. When using overlay, reduce opacity.
              opacity: injectionResult.success ? 1 : willShowOverlay ? 0.3 : 1,
            }}
            resizeMode="contain"
            onAnimationFailure={error => {
              console.error('[SendConfirmationAnimation] Lottie animation failed:', error);
              setAnimationError(true);
            }}
          />
        ) : isInjectionReady ? (
          // Fallback when animation fails
          <View
            style={{
              width,
              height,
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Simple fallback animation or static content */}
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
        ) : null}

        {/* Animated Token/Coin Overlay - positioned to match Flow coin exactly */}
        {/* ONLY show overlay when injection fails - this enables TRUE dynamic injection! */}
        {willShowOverlay && isInjectionReady ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 56, // Keep current size for now, matches well with the animation scale
                height: 56,
                marginLeft: -28,
                marginTop: -28,
                zIndex: 3,
                // Remove borderRadius from container to prevent clipping
                // Add padding to accommodate shadow
                shadowColor: '#000',
                shadowOffset: { width: 0, height: isNFTTransaction ? 4 : 3 },
                shadowOpacity: isNFTTransaction ? 0.15 : 0.2,
                shadowRadius: isNFTTransaction ? 8 : 6,
                elevation: isNFTTransaction ? 8 : 6,
              },
              animatedTokenStyle,
            ]}
          >
            {imageUri ? (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28, // Circular clipping container
                  backgroundColor: isNFTTransaction ? '#ffffff' : 'transparent', // White background for NFTs
                  borderWidth: isNFTTransaction ? 0.5 : 0,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden', // This ensures the image is clipped to the circle
                }}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28, // Apply circular border radius directly to image for reliable clipping
                  }}
                  resizeMode="cover"
                  onError={error => {
                    console.log(
                      '[SendConfirmationAnimation] Failed to load image:',
                      imageUri,
                      error
                    );
                    console.log(
                      '[SendConfirmationAnimation] Consider checking if the URL is valid and accessible'
                    );
                    setImageLoadError(true);
                  }}
                  onLoadStart={() => {
                    //  console.log('[SendConfirmationAnimation] Started loading image:', imageUri);
                  }}
                  onLoadEnd={() => {
                    //  console.log('[SendConfirmationAnimation] Finished loading image:', imageUri);
                  }}
                  defaultSource={undefined} // Ensure no default source conflicts
                />
              </View>
            ) : (
              // Fallback placeholder for NFT transactions without images
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28, // Always circular for both NFTs and tokens
                  backgroundColor: isNFTTransaction ? '#6366f1' : '#10b981',
                  borderWidth: isNFTTransaction ? 0.5 : 0,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 12, // Make the inner icon circular too
                  }}
                />
              </View>
            )}
          </Animated.View>
        ) : null}
      </View>
    </AnimationErrorBoundary>
  );
};
