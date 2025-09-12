import React, { useEffect, useRef } from 'react';
import { View, type ViewProps } from 'tamagui';

// Cross-platform Lottie component
interface LottieAnimationProps extends ViewProps {
  source: any; // Lottie JSON data
  autoPlay?: boolean;
  loop?: boolean;
  width?: number;
  height?: number;
  speed?: number;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  source,
  autoPlay = true,
  loop = true,
  width = 200,
  height = 200,
  speed = 1,
  ...viewProps
}) => {
  const animationRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load lottie-web on web platform
    if (typeof window !== 'undefined' && containerRef.current) {
      import('lottie-web').then((Lottie) => {
        if (!containerRef.current || animationRef.current) return;

        animationRef.current = Lottie.default.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop,
          autoplay: autoPlay,
          animationData: source,
        });

        animationRef.current.setSpeed(speed);

        return () => {
          animationRef.current?.destroy();
        };
      });
    }
  }, [source, autoPlay, loop, speed]);

  // For React Native, we would use lottie-react-native
  // This is a web-only implementation for now
  // For React Native support, you'd conditionally import and use:
  // import LottieView from 'lottie-react-native';

  return (
    <View width={width} height={height} {...viewProps}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  );
};

// Export a React Native version if needed
export const LottieAnimationNative: React.FC<LottieAnimationProps> = (props) => {
  // This would be implemented with lottie-react-native
  // For now, return a placeholder
  return <View {...props} />;
};
