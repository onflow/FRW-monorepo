import * as React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const duration = 1000;

interface SkeletonProps extends React.ComponentPropsWithoutRef<typeof Animated.View> {
  isDark?: boolean;
}

function Skeleton({ style: customStyle, isDark = false, ...props }: SkeletonProps) {
  const sv = useSharedValue(1);

  React.useEffect(() => {
    sv.value = withRepeat(
      withSequence(withTiming(0.5, { duration }), withTiming(1, { duration })),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: sv.value,
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderRadius: 6,
        },
        animatedStyle,
        customStyle,
      ]}
      {...props}
    />
  );
}

export { Skeleton };
export default Skeleton;
