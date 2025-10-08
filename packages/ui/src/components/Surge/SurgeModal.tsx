import { AlertTriangle, FlowLogo, SurgeIcon, Close } from '@onflow/frw-icons';
import React, { useEffect } from 'react';
import { YStack, XStack, Button } from 'tamagui';

import { Text } from '../../foundation/Text';
import { HoldToSendButton } from '../HoldToSendButton';

/**
 * SurgeModal component for displaying surge pricing warnings and confirmation
 *
 * @example
 * ```tsx
 * <SurgeModal
 *   visible={showSurgeModal}
 *   transactionFee="- 500.00"
 *   onClose={() => setShowSurgeModal(false)}
 *   onAgree={() => {
 *     // Handle user agreement to surge pricing
 *     console.log('User agreed to surge pricing');
 *   }}
 *   isLoading={isProcessing}
 * />
 * ```
 */
export interface SurgeModalProps {
  /**
   * Whether the modal is visible
   */
  visible?: boolean;
  /**
   * Transaction fee amount to display
   */
  transactionFee?: string;
  /**
   * Surge multiplier (e.g., "4" for 4x higher fees)
   */
  multiplier?: string;
  /**
   * Callback when the modal is closed
   */
  onClose?: () => void;
  /**
   * Callback when user agrees to surge pricing (hold button released)
   */
  onAgree?: () => void;
  /**
   * Whether the hold button is in loading state
   */
  isLoading?: boolean;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

export const SurgeModal: React.FC<SurgeModalProps> = ({
  visible = true,
  transactionFee = '- 500.00',
  multiplier = '4',
  onClose,
  onAgree,
  isLoading = false,
  className,
}) => {
  // Handle escape key press and body scroll prevention
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible && onClose) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <YStack
      bg="$dark80"
      items="center"
      justify="center"
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
      aria-modal={true}
      role="dialog"
      aria-labelledby="surge-modal-title"
      aria-describedby="surge-modal-description"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
      }}
    >
      <YStack
        width={343}
        bg="$surfaceDark5"
        rounded="$4"
        p="$4"
        gap="$4"
        shadowColor="$shadow"
        shadowOffset={{ width: 0, height: 5 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
        style={{ minWidth: 300, maxWidth: '90vw' }}
        data-node-id="9619:26612"
      >
        {/* Close Button */}
        <Button
          position="absolute"
          top="$4"
          right="$4"
          zIndex={1}
          items="center"
          justify="center"
          width="$6"
          height="$6"
          borderRadius="$10"
          padding={0}
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
          cursor="pointer"
          chromeless
          icon={<Close size={12} color="white" />}
        />

        {/* Content Frame */}
        <YStack items="center" gap="$4" style={{ alignSelf: 'stretch' }}>
          {/* Alert Icon */}
          <YStack items="center" justify="center" width={64} height={64} bg="$error" rounded="$10">
            <AlertTriangle size={32} color="white" />
          </YStack>

          {/* Title */}
          <Text
            id="surge-modal-title"
            fontSize={24}
            fontWeight="700"
            color="white"
            lineHeight="$5"
            style={{ textAlign: 'center', maxWidth: 303 }}
          >
            Are you really sure that you want to continue with surge pricing?
          </Text>

          {/* Divider Line */}
          <YStack height={1} width="100%" bg="$border" />

          {/* Transaction Fee Section */}
          <YStack
            bg="rgba(253, 176, 34, 0.15)"
            rounded="$4"
            p="$4"
            gap="$2"
            width="100%"
            style={{ maxWidth: 302 }}
          >
            {/* Transaction Fee Row */}
            <XStack justify="space-between" items="center" width="100%">
              <Text fontSize={14} fontWeight="400" color="$white">
                Your transaction fee
              </Text>
              <XStack items="center" gap="$1">
                <Text fontSize={14} fontWeight="500" color="$white">
                  {transactionFee}
                </Text>
                <FlowLogo size={18} theme="multicolor" />
              </XStack>
            </XStack>

            {/* Surge Active Section */}
            <XStack items="center" gap="$2">
              <YStack items="center" justify="center" style={{ color: 'var(--warning)' }}>
                <SurgeIcon size={24} />
              </YStack>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="$warning">
                  Surge price active
                </Text>
              </YStack>
            </XStack>

            {/* Description */}
            <Text
              id="surge-modal-description"
              fontSize={14}
              fontWeight="400"
              color="$warning"
              lineHeight="$4"
            >
              Due to high network activity, transaction fees are elevated, and Flow Wallet is
              temporarily not paying for your gas. Current network fees are {multiplier}× higher
              than usual.
            </Text>
          </YStack>

          {/* Hold to Agree Button */}
          <YStack width="100%" style={{ maxWidth: 303 }}>
            <HoldToSendButton
              onPress={async () => {
                if (onAgree) {
                  onAgree();
                }
              }}
              holdToSendText="Hold to agree to surge pricing"
              holdDuration={1500}
              stopSignal={isLoading}
            />
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};
