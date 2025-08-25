import { bridge } from '@onflow/frw-context';
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
  const isExtension = bridge.getPlatform() === 'extension';

  return (
    <YStack p="$4" gap={4} width="100%" {...props}>
      {/* Header */}
      <Text fontSize={12} fontWeight="400" color="rgba(255, 255, 255, 0.8)">
        {chrome.i18n.getMessage('Send')}
      </Text>

      {/* Main Input Row */}
      <XStack py={10} alignItems="center" justifyContent="space-between" gap={1}>
        {/* Token Icon */}
        <Avatar
          src={selectedToken?.logo || selectedToken?.logoURI}
          fallback={selectedToken?.symbol?.charAt(0) || 'T'}
          size={40}
        />

        {/* Amount Input */}
        <XStack flex={1}>
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
            lineHeight={35}
            height={35}
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
        >
          <XStack items="center" gap={3}>
            <Text fontSize={12} fontWeight="600" color="$white" lineHeight={18} numberOfLines={1}>
              {tokenSymbol}
            </Text>
            {selectedToken?.isVerified && <CheckCircle size={10} color="#FFFFFF" />}
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
              {tokenBalance} {tokenSymbol}
            </Text>
          )}
          {!isExtension && (
            <YStack
              bg={'$bg1'}
              rounded={40}
              height="$6"
              items="center"
              pressStyle={{ opacity: 0.8 }}
              onPress={onMaxPress}
              px="$2.5"
            >
              <Text fontSize="$3" fontWeight="600">
                MAX
              </Text>
            </YStack>
          )}
        </XStack>
      </XStack>
    </YStack>
  );
}
