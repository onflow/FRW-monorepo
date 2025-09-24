import React, { useEffect, useState } from 'react';
import { YStack, useTheme } from 'tamagui';

import { Text } from '../foundation/Text';

export interface ToastProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  title,
  message,
  type = 'error',
  duration = 4000,
  onClose,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);

    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: '$success',
          borderColor: '$success',
        };
      case 'warning':
        return {
          bg: '$warning',
          borderColor: '$warning',
        };
      case 'info':
        return {
          bg: '$primary',
          borderColor: '$primary',
        };
      case 'error':
      default:
        return {
          bg: '$error',
          borderColor: '$error',
        };
    }
  };

  const styles = getToastStyles();

  const toastContent = (
    <YStack
      position="fixed"
      top={20}
      left="50%"
      transform="translateX(-50%)"
      zIndex={999999}
      bg={styles.bg}
      borderColor={styles.borderColor}
      borderWidth={1}
      borderRadius="$3"
      px="$4"
      py="$3"
      maxWidth="90%"
      minWidth={200}
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.3}
      shadowRadius={8}
      elevation={8}
      animation="quick"
      enterStyle={{ opacity: 0, y: -20, scale: 0.95 }}
      exitStyle={{ opacity: 0, y: -20, scale: 0.95 }}
    >
      <Text
        color="$text"
        fontSize="$3"
        fontWeight="500"
        numberOfLines={3}
        style={{ textAlign: 'center' }}
      >
        {title}
        {message && (
          <Text
            color="$textSecondary"
            fontSize="$2"
            fontWeight="400"
            numberOfLines={3}
            style={{ textAlign: 'center' }}
          >
            {message}
          </Text>
        )}
      </Text>
    </YStack>
  );

  // For React Native, render directly
  return toastContent;
};

export { Toast as UIToast };
