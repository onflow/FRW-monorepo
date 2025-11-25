import { isDarkMode, logger } from '@onflow/frw-utils';
import React, { useEffect, useState } from 'react';
import { View, useTheme } from 'tamagui';

import LottieView from './LottieView';
import shieldAnimationDark from '../assets/animations/shield-with-lock-dark-2.json';
import shieldAnimationLight from '../assets/animations/shield-with-lock-light-2.json';
import { injectImageWithFallbacks } from '../utils/lottie-image-injection';

interface ShieldAnimationProps {
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
}

/**
 * ShieldAnimation - Animated shield with lock for onboarding
 * Automatically switches between light and dark animations based on theme
 * Injects Flow logo as placeholder for any image assets
 */
export const ShieldAnimation: React.FC<ShieldAnimationProps> = ({
  width = 200,
  height = 200,
  autoPlay = true,
  loop = true,
}) => {
  const theme = useTheme();
  const isCurrentlyDarkMode = isDarkMode(theme);
  const [currentAnimationSource, setCurrentAnimationSource] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareAnimation = async () => {
      try {
        setIsReady(false);

        // Select the right animation based on theme
        const baseAnimation = isCurrentlyDarkMode ? shieldAnimationDark : shieldAnimationLight;

        // Inject Flow logo placeholder for image_0
        const result = await injectImageWithFallbacks(
          baseAnimation,
          'image_0',
          '' // Empty string triggers base64 placeholder (Flow logo)
        );

        setCurrentAnimationSource(result.animationData);
        setIsReady(true);
      } catch (error) {
        logger.error('[ShieldAnimation] Failed to prepare animation:', error);
        setIsReady(true);
      }
    };

    prepareAnimation();
  }, [isCurrentlyDarkMode]);

  if (!isReady || !currentAnimationSource) {
    return null;
  }

  return (
    <View width={width} height={height} alignItems="center" justifyContent="center">
      <LottieView
        source={currentAnimationSource}
        autoPlay={autoPlay}
        loop={loop}
        style={{
          width,
          height,
        }}
        resizeMode="contain"
        onAnimationFailure={(error) => {
          logger.error('[ShieldAnimation] Animation failed:', error);
        }}
      />
    </View>
  );
};
