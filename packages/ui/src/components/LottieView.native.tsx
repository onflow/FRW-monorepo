// eslint-disable-next-line import/no-unresolved
import RNAnimatedLottieView, { type AnimationObject } from 'lottie-react-native';
import React from 'react';
import { Platform } from 'react-native';

// Re-export a compatible LottieView component for native platforms
export type LottieSource = AnimationObject | { uri: string } | number;

export interface LottieViewProps {
  source: LottieSource;
  autoPlay?: boolean;
  loop?: boolean;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'center';
  enableMergePathsAndroidForKitKatAndAbove?: boolean;
  cacheComposition?: boolean;
  speed?: number;
  onAnimationFailure?: (error: unknown) => void;
  onAnimationLoaded?: () => void;
}

const LottieView = React.forwardRef<RNAnimatedLottieView, LottieViewProps>(
  (
    {
      source,
      autoPlay = true,
      loop = true,
      style,
      resizeMode = 'contain',
      enableMergePathsAndroidForKitKatAndAbove = false,
      cacheComposition = true,
      speed = 1,
      onAnimationFailure,
      onAnimationLoaded,
    },
    ref
  ) => {
    const animationRef = React.useRef<RNAnimatedLottieView>(null);

    // Expose ref to parent and set up images folder for Android
    React.useImperativeHandle(ref, () => animationRef.current!, []);

    return (
      <RNAnimatedLottieView
        ref={animationRef}
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        style={style}
        resizeMode={resizeMode}
        enableMergePathsAndroidForKitKatAndAbove={enableMergePathsAndroidForKitKatAndAbove}
        cacheComposition={cacheComposition}
        speed={speed}
        onAnimationFailure={onAnimationFailure as any}
        onAnimationLoaded={() => {
          // Set images folder to prevent IllegalStateException on Android only
          if (
            Platform.OS === 'android' &&
            animationRef.current &&
            typeof animationRef.current.setImagesFolder === 'function'
          ) {
            animationRef.current.setImagesFolder('');
          }
          onAnimationLoaded?.();
        }}
      />
    );
  }
);

LottieView.displayName = 'LottieView(native)';

export default LottieView;
