import { InfoIcon } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { InfoDialog } from './InfoDialog';
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
  /**
   * Custom content to show in the info dialog when info icon is clicked
   */
  infoDialogContent?: React.ReactNode;
  /**
   * Title for the info dialog
   */
  infoDialogTitle?: string;
  /**
   * Optional button text for the info dialog
   */
  infoDialogButtonText?: string;
  /**
   * Callback when info dialog button is clicked
   */
  onInfoDialogButtonClick?: () => void;
}

export const StorageWarning: React.FC<StorageWarningProps> = ({
  message = 'Account balance will fall below the minimum FLOW required for storage after this transaction, causing this transaction to fail.',
  showIcon = true,
  title = 'Storage warning',
  visible = true,
  infoDialogContent,
  infoDialogTitle = 'Storage Information',
  infoDialogButtonText = 'Got it',
  onInfoDialogButtonClick,
}) => {
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const handleInfoIconClick = () => {
    setShowInfoDialog(true);
  };

  const handleCloseDialog = () => {
    setShowInfoDialog(false);
  };

  const handleButtonClick = () => {
    if (onInfoDialogButtonClick) {
      onInfoDialogButtonClick();
    } else {
      // Default behavior: close dialog
      setShowInfoDialog(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <YStack gap={4}>
        {/* Header with title and info icon */}
        <XStack items="center" justify="space-between">
          <Text fontSize="$3" fontWeight="400" color="$white" lineHeight={18}>
            {title}
          </Text>
          {showIcon && (
            <YStack pressStyle={{ opacity: 0.7 }} onPress={handleInfoIconClick} cursor="pointer">
              <InfoIcon size={15} color="rgba(255, 255, 255, 0.4)" />
            </YStack>
          )}
        </XStack>

        {/* Warning message */}
        <Text fontSize="$3" fontWeight="400" color="#FDB022" lineHeight={20}>
          {message}
        </Text>
      </YStack>

      {/* Info Dialog */}
      <InfoDialog
        visible={showInfoDialog}
        title={infoDialogTitle}
        onClose={handleCloseDialog}
        buttonText={infoDialogButtonText}
        onButtonClick={handleButtonClick}
      >
        {infoDialogContent || (
          <YStack gap={12} mb={8} width="100%" alignItems="center" justifyContent="center">
            <Text fontSize="$3" fontWeight="400" color="$white" lineHeight={20} ta="center">
              Flow accounts require a minimum balance of FLOW tokens to cover storage costs.
            </Text>
            <Text fontSize="$3" fontWeight="400" color="$white" lineHeight={20} ta="center">
              When sending tokens or NFTs, ensure your account maintains sufficient FLOW balance to
              cover storage requirements, otherwise the transaction will fail.
            </Text>
          </YStack>
        )}
      </InfoDialog>
    </>
  );
};
