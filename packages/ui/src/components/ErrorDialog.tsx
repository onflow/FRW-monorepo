import { Close } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface ErrorDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  visible,
  title,
  message,
  buttonText = 'Okay',
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

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
    >
      <YStack
        w={343}
        h={308}
        bg="#2A2A2A"
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
        <YStack items="center" gap={16} w={311}>
          {/* Header Frame */}
          <YStack items="flex-end" alignSelf="stretch" gap={16}>
            {/* Title and Close Button */}
            <XStack items="center">
              <Text
                w={264}
                fontSize={18}
                fontWeight="700"
                lineHeight="1.78em"
                letterSpacing="-1.7%"
                text="center"
                color="#FFFFFF"
              >
                {title}
              </Text>
              <YStack
                w={24}
                h={24}
                items="center"
                justify="center"
                bg="rgba(0, 0, 0, 0.03)"
                rounded={12}
                pressStyle={{ opacity: 0.7 }}
                onPress={onClose}
                cursor="pointer"
              >
                <Close size={10} color="#FFFFFF" />
              </YStack>
            </XStack>

            {/* Message Text */}
            <Text
              alignSelf="stretch"
              fontSize={14}
              fontWeight="300"
              lineHeight="1.43em"
              letterSpacing="-0.6%"
              text="center"
              color="#FFFFFF"
            >
              {message}
            </Text>
          </YStack>

          {/* Double button group */}
          <YStack alignSelf="stretch" items="center" justify="center" gap={16}>
            <YStack
              w={297}
              h={44}
              bg="#FFFFFF"
              rounded={12}
              items="center"
              justify="center"
              p="12px 16px"
              pressStyle={{ opacity: 0.8 }}
              onPress={handleConfirm}
              cursor="pointer"
            >
              <Text
                fontSize={14}
                fontWeight="700"
                lineHeight="1.43em"
                letterSpacing="-1%"
                text="center"
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
