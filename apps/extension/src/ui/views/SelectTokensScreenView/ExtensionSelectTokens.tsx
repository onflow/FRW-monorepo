import { useSendStore } from '@onflow/frw-stores';
import { type TokenModel } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  SegmentedControl,
  Text,
  TokenCard,
  YStack,
  XStack,
  ScrollView,
  RefreshView,
  AccountCard,
  Badge,
  Divider,
  Skeleton,
} from '@onflow/frw-ui';
import React, { useCallback, useMemo, useState } from 'react';

import { type ExtendedTokenInfo } from '@/shared/types';
import { useCoins } from '@/ui/hooks/useCoinHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

interface ExtensionSelectTokensProps {
  onTokenSelect: (token: TokenModel) => void;
  onBack: () => void;
}

export function ExtensionSelectTokens({ onTokenSelect, onBack }: ExtensionSelectTokensProps) {
  const [tab, setTab] = useState<'Tokens' | 'NFTs'>('Tokens');
  const { coins, coinsLoaded } = useCoins();
  const { mainAddress, evmAddress, activeAccountType } = useProfiles();

  const { setSelectedToken, setTransactionType, setCurrentStep } = useSendStore();

  // Convert extension coins to TokenModel format
  const tokens = useMemo(() => {
    if (!coins || !coinsLoaded) return [];

    return coins
      .filter((coin: ExtendedTokenInfo) => {
        const balance = parseFloat(coin.balance || '0');
        return balance > 0; // Only show tokens with positive balance
      })
      .map(
        (coin: ExtendedTokenInfo): TokenModel => ({
          identifier: coin.flowIdentifier || coin.symbol || coin.coin || '',
          symbol: coin.symbol || coin.unit || '',
          name: coin.name || coin.coin || '',
          balance: coin.balance || '0',
          displayBalance:
            coin.displayBalance || `${coin.balance || '0'} ${coin.symbol || coin.unit || ''}`,
          availableBalanceToUse: coin.availableBalance || coin.balance || '0',
          usdValue: parseFloat(coin.balanceInUSD || coin.total || '0'),
          change: coin.change24h?.toString() || null,
          icon: coin.logoURI || coin.icon || '',
          isVerified: coin.isVerified ?? true,
          address: coin.address || coin.contractName || '',
          decimals: coin.decimals || 8,
          priceInUSD: coin.priceInUSD || coin.price || '0',
        })
      );
  }, [coins, coinsLoaded]);

  // Handle token selection
  const handleTokenPress = useCallback(
    (token: TokenModel) => {
      setSelectedToken(token);
      setTransactionType('tokens');
      setCurrentStep('send-to');
      onTokenSelect(token);
    },
    [setSelectedToken, setTransactionType, setCurrentStep, onTokenSelect]
  );

  const handleRefresh = useCallback(() => {
    // Could trigger coin refresh here if needed
    console.log('Refresh tokens');
  }, []);

  // Get current account info for display
  const currentAddress = activeAccountType === 'evm' ? evmAddress : mainAddress;
  const accountName = activeAccountType === 'evm' ? 'EVM Account' : 'Flow Account';

  const TABS = ['Tokens', 'NFTs'] as const;

  return (
    <BackgroundWrapper backgroundColor="$background">
      <YStack flex={1} px="$4" pt="$2">
        {/* Header */}
        <XStack justify="center" items="center" py="$4" pos="relative">
          <Text fontSize="$6" fontWeight="700" color="$color" lineHeight="$2" letterSpacing="$-1">
            Send
          </Text>
        </XStack>

        {/* Account Card */}
        {currentAddress && (
          <AccountCard
            account={{
              address: currentAddress,
              name: accountName,
              balance: 'Loading...', // Could add balance calculation here
            }}
            title="From Account"
            isLoading={false}
            showBackground={true}
          />
        )}

        {/* Tab Selector */}
        <YStack my="$4">
          <SegmentedControl
            segments={TABS as unknown as string[]}
            value={tab}
            onChange={(value) => setTab(value as 'Tokens' | 'NFTs')}
            fullWidth={true}
          />
        </YStack>

        {/* Content */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {tab === 'Tokens' && (
            <YStack gap="$3">
              {!coinsLoaded ? (
                <>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <YStack key={`token-skeleton-${index}`} p="$3">
                      <XStack items="center" gap="$3">
                        <Skeleton width="$4" height="$4" borderRadius="$10" />
                        <YStack flex={1} gap="$2">
                          <Skeleton height="$1" width="60%" />
                          <Skeleton height="$0.75" width="40%" />
                        </YStack>
                        <YStack items="flex-end" gap="$1">
                          <Skeleton height="$1" width="$4" />
                          <Skeleton height="$0.75" width="$3" />
                        </YStack>
                      </XStack>
                    </YStack>
                  ))}
                </>
              ) : tokens.length === 0 ? (
                <RefreshView
                  type="empty"
                  message="No tokens with balance found"
                  onRefresh={handleRefresh}
                  refreshText="Refresh"
                />
              ) : (
                <YStack gap="$2">
                  {/* Token Count Badge */}
                  <XStack justify="space-between" items="center" px="$2" pb="$2">
                    <Badge variant="secondary" size="small">
                      {tokens.length} {tokens.length === 1 ? 'Token' : 'Tokens'}
                    </Badge>
                  </XStack>

                  {tokens.map((token, idx) => (
                    <React.Fragment key={`token-${token.identifier || token.symbol}-${idx}`}>
                      <TokenCard
                        symbol={token.symbol || ''}
                        name={token.name || ''}
                        balance={token.displayBalance || token.balance || '0'}
                        logo={token.icon}
                        price={token.usdValue?.toString()}
                        change24h={token.change ? parseFloat(token.change) : undefined}
                        isVerified={token.isVerified}
                        onPress={() => handleTokenPress(token)}
                      />
                      {idx < tokens.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </YStack>
              )}
            </YStack>
          )}

          {tab === 'NFTs' && (
            <YStack gap="$3">
              <RefreshView
                type="empty"
                message="NFT collections coming soon"
                onRefresh={() => {}}
                refreshText="Refresh"
              />
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </BackgroundWrapper>
  );
}
