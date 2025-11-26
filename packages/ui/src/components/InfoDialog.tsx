import { Close } from '@onflow/frw-icons';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Platform, Modal } from 'react-native';
import { YStack, Stack, useTheme } from 'tamagui';

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
  const theme = useTheme();

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
      pos={isWeb ? 'fixed' : 'absolute'}
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="$dark40"
      z={1000}
      items="center"
      justify="center"
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'info-dialog-title' : undefined}
    >
      <YStack
        w={339}
        minW={300}
        maxW="90%"
        minH={200}
        maxH="90%"
        bg="$bg2"
        rounded={16}
        shadowColor="$shadow"
        shadowOffset={{ width: 0, height: 5 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Header with title and close button aligned */}
        <YStack pos="relative" pt={20} px={20} pb={title ? 16 : 20}>
          {title && (
            <YStack
              w="100%"
              items="center"
              px={44} // Left and right padding equal to close button width + spacing (24 + 20 = 44)
            >
              <Text id="info-dialog-title" fontSize="$4" fontWeight="700" color="$text" ta="center">
                {title}
              </Text>
            </YStack>
          )}

          {/* Close button - aligned with title baseline */}
          <YStack
            pos="absolute"
            top={20}
            right={20}
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
            <Close size={24} color={theme.light80.val} style={{ alignSelf: 'center' }} />
          </YStack>
        </YStack>

        {/* Content area - grows with content */}
        <YStack px="$5" pb="$5" gap="$4">
          {/* Content */}
          <YStack w="100%" items="center" px="$2.5">
            {children}
          </YStack>

          {/* Bottom button */}
          {buttonText && (
            <YStack
              self="stretch"
              h="$11"
              bg="$white"
              rounded="$3"
              items="center"
              justify="center"
              px="$4"
              py="$3"
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
                color="$dark80"
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
