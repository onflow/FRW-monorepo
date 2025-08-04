import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTokenStore } from '@/stores';
import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { CloseIcon, Skeleton } from '../index';
import { Divider } from '../layout/divider';
import { AddressSearchBox } from '@/screens/Send/SendTo/components/AddressSearchBox';
import { TokenCard as SelectTokenCard } from '../cards/TokenCard';
import { TokenInfo } from '@/types';

interface TokenSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onTokenSelect: (token: TokenInfo) => void;
  selectedToken?: TokenInfo | null;
}

export const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({
  visible,
  onClose,
  onTokenSelect,
  selectedToken: _selectedToken,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<TokenInfo[]>([]); // Initialize empty, will load from cache
  const [isLoading, setIsLoading] = useState(false);

  // Load tokens when modal opens
  React.useEffect(() => {
    if (visible) {
      loadTokens();
    }
  }, [visible]);

  const loadTokens = async () => {
    setIsLoading(true);

    try {
      // Get wallet address
      const address = NativeFRWBridge.getSelectedAddress();
      if (!address) {
        console.log('[TokenSelectorModal] No wallet address available');
        return;
      }

      // Use token store for tokens
      const tokenStore = useTokenStore.getState();
      const network = NativeFRWBridge.getNetwork() || 'mainnet';
      await tokenStore.fetchTokens(address, network);
      const tokenInfos = tokenStore.getTokensForAddress(address, network) || [];

      if (tokenInfos.length > 0) {
        // Use TokenInfo objects directly
        setTokens(tokenInfos);
      } else {
        // No tokens available
        setTokens([]);
      }
    } catch (error) {
      console.error('[TokenSelectorModal] Error loading cached tokens:', error);
      // Keep existing tokens on error (could be empty or previously loaded)
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tokens based on non-zero balance and search query
  const filteredTokens = useMemo(() => {
    // First filter out tokens with zero balance
    const tokensWithBalance = tokens.filter(token => {
      const balance = parseFloat(token.displayBalance || token.balance || '0');
      return balance > 0;
    });

    // Then apply search query filter if there's a search
    if (!searchQuery.trim()) return tokensWithBalance;

    const query = searchQuery.toLowerCase();
    return tokensWithBalance.filter(
      token =>
        token.name.toLowerCase().includes(query) ||
        (token.symbol && token.symbol.toLowerCase().includes(query))
    );
  }, [tokens, searchQuery]);

  const handleTokenPress = (token: TokenInfo) => {
    onTokenSelect(token);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Background overlay */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.72)',
          justifyContent: 'flex-end',
        }}
      >
        {/* Modal content */}
        <View
          style={{
            backgroundColor: isDark ? '#121212' : '#FFFFFF',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingTop: 25,
            paddingHorizontal: 18,
            paddingBottom: 36,
            height: '90%', // Changed from maxHeight to fixed height
            minHeight: 600, // Ensure minimum height
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: isDark ? '#FFFFFF' : '#000000',
                    lineHeight: 24,
                    letterSpacing: -0.01,
                    textAlign: 'center',
                    minWidth: 100,
                  }}
                >
                  Tokens
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
              >
                <CloseIcon width={15} height={15} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={{ marginBottom: 16 }}>
              <AddressSearchBox
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search Token"
                showScanButton={false}
              />
            </View>

            {/* Token List - Remove double background and align with search bar */}
            <View style={{ flex: 1 }}>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                  <View style={{ paddingTop: 8 }}>
                    {[1, 2, 3, 4, 5].map(index => (
                      <View
                        key={index}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 16,
                          paddingHorizontal: 4,
                        }}
                      >
                        {/* Token icon skeleton */}
                        <Skeleton
                          isDark={isDark}
                          style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16 }}
                        />
                        <View style={{ flex: 1 }}>
                          {/* Token name skeleton */}
                          <Skeleton
                            isDark={isDark}
                            style={{ height: 16, width: 80, marginBottom: 8 }}
                          />
                          {/* Token balance skeleton */}
                          <Skeleton isDark={isDark} style={{ height: 12, width: 128 }} />
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          {/* USD value skeleton */}
                          <Skeleton
                            isDark={isDark}
                            style={{ height: 16, width: 64, marginBottom: 4 }}
                          />
                          {/* Change percentage skeleton */}
                          <Skeleton isDark={isDark} style={{ height: 12, width: 48 }} />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : filteredTokens.length === 0 ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text
                      style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
                    >
                      {searchQuery ? 'No tokens found' : 'No tokens available'}
                    </Text>
                  </View>
                ) : (
                  filteredTokens.map((token, index) => (
                    <React.Fragment key={`${token.symbol || 'unknown'}-${index}`}>
                      <SelectTokenCard token={token} onPress={() => handleTokenPress(token)} />
                      {/* Divider - only show between items, not after the last one */}
                      {index < filteredTokens.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};
