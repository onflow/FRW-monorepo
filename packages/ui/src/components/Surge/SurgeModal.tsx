import { AlertTriangle, FlowLogo, SurgeIcon, X } from '@onflow/frw-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { YStack, XStack, Button, Dialog, useTheme } from 'tamagui';

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
 *   multiplier="4"
 *   title={t('surge.modal.title')}
 *   transactionFeeLabel={t('surge.modal.transactionFee')}
 *   surgeActiveText={t('surge.modal.surgeActive')}
 *   description={t('surge.modal.description')}
 *   holdToAgreeText={t('surge.modal.holdToAgree')}
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
  /**
   * Modal title text
   */
  title?: string;
  /**
   * Transaction fee label text
   */
  transactionFeeLabel?: string;
  /**
   * Surge active status text
   */
  surgeActiveText?: string;
  /**
   * Description text with {{multiplier}} placeholder
   */
  description?: string;
  /**
   * Hold to agree button text
   */
  holdToAgreeText?: string;
}

export const SurgeModal: React.FC<SurgeModalProps> = ({
  visible = true,
  transactionFee = '- 500.00',
  multiplier = '4',
  onClose,
  onAgree,
  isLoading = false,
  className,
  title = 'Are you really sure that you want to continue with surge pricing?',
  transactionFeeLabel = 'Your transaction fee',
  surgeActiveText = 'Surge price active',
  description = 'Due to high network activity, transaction fees are elevated, and Flow Wallet is temporarily not paying for your gas. Current network fees are {{multiplier}}× higher than usual.',
  holdToAgreeText = 'Hold to agree to surge pricing',
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(visible);
  const isManualClose = useRef(false);
  const multiplierText = useMemo(() => Number(multiplier).toFixed(2), [multiplier]);
  const descriptionText = useMemo(
    () => description.replace('{{multiplier}}', multiplierText),
    [description, multiplierText]
  );

  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        if (!isManualClose.current) {
          setOpen(false);
          onClose?.();
        }
        isManualClose.current = false;
        return;
      }

      setOpen(true);
    },
    [onClose]
  );

  const handleAgreePress = useCallback(async () => {
    isManualClose.current = true;
    setOpen(false);
    await onAgree?.();
  }, [onAgree]);

  const handleDismiss = useCallback(() => {
    isManualClose.current = true;
    setOpen(false);
    onClose?.();
  }, [onClose]);

  return (
    <Dialog modal open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          bg="$dark80"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          onPress={handleDismiss}
        />
        <Dialog.Content
          key="content"
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
          data-node-id="9619:26612"
          className={className}
          aria-labelledby="surge-modal-title"
          aria-describedby="surge-modal-description"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: 20, opacity: 0 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
        >
          <Button
            width="$6"
            height="$6"
            pressStyle={{ opacity: 0.7 }}
            chromeless
            icon={<X size={20} color={theme.text?.val} />}
            onPress={handleDismiss}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
            p="$4"
          />

          <YStack items="center" gap="$4" style={{ alignSelf: 'stretch' }}>
            <YStack
              items="center"
              justify="center"
              width={64}
              height={64}
              bg="$error"
              rounded="$10"
            >
              <AlertTriangle size={32} color="white" />
            </YStack>

            <Text
              id="surge-modal-title"
              fontSize={24}
              fontWeight="700"
              color="white"
              lineHeight="$5"
              style={{ textAlign: 'center', maxWidth: 303 }}
            >
              {title}
            </Text>

            <YStack height={1} width="100%" bg="$border" />

            <YStack
              bg="rgba(253, 176, 34, 0.15)"
              rounded="$4"
              p="$4"
              gap="$2"
              width="100%"
              style={{ maxWidth: 302 }}
            >
              <XStack justify="space-between" items="center" width="100%">
                <Text fontSize={14} fontWeight="400" color="$white">
                  {transactionFeeLabel}
                </Text>
                <XStack items="center" gap="$1">
                  <Text fontSize={14} fontWeight="500" color="$white">
                    {transactionFee}
                  </Text>
                  <FlowLogo size={18} theme="multicolor" />
                </XStack>
              </XStack>

              <XStack items="center" gap="$2">
                <YStack items="center" justify="center" style={{ color: 'var(--warning)' }}>
                  <SurgeIcon color={theme.warning?.val} size={24} />
                </YStack>
                <YStack flex={1}>
                  <Text fontSize={14} fontWeight="600" color="$warning">
                    {surgeActiveText}
                  </Text>
                </YStack>
              </XStack>

              <Text
                id="surge-modal-description"
                fontSize={14}
                fontWeight="400"
                color="$warning"
                lineHeight="$4"
              >
                {descriptionText}
              </Text>
            </YStack>

            <YStack width="100%" style={{ maxWidth: 303 }}>
              <HoldToSendButton
                onPress={handleAgreePress}
                holdToSendText={holdToAgreeText}
                holdDuration={1000}
                stopSignal={isLoading}
                styles={{
                  backgroundColor: '$error',
                  color: '$white',
                  stroke: '$white',
                }}
              />
            </YStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
