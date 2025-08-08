import LottieView from 'lottie-react-native';
import React, { useRef, useEffect } from 'react';
import { type ViewStyle, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import sendConfirmationAnimation from '@/assets/animations/send-confirmation.json';
import FlowLogo from '@/assets/icons/tokens/FlowLogo';

interface Token {
  symbol?: string;
  name?: string;
  logoURI?: string;
  identifier?: string;
}

interface NFT {
  id: string | number;
  name?: string;
  collectionSquareImage?: string;
}

interface SendConfirmationAnimationProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  autoPlay?: boolean;
  loop?: boolean;
  selectedToken?: Token;
  selectedNFTs?: NFT[];
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

  // Determine what to show based on transaction type and available data
  const isNFTTransaction = transactionType?.includes('nft');
  const shouldShowFlowLogo = !selectedToken && !isNFTTransaction;

  // Get image URI - only use collection square image for NFT transactions
  const getImageUri = () => {
    if (isNFTTransaction && selectedNFTs && selectedNFTs.length > 0) {
      const firstNFT = selectedNFTs[0];
      return firstNFT.collectionSquareImage || null;
    }
    return selectedToken?.logoURI;
  };

  const imageUri = getImageUri();

  // Animation values for the token overlay
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (autoPlay) {
      // Extract exact timing from Lottie animation: 60 frames at 29.97fps ≈ 2 seconds
      const animationDuration = 2000;

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
    <View style={[{ width, height, position: 'relative' }, style]}>
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
        }}
        resizeMode="contain"
      />

      {/* Animated Token/Coin Overlay - positioned to match Flow coin exactly */}
      {!shouldShowFlowLogo && imageUri && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 56,
              height: 56,
              borderRadius: 28, // Always circular for collection images and tokens
              marginLeft: -28,
              marginTop: -28,
              zIndex: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 6,
            },
            animatedTokenStyle,
          ]}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28, // Always circular for collection images and tokens
              }}
              resizeMode="cover"
            />
          ) : (
            // Fallback to Flow logo with circular background
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28, // Always circular for collection images and tokens
                backgroundColor: '#00EF8B',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FlowLogo width={30} height={30} />
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};
