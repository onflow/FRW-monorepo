import { SurgeActive } from '@onflow/frw-icons';
import React, { useEffect } from 'react';
import { YStack } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface SurgeWarningProps {
  /**
   * The warning message to display
   */
  message: string;
  /**
   * The title/heading for the warning
   */
  title?: string;
  /**
   * Icon component to display (should be a React component)
   */
  icon?: React.ReactNode;
  /**
   * Whether the warning modal is visible
   */
  visible?: boolean;
  /**
   * Variant of the warning (affects colors and styling)
   */
  variant?: 'warning' | 'error' | 'info';
  /**
   * Custom background color (overrides variant colors)
   */
  backgroundColor?: string;
  /**
   * Custom text color (overrides variant colors)
   */
  textColor?: string;
  /**
   * Custom title color (overrides variant colors)
   */
  titleColor?: string;
  /**
   * Whether to show the icon
   */
  showIcon?: boolean;
  /**
   * Button text for the modal
   */
  buttonText?: string;
  /**
   * Callback when the modal is closed
   */
  onClose?: () => void;
  /**
   * Callback when the button is pressed
   */
  onButtonPress?: () => void;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

export const SurgeWarning: React.FC<SurgeWarningProps> = ({
  message,
  title,
  icon = <SurgeActive />,
  visible = true,
  variant = 'warning',
  backgroundColor,
  textColor,
  titleColor,
  showIcon = true,
  buttonText = 'Okay',
  onClose,
  onButtonPress,
  className,
}) => {
  // Get colors based on variant
  const getVariantColors = () => {
    switch (variant) {
      case 'error':
        return {
          background: backgroundColor || ('$bg5' as any),
          title: titleColor || ('$white' as any),
          text: textColor || ('$error' as any),
        };
      case 'info':
        return {
          background: backgroundColor || ('$bg5' as any),
          title: titleColor || ('$white' as any),
          text: textColor || ('$primary' as any),
        };
      case 'warning':
      default:
        return {
          background: backgroundColor || ('$bg5' as any),
          title: titleColor || ('$white' as any),
          text: textColor || ('$warning' as any),
        };
    }
  };

  const colors = getVariantColors();

  // Handle escape key press and body scroll prevention
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible && onClose) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [visible, onClose]);

  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
    }
    if (onClose) {
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <YStack
      bg="$dark80"
      items="center"
      justify="center"
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
      aria-modal={true}
      role="dialog"
      aria-labelledby="surge-warning-title"
      aria-describedby="surge-warning-message"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <YStack
        width={343}
        bg={colors.background}
        rounded="$4"
        p="$4"
        gap="$4"
        shadowColor="$shadow"
        shadowOffset={{ width: 0, height: 5 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
        style={
          backgroundColor
            ? { backgroundColor, minWidth: 300, maxWidth: '90vw' }
            : { minWidth: 300, maxWidth: '90vw' }
        }
        data-node-id="4633:31373"
      >
        {/* Close Button */}
        <YStack
          items="center"
          justify="center"
          width={24}
          height={24}
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
          cursor="pointer"
          style={{
            position: 'absolute',
            top: '$4',
            right: '$4',
            zIndex: 1,
          }}
        >
          <Text fontSize="$4" fontWeight="600" color="$light40" style={{ textAlign: 'center' }}>
            ×
          </Text>
        </YStack>

        {/* Content Frame */}
        <YStack items="center" gap="$4" style={{ alignSelf: 'stretch' }}>
          {/* Icon */}
          {showIcon && icon && (
            <YStack items="center" justify="center" width={48} height={48}>
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, {
                    size: 48,
                  })
                : icon}
            </YStack>
          )}

          {/* Title */}
          {title && (
            <Text
              id="surge-warning-title"
              fontSize={18}
              fontWeight="700"
              color={colors.title}
              lineHeight="$5"
              style={
                titleColor ? { color: titleColor, textAlign: 'center' } : { textAlign: 'center' }
              }
            >
              {title}
            </Text>
          )}

          {/* Warning message */}
          <Text
            id="surge-warning-message"
            fontSize={14}
            fontWeight="400"
            color={colors.text}
            lineHeight="$5"
            style={textColor ? { color: textColor, textAlign: 'center' } : { textAlign: 'center' }}
          >
            {message}
          </Text>

          {/* Button */}
          <YStack
            width="100%"
            height={44}
            bg="$white"
            rounded="$3"
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleButtonPress}
            cursor="pointer"
          >
            <Text fontSize={14} fontWeight="700" color="$dark80" style={{ textAlign: 'center' }}>
              {buttonText}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};
