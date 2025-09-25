import { Close } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, Sheet } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface SurgeInfoProps {
  isOpen: boolean;
  onClose: () => void;
  transactionFee?: string;
  surgeMultiplier?: number;
}

export const SurgeInfo: React.FC<SurgeInfoProps> = ({
  isOpen,
  onClose,
  transactionFee = '- 5.00 Flow',
  surgeMultiplier = 1,
}) => {
  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onClose}
      snapPointsMode="fit"
      dismissOnSnapToBottom
      animation="lazy"
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        bg="rgba(0, 0, 0, 0.72)"
      />
      <Sheet.Handle bg="$gray8" />
      <Sheet.Frame
        bg="#121212"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        animation="lazy"
        enterStyle={{ y: 1000 }}
        exitStyle={{ y: 1000 }}
      >
        <YStack p="$4.5" pb="$9" gap="$4" items="center" maxWidth={375} alignSelf="center">
          {/* Header with close button */}
          <XStack
            justify="space-between"
            items="center"
            alignSelf="stretch"
            gap="$3.25"
            width="100%"
          >
            <XStack items="center" gap="$2" width={240}>
              <XStack items="center" alignSelf="stretch" gap="$2" flex={1}>
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color="#FFFFFF"
                  lineHeight="$6"
                  letterSpacing={-0.16}
                >
                  Surge pricing
                </Text>
              </XStack>
            </XStack>
            <YStack
              width={24}
              height={24}
              items="center"
              justify="center"
              onPress={onClose}
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
            >
              <Close size={15} color="#FFFFFF" />
            </YStack>
          </XStack>

          {/* Content Card */}
          <YStack
            bg="rgba(255, 255, 255, 0.1)"
            borderRadius={16}
            p={0}
            px="$4.5"
            width={342}
            items="center"
          >
            {/* Transaction Fee Row */}
            <XStack
              justify="space-between"
              items="center"
              alignSelf="stretch"
              gap="$11"
              p="$4"
              py="$4"
              borderBottomWidth={1}
              borderBottomColor="rgba(255, 255, 255, 0.1)"
            >
              <XStack items="center" gap="$3" width={306}>
                <XStack items="center" gap="$3.5" width={282}>
                  <XStack justify="flex-end" items="center" gap="$1.25">
                    <Text
                      fontSize={14}
                      fontWeight="400"
                      color="rgba(255, 255, 255, 0.8)"
                      lineHeight={20}
                      letterSpacing={0.28}
                    >
                      Transaction fee
                    </Text>
                  </XStack>
                </XStack>
              </XStack>
              <XStack items="center" gap="$1.25">
                <Text
                  fontSize={14}
                  fontWeight="500"
                  color="rgba(255, 255, 255, 0.4)"
                  lineHeight={20}
                  letterSpacing={0.28}
                  textAlign="right"
                >
                  {transactionFee}
                </Text>
              </XStack>
            </XStack>

            {/* Surge Rate Row */}
            <XStack
              justify="space-between"
              items="center"
              alignSelf="stretch"
              gap="$11"
              p="$4"
              py="$4"
            >
              <XStack items="center" gap="$3">
                <XStack items="center" gap="$3.5">
                  <XStack justify="flex-end" items="center" gap="$1.25">
                    <Text
                      fontSize={14}
                      fontWeight="400"
                      color="rgba(255, 255, 255, 0.8)"
                      lineHeight={20}
                      letterSpacing={0.28}
                    >
                      Surge rate
                    </Text>
                  </XStack>
                </XStack>
              </XStack>
              <XStack items="center" gap="$1.25">
                <Text
                  fontSize={14}
                  fontWeight="500"
                  color="rgba(255, 255, 255, 0.4)"
                  lineHeight={20}
                  letterSpacing={0.28}
                  textAlign="right"
                >
                  {surgeMultiplier}X standard rate
                </Text>
              </XStack>
            </XStack>
          </YStack>

          {/* Description */}
          <Text
            fontSize={12}
            fontWeight="400"
            color="#FFFFFF"
            lineHeight={16}
            textAlign="left"
            width={339}
          >
            Surge pricing may apply during periods of high network demand, and the wallet will
            automatically adjust transaction fees to prioritize speed while balancing cost
            efficiency.
          </Text>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
