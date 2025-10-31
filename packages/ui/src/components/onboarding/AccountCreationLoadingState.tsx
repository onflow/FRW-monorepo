import { isDarkMode } from '@onflow/frw-utils';
import React, { useEffect, useState } from 'react';
import { YStack, Text, View, useTheme } from 'tamagui';

import LottieView from '../LottieView';
import { OnboardingBackground } from './OnboardingBackground';
import creatingAccountDark from '../../assets/animations/creating-account-dark.json';
import creatingAccountLight from '../../assets/animations/creating-account-light.json';
import loadingBarDark from '../../assets/animations/loading-bar-dark.json';
import loadingBarLight from '../../assets/animations/loading-bar-light.json';

interface AccountCreationLoadingStateProps {
  visible: boolean;
  title?: string;
  statusText?: string;
  onComplete?: () => void;
  duration?: number;
}

/**
 * AccountCreationLoadingState - Shared loading state for account creation
 * Shows a beautiful animation with theme-based Lottie animations
 * Automatically switches between light and dark animations based on theme
 */
export function AccountCreationLoadingState({
  visible,
  title = 'Creating\nyour account',
  statusText = 'Configuring account',
  onComplete,
  duration = 3000,
}: AccountCreationLoadingStateProps): React.ReactElement | null {
  const theme = useTheme();
  const isCurrentlyDarkMode = isDarkMode(theme);
  const [currentAnimationSource, setCurrentAnimationSource] = useState<any>(null);
  const [currentLoadingBarSource, setCurrentLoadingBarSource] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Handle theme-based animation switching
  useEffect(() => {
    const prepareAnimation = async () => {
      try {
        setIsReady(false);

        // Select the right animations based on theme
        const baseAnimation = isCurrentlyDarkMode ? creatingAccountDark : creatingAccountLight;
        const loadingBarAnimation = isCurrentlyDarkMode ? loadingBarDark : loadingBarLight;

        setCurrentAnimationSource(baseAnimation);
        setCurrentLoadingBarSource(loadingBarAnimation);
        setIsReady(true);
      } catch (error) {
        console.error('[AccountCreationLoadingState] Failed to prepare animation:', error);
        setIsReady(true);
      }
    };

    prepareAnimation();
  }, [isCurrentlyDarkMode]);

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
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
      }}
    >
      <OnboardingBackground showDecorations={false}>
        <YStack flex={1} items="center" justify="center">
          {/* Title */}
          <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36} mb="$8">
            {title}
          </Text>

          {/* Animation - matching Figma design: 232.25 x 248.55 */}
          {isReady && currentAnimationSource ? (
            <YStack width={232} height={249} items="center" justify="center" mb="$6">
              <LottieView
                source={currentAnimationSource}
                autoPlay={true}
                loop={true}
                style={{
                  width: 232,
                  height: 249,
                }}
                resizeMode="contain"
                onAnimationFailure={(error) => {
                  console.error('[AccountCreationLoadingState] Animation failed:', error);
                }}
              />
            </YStack>
          ) : (
            <YStack width={232} height={249} items="center" justify="center" mb="$6">
              <Text fontSize={80}>✨</Text>
            </YStack>
          )}

          {/* Progress section - matching Figma design width: 339px */}
          <YStack width={339} items="center" gap="$3">
            {/* Status text */}
            <Text fontSize="$4" fontWeight="700" color="$primary">
              {statusText}
            </Text>

            {/* Loading bar animation */}
            {isReady && currentLoadingBarSource ? (
              <YStack width="100%" height={52} items="center" justify="center">
                <LottieView
                  source={currentLoadingBarSource}
                  autoPlay={true}
                  loop={true}
                  style={{
                    width: 339,
                    height: 52,
                  }}
                  resizeMode="cover"
                  onAnimationFailure={(error) => {
                    console.error('[AccountCreationLoadingState] Loading bar animation failed:', error);
                  }}
                />
              </YStack>
            ) : (
              <View width="100%" height={52} items="center" justify="center">
                <Text fontSize={24}>⏳</Text>
              </View>
            )}
          </YStack>
        </YStack>
      </OnboardingBackground>
    </View>
  );
}
