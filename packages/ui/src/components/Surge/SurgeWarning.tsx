import { SurgeIcon, Close } from '@onflow/frw-icons';
import { isDarkMode } from '@onflow/frw-utils';
import React, { useEffect } from 'react';
import { YStack, useTheme } from 'tamagui';

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
  /**
   * Surge pricing multiplier for dynamic messaging
   */
  surgeMultiplier?: number;
}

export const SurgeWarning: React.FC<SurgeWarningProps> = ({
  message,
  title,
  icon = <SurgeIcon />,
  visible = true,
  variant = 'warning',
  backgroundColor,
  textColor,
  titleColor,
  showIcon = true,
  buttonText = 'Okay',
  onClose,
  onButtonPress,
}) => {
  const theme = useTheme();
  const isCurrentlyDarkMode = isDarkMode(theme);

  // Theme-aware colors using the helper function
  const closeIconColor = theme.white?.val || '#FFFFFF';
  const activityIconColor = theme.black?.val || '#000000';
  const warningBackgroundColor = theme.warning?.val || '#FDB022';
  const dynamicTitleColor = titleColor || theme.white?.val || '#FFFFFF';
  const dynamicTextColor = textColor || theme.white?.val || '#FFFFFF';
  const modalBackgroundColor = backgroundColor || theme.surfaceDark5?.val || '#2A2A2A';

  // Get colors based on variant (keeping original structure but using theme values)
  const getVariantColors = () => {
    switch (variant) {
      case 'error':
        return {
          background: modalBackgroundColor,
          title: dynamicTitleColor,
          text: dynamicTextColor,
        };
      case 'info':
        return {
          background: modalBackgroundColor,
          title: dynamicTitleColor,
          text: dynamicTextColor,
        };
      case 'warning':
      default:
        return {
          background: modalBackgroundColor,
          title: dynamicTitleColor,
          text: dynamicTextColor,
        };
    }
  };

  const colors = getVariantColors();

  // Handle escape key press and body scroll prevention (web only)
  useEffect(() => {
    // Check if we're in a web environment
    if (typeof document === 'undefined') {
      return;
    }

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
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 5 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
        data-node-id="4633:31373"
      >
        {/* Close Button */}
        <YStack
          pos="absolute"
          top={16}
          right={16}
          w={24}
          h={24}
          items="center"
          justify="center"
          bg="$dark5"
          rounded={12}
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
          cursor="pointer"
          aria-label="Close dialog"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Close size={10} color={closeIconColor} />
        </YStack>

        {/* Content Frame */}
        <YStack items="center" gap="$4" style={{ alignSelf: 'stretch', paddingTop: '$2' }}>
          {/* Icon */}
          {showIcon && icon && (
            <YStack
              items="center"
              justify="center"
              width={48}
              height={48}
              bg={warningBackgroundColor}
              rounded="$12"
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, {
                    size: 26,
                    color: activityIconColor, // SurgeIcon only has stroke, so black will show on yellow background
                  })
                : icon}
            </YStack>
          )}

          {/* Text Content */}
          <YStack items="center" gap="$2" style={{ alignSelf: 'stretch' }}>
            {/* Title */}
            {title && (
              <Text
                id="surge-warning-title"
                fontSize="$6"
                fontWeight="700"
                color={colors.title}
                lineHeight="$6"
                style={{ textAlign: 'center', width: 264 }}
              >
                {title}
              </Text>
            )}

            {/* Warning message */}
            <Text
              id="surge-warning-message"
              fontSize="$4"
              fontWeight="400"
              color={colors.text}
              lineHeight="$4"
              style={{ textAlign: 'center', width: 275 }}
            >
              {message}
            </Text>
          </YStack>

          {/* Button */}
          <YStack
            width="100%"
            height={52}
            bg="$white"
            rounded="$4"
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleButtonPress}
            cursor="pointer"
            p="$4"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={1}
            shadowRadius={2}
            elevation={1}
          >
            <Text fontSize="$5" fontWeight="600" color="$black" style={{ textAlign: 'center' }}>
              {buttonText}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};
