import { VerifiedToken, SwitchVertical, ChevronDown } from '@onflow/frw-icons';
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
  onMaxPress,
  placeholder = '0.00',
  showBalance = true,
  showConverter = true,
  disabled = false,
  ...props
}: TokenAmountInputProps): React.ReactElement {
  const [focused, setFocused] = useState(false);

  const displayAmount = amount || '';
  const tokenSymbol = selectedToken?.symbol || 'Token';
  const tokenBalance = selectedToken?.balance || '0';

  return (
    <YStack
      bg="rgba(255, 255, 255, 0.1)"
      rounded={16}
      p={16}
      gap={16}
      width="100%"
      maxWidth={343}
      {...props}
    >
      {/* Header */}
      <Text fontSize={12} fontWeight="400" color="rgba(255, 255, 255, 0.8)">
        Send Tokens
      </Text>

      {/* Main Input Row */}
      <XStack alignItems="center" justifyContent="space-between" gap={12}>
        {/* Token Icon */}
        <Avatar
          src={selectedToken?.logo || selectedToken?.logoURI}
          fallback={selectedToken?.symbol?.charAt(0) || 'T'}
          size={40}
        />

        {/* Amount Input */}
        <XStack alignItems="center" flex={1}>
          {!isTokenMode && (
            <Text fontSize={32} fontWeight="500" color="$white">
              $
            </Text>
          )}

          <Input
            value={displayAmount}
            onChangeText={onAmountChange}
            placeholder={placeholder}
            keyboardType="numeric"
            fontSize={32}
            fontWeight="500"
            color="$white"
            textAlign="left"
            borderWidth={0}
            bg="transparent"
            outlineWidth={0}
            focusStyle={{
              borderWidth: 0,
              borderColor: 'transparent',
              backgroundColor: 'transparent',
              outlineWidth: 0,
              outlineColor: 'transparent',
            }}
            hoverStyle={{
              borderWidth: 0,
              borderColor: 'transparent',
              backgroundColor: 'transparent',
            }}
            pressStyle={{
              borderWidth: 0,
              borderColor: 'transparent',
              backgroundColor: 'transparent',
            }}
            style={{
              textAlign: 'left',
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            selectTextOnFocus
          />
        </XStack>

        {/* Token Selector */}
        <XStack
          bg="rgba(255, 255, 255, 0.1)"
          rounded={20}
          alignItems="center"
          gap={6}
          px={12}
          py={8}
          pressStyle={{ opacity: 0.8 }}
          onPress={onTokenSelectorPress}
          disabled={disabled}
          cursor="pointer"
        >
          <Text fontSize={12} fontWeight="600" color="$white" numberOfLines={1}>
            {tokenSymbol}
          </Text>
          {selectedToken?.isVerified && <VerifiedToken size={12} color="#41CC5D" />}
          <ChevronDown size={12} color="#FFFFFF" />
        </XStack>
      </XStack>

      {/* Bottom Row */}
      <XStack alignItems="center" justifyContent="space-between">
        {/* Left Side - Converter */}
        {showConverter && (
          <XStack alignItems="center" gap={8}>
            <XStack
              bg="rgba(255, 255, 255, 0.1)"
              rounded={12}
              p={6}
              pressStyle={{ opacity: 0.8 }}
              onPress={onToggleInputMode}
              disabled={disabled}
              cursor="pointer"
            >
              <SwitchVertical size={12} color="rgba(255, 255, 255, 0.4)" />
            </XStack>

            <YStack gap={2}>
              <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.8)">
                {isTokenMode
                  ? `$${(parseFloat(displayAmount || '0') * (selectedToken?.price || 0)).toFixed(2)}`
                  : `$${displayAmount || '0.00'}`}
              </Text>
            </YStack>
          </XStack>
        )}

        {/* Right Side - Balance and MAX */}
        {showBalance && (
          <XStack alignItems="center" gap={8}>
            <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.8)" textAlign="right">
              {tokenBalance} {tokenSymbol}
            </Text>

            {onMaxPress && (
              <XStack
                bg="rgba(255, 255, 255, 0.1)"
                rounded={20}
                alignItems="center"
                px={12}
                py={6}
                pressStyle={{ opacity: 0.8 }}
                onPress={onMaxPress}
                disabled={disabled}
                cursor="pointer"
              >
                <Text fontSize={12} fontWeight="600" color="$white" textAlign="center">
                  MAX
                </Text>
              </XStack>
            )}
          </XStack>
        )}
      </XStack>
    </YStack>
  );
}
