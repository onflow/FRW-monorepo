import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

import { useAndroidTextFix } from '@/lib/androidTextFix';

interface HoldToSendButtonProps {
  onPress: () => Promise<void>;
  onComplete?: () => void;
  stopSignal?: boolean;
  holdDuration?: number;
}

export const HoldToSendButton: React.FC<HoldToSendButtonProps> = ({
  onPress,
  onComplete,
  stopSignal = false,
  holdDuration = 2000,
}) => {
  const { t } = useTranslation();
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const androidTextFix = useAndroidTextFix();

  const progressValue = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const spinAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const CIRCLE_RADIUS = 8;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Handle stop signal from external source
  useEffect(() => {
    if (stopSignal && (isAnimating || isCompleted)) {
      handleStop();
    }
  }, [stopSignal]);

  const handleStop = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

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
  }, []);

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

    // Set a timer for the hold duration
    holdTimerRef.current = setTimeout(() => {
      if (isHolding) {
        setIsCompleted(true);
      }
    }, holdDuration);
  }, [isDisabled, isAnimating, isHolding, holdDuration, onPress, onComplete]);

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

    // Clear timer
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    progressValue.setValue(0);
  }, [isCompleted, isAnimating]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
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
        className="rounded-2xl mx-4 p-4 min-h-16 items-center justify-center self-stretch"
        style={[
          {
            backgroundColor: '#FFFFFF',
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {isAnimating ? (
          <View className="flex-row items-center justify-center gap-3">
            <Animated.View
              className="w-5 h-5 border-4 border-sf-2 border-t-sf-1 rounded-full"
              style={[
                {
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
            <Text
              className="text-fg-1 font-semibold font-inter"
              style={[androidTextFix, { fontSize: 16, includeFontPadding: false }]}
              allowFontScaling={false}
            >
              {t('send.holdToSend')}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-center gap-3">
            <View className="w-5 h-5 items-center justify-center">
              {isHolding || isCompleted ? (
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Circle
                    cx={12}
                    cy={12}
                    r={CIRCLE_RADIUS}
                    stroke="#FAFAFA"
                    strokeWidth={4}
                    fill="none"
                  />
                  <AnimatedCircle
                    cx={12}
                    cy={12}
                    r={CIRCLE_RADIUS}
                    stroke="#1A1A1A"
                    strokeWidth={4}
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
                <View className="w-5 h-5 border-4 border-gray-300 rounded-full" />
              )}
            </View>
            <Text
              className="text-fg-1 font-semibold font-inter text-center flex-shrink-0"
              style={[
                androidTextFix,
                {
                  fontSize: 16,
                  includeFontPadding: false,
                },
              ]}
              allowFontScaling={false}
            >
              {t('send.holdToSend')}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
