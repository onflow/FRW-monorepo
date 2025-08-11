import React, { useState } from 'react';
import { Input, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Button } from '../foundation/Button';
import { Text } from '../foundation/Text';
import type { TokenAmountInputProps } from '../types';

export function TokenAmountInput({
  selectedToken,
  amount,
  onAmountChange,
  isTokenMode = true,
  onToggleInputMode,
  onTokenSelectorPress,
  onMaxPress,
  placeholder = '0.00',
  showBalance = true,
  showConverter = true,
  disabled = false,
  ...props
}: TokenAmountInputProps): React.ReactElement {
  const [focused, setFocused] = useState(false);

  const displayAmount = amount || '0';
  const tokenSymbol = selectedToken?.symbol || 'Token';
  const tokenBalance = selectedToken?.balance || '0';

  return (
    <YStack gap="$3" {...props}>
      {/* Header */}
      <XStack items="center" gap="$4">
        <Text fontSize="$2" color="$textSecondary" minW={75}>
          Send Tokens
        </Text>
      </XStack>

      {/* Main Input Row */}
      <XStack items="center" gap="$3">
        {/* Token Icon */}
        <Avatar
          src={selectedToken?.logo || selectedToken?.logoURI}
          fallback={selectedToken?.symbol?.charAt(0) || 'T'}
          size={36}
        />

        {/* Amount Input */}
        <XStack items="center" flex={1}>
          {!isTokenMode && (
            <Text fontSize="$7" fontWeight="500" color="$text" mr="$1">
              $
            </Text>
          )}

          <Input
            value={displayAmount}
            onChangeText={onAmountChange}
            placeholder={placeholder}
            keyboardType="numeric"
            fontSize="$7"
            fontWeight="500"
            color="$text"
            flex={1}
            borderWidth={0}
            backgroundColor="transparent"
            focusStyle={{
              borderColor: 'transparent',
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            selectTextOnFocus
          />
        </XStack>

        {/* Token Selector */}
        <Button variant="secondary" size="small" onPress={onTokenSelectorPress} disabled={disabled}>
          <XStack items="center" gap="$2">
            <Text fontSize="$3" fontWeight="600" numberOfLines={1}>
              {tokenSymbol}
            </Text>
            {selectedToken?.isVerified && (
              <YStack width={12} height={12} alignItems="center" justifyContent="center">
                ✓
              </YStack>
            )}
            <Text fontSize="$2">▼</Text>
          </XStack>
        </Button>
      </XStack>

      {/* Bottom Row */}
      <XStack items="center" justify="space-between">
        {/* Converter */}
        {showConverter && (
          <XStack items="center" gap="$3">
            <Button variant="ghost" size="small" onPress={onToggleInputMode} disabled={disabled}>
              ⇄
            </Button>

            <Text fontSize="$3" color="$textSecondary" numberOfLines={1}>
              {isTokenMode
                ? `$${(parseFloat(displayAmount || '0') * (selectedToken?.price || 0)).toFixed(2)}`
                : `${(parseFloat(displayAmount || '0') / (selectedToken?.price || 1)).toFixed(6)} ${tokenSymbol}`}
            </Text>
          </XStack>
        )}

        {/* Balance and MAX */}
        {showBalance && (
          <XStack items="center" gap="$3" flex={1} justify="flex-end">
            <Text fontSize="$3" color="$textSecondary" text="right" numberOfLines={1}>
              {tokenBalance}
            </Text>

            <Button variant="ghost" size="small" onPress={onMaxPress} disabled={disabled}>
              MAX
            </Button>
          </XStack>
        )}
      </XStack>
    </YStack>
  );
}
