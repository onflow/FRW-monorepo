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
          messageColor: '$textSecondary',
          titleColor: '$textPrimary',
        };
      case 'warning':
        return {
          bg: '$warning',
          messageColor: '$textSecondary',
          titleColor: '$textPrimary',
        };
      case 'info':
        return {
          bg: '$grayBg1',
          messageColor: '$textSecondary',
          titleColor: '$textPrimary',
        };
      case 'error':
      default:
        return {
          bg: '$error',
          messageColor: '$textSecondary',
          titleColor: '$textPrimary',
        };
    }
  };

  const styles = getToastStyles();

  const toastContent = (
    <YStack
      role="status"
      aria-live="off"
      aria-atomic="true"
      data-state="open"
      data-swipe-direction="vertical"
      data-disable-theme="true"
      tabIndex={0}
      bg={styles.bg as any}
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.3}
      shadowRadius={8}
      elevation={8}
      animation="quick"
      enterStyle={{ opacity: 0, y: -20, scale: 0.95 }}
      exitStyle={{ opacity: 0, y: -20, scale: 0.95 }}
      style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        borderRadius: 34,
        minWidth: 200,
        margin: '2px auto',
        pointerEvents: 'auto',
        touchAction: 'none',
        userSelect: 'none',
        alignItems: 'flex-start',
        flexDirection: 'column',
        padding: '7px 24px',
      }}
    >
      <Text
        color={styles.titleColor as any}
        fontSize="$4"
        fontWeight="500"
        style={{ whiteSpace: 'nowrap' }}
      >
        {title}
      </Text>
      {message && (
        <Text
          color={styles.messageColor as any}
          fontSize="$1"
          fontWeight="400"
          style={{ whiteSpace: 'nowrap' }}
        >
          {message}
        </Text>
      )}
    </YStack>
  );

  // For React Native, render directly
  return toastContent;
};

export { Toast as UIToast };
