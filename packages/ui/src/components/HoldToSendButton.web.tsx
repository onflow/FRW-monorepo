import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, useTheme } from 'tamagui';

import { Text } from '../foundation/Text';

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
  const [progress, setProgress] = useState(0); // 0..1
  const [spinAngle, setSpinAngle] = useState(0); // 0..360
  const [isError, setIsError] = useState(false);
  const [errorShakeX, setErrorShakeX] = useState(0);

  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const completeTimeoutRef = useRef<number | null>(null);
  const spinRafRef = useRef<number | null>(null);
  const spinStartRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const errorTimeoutRef = useRef<number | null>(null);
  const prevErrorSignalRef = useRef<boolean>(errorSignal);
  const errorShakeTimeoutsRef = useRef<number[]>([]);

  const CIRCLE_RADIUS = 8;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Theme-driven colors (inverse button): use $text as background and $bg as text
  const buttonBackgroundColor = theme.text?.val ?? '#000000';
  const buttonTextColor = theme.bg?.val ?? '#FFFFFF';
  const progressBackgroundColor = theme.textSecondary?.val ?? '#767676';
  const errorColor = theme.error?.val ?? '#FF3B30';

  const stopAll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    if (spinRafRef.current) cancelAnimationFrame(spinRafRef.current);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    if (errorShakeTimeoutsRef.current.length) {
      errorShakeTimeoutsRef.current.forEach((id) => clearTimeout(id));
      errorShakeTimeoutsRef.current = [];
    }
    rafRef.current = null;
    completeTimeoutRef.current = null;
    spinRafRef.current = null;
    errorTimeoutRef.current = null;
    spinStartRef.current = null;
    startRef.current = null;
    setIsHolding(false);
    setIsCompleted(false);
    setIsAnimating(false);
    setIsDisabled(false);
    setProgress(0);
    setSpinAngle(0);
    setIsError(false);
    setErrorShakeX(0);
    isHoldingRef.current = false;
    isAnimatingRef.current = false;
  }, []);

  useEffect(() => {
    // Align with native: only stop when not in spinner phase
    if (stopSignal && !isAnimating && isHolding) {
      stopAll();
    }
  }, [stopSignal, isAnimating, isHolding, stopAll]);

  // Error signal: show error ring briefly then reset
  useEffect(() => {
    const prev = prevErrorSignalRef.current;
    if (!prev && errorSignal) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
      if (spinRafRef.current) cancelAnimationFrame(spinRafRef.current);
      setIsHolding(false);
      setIsCompleted(false);
      setIsAnimating(false);
      setIsDisabled(false);
      setIsError(true);
      // trigger shake animation for the icon
      setErrorShakeX(0);
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
      let acc = 0;
      steps.forEach((val, idx) => {
        const dur = idx < steps.length - 1 ? 40 : 60;
        acc += dur;
        const id = window.setTimeout(() => setErrorShakeX(val), acc) as unknown as number;
        errorShakeTimeoutsRef.current.push(id);
      });
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = window.setTimeout(
        () => {
          stopAll();
        },
        Math.max(600, errorDisplayDurationMs)
      );
    }
    prevErrorSignalRef.current = errorSignal;
  }, [errorSignal, errorDisplayDurationMs, stopAll]);

  const tick = useCallback(
    (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(1, elapsed / holdDuration);
      setProgress(p);
      if (p < 1 && isHoldingRef.current && !isAnimatingRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [holdDuration]
  );

  const handlePressStart = useCallback(() => {
    if (isDisabled || isAnimating) return;
    setIsHolding(true);
    isHoldingRef.current = true;
    startRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    completeTimeoutRef.current = window.setTimeout(() => {
      setIsCompleted(true);
      setIsAnimating(true);
      setIsDisabled(true);
      isAnimatingRef.current = true;
      // Start JS-driven spinner rotation (fallback across browsers)
      spinStartRef.current = null;
      const SPIN_DURATION = 800; // ms per full rotation
      const spinLoop = (ts: number) => {
        if (spinStartRef.current === null) spinStartRef.current = ts;
        const elapsed = ts - spinStartRef.current;
        const angle = ((elapsed % SPIN_DURATION) / SPIN_DURATION) * 360;
        setSpinAngle(angle);
        spinRafRef.current = requestAnimationFrame(spinLoop);
      };
      spinRafRef.current = requestAnimationFrame(spinLoop);
      onPress()
        .catch(() => void 0)
        .finally(() => onComplete?.());
    }, holdDuration) as unknown as number;
  }, [holdDuration, isDisabled, isAnimating, onPress, onComplete, tick]);

  const handlePressEnd = useCallback(() => {
    if (isCompleted || isAnimating) return;
    stopAll();
  }, [isCompleted, isAnimating, stopAll]);

  useEffect(() => () => stopAll(), [stopAll]);

  return (
    <View
      role="button"
      tabIndex={0}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      aria-disabled={isDisabled}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      userSelect="none"
      style={{
        backgroundColor: buttonBackgroundColor,
        borderRadius: 16,
        padding: 16,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        opacity: isDisabled ? 0.9 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
        transition: 'transform 100ms ease',
        transform: isError ? `translateX(${errorShakeX}px)` : undefined,
      }}
    >
      <View flexDirection="row" items="center" justify="center" gap="$3">
        {/* Icon renderer: one container, different visual states */}
        {isError ? (
          <View width={24} height={24} items="center" justify="center">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r={CIRCLE_RADIUS}
                stroke={errorColor}
                strokeWidth={3}
                fill="none"
              />
            </svg>
          </View>
        ) : isAnimating ? (
          <View width={24} height={24} items="center" justify="center">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <g transform={`rotate(${spinAngle - 90} 12 12)`}>
                <circle
                  cx="12"
                  cy="12"
                  r={CIRCLE_RADIUS}
                  stroke={progressBackgroundColor}
                  strokeWidth={3}
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r={CIRCLE_RADIUS}
                  stroke={buttonTextColor}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={`${(CIRCLE_CIRCUMFERENCE * 0.25).toFixed(2)} ${(CIRCLE_CIRCUMFERENCE * 0.75).toFixed(2)}`}
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </View>
        ) : (
          <View width={20} height={20} items="center" justify="center">
            {isHolding || isCompleted ? (
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r={CIRCLE_RADIUS}
                  stroke={progressBackgroundColor}
                  strokeWidth={3}
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r={CIRCLE_RADIUS}
                  stroke={buttonTextColor}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={CIRCLE_CIRCUMFERENCE * (1 - progress)}
                  strokeLinecap="round"
                  transform="rotate(-90 12 12)"
                />
              </svg>
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
    </View>
  );
};
