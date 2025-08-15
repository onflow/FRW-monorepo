import {
  BackgroundWrapper,
  YStack,
  ScrollView,
  View,
  TokenAmountInput,
  Text,
  Button,
} from '@onflow/frw-ui';
import React, { useState } from 'react';

import type { BaseScreenProps } from '../types';

interface SendToAmountScreenProps extends BaseScreenProps {
  transactionState?: unknown;
  onAmountChange?: (amount: string) => void;
  onContinue?: (amount: string) => void;
}

export function SendToAmountScreen({
  navigation: _navigation,
  bridge: _bridge,
  t,
  transactionState,
  onAmountChange,
  onContinue,
}: SendToAmountScreenProps): JSX.Element {
  const [amount, setAmount] = useState('');

  const handleAmountChange = (newAmount: string): void => {
    setAmount(newAmount);
    onAmountChange?.(newAmount);
  };

  const handleContinue = (): void => {
    onContinue?.(amount);
  };

  return (
    <BackgroundWrapper>
      <ScrollView>
        <YStack space="$4" padding="$4">
          <Text variant="h3" textAlign="center">
            {t('send.enterAmount')}
          </Text>

          <View>
            <TokenAmountInput
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              token={transactionState}
            />
          </View>

          <Button
            onPress={handleContinue}
            disabled={!amount || parseFloat(amount) <= 0}
            variant="primary"
          >
            {t('common.continue')}
          </Button>
        </YStack>
      </ScrollView>
    </BackgroundWrapper>
  );
}
