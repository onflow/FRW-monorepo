import { Close } from '@onflow/frw-icons';
import React, { useEffect } from 'react';
import { YStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface ErrorDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  onConfirm?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  visible,
  title,
  message,
  buttonText = 'Okay',
  onClose,
  onConfirm,
  variant = 'error',
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  // Get colors based on variant
  const getTextColors = () => {
    switch (variant) {
      case 'warning':
        return {
          title: '$white', // White for warning title
          message: '$warning', // Yellow for warning message/body text
        };
      case 'error':
        return {
          title: '$white', // White for error title
          message: '$error', // Red for error message
        };
      case 'info':
      default:
        return {
          title: '$white', // White for info/default title
          message: '$white', // White for info/default message
        };
    }
  };

  const textColors = getTextColors();

  // Handle escape key press and body scroll prevention
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      items="center"
      justify="center"
      zIndex={1000}
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-message"
    >
      <YStack
        minWidtheight={400}
        maxWidth="90vw"
        widtheight={400}
        bg="$bg2"
        rounded={16}
        p={16}
        gap={10}
        shadowColor="rgba(0, 0, 0, 0.25)"
        shadowOffset={{ width: 0, height: 5 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Content Frame */}
        <YStack items="center" gap={16} alignSelf="stretch">
          {/* Header Frame */}
          <YStack items="flex-end" alignSelf="stretch" gap={16}>
            {/* Title and Close Button */}
            <YStack alignSelf="stretch" items="center" position="relative">
              <Text
                id="error-dialog-title"
                fontSize={18}
                fontWeight="700"
                lineHeight="1.78em"
                letterSpacing={-0.306}
                textAlign="center"
                color={textColors.title}
              >
                {title}
              </Text>
              <YStack
                position="absolute"
                top={0}
                right={0}
                items="center"
                justify="center"
                bg="$light10"
                rounded={16}
                p={8}
                pressStyle={{ opacity: 0.7 }}
                onPress={onClose}
                cursor="pointer"
                aria-label="Close dialog"
              >
                <Close size={8} color="rgba(255, 255, 255, 0.3)" />
              </YStack>
            </YStack>

            {/* Message Text */}
            <Text
              id="error-dialog-message"
              alignSelf="stretch"
              fontSize={14}
              fontWeight="300"
              lineHeight="1.43em"
              letterSpacing={-0.084}
              textAlign="center"
              color={textColors.message}
            >
              {message}
            </Text>
          </YStack>

          {/* Double button group */}
          <YStack alignSelf="stretch" items="center" justify="center" gap={16}>
            <YStack
              alignSelf="stretch"
              height={44}
              bg="$white"
              rounded={12}
              items="center"
              justify="center"
              px={16}
              py={12}
              pressStyle={{ opacity: 0.8 }}
              onPress={handleConfirm}
              cursor="pointer"
            >
              <Text
                fontSize={14}
                fontWeight="700"
                lineHeight="1.43em"
                letterSpacing={-0.14}
                textAlign="center"
                color="rgba(0, 0, 0, 0.9)"
              >
                {buttonText}
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};
