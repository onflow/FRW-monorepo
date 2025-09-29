import { FlowLogo, SurgeIcon, InfoIcon } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { YStack, XStack, Button, useTheme } from 'tamagui';

import { PriceBreakdown } from './PriceBreakdown';
import { Text } from '../../foundation/Text';

export interface SurgeFeeConfirmationSectionProps {
  transactionFee?: string;
  className?: string;
  onSurgeInfoPress?: () => void;
}

export const SurgeFeeConfirmationSection: React.FC<SurgeFeeConfirmationSectionProps> = ({
  transactionFee = '- 5.00',
  className,
  onSurgeInfoPress,
}) => {
  const theme = useTheme();
  const [isPriceBreakdownOpen, setIsPriceBreakdownOpen] = useState(false);

  // Theme-aware colors
  const warningIconColor = theme.warning?.val || '#FDB022';
  return (
    <YStack
      bg="rgba(253, 176, 34, 0.15)"
      rounded="$4"
      p="$4.5"
      gap="$2.5"
      className={className}
      width="100%"
    >
      {/* Transaction Fee Section */}
      <XStack justify="space-between" items="stretch" gap="$2" width="100%">
        {/* Fee Info */}
        <YStack gap="$1" flex={1}>
          <XStack justify="space-between" items="center" width="100%">
            <Text
              fontSize={14}
              fontWeight="400"
              color="$white"
              lineHeight={18}
              letterSpacing={-0.084}
            >
              Your transaction fee
            </Text>
            <XStack items="center" gap="$1.5">
              <Text
                fontSize={14}
                fontWeight="500"
                color="$white"
                lineHeight={20}
                letterSpacing={-0.084}
              >
                {transactionFee}
              </Text>
              <FlowLogo size={18} theme="multicolor" />
            </XStack>
          </XStack>
        </YStack>
      </XStack>

      {/* Surge Warning Section */}
      <XStack items="flex-start" gap="$2.5" width="100%">
        {/* Activity Icon */}
        <SurgeIcon size={24} color={warningIconColor} />

        {/* Warning Content */}
        <YStack flex={1} gap="$2.5">
          <XStack justify="space-between" items="center" width="100%">
            <Text
              fontSize={14}
              fontWeight="600"
              color="$warning"
              lineHeight={17}
              letterSpacing={-0.084}
            >
              Surge price active
            </Text>
            <XStack items="center" gap="$0.5">
              <Text
                fontSize={14}
                fontWeight="400"
                color="rgba(255, 255, 255, 0.4)"
                lineHeight={20}
                letterSpacing={-0.084}
                width={124}
                style={{ textAlign: 'right' }}
              >
                Price breakdown
              </Text>
              <Button
                bg="transparent"
                borderWidth={0}
                p={0}
                onPress={onSurgeInfoPress || (() => setIsPriceBreakdownOpen(true))}
                icon={<InfoIcon size={15} color="rgba(255, 255, 255, 0.7)" />}
                chromeless
              />
            </XStack>
          </XStack>
        </YStack>
      </XStack>

      {/* Descriptive Warning Message */}
      <Text fontSize={14} fontWeight="400" color="$warning" lineHeight={17} letterSpacing={-0.084}>
        Due to high network activity, transaction fees are elevated. Current network fees are 4×
        higher than usual and your free allowance will not cover the fee for this transaction.
      </Text>

      {/* Price Breakdown Modal */}
      <PriceBreakdown
        isOpen={isPriceBreakdownOpen}
        onClose={() => setIsPriceBreakdownOpen(false)}
        transactionFee={transactionFee}
        surgeRate="4X standard rate"
        finalFee={transactionFee}
      />
    </YStack>
  );
};
