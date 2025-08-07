import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import { type ViewStyle } from 'react-native';

import sendConfirmationAnimation from '@/assets/animations/send-confirmation.json';

interface SendConfirmationAnimationProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  autoPlay?: boolean;
  loop?: boolean;
}

export const SendConfirmationAnimation: React.FC<SendConfirmationAnimationProps> = ({
  width = 399,
  height = 148,
  style,
  autoPlay = true,
  loop = false,
}) => {
  const animationRef = useRef<LottieView>(null);

  return (
    <LottieView
      ref={animationRef}
      source={sendConfirmationAnimation}
      autoPlay={autoPlay}
      loop={loop}
      style={[
        {
          width,
          height,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};
