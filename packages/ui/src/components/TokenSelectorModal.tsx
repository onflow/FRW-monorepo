import { Search, Close, VerifiedToken } from '@onflow/frw-icons';
import { type TokenModel, formatCurrencyStringForDisplay } from '@onflow/frw-types';
import { getDisplayBalanceWithSymbol } from '@onflow/frw-utils';
import React, { useState, useMemo } from 'react';
import { YStack, XStack, ScrollView, Input, Sheet, useMedia, Stack, useTheme, View } from 'tamagui';

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
  const theme = useTheme();
  const isMobile = media.xs || media.sm;

  // Theme-aware close icon color - same logic as ConfirmationDrawer
  const closeIconColor = theme.color?.val || '#000000';

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
      <XStack items="center" width="100%">
        {isExtension ? (
          <>
            <View flex={1} items="center">
              <Text fontSize="$5" fontWeight="700" color="$text" text="center">
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
              <Text fontSize="$5" fontWeight="700" color="$text" text="center">
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
            fontWeight="400"
            height="100%"
            focusStyle={{
              borderWidth: 0,
            }}
          />
        </XStack>
      )}

      {/* Token count display */}
      <Text>
        Found {filteredTokens.length} tokens
      </Text>

      {/* Comment out dynamic content and Close icon for now */}
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
          bg="rgba(0, 0, 0, 0.3)"
        />
        {!isExtension && <Sheet.Handle />}
        <Sheet.Frame
          bg="#121212"
          borderTopLeftRadius={isExtension ? 0 : 16}
          borderTopRightRadius={isExtension ? 0 : 16}
          pt={isExtension ? 0 : 25}
          px={'$4'}
          pb={isExtension ? 0 : 36}
          animation={isExtension ? 'quick' : 'lazy'}
          enterStyle={{ y: 500 }}
          exitStyle={{ y: 500 }}
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
