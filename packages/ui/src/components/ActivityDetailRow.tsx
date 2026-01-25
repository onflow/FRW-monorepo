import { FlowLogo } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Text } from '../foundation/Text';
import type { ActivityDetailRowProps } from '../types';

/**
 * ActivityDetailRow - A row component for displaying activity detail information
 *
 * Used in the ActivityDetailScreen to show transaction details like:
 * - Date, Status, Network, Transaction Fee, Network Fee
 *
 * @example
 * ```tsx
 * <ActivityDetailRow
 *   label="Status"
 *   value="Success"
 *   valueColor="$primary"
 * />
 * ```
 */
export function ActivityDetailRow({
  label,
  value,
  valueColor = '$text2',
  secondaryText,
  showStrikethrough = false,
  originalValue,
  showFlowLogo = false,
}: ActivityDetailRowProps): React.ReactElement {
  return (
    <YStack gap="$1">
      <XStack justify="space-between" items="center" py="$3">
        {/* Left side - Label */}
        <Text fontSize={14} fontWeight="400" color="$text2" lineHeight={20}>
          {label}
        </Text>

        {/* Right side - Value with optional elements */}
        <XStack items="center" gap="$2">
          {showStrikethrough && originalValue && (
            <Text
              fontSize={14}
              fontWeight="400"
              color="$text2"
              lineHeight={20}
              textDecorationLine="line-through"
              opacity={0.6}
            >
              {originalValue}
            </Text>
          )}
          <Text fontSize={14} fontWeight="400" color={valueColor as any} lineHeight={20}>
            {value}
          </Text>
          {showFlowLogo && <FlowLogo size={16} theme="multicolor" />}
        </XStack>
      </XStack>

      {/* Secondary text (e.g., "Covered by Flow Wallet") */}
      {secondaryText && (
        <XStack justify="flex-end" mt={-8} mb="$2">
          <Text fontSize={12} fontWeight="400" color="$text2" opacity={0.6} lineHeight={16}>
            {secondaryText}
          </Text>
        </XStack>
      )}
    </YStack>
  );
}
