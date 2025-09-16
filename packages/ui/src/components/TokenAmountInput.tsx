import { SwitchVertical, ChevronDown, VerifiedToken } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { Input, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';
import type { TokenAmountInputProps } from '../types';

// Helper function to format balance with max 8 decimal places
function formatBalance(balance?: string | number): string {
  if (!balance) return '0';

  const num = typeof balance === 'number' ? balance : parseFloat(balance);
  if (isNaN(num)) return balance.toString();

  // If the number has more than 8 decimal places, round to 8
  // Otherwise, show the number as is (without trailing zeros)
  const rounded = Math.round(num * 100000000) / 100000000;
  return rounded.toString();
}

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
  const [_focused, setFocused] = useState(false);

  const displayAmount = amount || '';
  const tokenSymbol = selectedToken?.symbol || 'Token';
  const tokenBalance = selectedToken?.balance || '0';
  return (
    <YStack gap={12} p={3} pb={16} rounded={16} width="100%" {...props}>
      {/* Send Tokens Header - aligned with From Account */}
      <Text
        fontSize="$2"
        mb="$3"
        ml="$1"
        fontWeight="400"
        color="$light80"
        lineHeight={16}
        textAlign="left"
      >
        Send Tokens
      </Text>

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

          {/* Amount Input - fixed width 169px, height 35px to match input */}
          <XStack items="center" width={169} height={35}>
            {!isTokenMode && (
              <Text fontSize={28} fontWeight="500" color="$white" lineHeight={35} mr={4}>
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
              lineHeight={35}
              height={35}
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
          minW={85}
          height={35.2}
          pt={3}
          pr={9}
          pb={3}
          pl={10}
          gap={8}
          pressStyle={{ opacity: 0.8 }}
          onPress={onTokenSelectorPress}
          disabled={disabled}
          cursor="pointer"
        >
          <XStack items="center" gap={3}>
            <Text fontSize={12} fontWeight="600" color="$white" lineHeight={18} numberOfLines={1}>
              {tokenSymbol}
            </Text>
            {selectedToken?.isVerified && <VerifiedToken size={10} color="#41CC5D" />}
          </XStack>
          <ChevronDown size={14} color="#FFFFFF" />
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
              cursor="pointer"
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
                : `${(parseFloat(displayAmount || '0') / (selectedToken?.price || 1)).toFixed(5)}`}
            </Text>
          </XStack>
        )}

        {/* Right Side - Balance */}
        <XStack justify="space-between" items="center" gap="$2.5">
          {showBalance && (
            <Text
              fontSize={14}
              fontWeight="400"
              opacity={0.8}
              lineHeight={16}
              text="right"
              flexShrink={0}
            >
              {formatBalance(tokenBalance)} {tokenSymbol}
            </Text>
          )}
          <YStack
            bg={'rgba(255, 255, 255, 0.2)'}
            rounded={40}
            height="$6"
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={onMaxPress}
            px="$2.5"
            cursor="pointer"
          >
            <Text fontSize="$3" fontWeight="600">
              MAX
            </Text>
          </YStack>
        </XStack>
      </XStack>
    </YStack>
  );
}
