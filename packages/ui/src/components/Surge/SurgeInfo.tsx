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
      {/* Bottom Sheet Content - positioned like NFTSelectionBar */}
      <YStack
        pos="absolute"
        b="$0"
        l="$0"
        r="$0"
        width="100%"
        bg="$background"
        borderTopLeftRadius="$4"
        borderTopRightRadius="$4"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: -2 }}
        shadowOpacity={0.1}
        shadowRadius="$2"
        elevation={8}
        pt="$3"
        px="$4"
        pb="$5"
        maxH="75vh"
        gap="$4"
      >
        {/* Header */}
        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
          <Text fontSize="$4" fontWeight="700" color="$white">
            Surge pricing
          </Text>
          <Button
            backgroundColor="transparent"
            borderWidth={0}
            padding={0}
            onPress={onClose}
            hoverStyle={{
              backgroundColor: '$light10',
              borderRadius: '$2',
            }}
          >
            <Close size={24} color="$white" />
          </Button>
        </XStack>

        {/* Content Card */}
        <YStack background="$light10" borderRadius="$4" padding="$4" gap="$4" width="100%">
          {/* Transaction Fee Row */}
          <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
            <Text fontSize="$3" fontWeight="400" color="$light80">
              Transaction fee
            </Text>
            <Text fontSize="$3" fontWeight="500" color="$light40">
              - 5.00 Flow
            </Text>
          </XStack>

          {/* Separator */}
          <YStack height={1} background="$light10" width="100%" />

          {/* Surge Rate Row */}
          <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
            <Text fontSize="$3" fontWeight="400" color="$light80">
              Surge rate
            </Text>
            <Text fontSize="$3" fontWeight="500" color="$light40">
              4X standard rate
            </Text>
          </XStack>
        </YStack>

        {/* Description */}
        <Text fontSize="$2" fontWeight="400" color="$white" lineHeight="$4">
          Surge pricing may apply during periods of high network demand, and the wallet will
          automatically adjust transaction fees to prioritize speed while balancing cost efficiency.
        </Text>
      </YStack>
    </YStack>
  );
};
