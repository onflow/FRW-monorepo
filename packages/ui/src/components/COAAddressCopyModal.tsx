import { Close } from '@onflow/frw-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { YStack, XStack, Button, Dialog, useTheme } from 'tamagui';

import { Text } from '../foundation/Text';

export interface COAAddressCopyModalProps {
  visible: boolean;
  address: string;
  onClose: () => void;
  onConfirm: () => void;
  /**
   * Optional title text. Defaults to "EVM on Flow address"
   */
  title?: string;
  /**
   * Optional warning message. Defaults to standard COA warning message
   */
  warningMessage?: string;
  /**
   * Optional confirm button text. Defaults to "Confirm to copy address"
   */
  confirmButtonText?: string;
}

export const COAAddressCopyModal: React.FC<COAAddressCopyModalProps> = ({
  visible,
  address,
  onClose,
  onConfirm,
  title,
  warningMessage,
  confirmButtonText,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(visible);
  const isManualClose = useRef(false);

  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        if (!isManualClose.current) {
          setOpen(false);
          onClose();
        }
        isManualClose.current = false;
        return;
      }
      setOpen(true);
    },
    [onClose]
  );

  const handleConfirm = useCallback(() => {
    isManualClose.current = true;
    setOpen(false);
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  const handleDismiss = useCallback(() => {
    isManualClose.current = true;
    setOpen(false);
    onClose();
  }, [onClose]);

  // Handle escape key press and body scroll prevention
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && open) {
        handleDismiss();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
    }

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
      if (document.body) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [open, handleDismiss]);

  return (
    <Dialog modal open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          bg="$dark40"
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
          width={339}
          bg="$surfaceDark5"
          rounded="$4"
          p={18}
          gap={16}
          shadowColor="$shadow"
          shadowOffset={{ width: 0, height: 5 }}
          shadowOpacity={0.25}
          shadowRadius={12}
          elevation={8}
          aria-labelledby="coa-modal-title"
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
            width={24}
            height={24}
            pressStyle={{ opacity: 0.7 }}
            chromeless
            icon={<Close size={14} color={theme.white?.val} />}
            onPress={handleDismiss}
            style={{ position: 'absolute', top: 14, right: 14, zIndex: 1 }}
            p={4}
          />

          <YStack items="center" gap="$4" style={{ alignSelf: 'stretch' }}>
            {/* Title */}
            <Text
              id="coa-modal-title"
              fontSize={20}
              fontWeight="700"
              style={{ textAlign: 'center' }}
              color="$white"
            >
              {title || 'EVM on Flow address'}
            </Text>

            {/* Network Badge */}
            <XStack items="center" justify="center" gap={0}>
              {/* EVM Badge */}
              <YStack
                bg="#627EEA"
                px={8}
                py={2}
                borderTopLeftRadius={16}
                borderBottomLeftRadius={16}
              >
                <Text fontSize={10} fontWeight="600" color="$white">
                  EVM
                </Text>
              </YStack>
              {/* FLOW Badge */}
              <YStack
                bg="#00EF8B"
                px={8}
                py={2}
                borderTopRightRadius={16}
                borderBottomRightRadius={16}
              >
                <Text fontSize={10} fontWeight="600" color="$black">
                  FLOW
                </Text>
              </YStack>
            </XStack>

            {/* Warning Message */}
            <Text fontSize={14} lineHeight={20} style={{ textAlign: 'center' }} color="$white">
              {warningMessage ||
                'You have copied an EVM address on the Flow network, please make sure you only send assets on the Flow network to this address otherwise they will be lost.'}
            </Text>

            {/* Address Display */}
            <YStack bg="#1A1A1A" rounded={8} p={12} width="100%">
              <Text
                fontSize={14}
                style={{ wordBreak: 'break-all', textAlign: 'left', fontFamily: 'monospace' }}
                color="$white"
              >
                {address}
              </Text>
            </YStack>

            {/* Confirm Button */}
            <Button
              height={48}
              bg="$white"
              rounded={12}
              pressStyle={{ opacity: 0.8 }}
              onPress={handleConfirm}
              width="100%"
            >
              <Text fontSize={14} fontWeight="600" style={{ textAlign: 'center' }} color="$black">
                {confirmButtonText || 'Confirm to copy address'}
              </Text>
            </Button>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
