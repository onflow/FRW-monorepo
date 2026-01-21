import { ConfirmDialogBg } from '@onflow/frw-icons';
import React from 'react';
import { View } from 'tamagui';

import { ConfirmationAnimation } from './ConfirmationAnimation';

export interface ConfirmationAnimationSectionProps {
  /** Whether the lottie should animate */
  isPlaying?: boolean;
  /** Optional token/NFT image to inject into the lottie */
  imageUri?: string;
  /** Optional transaction type used by ConfirmationAnimation */
  transactionType?: string;

  /** Layout props (defaults match ConfirmationDrawer) */
  containerHeight?: number;
  animationWidth?: number;
  animationHeight?: number;
  backgroundSize?: number;
  backgroundOpacity?: number;
}

/**
 * ConfirmationAnimationSection
 * Reusable "Send confirmation" animation block (gradient + lottie)
 * Matches the layout used in `ConfirmationDrawer`.
 */
export const ConfirmationAnimationSection = React.memo(function ConfirmationAnimationSection({
  isPlaying = true,
  imageUri,
  transactionType,
  containerHeight = 120,
  animationWidth = 400,
  animationHeight = 150,
  backgroundSize = 600,
  backgroundOpacity = 0.15,
}: ConfirmationAnimationSectionProps): React.ReactElement {
  return (
    <View
      height={containerHeight}
      width="100%"
      items="center"
      justify="center"
      my="$2"
      position="relative"
    >
      {/* Background Gradient - Centered on Animation */}
      <View
        position="absolute"
        t={0}
        l={0}
        r={0}
        b={0}
        items="center"
        justify="center"
        opacity={backgroundOpacity}
        // Use style to avoid Tamagui prop typing issues for zIndex.
        style={{ zIndex: -1 }}
      >
        <ConfirmDialogBg
          width={backgroundSize}
          height={backgroundSize}
          color="url(#confirm-dialog-bg_svg__a)"
        />
      </View>

      <ConfirmationAnimation
        width={animationWidth}
        height={animationHeight}
        imageUri={imageUri}
        transactionType={transactionType}
        autoPlay={isPlaying}
        loop={isPlaying}
      />
    </View>
  );
});
