import {
  BackgroundWrapper,
  YStack,
  XStack,
  Text,
  Button,
  AccountCard,
  TokenAvatar,
  Modal,
  ScrollView,
} from '@onflow/frw-ui';
import React, { useState } from 'react';

import type { BaseScreenProps } from '../types';

interface TransferConfirmationProps extends BaseScreenProps {
  isOpen?: boolean;
  transactionState?: unknown;
  isLoading?: boolean;
  onClose?: () => void;
  onConfirm?: (transactionData: unknown) => void;
}

export function TransferConfirmation({
  navigation: _navigation,
  bridge: _bridge,
  t,
  isOpen = false,
  transactionState,
  isLoading = false,
  onClose,
  onConfirm,
}: TransferConfirmationProps): JSX.Element | null {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    if (confirming || isLoading) return;

    setConfirming(true);
    try {
      await onConfirm?.(transactionState);
    } finally {
      setConfirming(false);
    }
  };

  const handleClose = (): void => {
    if (confirming || isLoading) return;
    onClose?.();
  };

  if (!isOpen) return null;

  const txState = transactionState as any;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <BackgroundWrapper>
        <ScrollView>
          <YStack space="$4" padding="$4">
            <Text variant="h3" textAlign="center">
              {t('send.confirmTransaction')}
            </Text>

            {/* From Account */}
            <YStack space="$2">
              <Text variant="label" color="$neutral400">
                {t('send.from')}
              </Text>
              <AccountCard account={txState?.fromContact} address={txState?.fromAddress} />
            </YStack>

            {/* To Account */}
            <YStack space="$2">
              <Text variant="label" color="$neutral400">
                {t('send.to')}
              </Text>
              <AccountCard account={txState?.toContact} address={txState?.toAddress} />
            </YStack>

            {/* Amount */}
            <YStack space="$2">
              <Text variant="label" color="$neutral400">
                {t('send.amount')}
              </Text>
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" space="$2">
                  <TokenAvatar
                    symbol={txState?.tokenInfo?.symbol}
                    src={txState?.tokenInfo?.logoURI}
                    width={32}
                    height={32}
                  />
                  <YStack>
                    <Text variant="body" fontWeight="600">
                      {txState?.amount} {txState?.tokenInfo?.symbol}
                    </Text>
                    {txState?.fiatAmount && (
                      <Text variant="caption" color="$neutral400">
                        ≈ ${txState.fiatAmount} USD
                      </Text>
                    )}
                  </YStack>
                </XStack>
              </XStack>
            </YStack>

            {/* Transaction Fee */}
            {txState?.fee && (
              <YStack space="$2">
                <Text variant="label" color="$neutral400">
                  {t('send.transactionFee')}
                </Text>
                <Text variant="body">{txState.fee} FLOW</Text>
              </YStack>
            )}

            {/* Action Buttons */}
            <YStack space="$3" marginTop="$4">
              <Button
                onPress={handleConfirm}
                disabled={confirming || isLoading}
                variant="primary"
                loading={confirming || isLoading}
              >
                {confirming || isLoading ? t('send.confirming') : t('send.confirm')}
              </Button>

              <Button onPress={handleClose} disabled={confirming || isLoading} variant="secondary">
                {t('common.cancel')}
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
      </BackgroundWrapper>
    </Modal>
  );
}
