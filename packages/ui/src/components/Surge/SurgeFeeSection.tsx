import { SurgeActive, InfoIcon } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, Separator } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface SurgeFeeSectionProps {
  transactionFee?: string;
  freeAllowance?: string;
  showWarning?: boolean;
  className?: string;
}

export const SurgeFeeSection: React.FC<SurgeFeeSectionProps> = ({
  transactionFee = '- 5.00',
  freeAllowance = '1.1357',
  showWarning = true,
  className,
}) => {
  return (
    <YStack gap="$4" className={className}>
      {/* Surge Price Active Indicator */}
      <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
        <XStack style={{ alignItems: 'center' }} gap="$2">
          <SurgeActive size={24} />
          <Text fontSize={14} fontWeight="600" color="$warning" lineHeight="$4">
            Surge price active
          </Text>
        </XStack>
        <InfoIcon size={24} />
      </XStack>

      {/* Fee Breakdown Card */}
      <YStack
        background="$light10"
        style={{ borderRadius: '$4', padding: '$4' }}
        gap="$1.5"
        width="100%"
      >
        {/* Transaction Fee Section */}
        <YStack gap="$1" width="100%">
          <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
            <Text fontSize={14} fontWeight="400" color="$light80" lineHeight="$5">
              Transaction fee
            </Text>
            <XStack style={{ alignItems: 'center' }} gap="$1.5">
              <Text
                fontSize={14}
                fontWeight="500"
                color="$white"
                lineHeight="$5"
                style={{ textAlign: 'right' }}
              >
                {transactionFee}
              </Text>
              <InfoIcon size={16} />
            </XStack>
          </XStack>

          <XStack style={{ alignItems: 'center', justifyContent: 'flex-end' }} width="100%">
            <XStack style={{ alignItems: 'center' }} gap="$1.5">
              <Text
                fontSize={14}
                fontWeight="400"
                color="$light40"
                lineHeight="$5"
                letterSpacing={-0.084}
                style={{ textAlign: 'right' }}
              >
                Price breakdown
              </Text>
              <InfoIcon size={14} />
            </XStack>
          </XStack>
        </YStack>

        {/* Separator Line */}
        <Separator background="$light10" />

        {/* Free Transaction Allowance Section */}
        <YStack gap="$4" width="100%">
          <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
            <Text fontSize={14} fontWeight="400" color="$white" lineHeight="$4">
              Free transaction allowance
            </Text>
            <XStack style={{ alignItems: 'center' }} gap="$1.5">
              <Text
                fontSize={14}
                fontWeight="500"
                color="$white"
                lineHeight="$5"
                style={{ textAlign: 'right' }}
              >
                {freeAllowance}
              </Text>
              <InfoIcon size={16} />
            </XStack>
          </XStack>

          {/* Warning Message */}
          {showWarning && (
            <Text fontSize={14} fontWeight="400" color="$warning" lineHeight="$5">
              Your free transaction allowance will not cover this transaction.
            </Text>
          )}
        </YStack>
      </YStack>
    </YStack>
  );
};
