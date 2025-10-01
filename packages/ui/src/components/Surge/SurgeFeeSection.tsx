import { FlowLogo, SurgeIcon, InfoIcon } from '@onflow/frw-icons';
import { isDarkMode } from '@onflow/frw-utils';
import React, { useState } from 'react';
import { YStack, XStack, Button, useTheme } from 'tamagui';

import { SurgeInfo } from './SurgeInfo';
import { SurgeWarning } from './SurgeWarning';
import { Text } from '../../foundation/Text';

export interface SurgeFeeSectionProps {
  transactionFee?: string;
  freeAllowance?: string;
  showWarning?: boolean;
  className?: string;
  onSurgeInfoPress?: () => void;
  surgeMultiplier?: number;
  isSurgePricingActive?: boolean;
}

export const SurgeFeeSection: React.FC<SurgeFeeSectionProps> = ({
  transactionFee = '- 5.00',
  freeAllowance = '1.1357',
  showWarning = true,
  className,
  onSurgeInfoPress,
  surgeMultiplier = 1,
  isSurgePricingActive = false,
}) => {
  const theme = useTheme();
  const [isSurgeWarningOpen, setIsSurgeWarningOpen] = useState(false);
  const [isSurgeInfoOpen, setIsSurgeInfoOpen] = useState(false);

  // Theme-aware colors
  const cardBackgroundColor = isDarkMode(theme) ? '$light10' : '$bg2';
  const warningIconColor = theme.warning?.val || '#FDB022';

  // Don't render if surge pricing is not active
  if (!isSurgePricingActive) {
    return null;
  }

  return (
    <YStack gap="$4" className={className}>
      {/* Surge Price Active Indicator */}
      <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
        <XStack style={{ alignItems: 'center' }} gap="$2">
          <SurgeIcon size={24} color={warningIconColor} />
          <Text fontSize={14} fontWeight="600" color="$warning" lineHeight="$4">
            Surge price active
          </Text>
        </XStack>
        <Button
          bg="transparent"
          borderWidth={0}
          p={0}
          onPress={onSurgeInfoPress || (() => setIsSurgeWarningOpen(true))}
          icon={<InfoIcon size={24} />}
          chromeless
        />
      </XStack>

      {/* Fee Breakdown Card */}
      <YStack bg={cardBackgroundColor} rounded="$4" p="$4" gap="$1.5" width="100%">
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
                bg="transparent"
                borderWidth={0}
                p={0}
                onPress={() => setIsSurgeInfoOpen(true)}
                icon={<InfoIcon size={14} />}
                chromeless
              />
            </XStack>
          </XStack>
        </YStack>

        {/* Separator Line */}
        {/* <Separator background="$light10" /> */}

        {/* Free Transaction Allowance Section */}
        {/* <YStack gap="$3" width="100%">
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
              <FlowLogo size={18} theme="multicolor" />
            </XStack>
          </XStack>

          {/* Allowance Progress Bar */}
        {/* <YStack gap="$2" width="100%">
            {/* Progress Bar Container */}
        {/* <YStack
              height={10}
              bg="rgba(255, 255, 255, 0.2)"
              rounded="$5"
              width="100%"
              overflow="hidden"
            >
              {/* Progress Fill */}
        {/* <YStack height="100%" width="76%" bg="#FDB022" rounded="$5" />
            </YStack>
          </YStack>

          {/* Warning Message */}
        {/* {!showWarning && (
            <Text
              fontSize={14}
              fontWeight="400"
              color="$warning"
              lineHeight={20}
              letterSpacing={-0.084}
            >
              Your free transaction allowance will not cover this transaction.
            </Text>
          )}
        </YStack> */}
      </YStack>

      {/* Surge Warning Modal */}
      <SurgeWarning
        message={`Due to high network activity, transaction fees are elevated. Current network fees are ${Number(
          surgeMultiplier
        )
          .toFixed(2)
          .replace(
            /\.?0+$/,
            ''
          )}× higher than usual and your free allowance will not cover the fee for this transaction.`}
        title="Surge pricing"
        variant="warning"
        visible={isSurgeWarningOpen}
        onClose={() => setIsSurgeWarningOpen(false)}
        surgeMultiplier={surgeMultiplier}
      />

      {/* Surge Info Bottom Sheet */}
      <SurgeInfo
        isOpen={isSurgeInfoOpen}
        onClose={() => setIsSurgeInfoOpen(false)}
        transactionFee={transactionFee}
        surgeMultiplier={surgeMultiplier}
      />
    </YStack>
  );
};
