import type { NFTModel } from '@onflow/frw-types';
import { getNFTCover, convertedSVGURL } from '@onflow/frw-utils';
import LottieView from 'lottie-react-native';
import React, { useRef, useEffect, useState } from 'react';
import { type ViewStyle, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import sendConfirmationAnimation from '@/assets/animations/send-confirmation.json';

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
      const collectionLogo = firstNFT.collection?.logo?.trim();
      const collectionLogoURI = firstNFT.collection?.logoURI?.trim();

      if (collectionSquareImage) {
        return convertedSVGURL(collectionSquareImage);
      }
      if (collectionBannerImage) {
        return convertedSVGURL(collectionBannerImage);
      }
      if (collectionLogo) {
        return convertedSVGURL(collectionLogo);
      }
      if (collectionLogoURI) {
        return convertedSVGURL(collectionLogoURI);
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

  // Determine if overlay will be shown to adjust animation opacity
  const willShowOverlay =
    (isNFTTransaction && selectedNFTs && selectedNFTs.length > 0) ||
    (imageUri && !imageLoadError && !shouldShowFlowLogo && !isFlowToken);

  // Reset error state when imageUri changes
  useEffect(() => {
    setImageLoadError(false);

    // Always log basic transaction info for debugging
    console.log('[SendConfirmationAnimation] Transaction Debug:', {
      transactionType,
      isNFTTransaction,
      hasSelectedNFTs: !!(selectedNFTs && selectedNFTs.length > 0),
      selectedNFTsCount: selectedNFTs?.length || 0,
      finalImageUri: imageUri,
      imageLoadError,
      shouldShowOverlay: willShowOverlay,
    });

    if (isNFTTransaction && selectedNFTs && selectedNFTs.length > 0) {
      const firstNFT = selectedNFTs[0];
      console.log('[SendConfirmationAnimation] NFT Animation Debug:', {
        finalImageUri: imageUri,
        collectionSquareImage: firstNFT.collectionSquareImage,
        collectionLogo: firstNFT.collection?.logo,
        collectionLogoURI: firstNFT.collection?.logoURI,
        nftCover: getNFTCover(firstNFT),
        thumbnail: firstNFT.thumbnail,
        postMediaImage: firstNFT.postMedia?.image,
        hasNestedCollection: !!firstNFT.collection,
        nftName: firstNFT.name,
        collectionName: firstNFT.collectionName,
        // Additional collection properties that might be available
        collectionBannerImage: firstNFT.collectionBannerImage,
        contractName: firstNFT.contractName,
        collectionContractName: firstNFT.collectionContractName,
        // Full nested collection object for debugging
        fullNestedCollection: firstNFT.collection,
      });

      // Special TopShot debugging
      if (
        firstNFT.collectionName?.toLowerCase().includes('topshot') ||
        firstNFT.collectionContractName?.toLowerCase().includes('topshot')
      ) {
        console.log('[SendConfirmationAnimation] TopShot Specific Debug:', {
          allCollectionProperties: Object.keys(firstNFT).filter(key =>
            key.toLowerCase().includes('collection')
          ),
          allImageProperties: Object.keys(firstNFT).filter(
            key =>
              key.toLowerCase().includes('image') ||
              key.toLowerCase().includes('logo') ||
              key.toLowerCase().includes('uri')
          ),
        });
      }
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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (autoPlay) {
      const animationDuration = 2000;

      // Follow the Flow coin animation exactly for all overlays
      // Extract exact timing from Lottie animation: 60 frames at 29.97fps ≈ 2 seconds

      // Flow coin position animation extracted from Lottie JSON:
      // Original animation canvas: 1500x816, Flow coin moves from [795.706,349.752] to [829.597,172] to [795.706,349.752]
      // Our canvas: 399x148, so we need to scale coordinates
      const scaleX = 399 / 1500; // 0.266
      const scaleY = 148 / 816; // 0.181

      // Flow coin positions from Lottie keyframes (on 1500x816 canvas)
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

      // Adjust positioning to ensure complete coverage of Flow coin
      const relativeStartX = scaledStartX - centerX - 10; // Shift 10px left (reduced from 12px to slide right slightly)
      const relativePeakX = scaledPeakX - centerX - 10;
      const relativeStartY = scaledStartY - centerY - 8; // Shift 8px up to match Flow coin jump
      const relativePeakY = scaledPeakY - centerY - 8;

      // Timing based on exact frame positions but adjusted for better coverage: 0->25->59 frames
      const firstPhaseRatio = 25 / 60; // 0.417 (41.7% of total time) - going up
      const secondPhaseRatio = 26 / 60; // 0.433 (43.3% of total time) - coming down much faster

      // Horizontal movement matching Flow coin exactly
      translateX.value = withSequence(
        withTiming(relativeStartX, { duration: 0, easing: Easing.linear }),
        withTiming(relativePeakX, {
          duration: animationDuration * firstPhaseRatio,
          easing: Easing.bezier(0.667, 0.658, 0.333, 0),
        }),
        withTiming(relativeStartX, {
          duration: animationDuration * secondPhaseRatio,
          easing: Easing.bezier(0.667, 1, 0.333, 0.686),
        })
      );

      // Vertical movement matching Flow coin arc
      translateY.value = withSequence(
        withTiming(relativeStartY, { duration: 0, easing: Easing.linear }),
        withTiming(relativePeakY, {
          duration: animationDuration * firstPhaseRatio,
          easing: Easing.bezier(0.667, 0.658, 0.333, 0),
        }),
        withTiming(relativeStartY, {
          duration: animationDuration * secondPhaseRatio,
          easing: Easing.bezier(0.667, 1, 0.333, 0.686),
        })
      );

      // Rotation matching Flow coin exactly: -5° -> -19° -> -5°
      rotation.value = withSequence(
        withTiming(-5, { duration: 0, easing: Easing.linear }),
        withTiming(-19, {
          duration: animationDuration * firstPhaseRatio,
          easing: Easing.bezier(0.833, 1, 0.167, 0),
        }),
        withTiming(-5, {
          duration: animationDuration * secondPhaseRatio,
          easing: Easing.bezier(0.833, 1, 0.519, 0),
        })
      );

      // Scale stays at 1 (since we're already sizing the overlay correctly)
      scale.value = withTiming(1, { duration: 0, easing: Easing.linear });
    }
  }, [autoPlay, translateX, translateY, rotation, scale, width, height]);

  const animatedTokenStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={[{ width, height, position: 'relative', overflow: 'visible' }, style]}>
      {/* Static background for NFT transactions */}
      {isNFTTransaction && (
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
      <LottieView
        ref={animationRef}
        source={sendConfirmationAnimation}
        autoPlay={autoPlay}
        loop={loop}
        style={{
          width,
          height,
          position: 'absolute',
          top: 0,
          left: 0,
          // Reduce opacity when overlay is shown to minimize green shadow interference
          opacity: willShowOverlay ? 0.3 : 1,
        }}
        resizeMode="contain"
      />

      {/* Animated Token/Coin Overlay - positioned to match Flow coin exactly */}
      {/* Show overlay for NFT transactions (with fallback) or token transactions with valid image */}
      {(isNFTTransaction && selectedNFTs && selectedNFTs.length > 0) ||
      (imageUri && !imageLoadError && !shouldShowFlowLogo && !isFlowToken) ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 56,
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
                  borderRadius: 0, // Remove border radius from image since container handles clipping
                }}
                resizeMode="cover"
                onError={error => {
                  console.log('[SendConfirmationAnimation] Failed to load image:', imageUri, error);
                  console.log(
                    '[SendConfirmationAnimation] Consider checking if the URL is valid and accessible'
                  );
                  setImageLoadError(true);
                }}
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
  );
};
