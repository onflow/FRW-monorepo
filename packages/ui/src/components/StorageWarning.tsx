import { InfoIcon } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface StorageWarningProps {
  /**
   * Custom warning message. Defaults to standard storage warning text.
   */
  message?: string;
  /**
   * Whether to show the info icon next to the title
   */
  showIcon?: boolean;
  /**
   * Title text for the warning section
   */
  title?: string;
  /**
   * Whether to show the warning
   */
  visible?: boolean;
}

export const StorageWarning: React.FC<StorageWarningProps> = ({
  message = 'Account balance will fall below the minimum FLOW required for storage after this transaction, causing this transaction to fail.',
  showIcon = true,
  title = 'Storage warning',
  visible = true,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <YStack gap="$1">
      {/* Header with title and info icon */}
      <XStack items="center" gap="$0.5">
        <Text fontSize="$2" fontWeight="400" color="$white" lineHeight={16}>
          {title}
        </Text>
        {showIcon && <InfoIcon size={15} color="rgba(255, 255, 255, 0.4)" />}
      </XStack>

      {/* Warning message */}
      <Text fontSize="$3" fontWeight="400" color="#FDB022" lineHeight={20}>
        {message}
      </Text>
    </YStack>
  );
};
