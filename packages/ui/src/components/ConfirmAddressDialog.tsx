import { Close } from '@onflow/frw-icons';
import React from 'react';
import { YStack } from 'tamagui';

import { Button } from '../foundation/Button';
import { IconButton } from '../foundation/IconButton';
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

  // Presentational-only component: container handles overlay and events

  if (!visible) return null;

  return (
    <YStack
      width={340}
      minW={300}
      maxW="90%"
      bg="$bg2"
      rounded={16}
      p={16}
      gap={10}
      shadowColor="$shadow"
      shadowOffset={{ width: 0, height: 5 }}
      shadowOpacity={0.25}
      shadowRadius={12}
      elevation={8}
      aria-labelledby="confirm-address-dialog-title"
      aria-describedby="confirm-address-dialog-message"
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
              color="$text"
            >
              {title}
            </Text>
            <YStack position="absolute" top={0} right={0}>
              <IconButton
                icon={<Close />}
                variant="ghost"
                size="small"
                onPress={onClose}
                aria-label="Close dialog"
              />
            </YStack>
          </YStack>

          {/* Message Text */}
          <Text
            id="confirm-address-dialog-message"
            w="100%"
            fontSize={14}
            fontWeight="300"
            lineHeight="1.43em"
            letterSpacing={-0.084}
            textAlign="center"
            color="$textSecondary"
          >
            {message}
          </Text>

          {/* Address Display Box */}
          <YStack
            width="100%"
            minH={64}
            bg="$bg3"
            rounded={8}
            items="center"
            justify="center"
            py={12}
            px={24}
            borderColor="$border"
            borderWidth={1}
          >
            <Text
              w="100%"
              fontSize={14}
              fontWeight="600"
              lineHeight="1.2em"
              letterSpacing={-0.084}
              textAlign="left"
              color="$text"
              numberOfLines={2}
              ellipsizeMode="middle"
            >
              {address}
            </Text>
          </YStack>
        </YStack>

        {/* Confirm button */}
        <Button variant="inverse" size="medium" fullWidth onPress={handleConfirm}>
          {buttonText}
        </Button>
      </YStack>
    </YStack>
  );
};
