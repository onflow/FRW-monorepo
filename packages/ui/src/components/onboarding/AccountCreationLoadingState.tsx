import { isDarkMode, logger } from '@onflow/frw-utils';
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
  /** Progress percentage (0-100). If provided, disables automatic progress. Set to 100 to trigger completion. */
  progress?: number;
}

/**
 * AccountCreationLoadingState - Shared loading state for account creation
 * Shows a beautiful animation with theme-based Lottie animations
 * Automatically switches between light and dark animations based on theme
 *
 * Progress behavior:
 * - Without `progress` prop: Auto-progresses 1% per 100ms up to 99%, then waits for completion
 * - With `progress` prop: Displays the given progress (0-100). Set to 100 to trigger completion.
 */
export function AccountCreationLoadingState({
  visible,
  title = 'Creating\nyour account',
  statusText = 'Configuring account',
  onComplete,
  duration = 3000,
  progress: externalProgress,
}: AccountCreationLoadingStateProps): React.ReactElement | null {
  const theme = useTheme();
  const isCurrentlyDarkMode = isDarkMode(theme);
  const [currentAnimationSource, setCurrentAnimationSource] = useState<any>(null);
  const [currentLoadingBarSource, setCurrentLoadingBarSource] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);

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
        logger.error('[AccountCreationLoadingState] Failed to prepare animation:', error);
        setIsReady(true);
      }
    };

    prepareAnimation();
  }, [isCurrentlyDarkMode]);

  // Calculate current progress (external or internal)
  const currentProgress = externalProgress !== undefined ? externalProgress : internalProgress;

  // Auto-progress effect (only when no external progress is provided)
  useEffect(() => {
    if (!visible || externalProgress !== undefined) return;

    // Reset progress when becoming visible
    setInternalProgress(0);

    // Progress from 0 to 99% at 1% per 100ms
    const progressInterval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 99) {
          clearInterval(progressInterval);
          return 99;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [visible, externalProgress]);

  // Handle completion when progress reaches 100%
  useEffect(() => {
    if (visible && currentProgress >= 100 && onComplete) {
      // Small delay to show 100% briefly before completing
      const timer = setTimeout(() => {
        onComplete();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [visible, currentProgress, onComplete]);

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
          <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight="$9" mb="$8">
            {title}
          </Text>

          {/* Animation - matching Figma design: 232.25 x 248.55 */}
          {isReady && currentAnimationSource && (
            <YStack width="$48" aspectRatio={232 / 249} items="center" justify="center" mb="$6">
              <LottieView
                source={currentAnimationSource}
                autoPlay={true}
                loop={true}
                style={{
                  width: '100%',
                  aspectRatio: 232 / 249,
                }}
                resizeMode="contain"
                onAnimationFailure={(error) => {
                  logger.error('[AccountCreationLoadingState] Animation failed:', error);
                }}
              />
            </YStack>
          )}

          {/* Progress section - responsive width */}
          <YStack width="100%" maxW="$84.75" items="center" gap="$3" px="$4">
            {/* Status text without percentage */}
            <Text fontSize="$4" fontWeight="700" color="$primary">
              {statusText}
            </Text>

            {/* Loading bar animation - progress controlled */}
            {isReady && currentLoadingBarSource && (
              <YStack width="100%" height="$13" items="center" justify="center">
                <LottieView
                  source={currentLoadingBarSource}
                  autoPlay={false}
                  loop={false}
                  progress={currentProgress / 100}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                  onAnimationFailure={(error) => {
                    logger.error(
                      '[AccountCreationLoadingState] Loading bar animation failed:',
                      error
                    );
                  }}
                />
              </YStack>
            )}
          </YStack>
        </YStack>
      </OnboardingBackground>
    </View>
  );
}
