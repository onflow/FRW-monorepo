import { Close } from '@onflow/frw-icons';
import React, { useEffect } from 'react';
import { YStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface ConfirmAddressDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  address: string;
  buttonText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmAddressDialog: React.FC<ConfirmAddressDialogProps> = ({
  visible,
  title = 'Confirm address',
  message = 'We noticed this may be your first time sending to this address. Please confirm the destination address.',
  address,
  buttonText = 'Confirm address',
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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
      aria-labelledby="confirm-address-dialog-title"
      aria-describedby="confirm-address-dialog-message"
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
          <YStack items="center" alignSelf="stretch" gap={16}>
            {/* Title and Close Button */}
            <YStack alignSelf="stretch" items="center" position="relative">
              <Text
                id="confirm-address-dialog-title"
                fontSize={18}
                fontWeight="700"
                lineHeight="1.78em"
                letterSpacing={-0.306}
                textAlign="center"
                color="$white"
              >
                {title}
              </Text>
              <YStack
                position="absolute"
                top={0}
                right={0}
                items="center"
                justify="center"
                bg="$subtleBg10"
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
              id="confirm-address-dialog-message"
              w="270.9px"
              h="76px"
              fontSize={14}
              fontWeight="300"
              lineHeight="1.43em"
              letterSpacing={-0.084}
              textAlign="center"
              color="#FFFFFF"
            >
              {message}
            </Text>

            {/* Address Display Box */}
            <YStack
              widtheight={290}
              height={64}
              bg="$subtleBg10"
              rounded={8}
              items="center"
              justify="center"
              py={12}
              px={24}
            >
              <Text
                w="248.49px"
                fontSize={14}
                fontWeight="600"
                lineHeight="1.2em"
                letterSpacing={-0.084}
                textAlign="left"
                color="$white"
                numberOfLines={2}
                ellipsizeMode="middle"
              >
                {address}
              </Text>
            </YStack>
          </YStack>

          {/* Double button group */}
          <YStack alignSelf="stretch" items="center" justify="center" gap={16}>
            <YStack
              widtheight={297}
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
