import { AlertTriangle, Activity, X, Loader } from '@onflow/frw-icons';
import React, { useEffect, useState } from 'react';
import { YStack, XStack, Button } from 'tamagui';

import { Text } from '../../foundation/Text';

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
  onClose,
  onAgree,
  isLoading = false,
  className,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

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

  // Handle hold button progress
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isHolding && !isLoading) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            if (onAgree) {
              onAgree();
            }
            return 0;
          }
          return prev + 2; // Adjust speed as needed
        });
      }, 50);
    } else {
      setHoldProgress(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isHolding, isLoading, onAgree]);

  const handleMouseDown = () => {
    setIsHolding(true);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
  };

  const handleMouseLeave = () => {
    setIsHolding(false);
  };

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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <YStack
        width={343}
        bg="$bg5"
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
          items="center"
          justify="center"
          width={24}
          height={24}
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
          cursor="pointer"
          style={{
            position: 'absolute',
            top: '$4',
            right: '$4',
            zIndex: 1,
          }}
          icon={<X size={24} />}
        />

        {/* Content Frame */}
        <YStack items="center" gap="$4" style={{ alignSelf: 'stretch' }}>
          {/* Alert Icon */}
          <YStack items="center" justify="center" width={64} height={64} bg="$error" rounded="$10">
            <AlertTriangle size={32} color="$white" />
          </YStack>

          {/* Title */}
          <Text
            id="surge-modal-title"
            fontSize={24}
            fontWeight="700"
            color="$white"
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
                {/* FLOW token icon placeholder - you may need to replace with actual token icon */}
                <YStack width={17.6} height={17.6} bg="$primary" rounded="$2" />
              </XStack>
            </XStack>

            {/* Surge Active Section */}
            <XStack items="center" gap="$2">
              <Activity size={24} color="$warning" />
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
              temporarily not paying for your gas. Current network fees are 4× higher than usual.
            </Text>
          </YStack>

          {/* Hold to Agree Button */}
          <YStack width="100%" style={{ maxWidth: 303 }}>
            <Button
              height={52}
              bg="$error"
              rounded="$4"
              pressStyle={{ opacity: 0.8 }}
              onPressIn={handleMouseDown}
              onPressOut={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              disabled={isLoading}
              style={{
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Progress bar overlay */}
              {isHolding && (
                <YStack
                  height="100%"
                  bg="rgba(255, 255, 255, 0.2)"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${holdProgress}%`,
                    transition: 'width 0.1s ease-out',
                  }}
                />
              )}

              <XStack items="center" gap="$2">
                {isLoading ? (
                  <Loader size={20} color="$white" />
                ) : (
                  <YStack width={20} height={20} />
                )}
                <Text fontSize={16} fontWeight="600" color="$white">
                  Hold to agree to surge pricing
                </Text>
              </XStack>
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};
