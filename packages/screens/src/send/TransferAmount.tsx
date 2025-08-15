import { YStack, XStack, View, Text, Input, Button, TokenAvatar } from '@onflow/frw-ui';
import React, { useCallback } from 'react';

interface TransferAmountProps {
  transactionState: unknown;
  handleAmountChange: (amount: string) => void;
  handleTokenChange?: (tokenAddress: string) => void;
  handleSwitchFiatOrCoin?: () => void;
  handleMaxClick?: () => void;
}

export function TransferAmount({
  transactionState,
  handleAmountChange,
  handleTokenChange: _handleTokenChange,
  handleSwitchFiatOrCoin,
  handleMaxClick,
}: TransferAmountProps): JSX.Element {
  const { amount, fiatAmount, tokenInfo, fiatOrCoin } = (transactionState as any) || {};

  const renderTokenAvatar = useCallback(() => {
    if (!tokenInfo) return null;

    return <TokenAvatar symbol={tokenInfo.symbol} src={tokenInfo.logoURI} width={24} height={24} />;
  }, [tokenInfo]);

  const displayAmount = fiatOrCoin === 'fiat' ? fiatAmount : amount;
  const displaySymbol = fiatOrCoin === 'fiat' ? 'USD' : tokenInfo?.symbol;

  return (
    <YStack space="$3">
      <XStack alignItems="center" justifyContent="space-between">
        <Text variant="label" color="$neutral400">
          Amount
        </Text>
        {handleMaxClick && (
          <Button size="small" variant="ghost" onPress={handleMaxClick}>
            Max
          </Button>
        )}
      </XStack>

      <XStack alignItems="center" space="$2">
        <View flex={1}>
          <Input
            value={displayAmount || ''}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            keyboardType="numeric"
            fontSize="$6"
            textAlign="right"
          />
        </View>

        <XStack alignItems="center" space="$2">
          {renderTokenAvatar()}
          <Text variant="body" fontWeight="600">
            {displaySymbol}
          </Text>
        </XStack>

        {handleSwitchFiatOrCoin && (
          <Button size="small" variant="ghost" onPress={handleSwitchFiatOrCoin}>
            ⇄
          </Button>
        )}
      </XStack>

      {fiatOrCoin === 'coin' && fiatAmount && (
        <Text variant="caption" color="$neutral400" textAlign="right">
          ≈ ${fiatAmount} USD
        </Text>
      )}

      {fiatOrCoin === 'fiat' && amount && (
        <Text variant="caption" color="$neutral400" textAlign="right">
          ≈ {amount} {tokenInfo?.symbol}
        </Text>
      )}
    </YStack>
  );
}
