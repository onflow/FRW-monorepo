import { Search, Close, VerifiedToken } from '@onflow/frw-icons';
import { type TokenModel } from '@onflow/frw-types';
import { isDarkMode } from '@onflow/frw-utils';
import React, { useState, useMemo } from 'react';
import {
  YStack,
  XStack,
  ScrollView,
  Input,
  Sheet,
  useMedia,
  Stack,
  useTheme,
  View,
  Separator,
} from 'tamagui';

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
  backgroundColor = '$bgDrawer',
  maxHeight = 600,
  platform = 'auto',
  currency = { symbol: '$' },
  isExtension = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const media = useMedia();
  const theme = useTheme();
  const isMobile = media.xs || media.sm;

  // Theme-aware close icon color - same logic as ConfirmationDrawer
  const closeIconColor = theme.color?.val || '#000000';

  // Theme-aware search icon color - using isDarkMode helper function
  const isCurrentlyDarkMode = isDarkMode(theme);
  const searchIconColor = isCurrentlyDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';

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

  // Working version with proper header structure
  const renderContent = () => (
    <YStack flex={1} gap={20}>
      {/* Header - exact ConfirmationDrawer structure that works */}
      <XStack items="center" width="100%" shrink={0}>
        {isExtension ? (
          <>
            <View flex={1} items="center">
              <Text fontSize="$5" fontWeight="700" color="$color" text="center">
                {title}
              </Text>
            </View>

            <XStack
              width={32}
              height={32}
              items="center"
              justify="center"
              pressStyle={{ opacity: 0.8 }}
              onPress={onClose}
              cursor="pointer"
            >
              <Close size={15} color={closeIconColor} />
            </XStack>
          </>
        ) : (
          <>
            <View width={32} height={32} />

            <View flex={1} items="center">
              <Text fontSize="$5" fontWeight="700" color="$color" text="center">
                {title}
              </Text>
            </View>

            <XStack
              width={32}
              height={32}
              items="center"
              justify="center"
              rounded="$4"
              pressStyle={{ opacity: 0.8 }}
              onPress={onClose}
              cursor="pointer"
            >
              <Close size={15} color={closeIconColor} />
            </XStack>
          </>
        )}
      </XStack>

      {/* Search Input - using working structure */}
      {searchable && (
        <XStack
          bg="$backgroundStrong"
          rounded="$4"
          px="$4"
          items="center"
          gap="$2"
          borderWidth={0}
          height={44}
          shrink={0}
        >
          <Search size={20} color={searchIconColor} theme="outline" />
          <Input
            flex={1}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Token"
            placeholderTextColor="$placeholderColor"
            fontSize={16}
            color="$color"
            borderWidth={0}
            bg="transparent"
            unstyled
            fontWeight="400"
            height="100%"
            focusStyle={{
              borderWidth: 0,
            }}
          />
        </XStack>
      )}

      {/* Token List ScrollView with explicit height constraints */}
      <View style={{ flex: 1, minHeight: 0, height: '100%' }}>
        <ScrollView
          style={{
            flex: 1,
            maxHeight: 400,
            height: '100%',
          }}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        >
          <YStack gap="$2">
            {filteredTokens.length === 0 ? (
              <Text text="center" color="$color" py="$4">
                {emptyMessage}
              </Text>
            ) : (
              filteredTokens.map((token, index) => (
                <YStack key={`${token.symbol}-${index}`}>
                  <Stack
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => handleTokenSelect(token)}
                    cursor="pointer"
                    items="center"
                    justify="center"
                    width="100%"
                    height={64}
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
                                color="$color"
                                numberOfLines={1}
                                lineHeight="$1"
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
                            color="$color"
                            numberOfLines={1}
                            text="right"
                            lineHeight="$1"
                          >
                            {token.displayBalance || token.balance || '0'} {token.symbol}
                          </Text>
                        </XStack>

                        {/* Bottom row: Symbol + USD value */}
                        <XStack justify="space-between" items="center" gap="$1">
                          <Text
                            fontSize={12}
                            color="$color"
                            opacity={0.7}
                            numberOfLines={1}
                            lineHeight="$1"
                          >
                            {token.symbol}
                          </Text>
                          <Text
                            fontSize={12}
                            color="$color"
                            opacity={0.7}
                            numberOfLines={1}
                            text="right"
                            lineHeight="$1"
                          >
                            {token.balanceInUSD
                              ? `$${parseFloat(token.balanceInUSD).toFixed(2)}`
                              : token.balanceInCurrency
                                ? parseFloat(token.balanceInCurrency).toFixed(2)
                                : ''}
                          </Text>
                        </XStack>
                      </YStack>
                    </XStack>
                  </Stack>
                  {/* Separator between rows, but not after the last item */}
                  {index < filteredTokens.length - 1 && (
                    <Separator borderColor="$borderColor" my="$2" />
                  )}
                </YStack>
              ))
            )}
          </YStack>
        </ScrollView>
      </View>

      {/* Comment out any remaining components */}
      {/*
      <XStack items="center" justify="space-between">
        <XStack width={40} />
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

      <Text>Found {filteredTokens.length} tokens</Text>
      */}

      {/* Still commented out - search and other components */}
      {/*

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
            placeholderTextColor="$placeholderColor"
            fontSize={16}
            color="$color"
            borderWidth={0}
            bg="transparent"
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

      <Text>Found {filteredTokens.length} tokens</Text>
      */}
    </YStack>
  );

  // Determine if we should use sheet
  const shouldUseSheet =
    platform === 'mobile' || (platform === 'auto' && (isMobile || isReactNative));

  // Mobile: Use bottom sheet
  if (shouldUseSheet) {
    return (
      <Sheet
        modal
        open={visible}
        onOpenChange={onClose}
        snapPointsMode={!isExtension ? 'fit' : undefined}
        dismissOnSnapToBottom
        snapPoints={isExtension ? [91] : undefined}
        animation={isExtension ? 'quick' : 'lazy'}
      >
        <Sheet.Overlay
          animation={isExtension ? undefined : 'lazy'}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          bg="$backgroundTransparent"
        />
        {!isExtension && <Sheet.Handle />}
        <Sheet.Frame
          bg="$bgDrawer"
          borderTopLeftRadius={isExtension ? 0 : 16}
          borderTopRightRadius={isExtension ? 0 : 16}
          pt={isExtension ? 0 : 25}
          pb={isExtension ? 0 : 36}
          animation={isExtension ? 'quick' : 'lazy'}
          enterStyle={{ y: 500 }}
          exitStyle={{ y: 500 }}
          flex={1}
          height="100%"
        >
          <YStack p="$4" gap="$4" flex={1} height="100%">
            {renderContent()}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    );
  }

  // Desktop: Use modal
  return (
    <YStack
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
      bg="$backgroundTransparent"
      items="center"
      justify="center"
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
    >
      <YStack
        bg={backgroundColor as any}
        rounded="$4"
        minW={320}
        maxW="90%"
        maxH={maxHeight}
        shadowColor="$shadowColor"
        shadowOpacity={0.25}
        shadowRadius="$4"
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
        flex={1}
        my="$4"
      >
        <YStack p="$4" gap="$4" flex={1}>
          {renderContent()}
        </YStack>
      </YStack>
    </YStack>
  );
};
