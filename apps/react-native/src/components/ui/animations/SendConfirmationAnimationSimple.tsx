import type { NFTModel } from '@onflow/frw-types';
import { getNFTCover, convertedSVGURL } from '@onflow/frw-utils';
import React, { useRef, useEffect, useState } from 'react';
import { type ViewStyle, View, Image } from 'react-native';
import { Animated, Easing } from 'react-native';

interface SendConfirmationAnimationSimpleProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  autoPlay?: boolean;
  selectedToken?: { symbol?: string; name?: string; logoURI?: string; identifier?: string };
  selectedNFTs?: NFTModel[];
  transactionType?: string;
}

export const SendConfirmationAnimationSimple: React.FC<SendConfirmationAnimationSimpleProps> = ({
  width = 399,
  height = 148,
  style,
  autoPlay = true,
  selectedToken,
  selectedNFTs,
  transactionType,
}) => {
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

  // Reset error state when imageUri changes
  useEffect(() => {
    setImageLoadError(false);

    console.log('[SendConfirmationAnimationSimple] Transaction Debug:', {
      transactionType,
      isNFTTransaction,
      hasSelectedNFTs: !!(selectedNFTs && selectedNFTs.length > 0),
      selectedNFTsCount: selectedNFTs?.length || 0,
      finalImageUri: imageUri,
      imageLoadError,
      isFlowToken,
      shouldShowFlowLogo,
    });
  }, [
    imageUri,
    isNFTTransaction,
    selectedNFTs,
    imageLoadError,
    transactionType,
    shouldShowFlowLogo,
    isFlowToken,
  ]);

  // Simple animation values
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (autoPlay) {
      // Simple bounce animation
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -10,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 800,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

      bounceAnimation.start();

      return () => {
        bounceAnimation.stop();
      };
    }
  }, [autoPlay, translateY]);

  const animatedStyle = {
    transform: [{ translateY }],
    opacity,
  };

  return (
    <View style={[{ width, height, position: 'relative', overflow: 'visible' }, style]}>
      {/* Simple background */}
      <View
        style={{
          width,
          height,
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#f8fafc',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Background pattern */}
        <View
          style={{
            width: 100,
            height: 60,
            backgroundColor: '#e2e8f0',
            borderRadius: 8,
            opacity: 0.5,
          }}
        />
      </View>

      {/* Animated Token/Coin */}
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
              shadowColor: '#000',
              shadowOffset: { width: 0, height: isNFTTransaction ? 4 : 3 },
              shadowOpacity: isNFTTransaction ? 0.15 : 0.2,
              shadowRadius: isNFTTransaction ? 8 : 6,
              elevation: isNFTTransaction ? 8 : 6,
            },
            animatedStyle,
          ]}
        >
          {imageUri ? (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isNFTTransaction ? '#ffffff' : 'transparent',
                borderWidth: isNFTTransaction ? 0.5 : 0,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
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
                    '[SendConfirmationAnimationSimple] Failed to load image:',
                    imageUri,
                    error
                  );
                  setImageLoadError(true);
                }}
                onLoadStart={() => {
                  console.log('[SendConfirmationAnimationSimple] Started loading image:', imageUri);
                }}
                onLoadEnd={() => {
                  console.log(
                    '[SendConfirmationAnimationSimple] Finished loading image:',
                    imageUri
                  );
                }}
              />
            </View>
          ) : (
            // Fallback placeholder
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
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
                  borderRadius: 12,
                }}
              />
            </View>
          )}
        </Animated.View>
      ) : null}
    </View>
  );
};
