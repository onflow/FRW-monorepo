import { Search, Close, VerifiedToken } from '@onflow/frw-icons';
import { type TokenModel } from '@onflow/frw-types';
import React, { useState, useMemo } from 'react';
import { YStack, XStack, ScrollView, Input, View, Sheet, useMedia } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Button } from '../foundation/Button';
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
        <Text fontSize={18} fontWeight="700" color="#FFFFFF" flex={1} textAlign="center">
          {title}
        </Text>
        <Button size="small" variant="ghost" onPress={onClose}>
          <Close size={15} color="#FFFFFF" />
        </Button>
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
                <XStack
                  items="flex-end"
                  gap={8}
                  py={8}
                  px={0}
                  bg="transparent"
                  hoverStyle={{ bg: 'rgba(255, 255, 255, 0.05)' }}
                  pressStyle={{ bg: 'rgba(255, 255, 255, 0.08)' }}
                  onPress={() => handleTokenSelect(token)}
                  cursor="pointer"
                >
                  {/* Token Logo */}
                  <Avatar
                    src={token.logoURI}
                    fallback={token.symbol.charAt(0)}
                    size={48}
                    bg="rgba(255, 255, 255, 0.1)"
                  />

                  {/* Token Info */}
                  <YStack flex={1} gap={4}>
                    {/* Top row: Token name and verified icon */}
                    <XStack justify="space-between" items="center">
                      <XStack items="center" gap={4}>
                        <Text fontSize={14} fontWeight="600" color="#FFFFFF">
                          {token.symbol}
                        </Text>
                        {token.isVerified && (
                          <VerifiedToken size={16} color="#41CC5D" />
                        )}
                      </XStack>
                      <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.8)" textAlign="right">
                        {typeof token.balance === 'string'
                          ? token.balance
                          : token.balance?.toFixed(4)}
                      </Text>
                    </XStack>
                    
                    {/* Bottom row: Token balance and USD price */}
                    <XStack justify="space-between" items="center">
                      <Text fontSize={14} fontWeight="400" color="#FFFFFF" textAlign="right">
                        {typeof token.balance === 'string'
                          ? `${token.balance} ${token.symbol}`
                          : `${token.balance?.toFixed(4)} ${token.symbol}`}
                      </Text>
                      {token.priceInUSD && (
                        <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.4)" textAlign="right">
                          ${token.priceInUSD}
                        </Text>
                      )}
                    </XStack>
                  </YStack>
                </XStack>
                
                {/* Divider - show for all items except the last one */}
                {index < filteredTokens.length - 1 && (
                  <YStack 
                    height={1} 
                    bg="rgba(255, 255, 255, 0.1)" 
                    mx={12}
                  />
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
  const shouldUseSheet = platform === 'mobile' || 
    (platform === 'auto' && (isMobile || isReactNative));

  // Mobile: Use bottom sheet
  if (shouldUseSheet) {
    return (
      <Sheet
        modal
        open={visible}
        onOpenChange={(open) => !open && onClose()}
        snapPoints={[85, 50]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="rgba(0, 0, 0, 0.3)"
        />
        <Sheet.Handle />
        <Sheet.Frame 
          bg="#121212" 
          borderTopLeftRadius={16} 
          borderTopRightRadius={16}
          pt={25}
          px={18}
          pb={36}
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
