import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { View, useThemeName } from 'tamagui';

import type { SkeletonProps } from '../types';

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  animated = true,
  baseBgLight,
  baseBgDark,
  animationType = 'pulse',
  pulseDuration = 1000,
  pulseMinOpacity = 0.6,
  pulseMaxOpacity = 1,
  ...rest
}: SkeletonProps): React.ReactElement {
  const themeName = useThemeName();
  const isDark = !!themeName?.includes('dark');
  const pulseAnim = useRef(new Animated.Value(pulseMinOpacity)).current;

  useEffect(() => {
    if (!animated || animationType !== 'pulse') return;
    pulseAnim.stopAnimation();
    pulseAnim.setValue(pulseMinOpacity);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: pulseMaxOpacity,
          duration: pulseDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: pulseMinOpacity,
          duration: pulseDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated, animationType, pulseAnim, pulseDuration, pulseMinOpacity, pulseMaxOpacity]);
  const baseBg = isDark ? baseBgDark || ('$light10' as any) : baseBgLight || ('$dark10' as any);

  if (animated && animationType === 'pulse') {
    return (
      <Animated.View style={{ opacity: pulseAnim }}>
        <View
          width={width as any}
          height={height as any}
          rounded={borderRadius as any}
          bg={baseBg}
          overflow="hidden"
          {...rest}
        />
      </Animated.View>
    );
  }

  return (
    <View
      width={width as any}
      height={height as any}
      rounded={borderRadius as any}
      bg="$subtleBg10"
      animation={animated ? 'lazy' : undefined}
      animateOnly={['opacity']}
      opacity={animated ? 0.8 : 1}
      // Simple pulse animation using Tamagui's built-in animations
      {...(animated && {
        '$theme-light': {
          bg: '$subtleBg10',
        },
        '$theme-dark': {
          bg: '$subtleBg10',
        },
      })}
      overflow="hidden"
      {...rest}
    />
  );
}

export { Skeleton as UISkeleton };
