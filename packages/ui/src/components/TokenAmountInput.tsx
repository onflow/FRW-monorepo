import { SwitchVertical, ChevronDown, VerifiedToken } from '@onflow/frw-icons';
import { isDarkMode } from '@onflow/frw-utils';
import BN from 'bignumber.js';
import React, { useState, useRef } from 'react';
import { Input, XStack, YStack, useTheme } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';
import type { TokenAmountInputProps } from '../types';

// Helper function to format balance with max 8 decimal places using BigNumber
function formatBalance(balance?: string | number): string {
  if (!balance) return '0';

  try {
    const balanceBN = new BN(balance.toString());

    // If the number is invalid, return the original string
    if (balanceBN.isNaN()) {
      return balance.toString();
    }

    // Round to 8 decimal places and remove trailing zeros
    return balanceBN.toFixed(8).replace(/\.?0+$/, '');
  } catch (error) {
    // Fallback to original string if BigNumber parsing fails
    return balance.toString();
  }
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
  inputRef: externalInputRef,
  currency = {
    name: 'USD',
    symbol: '$',
    rate: '1',
  },
  amountError,
  ...props
}: TokenAmountInputProps): React.ReactElement {
  const [_focused, setFocused] = useState(false);
  const internalInputRef = useRef<any>(null);
  const inputRef = externalInputRef || internalInputRef;
  const theme = useTheme();

  // Theme detection using helper function
  const isCurrentlyDarkMode = isDarkMode(theme);

  // Theme-aware text color
  const textColor = isCurrentlyDarkMode
    ? theme.white?.val || '#FFFFFF'
    : theme.black?.val || '#000000';

  // Theme-aware token selector colors
  const tokenSelectorBackgroundColor = isCurrentlyDarkMode
    ? theme.white10?.val || 'rgba(255, 255, 255, 0.10)'
    : 'rgba(0, 0, 0, 0.05)';
  const tokenSelectorTextColor = isCurrentlyDarkMode ? '#FFFFFF' : '#000000';
  const chevronColor = '#767676'; // Same color as edit icon for both modes

  // Theme-aware converter colors
  const converterButtonColor = isCurrentlyDarkMode
    ? theme.white10?.val || 'rgba(255, 255, 255, 0.10)'
    : 'rgba(0, 0, 0, 0.05)';
  const converterIconColor = '#767676'; // Same color as edit icon for both modes
  const converterTextColor = isCurrentlyDarkMode
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(0, 0, 0, 0.8)';

  // Theme-aware header text color
  const headerTextColor = isCurrentlyDarkMode
    ? theme.light80?.val || '#CCCCCC'
    : theme.textSecondary?.val || '#666666';

  const displayAmount = amount || '';
  const tokenSymbol = selectedToken?.symbol || 'Token';
  const tokenBalance = selectedToken?.balance || '0';
  return (
    <YStack gap={12} p={3} pb={16} rounded={16} width="100%" {...props}>
      {/* Send Tokens Header - aligned with From Account */}
      <Text fontSize="$2" mb="$3" ml="$1" fontWeight="400" lineHeight={16} text="left">
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
              <Text fontSize={28} fontWeight="500" lineHeight={35} mr={4}>
                {currency.symbol}
              </Text>
            )}
            <Input
              ref={inputRef}
              value={displayAmount}
              onChangeText={onAmountChange}
              placeholder={placeholder}
              keyboardType="numeric"
              fontSize={28}
              fontWeight="500"
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
              style={{
                borderRadius: 0,
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={disabled}
              selectTextOnFocus
              textAlign="left"
              as
              any
            />
          </XStack>
        </XStack>

        {/* Token Selector - exactly 85px width, 35.2px height */}
        <XStack
          items="center"
          justify="space-between"
          bg={tokenSelectorBackgroundColor}
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
            <Text fontSize={12} fontWeight="600" lineHeight={18} numberOfLines={1}>
              {tokenSymbol}
            </Text>
            {selectedToken?.isVerified && <VerifiedToken size={10} color="#41CC5D" />}
          </XStack>
          <ChevronDown size={14} color={chevronColor} />
        </XStack>
      </XStack>

      {/* Bottom Row - space-between layout */}
      <XStack items="center" justify="space-between">
        {/* Left Side - Converter Toggle and USD Value */}
        {showConverter ? (
          <XStack items="center" gap={4} flex={1} minW={0}>
            {/* Swap Button - exactly 25x25px with 4.545px padding */}
            <XStack
              items="center"
              justify="center"
              width={25}
              height={25}
              bg={converterButtonColor}
              rounded={56.818}
              p={4.545}
              mr="$1"
              pressStyle={{ opacity: 0.8 }}
              onPress={onToggleInputMode}
              disabled={disabled}
              cursor="pointer"
            >
              <SwitchVertical size={11.36} color={converterIconColor} />
            </XStack>

            <Text fontSize={14} fontWeight="400" lineHeight={16} flex={1} minW={0} opacity={0.8}>
              {isTokenMode
                ? `${currency.symbol}${(parseFloat(displayAmount || '0') * (selectedToken?.price || 0)).toFixed(2)}`
                : `${(parseFloat(displayAmount || '0') / (selectedToken?.price || 1)).toFixed(5)}`}
            </Text>
          </XStack>
        ) : null}

        {/* Right Side - Balance */}
        <XStack justify="space-between" items="center" gap="$2.5">
          {showBalance ? (
            <Text
              fontSize={14}
              fontWeight="400"
              opacity={0.8}
              lineHeight={16}
              text="right"
              flexShrink={0}
              as
              any
            >
              {formatBalance(tokenBalance)} {tokenSymbol}
            </Text>
          ) : null}
          <YStack
            bg={
              isCurrentlyDarkMode
                ? theme.white10?.val || 'rgba(255, 255, 255, 0.10)'
                : 'rgba(0, 0, 0, 0.05)'
            }
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

      {/* Error Message */}
      {amountError ? (
        <Text fontSize="$2" color="$error" mt="$2" ml="$1" lineHeight={16}>
          {amountError}
        </Text>
      ) : null}
    </YStack>
  );
}
