import { FlowLogo } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface TransactionFeeSectionProps {
  flowFee?: string;
  usdFee?: string;
  title?: string;
  showCovered?: boolean;
  coveredMessage?: string;
  isFree?: boolean;
  backgroundColor?: string;
  borderRadius?: string | number;
  contentPadding?: number;
  titleColor?: string;
  feeColor?: string;
}

export const TransactionFeeSection: React.FC<TransactionFeeSectionProps> = ({
  flowFee = '0.001 FLOW',
  usdFee = '$0.00',
  title = 'Transaction Fee',
  showCovered = true,
  coveredMessage = 'Covered by Flow Wallet',
  isFree = false,
  backgroundColor,
  borderRadius,
  contentPadding,
  titleColor = '#FFFFFF',
  feeColor = '#FFFFFF',
}) => {
  const containerProps = backgroundColor
    ? {
        backgroundColor: backgroundColor,
        borderRadius: borderRadius,
        padding: contentPadding,
      }
    : {};

  return (
    <YStack gap="$0.5" {...containerProps}>
      {/* Main fee row */}
      <XStack justify="space-between" items="center">
        {/* Left side - Title */}
        <Text fontSize="$3" fontWeight="400" color={titleColor as any} lineHeight={20}>
          {title}
        </Text>

        {/* Right side - Fee amount and Flow logo */}
        <XStack items="center" gap="$0.5">
          {isFree ? (
            // Show strikethrough when free
            <XStack items="center" gap="$0.5" position="relative">
              <Text
                fontSize="$4"
                fontWeight="400"
                color={feeColor as any}
                lineHeight={20}
                textDecorationLine="line-through"
                opacity={0.6}
              >
                {flowFee}
              </Text>
              <Text
                fontSize="$4"
                fontWeight="400"
                color={feeColor as any}
                lineHeight={20}
                textDecorationLine="line-through"
                opacity={0.6}
              >
                {usdFee}
              </Text>
              <FlowLogo size={18} style={{ opacity: 0.6 }} />
            </XStack>
          ) : (
            // Show normal fee display
            <XStack items="center" gap="$1">
              <Text
                fontSize="$4"
                fontWeight="400"
                color={'rgba(255, 255, 255, 0.6)' as any}
                lineHeight={20}
              >
                {flowFee}
              </Text>
              <Text fontSize="$4" fontWeight="400" color={feeColor as any} lineHeight={20}>
                {usdFee}
              </Text>
              <FlowLogo size={18} />
            </XStack>
          )}
        </XStack>
      </XStack>

      {/* Covered message row */}
      {showCovered && (
        <XStack justify="flex-end" items="center">
          <Text
            fontSize="$2"
            fontWeight="400"
            color={'rgba(255, 255, 255, 0.4)' as any}
            lineHeight={17}
          >
            {coveredMessage}
          </Text>
        </XStack>
      )}
    </YStack>
  );
};
