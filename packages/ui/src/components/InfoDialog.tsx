import { Close } from '@onflow/frw-icons';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { YStack } from 'tamagui';

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

  const dialogContent = (
    <YStack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "info-dialog-title" : undefined}
    >
      <YStack
        w={339}
        minW={300}
        maxW="90vw"
        h={326}
        minH={300}
        maxH="90vh"
        bg="#28282A"
        rounded={16}
        shadowColor="rgba(0, 0, 0, 0.25)"
        shadowOffset={{ width: 0, height: 5 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Close button */}
        <YStack
          position="absolute"
          top={19.56}
          right={18}
          w={24}
          h={24}
          items="center"
          justify="center"
          bg="rgba(0, 0, 0, 0.03)"
          rounded={12}
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
          cursor="pointer"
          aria-label="Close dialog"
        >
          <Close size={10} color="#FFFFFF" />
        </YStack>

        {/* Content area */}
        <YStack p={20} pt={60} flex={1} gap={16}>
          {title && (
            <Text
              id="info-dialog-title"
              fontSize={16}
              fontWeight="600"
              color="$white"
              textAlign="center"
            >
              {title}
            </Text>
          )}
          
          {/* Content */}
          <YStack flex={1} justify="flex-start">
            {children}
          </YStack>

          {/* Bottom button */}
          {buttonText && (
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
              onPress={onButtonClick}
              cursor="pointer"
            >
              <Text
                fontSize={14}
                fontWeight="700"
                lineHeight="1.43em"
                letterSpacing="-1%"
                textAlign="center"
                color="rgba(0, 0, 0, 0.9)"
              >
                {buttonText}
              </Text>
            </YStack>
          )}
        </YStack>
      </YStack>
    </YStack>
  );

  // Use portal to render at document body level (only in browser)
  if (typeof document !== 'undefined') {
    return createPortal(dialogContent, document.body);
  }

  // Fallback for non-browser environments (React Native, SSR)
  return dialogContent;
};