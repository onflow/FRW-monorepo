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
  errorSignal?: boolean;
  errorDisplayDurationMs?: number;
}

export const HoldToSendButton: React.FC<HoldToSendButtonProps> = ({
  onPress,
  onComplete,
  stopSignal = false,
  holdDuration = 1500,
  holdToSendText,
  errorSignal = false,
  errorDisplayDurationMs = 1200,
}) => {
  const theme = useTheme();
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [isError, setIsError] = useState(false);

  const progressValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current; // Native driver for rotation
  const scaleValue = useRef(new Animated.Value(1)).current;
  const progressAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const rotateAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const errorShakeX = useRef(new Animated.Value(0)).current;
  const progressCurrentRef = useRef(0);
  const progressListenerIdRef = useRef<string | null>(null);
  const completedRef = useRef(false);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevErrorSignalRef = useRef<boolean>(errorSignal);

  const CIRCLE_RADIUS = 8;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Theme-driven colors (inverse button): use $text as background and $bg as text
  const buttonBackgroundColor = theme.text?.val ?? '#000000';
  const buttonTextColor = theme.bg?.val ?? '#FFFFFF';
  const progressBackgroundColor = theme.textSecondary?.val ?? '#767676';
  const errorColor = theme.error?.val ?? '#FF3B30';

  const handleStop = useCallback(() => {
    if (progressAnimationRef.current) {
      progressAnimationRef.current.stop();
      progressAnimationRef.current = null;
    }

    if (rotateAnimationRef.current) {
      rotateAnimationRef.current.stop();
      rotateAnimationRef.current = null;
    }

    setIsHolding(false);
    setIsCompleted(false);
    setIsAnimating(false);
    setIsDisabled(false);
    setIsRollingBack(false);
    setIsError(false);

    progressValue.setValue(0);
    rotateValue.setValue(0);
    scaleValue.setValue(1);
    errorShakeX.stopAnimation();
    errorShakeX.setValue(0);
    progressCurrentRef.current = 0;
    completedRef.current = false;
    try {
      if (progressListenerIdRef.current) {
        progressValue.removeListener(progressListenerIdRef.current);
        progressListenerIdRef.current = null;
      }
    } catch {
      void 0;
    }
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, [progressValue, rotateValue, scaleValue, errorShakeX]);

  // Handle stop signal from external source
  useEffect(() => {
    // Only allow stopSignal to cancel when not in spinner phase
    if (stopSignal && !isAnimating && (isHolding || isRollingBack)) {
      handleStop();
    }
  }, [stopSignal, isAnimating, isHolding, isRollingBack, handleStop]);

  // Handle error signal: enter error state briefly, then reset
  useEffect(() => {
    const prev = prevErrorSignalRef.current;
    if (!prev && errorSignal) {
      // stop any running animations
      if (progressAnimationRef.current) {
        progressAnimationRef.current.stop();
        progressAnimationRef.current = null;
      }
      if (rotateAnimationRef.current) {
        rotateAnimationRef.current.stop();
        rotateAnimationRef.current = null;
      }
      setIsHolding(false);
      setIsRollingBack(false);
      setIsAnimating(false);
      setIsCompleted(false);
      setIsDisabled(false);
      setIsError(true);
      // trigger shake animation on error icon
      errorShakeX.setValue(0);
      const amplitude = 6;
      const steps = [
        -amplitude,
        amplitude,
        -amplitude * 0.7,
        amplitude * 0.7,
        -amplitude * 0.4,
        amplitude * 0.4,
        0,
      ];
      Animated.sequence(
        steps.map((to, idx) =>
          Animated.timing(errorShakeX, {
            toValue: to,
            duration: idx < steps.length - 1 ? 40 : 60,
            useNativeDriver: true,
          })
        )
      ).start();
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(
        () => {
          handleStop();
        },
        Math.max(600, errorDisplayDurationMs)
      );
    }
    prevErrorSignalRef.current = errorSignal;
  }, [errorSignal, errorDisplayDurationMs, handleStop]);

  const handlePressIn = useCallback(() => {
    if (isDisabled || isAnimating) return;

    setIsHolding(true);

    // Ensure any rollback/progress animation is stopped and baseline is 0
    if (progressAnimationRef.current) {
      progressAnimationRef.current.stop();
      progressAnimationRef.current = null;
    }
    progressValue.stopAnimation();
    progressValue.setValue(0);
    progressCurrentRef.current = 0;
    completedRef.current = false;
    setIsRollingBack(false);
    try {
      if (progressListenerIdRef.current) {
        progressValue.removeListener(progressListenerIdRef.current);
        progressListenerIdRef.current = null;
      }
    } catch {
      void 0;
    }

    // Scale down animation on press
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    // Track current progress value for smooth rollback if released
    const listenerId = progressValue.addListener(({ value }) => {
      progressCurrentRef.current = value as number;
    });
    progressListenerIdRef.current = listenerId as unknown as string;

    // Start progress animation (JS driver because it drives SVG props)
    progressAnimationRef.current = Animated.timing(progressValue, {
      toValue: 1,
      duration: holdDuration,
      useNativeDriver: false,
    });

    progressAnimationRef.current.start();

    // Use a timeout to mark completion reliably (robust under Hermes/Fabric)
    holdTimeoutRef.current = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;

      setIsCompleted(true);
      setIsAnimating(true);
      setIsDisabled(true);
      setIsRollingBack(false);
      onPress().finally(() => onComplete?.());
    }, holdDuration);
  }, [isDisabled, isAnimating, holdDuration, onPress, onComplete, progressValue, scaleValue]);

  // Ensure spinner starts whenever isAnimating flips true, and stops otherwise
  useEffect(() => {
    if (isAnimating) {
      if (!rotateAnimationRef.current) {
        rotateValue.setValue(0);
        rotateAnimationRef.current = Animated.loop(
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          { resetBeforeIteration: true }
        );
        rotateAnimationRef.current.start();
      }
    } else {
      if (rotateAnimationRef.current) {
        rotateAnimationRef.current.stop();
        rotateAnimationRef.current = null;
      }
      rotateValue.stopAnimation();
    }
  }, [isAnimating, rotateValue]);

  const handlePressOut = useCallback(() => {
    // Always scale back to normal, regardless of state
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();

    // If completed (or about to be), don't rollback
    if (completedRef.current || isCompleted || isAnimating) return;

    setIsHolding(false);

    // Stop progress animation and roll back smoothly to 0
    if (progressAnimationRef.current) {
      progressAnimationRef.current.stop();
      progressAnimationRef.current = null;
    }

    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    // Remove progress listener; not needed during rollback
    try {
      if (progressListenerIdRef.current) {
        progressValue.removeListener(progressListenerIdRef.current);
        progressListenerIdRef.current = null;
      }
    } catch {
      void 0;
    }

    const rollbackDuration = Math.max(
      150,
      Math.min(400, progressCurrentRef.current * holdDuration * 0.5)
    );
    setIsRollingBack(true);
    Animated.timing(progressValue, {
      toValue: 0,
      duration: rollbackDuration,
      useNativeDriver: false,
    }).start(() => {
      progressCurrentRef.current = 0;
      setIsRollingBack(false);
    });
  }, [isCompleted, isAnimating, progressValue, scaleValue, holdDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return (): void => {
      if (progressAnimationRef.current) {
        progressAnimationRef.current.stop();
      }
      if (rotateAnimationRef.current) {
        rotateAnimationRef.current.stop();
      }
      // no-op
      try {
        progressValue.removeAllListeners();
      } catch {
        void 0;
      }
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
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
            transform: [
              { scale: scaleValue },
              { translateX: isError ? (errorShakeX as unknown as number) : 0 },
            ],
          },
        ]}
      >
        <View flexDirection="row" items="center" justify="center" gap="$3">
          {/* Icon renderer: one container, different visual states */}
          {isError ? (
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Circle
                cx={12}
                cy={12}
                r={CIRCLE_RADIUS}
                stroke={errorColor}
                strokeWidth={3}
                fill="none"
              />
            </Svg>
          ) : isAnimating ? (
            <Animated.View
              style={{
                width: 24,
                height: 24,
                transform: [
                  {
                    rotate: rotateValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Circle
                  cx={12}
                  cy={12}
                  r={CIRCLE_RADIUS}
                  stroke={progressBackgroundColor}
                  strokeWidth={3}
                  fill="none"
                />
                <Circle
                  cx={12}
                  cy={12}
                  r={CIRCLE_RADIUS}
                  stroke={buttonTextColor}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={[CIRCLE_CIRCUMFERENCE * 0.25, CIRCLE_CIRCUMFERENCE * 0.75]}
                  strokeLinecap="round"
                  transform="rotate(-90 12 12)"
                />
              </Svg>
            </Animated.View>
          ) : (
            <View width={20} height={20} items="center" justify="center">
              {isHolding || isCompleted || isRollingBack ? (
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
                <View
                  width={20}
                  height={20}
                  borderWidth={3}
                  borderColor={progressBackgroundColor}
                  rounded="$10"
                />
              )}
            </View>
          )}
          <Text
            fontSize="$5"
            fontWeight="600"
            color={isError ? (errorColor as string) : (buttonTextColor as string)}
            textAlign="center"
            flexShrink={0}
          >
            {holdToSendText}
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
