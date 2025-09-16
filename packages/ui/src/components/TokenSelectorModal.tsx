import { Search, Close, VerifiedToken } from '@onflow/frw-icons';
import { type TokenModel, formatCurrencyStringForDisplay } from '@onflow/frw-types';
import { getDisplayBalanceWithSymbol } from '@onflow/frw-utils';
import React, { useState, useMemo } from 'react';
import { YStack, XStack, ScrollView, Input, Sheet, useMedia, Stack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';

export interface TokenSelectorModalProps {
  visible: boolean;
  selectedToken: TokenModel | null;
  tokens?: TokenModel[];
  onTokenSelect: (token: TokenModel) => void;
  onClose: () => void;
  searchable?: boolean;
  title?: string;
  emptyMessage?: string;
  backgroundColor?: string;
  maxHeight?: number;
  platform?: 'mobile' | 'desktop' | 'auto';
  currency?: { symbol: string };
  isExtension?: boolean;
}

export const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({
  visible,
  selectedToken,
  tokens = [],
  onTokenSelect,
  onClose,
  searchable = true,
  title = 'Select Token',
  emptyMessage = 'No tokens available',
  backgroundColor = '$background',
  maxHeight = 600,
  platform = 'auto',
  currency = { symbol: '$' },
  isExtension = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const media = useMedia();
  const isMobile = media.xs || media.sm;

  // Alternative detection: check if we're on React Native
  const isReactNative = typeof window === 'undefined' || !window.document;

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;

    const query = searchQuery.toLowerCase();
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.symbol?.toLowerCase().includes(query) ||
        token.contractAddress?.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  // Handle token selection
  const handleTokenSelect = (token: TokenModel): void => {
    onTokenSelect(token);
    setSearchQuery('');
    onClose();
  };

  // Shared content component
  const renderContent = () => (
    <YStack flex={1} gap={20}>
      {/* Header */}
      <XStack items="center" justify="space-between">
        <XStack width={40} /> {/* Invisible spacer to balance the close button */}
        <Text fontSize={18} fontWeight="700" color="#FFFFFF" flex={1} textAlign="center">
          {title}
        </Text>
        <XStack
          width={40}
          height={40}
          items="center"
          justify="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
          cursor="pointer"
        >
          <Close size={15} color="#FFFFFF" />
        </XStack>
      </XStack>

      {/* Search Input */}
      {searchable && (
        <XStack
          bg="$light10"
          rounded="$4"
          px="$4"
          items="center"
          gap="$2"
          borderWidth={0}
          height={44}
        >
          <Search size={20} color="rgba(255, 255, 255, 0.6)" />
          <Input
            flex={1}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Token"
            placeholderTextColor="$light40"
            fontSize={16}
            color="$white"
            borderWidth={0}
            backgroundColor="transparent"
            unstyled
            fontFamily="Inter"
            fontWeight="400"
            height="100%"
            textAlignVertical="center"
            focusStyle={{
              borderWidth: 0,
              outline: 'none',
            }}
          />
        </XStack>
      )}

      {/* Token List */}
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack>
          {filteredTokens.length === 0 ? (
            <YStack py={20} items="center">
              <Text fontSize={14} color="rgba(255, 255, 255, 0.6)">
                {emptyMessage}
              </Text>
            </YStack>
          ) : (
            filteredTokens.map((token, index) => (
              <YStack key={token.id || `${token.symbol}-${index}`}>
                <Stack
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => handleTokenSelect(token)}
                  cursor="pointer"
                  items="center"
                  justify="center"
                  width="100%"
                  height={64}
                  px={12}
                  hoverStyle={{ opacity: 0.7 }}
                >
                  <XStack items="center" gap="$2" width="100%">
                    <Avatar
                      src={token.logoURI}
                      alt={token.symbol}
                      fallback={token.symbol?.[0] || token.name?.[0] || '?'}
                      size={48}
                    />
                    <YStack flex={1} gap="$1">
                      {/* Top row: Token name + verified badge + balance */}
                      <XStack justify="space-between" items="center" gap="$1">
                        <XStack items="center" gap="$1" flex={1} shrink={1}>
                          <XStack items="center" gap="$1" shrink={1}>
                            <Text
                              fontWeight="600"
                              fontSize={14}
                              color="$text1"
                              numberOfLines={1}
                              lineHeight="$1"
                              letterSpacing={-0.6}
                              shrink={1}
                            >
                              {token.name || token.symbol}
                            </Text>
                            {token.isVerified && <VerifiedToken size={16} color="#41CC5D" />}
                          </XStack>
                        </XStack>
                        <Text
                          fontSize={14}
                          fontWeight="400"
                          color="$text1"
                          numberOfLines={1}
                          text="right"
                          lineHeight="$1"
                        >
                          {getDisplayBalanceWithSymbol(token)}
                        </Text>
                      </XStack>

                      {/* Bottom row: Price per token + total balance in currency */}
                      <XStack items="center" gap="$1" justify="space-between">
                        <XStack items="center" gap="$1">
                          <Text
                            color="$text2"
                            fontSize={14}
                            fontWeight="400"
                            numberOfLines={1}
                            lineHeight="$1"
                          >
                            {(() => {
                              if (token.priceInCurrency === '0' || token.priceInCurrency === '0.00')
                                return '';
                              const currencyValue = parseFloat(token.priceInCurrency ?? '0');
                              return !isNaN(currencyValue) && currencyValue > 0
                                ? `${currency.symbol}${formatCurrencyStringForDisplay({ value: currencyValue, digits: 4 })}`
                                : '';
                            })()}
                          </Text>
                        </XStack>

                        <Text
                          color="$text2"
                          fontSize={14}
                          fontWeight="400"
                          numberOfLines={1}
                          lineHeight="$1"
                        >
                          {(() => {
                            if (
                              !token.balanceInCurrency ||
                              token.balanceInCurrency === '0' ||
                              token.balanceInCurrency === '0.00'
                            )
                              return '';
                            const currencyValue = parseFloat(token.balanceInCurrency);
                            return !isNaN(currencyValue) && currencyValue > 0
                              ? `${currency.symbol}${currencyValue.toFixed(2)}`
                              : '';
                          })()}
                        </Text>
                      </XStack>
                    </YStack>
                  </XStack>
                </Stack>

                {/* Divider - show for all items except the last one */}
                {index < filteredTokens.length - 1 && (
                  <YStack height={1} bg="rgba(255, 255, 255, 0.1)" mx={0} />
                )}
              </YStack>
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );

  if (!visible) return null;

  // Determine if we should use sheet
  const shouldUseSheet =
    platform === 'mobile' || (platform === 'auto' && (isMobile || isReactNative));

  // Mobile: Use bottom sheet
  if (shouldUseSheet) {
    return (
      <Sheet
        modal
        open={visible}
        onOpenChange={(open) => !open && onClose()}
        snapPoints={isExtension ? [91] : [85, 50]}
        dismissOnSnapToBottom={!isExtension}
        disableDrag={isExtension}
      >
        <Sheet.Overlay
          animation={isExtension ? undefined : 'lazy'}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          bg="rgba(0, 0, 0, 0.3)"
        />
        {!isExtension && <Sheet.Handle />}
        <Sheet.Frame
          bg="#121212"
          borderTopLeftRadius={isExtension ? 0 : 16}
          borderTopRightRadius={isExtension ? 0 : 16}
          pt={isExtension ? 0 : 25}
          px={isExtension ? 16 : 18}
          pb={isExtension ? 0 : 36}
          animation={isExtension ? 'quick' : 'lazy'}
          enterStyle={{ y: '100%' }}
          exitStyle={{ y: '100%' }}
        >
          {renderContent()}
        </Sheet.Frame>
      </Sheet>
    );
  }

  // Desktop: Use modal
  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="$backgroundTransparent"
      items="center"
      justify="center"
      zIndex={1000}
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
    >
      <YStack
        bg={backgroundColor}
        rounded="$4"
        p="$3"
        minW={320}
        maxW="90%"
        maxH={maxHeight}
        shadowColor="$shadowColor"
        shadowOpacity={0.25}
        shadowRadius="$4"
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </YStack>
    </YStack>
  );
};
