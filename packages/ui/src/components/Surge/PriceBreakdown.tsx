import { Close, FlowLogo } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, Button } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface PriceBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  transactionFee?: string;
  surgeRate?: string;
  freeAllowance?: string;
  finalFee?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  isOpen,
  onClose,
  transactionFee = '5.00',
  surgeRate = '4X standard rate',
  freeAllowance = '1.1357',
  finalFee = '5.00',
}) => {
  if (!isOpen) return null;

  return (
    <YStack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0, 0, 0, 0.72)"
      zIndex={999999}
      style={{ alignItems: 'center', justifyContent: 'flex-end' }}
    >
      {/* Modal Content */}
      <YStack
        backgroundColor="$background"
        borderTopLeftRadius="$4"
        borderTopRightRadius="$4"
        padding="$4"
        width="100%"
        maxWidth={375}
        gap="$4"
      >
        {/* Header */}
        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
          <Text fontSize="$4" fontWeight="700" color="$white">
            Price breakdown
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

        {/* Transaction Fee Card */}
        <YStack background="$light10" borderRadius="$4" padding="$4" width="100%">
          {/* Transaction Fee Row */}
          <XStack
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
            width="100%"
            paddingBottom="$4"
          >
            <Text fontSize="$3" fontWeight="400" color="$light80">
              Transaction fee
            </Text>
            <XStack style={{ alignItems: 'center' }} gap="$1">
              <Text fontSize="$3" fontWeight="500" color="$light40">
                - {transactionFee}
              </Text>
              {/* Flow icon placeholder */}
              <YStack width={18} height={18} backgroundColor="$success" borderRadius="$2" />
            </XStack>
          </XStack>

          {/* Separator */}
          <YStack height={1} background="$light10" width="100%" marginBottom="$4" />

          {/* Surge Rate Row */}
          <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
            <Text fontSize="$3" fontWeight="400" color="$light80">
              Surge rate
            </Text>
            <Text fontSize="$3" fontWeight="500" color="$light40">
              {surgeRate}
            </Text>
          </XStack>
        </YStack>

        {/* Free Transaction Allowance Card */}
        <YStack background="$light10" borderRadius="$4" padding="$4" width="100%" gap="$4">
          {/* Free Transaction Allowance Row */}
          <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
            <Text fontSize="$3" fontWeight="400" color="$light80">
              Free transaction allowance
            </Text>
            <XStack style={{ alignItems: 'center' }} gap="$1">
              <Text fontSize="$3" fontWeight="500" color="$light40">
                {freeAllowance}
              </Text>
              <FlowLogo size={18} theme="multicolor" />
            </XStack>
          </XStack>

          {/* Progress Bar */}
          <YStack height={6} background="$light20" borderRadius="$2" width="100%" overflow="hidden">
            {/* Progress Fill - mostly filled */}
            <YStack height="100%" width="76%" background="$warning" borderRadius="$2" />
          </YStack>

          {/* Warning Message */}
          <Text fontSize="$3" fontWeight="400" color="$warning">
            Your free transaction allowance will not cover this transaction.
          </Text>
        </YStack>

        {/* Final Fee Payable Card */}
        <YStack background="$light10" borderRadius="$4" padding="$4" width="100%">
          <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
            <Text fontSize="$3" fontWeight="400" color="$light80">
              Final fee payable
            </Text>
            <XStack style={{ alignItems: 'center' }} gap="$1">
              <Text fontSize="$3" fontWeight="500" color="$white">
                - {finalFee}
              </Text>
              {/* Flow icon placeholder */}
              <YStack width={18} height={18} backgroundColor="$success" borderRadius="$2" />
            </XStack>
          </XStack>
        </YStack>

        {/* Description */}
        <Text fontSize="$2" fontWeight="400" color="$white" lineHeight="$4">
          Transaction fee increased due to surge pricing in affect. Daily flow fee allocation was
          insufficient to pay the transaction fee, therefore you will be charged the full fee.
        </Text>
      </YStack>
    </YStack>
  );
};
