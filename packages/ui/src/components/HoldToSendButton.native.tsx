import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { View, useTheme } from 'tamagui';

import { Text } from '../foundation/Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HoldToSendButtonProps {
  onPress: () => Promise<void>;
  onComplete?: () => void;
  stopSignal?: boolean;
  holdDuration?: number;
  holdToSendText: string;
}

export const HoldToSendButton: React.FC<HoldToSendButtonProps> = ({
  onPress,
  onComplete,
  stopSignal = false,
  holdDuration = 1500,
  holdToSendText,
}) => {
  const theme = useTheme();
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const progressValue = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const progressAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const spinAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const CIRCLE_RADIUS = 8;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Theme-driven colors (inverse button): use $text as background and $bg as text
  const buttonBackgroundColor = theme.text?.val ?? '#000000';
  const buttonTextColor = theme.bg?.val ?? '#FFFFFF';
  const progressBackgroundColor = theme.textSecondary?.val ?? '#767676';

  const handleStop = useCallback(() => {
    if (progressAnimationRef.current) {
      progressAnimationRef.current.stop();
      progressAnimationRef.current = null;
    }

    if (spinAnimationRef.current) {
      spinAnimationRef.current.stop();
      spinAnimationRef.current = null;
    }

    setIsHolding(false);
    setIsCompleted(false);
    setIsAnimating(false);
    setIsDisabled(false);

    progressValue.setValue(0);
    spinValue.setValue(0);
    scaleValue.setValue(1);
  }, [progressValue, spinValue, scaleValue]);

  // Handle stop signal from external source
  useEffect(() => {
    if (stopSignal && (isAnimating || isCompleted)) {
      handleStop();
    }
  }, [stopSignal, isAnimating, isCompleted, handleStop]);

  const handlePressIn = useCallback(() => {
    if (isDisabled || isAnimating) return;

    setIsHolding(true);

    // Reset spin value to ensure smooth start
    spinValue.setValue(0);

    // Scale down animation on press
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    // Start progress animation
    progressAnimationRef.current = Animated.timing(progressValue, {
      toValue: 1,
      duration: holdDuration,
      useNativeDriver: true,
    });

    progressAnimationRef.current.start(({ finished }) => {
      if (finished) {
        // Prepare spinning animation before state changes
        spinAnimationRef.current = Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            // Add linear easing for smooth continuous rotation
            easing: Easing.linear,
          }),
          { iterations: -1 } // Infinite loop
        );

        // Update states and start spinning simultaneously
        setIsCompleted(true);
        setIsAnimating(true);
        setIsDisabled(true);

        // Start spinning animation immediately
        spinAnimationRef.current.start();

        // Call onPress and onComplete
        onPress().finally(() => {
          onComplete?.();
        });
      }
    });
  }, [
    isDisabled,
    isAnimating,
    isHolding,
    holdDuration,
    onPress,
    onComplete,
    progressValue,
    spinValue,
    scaleValue,
  ]);

  const handlePressOut = useCallback(() => {
    // Always scale back to normal, regardless of state
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();

    if (isCompleted || isAnimating) return;

    setIsHolding(false);

    // Stop progress animation
    if (progressAnimationRef.current) {
      progressAnimationRef.current.stop();
      progressAnimationRef.current = null;
    }

    progressValue.setValue(0);
  }, [isCompleted, isAnimating, progressValue, scaleValue]);

  // Cleanup on unmount
  useEffect(() => {
    return (): void => {
      if (progressAnimationRef.current) {
        progressAnimationRef.current.stop();
      }
      if (spinAnimationRef.current) {
        spinAnimationRef.current.stop();
      }
    };
  }, []);

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          {
            backgroundColor: buttonBackgroundColor,
            borderRadius: 16,
            paddingVertical: 16,
            minHeight: 56,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'stretch',
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {isAnimating ? (
          <View flexDirection="row" items="center" justify="center" gap="$3">
            <Animated.View
              style={[
                {
                  width: 20,
                  height: 20,
                  borderWidth: 4,
                  backgroundColor: '$red',
                  borderColor: progressBackgroundColor,
                  borderTopColor: progressBackgroundColor,
                  borderRadius: 10,
                  transform: [
                    {
                      rotate: spinValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text fontSize="$5" fontWeight="600" color={buttonTextColor}>
              {holdToSendText}
            </Text>
          </View>
        ) : (
          <View flexDirection="row" items="center" justify="center" gap="$3">
            <View width={20} height={20} items="center" justify="center">
              {isHolding || isCompleted ? (
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Circle
                    cx={12}
                    cy={12}
                    r={CIRCLE_RADIUS}
                    stroke={progressBackgroundColor}
                    strokeWidth={3}
                    fill="none"
                  />
                  <AnimatedCircle
                    cx={12}
                    cy={12}
                    r={CIRCLE_RADIUS}
                    stroke={buttonTextColor}
                    strokeWidth={3}
                    fill="none"
                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                    strokeDashoffset={progressValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [CIRCLE_CIRCUMFERENCE, 0],
                    })}
                    strokeLinecap="round"
                    transform="rotate(-90 12 12)"
                  />
                </Svg>
              ) : (
                <View width={20} height={20} borderWidth={3} borderColor="$gray8" rounded="$10" />
              )}
            </View>
            <Text
              fontSize="$5"
              fontWeight="600"
              color={buttonTextColor}
              textAlign="center"
              flexShrink={0}
            >
              {holdToSendText}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
