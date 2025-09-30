import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner, View, useTheme } from 'tamagui';

import { Text } from '../foundation/Text';

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
  const [progress, setProgress] = useState(0); // 0..1

  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const completeTimeoutRef = useRef<number | null>(null);

  const CIRCLE_RADIUS = 8;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Theme-driven colors (inverse button): use $text as background and $bg as text
  const buttonBackgroundColor = theme.text?.val ?? '#000000';
  const buttonTextColor = theme.bg?.val ?? '#FFFFFF';
  const progressBackgroundColor = theme.textSecondary?.val ?? '#767676';

  const stopAll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    rafRef.current = null;
    completeTimeoutRef.current = null;
    startRef.current = null;
    setIsHolding(false);
    setIsCompleted(false);
    setIsAnimating(false);
    setIsDisabled(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (stopSignal && (isAnimating || isCompleted)) {
      stopAll();
    }
  }, [stopSignal, isAnimating, isCompleted, stopAll]);

  const tick = useCallback(
    (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(1, elapsed / holdDuration);
      setProgress(p);
      if (p < 1 && isHolding && !isAnimating) {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [holdDuration, isHolding, isAnimating]
  );

  const handlePressStart = useCallback(() => {
    if (isDisabled || isAnimating) return;
    setIsHolding(true);
    startRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    completeTimeoutRef.current = window.setTimeout(() => {
      setIsCompleted(true);
      setIsAnimating(true);
      setIsDisabled(true);
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
        transition: 'transform 100ms ease',
      }}
    >
      {isAnimating ? (
        <View flexDirection="row" items="center" justify="center" gap="$2">
          <Spinner size="small" color={progressBackgroundColor} />
          <Text fontSize="$5" fontWeight="600" color={buttonTextColor}>
            {holdToSendText}
          </Text>
        </View>
      ) : (
        <View flexDirection="row" items="center" justify="center" gap="$3">
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
    </View>
  );
};
