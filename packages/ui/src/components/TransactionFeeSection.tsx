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
        bg: backgroundColor,
        rounded: borderRadius,
        p: contentPadding,
      }
    : {};

  return (
    <YStack gap={4} {...containerProps}>
      {/* Main fee row */}
      <XStack justify="space-between" items="center">
        {/* Left side - Title */}
        <Text
          fontSize="$3"
          fontWeight="400"
          color={titleColor}
          lineHeight={20}
          letterSpacing={-0.084}
        >
          {title}
        </Text>

        {/* Right side - Fee amount and Flow logo */}
        <XStack items="center" gap={6}>
          {isFree ? (
            // Show strikethrough when free
            <XStack items="center" gap={6} pos="relative">
              <Text
                fontSize="$4"
                fontWeight="400"
                color={feeColor}
                lineHeight={20}
                letterSpacing={-0.084}
                textDecorationLine="line-through"
                opacity={0.6}
              >
                {flowFee}
              </Text>
              <Text
                fontSize="$4"
                fontWeight="400"
                color={feeColor}
                lineHeight={20}
                letterSpacing={-0.084}
                textDecorationLine="line-through"
                opacity={0.6}
              >
                {usdFee}
              </Text>
              <FlowLogo size={18} theme="multicolor" style={{ opacity: 0.6 }} />
            </XStack>
          ) : (
            // Show normal fee display
            <XStack items="center" gap={6}>
              <Text
                fontSize="$4"
                fontWeight="400"
                color="rgba(255, 255, 255, 0.6)"
                lineHeight={20}
                letterSpacing={-0.084}
              >
                {flowFee}
              </Text>
              <Text
                fontSize="$4"
                fontWeight="400"
                color={feeColor}
                lineHeight={20}
                letterSpacing={-0.084}
              >
                {usdFee}
              </Text>
              <FlowLogo size={18} theme="multicolor" />
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
            color="rgba(255, 255, 255, 0.4)"
            lineHeight={17}
            letterSpacing={-0.084}
            text="right"
          >
            {coveredMessage}
          </Text>
        </XStack>
      )}
    </YStack>
  );
};
