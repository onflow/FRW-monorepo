import { Close } from '@onflow/frw-icons';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { YStack, Stack } from 'tamagui';
import { Platform, Modal } from 'react-native';

import { Text } from '../foundation/Text';

export interface InfoDialogProps {
  visible: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  /**
   * Optional button text to show at bottom of dialog
   */
  buttonText?: string;
  /**
   * Callback when bottom button is clicked
   */
  onButtonClick?: () => void;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({
  visible,
  title,
  children,
  onClose,
  buttonText,
  onButtonClick,
}) => {
  // Handle escape key press and body scroll prevention
  useEffect(() => {
    // Only run in browser environment
    if (typeof document === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (document.body) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const isWeb = Platform.OS === 'web';

  const dialogContent = (
    <Stack
      position={isWeb ? "fixed" : "absolute"}
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      alignItems="center"
      justifyContent="center"
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'info-dialog-title' : undefined}
    >
      <YStack
        width={339}
        minWidth={300}
        maxWidth="90%"
        height={326}
        minHeight={300}
        maxHeight="90%"
        backgroundColor="#28282A"
        borderRadius={16}
        shadowColor="rgba(0, 0, 0, 0.25)"
        shadowOffset={{ width: 0, height: 5 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <YStack
          position="absolute"
          top={19.56}
          right={18}
          width={24}
          height={24}
          alignItems="center"
          justifyContent="center"
          backgroundColor="rgba(0, 0, 0, 0.03)"
          borderRadius={12}
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
          cursor="pointer"
          aria-label="Close dialog"
        >
          <Close size={10} color="#FFFFFF" />
        </YStack>

        {/* Content area */}
        <YStack padding={20} paddingTop={60} flex={1} gap={16}>
          {title && (
            <Text
              id="info-dialog-title"
              fontSize={16}
              fontWeight="600"
              color="$white"
              ta="center"
            >
              {title}
            </Text>
          )}

          {/* Content */}
          <YStack flex={1} justifyContent="center" alignItems="center" width="100%" paddingHorizontal={10}>
            {children}
          </YStack>

          {/* Bottom button */}
          {buttonText && (
            <YStack
              alignSelf="stretch"
              height={44}
              backgroundColor="$white"
              borderRadius={12}
              alignItems="center"
              justifyContent="center"
              paddingHorizontal={16}
              paddingVertical={12}
              pressStyle={{ opacity: 0.8 }}
              onPress={onButtonClick}
              cursor="pointer"
            >
              <Text
                fontSize={14}
                fontWeight="700"
                lineHeight={20}
                letterSpacing={0}
                ta="center"
                color="rgba(0, 0, 0, 0.9)"
              >
                {buttonText}
              </Text>
            </YStack>
          )}
        </YStack>
      </YStack>
    </Stack>
  );

  // Use portal to render at document body level (only in browser)
  if (typeof document !== 'undefined' && Platform.OS === 'web') {
    return createPortal(dialogContent, document.body);
  }

  // For React Native, use Modal component for proper overlay
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {dialogContent}
    </Modal>
  );
};
