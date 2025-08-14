import { Search, Close } from '@onflow/frw-icons';
import React, { useState, useMemo } from 'react';
import { YStack, XStack, ScrollView, Button, Input, View } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';

export interface TokenModel {
  id?: string;
  symbol: string;
  name: string;
  logoURI?: string;
  balance?: string | number;
  priceInUSD?: string;
  decimal?: number;
  identifier?: string;
  contractAddress?: string;
  isVerified?: boolean;
}

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
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;

    const query = searchQuery.toLowerCase();
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query) ||
        token.contractAddress?.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  // Handle token selection
  const handleTokenSelect = (token: TokenModel) => {
    onTokenSelect(token);
    setSearchQuery('');
    onClose();
  };

  if (!visible) return null;

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
        p="$4"
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
        {/* Header */}
        <XStack items="center" justify="space-between" mb="$4">
          <Text fontSize="$5" fontWeight="600" color="$color">
            {title}
          </Text>
          <Button size="$2" variant="ghost" circular onPress={onClose} icon={<Close size={20} />} />
        </XStack>

        {/* Search Input */}
        {searchable && (
          <YStack mb="$3">
            <XStack
              bg="$gray2"
              rounded="$3"
              px="$3"
              py="$2"
              items="center"
              gap="$2"
              borderWidth={1}
              borderColor="$gray6"
            >
              <Search size={16} color="$gray10" />
              <Input
                flex={1}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search tokens..."
                fontSize="$3"
                borderWidth={0}
                backgroundColor="transparent"
                unstyled
              />
            </XStack>
          </YStack>
        )}

        {/* Token List */}
        <ScrollView maxHeight={400} showsVerticalScrollIndicator={false}>
          <YStack gap="$2">
            {filteredTokens.length === 0 ? (
              <YStack py="$4" items="center">
                <Text fontSize="$3" color="$gray10">
                  {emptyMessage}
                </Text>
              </YStack>
            ) : (
              filteredTokens.map((token, index) => (
                <XStack
                  key={token.id || `${token.symbol}-${index}`}
                  items="center"
                  gap="$3"
                  p="$3"
                  rounded="$3"
                  bg={selectedToken?.symbol === token.symbol ? '$blue3' : 'transparent'}
                  borderColor={selectedToken?.symbol === token.symbol ? '$blue8' : '$gray4'}
                  borderWidth={selectedToken?.symbol === token.symbol ? 1 : 0}
                  hoverStyle={{ bg: '$gray3' }}
                  pressStyle={{ bg: '$gray4' }}
                  onPress={() => handleTokenSelect(token)}
                  cursor="pointer"
                >
                  {/* Token Logo */}
                  <Avatar
                    src={token.logoURI}
                    fallback={token.symbol.charAt(0)}
                    size={40}
                    bg="$gray6"
                  />

                  {/* Token Info */}
                  <YStack flex={1} gap="$1">
                    <XStack items="center" gap="$2">
                      <Text fontSize="$4" fontWeight="600" color="$color">
                        {token.symbol}
                      </Text>
                      {token.isVerified && (
                        <View
                          bg="$green9"
                          rounded="$12"
                          w={16}
                          h={16}
                          items="center"
                          justify="center"
                        >
                          <Text fontSize="$1" color="$white" fontWeight="600">
                            ✓
                          </Text>
                        </View>
                      )}
                    </XStack>
                    <Text fontSize="$3" color="$gray11" numberOfLines={1}>
                      {token.name}
                    </Text>
                  </YStack>

                  {/* Token Balance */}
                  {token.balance && (
                    <YStack items="flex-end" gap="$1">
                      <Text fontSize="$3" fontWeight="500" color="$color">
                        {typeof token.balance === 'string'
                          ? token.balance
                          : token.balance.toFixed(4)}
                      </Text>
                      {token.priceInUSD && (
                        <Text fontSize="$2" color="$gray11">
                          ${token.priceInUSD}
                        </Text>
                      )}
                    </YStack>
                  )}
                </XStack>
              ))
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </YStack>
  );
};
