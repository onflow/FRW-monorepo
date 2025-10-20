import { FlowLogo, SurgeIcon } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, useTheme } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface SurgeFeeConfirmationSectionProps {
  transactionFee?: string;
  className?: string;
  surgeMultiplier?: number;
  transactionFeeLabel?: string;
  surgeTitle?: string;
  description?: string;
}

export const SurgeFeeConfirmationSection: React.FC<SurgeFeeConfirmationSectionProps> = ({
  transactionFee = '- 5.00',
  className,
  surgeMultiplier = 1,
  transactionFeeLabel = 'Your transaction fee',
  surgeTitle = 'Surge price active',
  description,
}) => {
  const theme = useTheme();

  // Theme-aware colors
  const warningIconColor = theme.warning?.val || '#FDB022';
  const formattedMultiplier = Number(surgeMultiplier)
    .toFixed(2)
    .replace(/\.?0+$/, '');
  const warningMessage =
    description ??
    `Due to high network activity, transaction fees are elevated. Current network fees are ${formattedMultiplier}× higher than usual and your free allowance will not cover the fee for this transaction.`;

  return (
    <YStack bg="$warning10" rounded="$4" p="$4.5" gap="$2.5" className={className} width="100%">
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
              {transactionFeeLabel}
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
              {surgeTitle}
            </Text>
          </XStack>
        </YStack>
      </XStack>

      {/* Descriptive Warning Message */}
      <Text fontSize={14} fontWeight="400" color="$warning" lineHeight={17} letterSpacing={-0.084}>
        {warningMessage}
      </Text>
    </YStack>
  );
};
