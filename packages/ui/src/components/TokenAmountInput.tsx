import { SwitchVertical, ChevronDown, CheckCircle } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { Input, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';
import type { TokenAmountInputProps } from '../types';

export function TokenAmountInput({
  selectedToken,
  amount,
  onAmountChange,
  isTokenMode = true,
  onToggleInputMode,
  onTokenSelectorPress,
  _onMaxPress,
  placeholder = '0.00',
  showBalance = true,
  showConverter = true,
  disabled = false,
  ...props
}: TokenAmountInputProps): React.ReactElement {
  const [_focused, setFocused] = useState(false);

  const displayAmount = amount || '';
  const tokenSymbol = selectedToken?.symbol || 'Token';
  const tokenBalance = selectedToken?.balance || '0';

  return (
    <YStack gap={12} p={16} pb={24} bg="$light10" rounded={16} width={343} {...props}>
      {/* Send Tokens Header - exactly 75px width */}
      <XStack items="center" gap={15}>
        <Text
          fontSize={12}
          fontWeight="400"
          color="rgba(255, 255, 255, 0.8)"
          width={75}
          lineHeight={16}
        >
          Send Tokens
        </Text>
      </XStack>

      {/* Main Input Row - space-between with 11px gap */}
      <XStack items="center" justify="space-between" gap={11}>
        {/* Token Logo and Amount Input - flexible width */}
        <XStack items="center" gap={11} flex={1}>
          {/* Token Logo - exactly 35.2x35.2px */}
          <Avatar
            src={selectedToken?.logo || selectedToken?.logoURI}
            fallback={selectedToken?.symbol?.charAt(0) || 'F'}
            size={35.2}
          />

          {/* Amount Input - fixed width 169px, height 26px */}
          <XStack items="center" width={169} height={26}>
            {!isTokenMode && (
              <Text fontSize={28} fontWeight="500" color="$white" lineHeight={16} mr={4}>
                $
              </Text>
            )}
            <Input
              value={displayAmount}
              onChangeText={onAmountChange}
              placeholder={placeholder}
              keyboardType="numeric"
              fontSize={28}
              fontWeight="500"
              color="$white"
              lineHeight={16}
              width={!isTokenMode ? 145 : 169}
              borderWidth={0}
              bg="transparent"
              p={0}
              m={0}
              focusStyle={{
                borderColor: 'transparent',
                borderWidth: 0,
                outlineWidth: 0,
                boxShadow: 'none',
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={disabled}
              selectTextOnFocus
              textAlign="left"
            />
          </XStack>
        </XStack>

        {/* Token Selector - exactly 85px width, 35.2px height */}
        <XStack
          items="center"
          justify="space-between"
          bg="$light10"
          rounded={39}
          width={85}
          height={35.2}
          pt={3}
          pr={9}
          pb={3}
          pl={10}
          gap={8}
          pressStyle={{ opacity: 0.8 }}
          onPress={onTokenSelectorPress}
          disabled={disabled}
        >
          <XStack items="center" gap={3}>
            <Text
              fontSize={12}
              fontWeight="600"
              color="$white"
              lineHeight={18}
              width={34.55}
              numberOfLines={1}
            >
              {tokenSymbol}
            </Text>
            {selectedToken?.isVerified && <CheckCircle size={10} color="#41CC5D" />}
          </XStack>
          <ChevronDown size={14} color="$white" />
        </XStack>
      </XStack>

      {/* Bottom Row - space-between layout */}
      <XStack items="center" justify="space-between">
        {/* Left Side - Converter Toggle and USD Value */}
        {showConverter && (
          <XStack items="center" gap={4} flex={1} minW={0}>
            {/* Swap Button - exactly 25x25px with 4.545px padding */}
            <XStack
              items="center"
              justify="center"
              width={25}
              height={25}
              bg="$light10"
              rounded={56.818}
              p={4.545}
              mr="$1"
              pressStyle={{ opacity: 0.8 }}
              onPress={onToggleInputMode}
              disabled={disabled}
            >
              <SwitchVertical size={11.36} color="rgba(255, 255, 255, 0.4)" />
            </XStack>

            <Text
              fontSize={14}
              fontWeight="400"
              color="rgba(255, 255, 255, 0.8)"
              lineHeight={16}
              flex={1}
              minW={0}
            >
              {isTokenMode
                ? `$${(parseFloat(displayAmount || '0') * (selectedToken?.price || 0)).toFixed(2)}`
                : `${(parseFloat(displayAmount || '0') / (selectedToken?.price || 1)).toFixed(5)} ${tokenSymbol}`}
            </Text>
          </XStack>
        )}

        {/* Right Side - Balance */}
        {showBalance && (
          <Text
            fontSize={14}
            fontWeight="400"
            color="rgba(255, 255, 255, 0.8)"
            lineHeight={16}
            text="right"
            flexShrink={0}
          >
            {tokenBalance} {tokenSymbol}
          </Text>
        )}
      </XStack>
    </YStack>
  );
}
