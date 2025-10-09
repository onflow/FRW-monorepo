import React, { useEffect } from 'react';
import { YStack, Text, View } from 'tamagui';

import sendConfirmationAnimation from '../../assets/animations/send-confirmation-noblur.json';
import LottieView from '../LottieView';

interface AccountCreationLoadingStateProps {
  visible: boolean;
  title?: string;
  statusText?: string;
  onComplete?: () => void;
  duration?: number;
}

/**
 * AccountCreationLoadingState - Shared loading state for account creation
 * Shows a beautiful glassmorphism design with animated progress bar
 */
export function AccountCreationLoadingState({
  visible,
  title = 'Creating\nyour account',
  statusText = 'Configuring account',
  onComplete,
  duration = 3000,
}: AccountCreationLoadingStateProps): React.ReactElement | null {
  // Handle completion after duration
  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, onComplete, duration]);

  if (!visible) return null;

  return (
    <View pos="absolute" top={0} left={0} right={0} bottom={0} bg="$background" zIndex={2000}>
      <YStack flex={1} items="center" justify="center">
        {/* Title */}
        <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36} mb="$8">
          {title}
        </Text>

        {/* Animation */}
        <View width={200} height={200} alignItems="center" justifyContent="center" mb="$6">
          <LottieView
            source={sendConfirmationAnimation}
            autoPlay={true}
            loop={true}
            style={{
              width: 200,
              height: 200,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Progress section */}
        <YStack w="90%" maxW={339} items="center" gap="$3">
          {/* Progress bar container */}
          <View w="100%" h={52} bg="transparent" rounded="$4" overflow="hidden">
            {/* Background line */}
            <View
              pos="absolute"
              top="50%"
              left={32}
              right={32}
              h={10}
              bg="rgba(255, 255, 255, 0.15)"
              rounded={5}
              style={{
                transform: 'translateY(-50%)',
              }}
            />

            {/* Animated progress line */}
            <View
              pos="absolute"
              top="50%"
              left={32}
              w="60%"
              h={10}
              rounded={5}
              style={{
                background: 'linear-gradient(90deg, #16FF99 60%, #B5FFDF 100%)',
                transform: 'translateY(-50%)',
                animation: 'progressAnimation 2s ease-in-out infinite',
              }}
            />
          </View>

          {/* Status text */}
          <Text fontSize="$4" fontWeight="600" color="$primary">
            {statusText}
          </Text>
        </YStack>
      </YStack>
    </View>
  );
}
