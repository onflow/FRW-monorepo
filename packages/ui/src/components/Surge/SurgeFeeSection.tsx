import { FlowLogo, SurgeIcon, InfoIcon } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, Separator, Button } from 'tamagui';

import { PriceBreakdown } from './PriceBreakdown';
import { SurgeInfo } from './SurgeInfo';
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
  const [isSurgeInfoOpen, setIsSurgeInfoOpen] = useState(false);
  const [isPriceBreakdownOpen, setIsPriceBreakdownOpen] = useState(false);
  return (
    <YStack gap="$4" className={className}>
      {/* Surge Price Active Indicator */}
      <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
        <XStack style={{ alignItems: 'center' }} gap="$2">
          <SurgeIcon size={24} />
          <Text fontSize={14} fontWeight="600" color="$warning" lineHeight="$4">
            Surge price active
          </Text>
        </XStack>
        <Button
          background="transparent"
          borderWidth={0}
          padding={0}
          onPress={() => setIsSurgeInfoOpen(true)}
          icon={<InfoIcon size={24} />}
          chromeless
        />
      </XStack>

      {/* Fee Breakdown Card */}
      <YStack background="$light10" borderRadius="$4" padding="$4" gap="$1.5" width="100%">
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
              <FlowLogo size={18} theme="multicolor" />
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
              <Button
                background="transparent"
                borderWidth={0}
                padding={0}
                onPress={() => setIsPriceBreakdownOpen(true)}
                icon={<InfoIcon size={14} />}
                chromeless
              />
            </XStack>
          </XStack>
        </YStack>

        {/* Separator Line */}
        <Separator background="$light10" />

        {/* Free Transaction Allowance Section */}
        <YStack gap="$3" width="100%">
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
            </XStack>
          </XStack>

          {/* Allowance Progress Bar */}
          <YStack gap="$2" width="100%">
            <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
              <Text fontSize={12} fontWeight="400" color="$light60" lineHeight="$3">
                Used
              </Text>
              <Text fontSize={12} fontWeight="400" color="$light60" lineHeight="$3">
                0.8643 / 1.1357
              </Text>
            </XStack>

            {/* Progress Bar Container */}
            <YStack
              height={6}
              background="$light20"
              borderRadius="$2"
              width="100%"
              overflow="hidden"
            >
              {/* Progress Fill */}
              <YStack height="100%" width="76%" background="$warning" borderRadius="$2" />
            </YStack>
          </YStack>

          {/* Warning Message */}
          {!showWarning && (
            <Text fontSize={14} fontWeight="400" color="$warning" lineHeight="$5">
              Your free transaction allowance will not cover this transaction.
            </Text>
          )}
        </YStack>
      </YStack>

      {/* Surge Info Modal */}
      <SurgeInfo isOpen={isSurgeInfoOpen} onClose={() => setIsSurgeInfoOpen(false)} />

      {/* Price Breakdown Modal */}
      <PriceBreakdown
        isOpen={isPriceBreakdownOpen}
        onClose={() => setIsPriceBreakdownOpen(false)}
        transactionFee={transactionFee}
        surgeRate="4X standard rate"
        freeAllowance={freeAllowance}
        finalFee={transactionFee}
      />
    </YStack>
  );
};
