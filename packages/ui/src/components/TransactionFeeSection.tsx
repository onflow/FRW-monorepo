import React from 'react';
import { YStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface TransactionFeeSectionProps {
  transactionFee: string;
  title?: string;
  description?: string;
  backgroundColor?: string;
  borderRadius?: string | number;
  contentPadding?: number;
  titleColor?: string;
  feeColor?: string;
  showEstimate?: boolean;
}

export const TransactionFeeSection: React.FC<TransactionFeeSectionProps> = ({
  transactionFee,
  title = 'Network Fee',
  description,
  backgroundColor = '$gray1',
  borderRadius = '$4',
  contentPadding = 16,
  titleColor = '$gray11',
  feeColor = '$color',
  showEstimate = true,
}) => {
  // Format the fee to ensure it shows estimate symbol if needed
  const formatFee = (fee: string) => {
    if (showEstimate && !fee.startsWith('~')) {
      return `~${fee}`;
    }
    return fee;
  };

  return (
    <YStack bg={backgroundColor} rounded={borderRadius} p={contentPadding}>
      <Text fontSize="$3" fontWeight="600" color={titleColor} mb="$2">
        {title}
      </Text>
      <Text fontSize="$4" color={feeColor}>
        {formatFee(transactionFee)}
      </Text>
      {description && (
        <Text fontSize="$2" color="$gray10" mt="$1">
          {description}
        </Text>
      )}
    </YStack>
  );
};
