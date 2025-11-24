import { ToastSuccess, ToastWarning, ToastInfo, ToastError } from '@onflow/frw-icons';
import React, { useEffect, useState } from 'react';
import { XStack, YStack, useTheme } from 'tamagui';

import { Text } from '../foundation/Text';

export interface ToastProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  feedbackCallback?: () => void;
  reportMsg?: string;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  title,
  message,
  type = 'error',
  duration = 4000,
  onClose,
  feedbackCallback,
  reportMsg,
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
          bg: '$grayBg1',
          messageColor: '$textSecondary',
          titleColor: '$textPrimary',
          icon: <ToastSuccess color={theme.success?.val || theme.success} />,
        };
      case 'warning':
        return {
          bg: '$grayBg1',
          messageColor: '$textSecondary',
          titleColor: '$textPrimary',
          icon: <ToastWarning color={theme.warning?.val || theme.warning} />,
        };
      case 'info':
        return {
          bg: '$grayBg1',
          messageColor: '$textSecondary',
          titleColor: '$textPrimary',
          icon: <ToastInfo color={theme.textPrimary?.val || theme.textPrimary} />,
        };
      case 'error':
      default:
        return {
          bg: '$grayBg1',
          messageColor: '$textSecondary',
          titleColor: '$textPrimary',
          icon: <ToastError color={theme.error?.val || theme.error} />,
        };
    }
  };

  const styles = getToastStyles();

  const toastContent = (
    <XStack
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
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        borderRadius: 34,
        minWidth: 200,
        maxWidth: 400,
        margin: '2px auto',
        pointerEvents: 'auto',
        touchAction: 'none',
        userSelect: 'none',
        padding: '6px 12px',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
      }}
    >
      <YStack>{styles.icon}</YStack>
      <YStack style={{ alignItems: 'flex-start', flexDirection: 'column', marginLeft: 1 }}>
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
            {message.slice(0, 50)}
          </Text>
        )}
      </YStack>
      {feedbackCallback && (
        <YStack
          onPress={feedbackCallback}
          cursor="pointer"
          rounded="$4"
          p="$1"
          bg="$white"
          shadowColor={theme.shadowColor}
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={1}
          pressStyle={{ opacity: 0.8 }}
          items="center"
          justify="center"
          ml="$1"
        >
          {/* <InfoIcon color={theme.warning?.val || theme.warning} /> */}
          <Text color="$black" fontSize="$1" fontWeight="400" style={{ whiteSpace: 'nowrap' }}>
            Report
          </Text>
        </YStack>
      )}
    </XStack>
  );

  // For React Native, render directly
  return toastContent;
};

export { Toast as UIToast };
