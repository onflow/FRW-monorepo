import * as React from 'react';
import { Animated, type ViewStyle } from 'react-native';

const duration = 1000;

interface SkeletonProps {
  isDark?: boolean;
  style?: ViewStyle;
}

function Skeleton({ style: customStyle, isDark = false, ...props }: SkeletonProps) {
  const opacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.5,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, []);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderRadius: 6,
          opacity,
        },
        customStyle,
      ]}
      {...props}
    />
  );
}

export { Skeleton };
export default Skeleton;
