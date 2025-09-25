import { Close } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, Button } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface SurgeInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurgeInfo: React.FC<SurgeInfoProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <YStack
      pos="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.72)"
      zIndex={999999}
      style={{ alignItems: 'center', justifyContent: 'flex-end' }}
    >
      {/* Bottom Sheet Content - matching Figma design */}
      <YStack
        pos="absolute"
        b="$0"
        l="$0"
        r="$0"
        width="100%"
        bg="#121212"
        borderTopLeftRadius={16}
        borderTopRightRadius={16}
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: -2 }}
        shadowOpacity={0.1}
        shadowRadius="$2"
        elevation={8}
        p="$4.5"
        pb="$9"
        maxH="75vh"
        gap="$4"
        items="center"
      >
        {/* Header with close button */}
        <XStack justify="space-between" items="center" alignSelf="stretch" gap="$3.25" width="100%">
          <XStack items="center" gap="$2" width={240}>
            <XStack items="center" alignSelf="stretch" gap="$2" flex={1}>
              <Text fontSize={16} fontWeight="700" color="#FFFFFF" lineHeight="$6" letterSpacing={-0.16}>
                Surge pricing
              </Text>
            </XStack>
          </XStack>
          <YStack width={24} height={24} items="center" justify="center" onPress={onClose} cursor="pointer" pressStyle={{ opacity: 0.7 }}>
            <Close size={15} color="#FFFFFF" />
          </YStack>
        </XStack>

        {/* Content Card */}
        <YStack bg="rgba(255, 255, 255, 0.1)" borderRadius={16} p={0} px="$4.5" width={342} items="center">
          {/* Transaction Fee Row */}
          <XStack justify="space-between" items="center" alignSelf="stretch" gap="$11" p="$4" py="$4" borderBottomWidth={1} borderBottomColor="rgba(255, 255, 255, 0.1)">
            <XStack items="center" gap="$3" width={306}>
              <XStack items="center" gap="$3.5" width={282}>
                <XStack justify="flex-end" items="center" gap="$1.25">
                  <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.8)" lineHeight={20} letterSpacing={0.28}>
                    Transaction fee
                  </Text>
                </XStack>
              </XStack>
            </XStack>
            <XStack items="center" gap="$1.25">
              <Text fontSize={14} fontWeight="500" color="rgba(255, 255, 255, 0.4)" lineHeight={20} letterSpacing={0.28} textAlign="right">
                - 5.00 Flow
              </Text>
            </XStack>
          </XStack>

          {/* Surge Rate Row */}
          <XStack justify="space-between" items="center" alignSelf="stretch" gap="$11" p="$4" py="$4">
            <XStack items="center" gap="$3">
              <XStack items="center" gap="$3.5">
                <XStack justify="flex-end" items="center" gap="$1.25">
                  <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.8)" lineHeight={20} letterSpacing={0.28}>
                    Surge rate
                  </Text>
                </XStack>
              </XStack>
            </XStack>
            <XStack items="center" gap="$1.25">
              <Text fontSize={14} fontWeight="500" color="rgba(255, 255, 255, 0.4)" lineHeight={20} letterSpacing={0.28} textAlign="right">
                4X standard rate
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Description */}
        <Text fontSize={12} fontWeight="400" color="#FFFFFF" lineHeight={16} textAlign="left" width={339}>
          Surge pricing may apply during periods of high network demand, and the wallet will automatically adjust transaction fees to prioritize speed while balancing cost efficiency.
        </Text>
      </YStack>
    </YStack>
  );
};
