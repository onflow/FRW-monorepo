import { useTokenStore } from '@onflow/frw-stores';
import { type WalletAccount } from '@onflow/frw-types';
import { useMemo } from 'react';
import { View } from 'react-native';

import { WalletAvatar } from '@/components/ui/media/WalletAvatar';
import { Text } from '@/components/ui/typography/text';
import { useTheme } from '@/contexts/ThemeContext';
import { isEVMAccount } from '@/lib';
import { formatCurrencyStringForDisplay, truncateBalance } from '@/lib/string';
import { Link } from 'icons';
import { AddressText, EVMChip, EditButton, Skeleton } from 'ui';

interface AccountCardProps {
  account: WalletAccount;
  title: string;
  showEditButton?: boolean; // Optional prop to show edit button
  onEditPress?: () => void; // Edit button callback
  isLoading?: boolean; // Loading state
  showBackground?: boolean; // Optional prop to show background container
}

// Check if account should show link icon (only for child and evm types)
const isLinkedAccount = (accountType?: string) => {
  return accountType === 'child' || accountType === 'evm';
};

export const AccountCard = ({
  account,
  title,
  showEditButton = false,
  onEditPress,
  isLoading = false,
  showBackground = false,
}: AccountCardProps) => {
  const { isDark } = useTheme();
  // For EVM accounts, get FLOW balance from EVM token list
  const isEVM = useMemo(() => isEVMAccount({ address: account.address }), [account.address]);

  // Check if should show parent emoji
  const shouldShowParentEmoji =
    isLinkedAccount((account as any).type) && account.parentEmoji?.emoji;

  // Use separate selectors to avoid creating new objects
  const tokens = useTokenStore(state => state.getTokensForAddress(account.address));
  const isCacheValid = useTokenStore(state => state.isCacheValidForAddress(account.address));

  // Get NFT count and balance directly from cache to avoid creating new objects
  const nftCount = useTokenStore(state => {
    const cacheKey = `${account.address}-mainnet`;
    return state.addressCache[cacheKey]?.nftCount || 0;
  });

  const balanceFromStore = useTokenStore(state => {
    const cacheKey = `${account.address}-mainnet`;
    return state.addressCache[cacheKey]?.balance || '0 FLOW';
  });

  // Check if we're still loading data for EVM accounts
  const isLoadingTokens = useMemo(
    () => isEVM && !isCacheValid && !tokens,
    [isEVM, isCacheValid, tokens]
  );

  // Find FLOW token from EVM token list
  const flowToken = useMemo(() => {
    if (isEVM && tokens) {
      return tokens.find((token: any) =>
        token.isFlow && typeof token.isFlow === 'function' ? token.isFlow() : false
      );
    }
    return null;
  }, [isEVM, tokens]);

  const balanceText = useMemo(() => {
    // Hide balance while loading for EVM accounts
    if (isLoadingTokens || isLoading) {
      return null;
    }

    // For EVM accounts, show FLOW balance from EVM token list
    if (isEVM && flowToken) {
      const balance = parseFloat(flowToken.balance || '0');
      if (balance > 0) {
        return truncateBalance(formatCurrencyStringForDisplay({ value: balance }) + ' FLOW', 12);
      }
    }

    // For non-EVM accounts, use balance from store
    if (balanceFromStore && balanceFromStore !== '0 FLOW') {
      // Balance is already formatted in store (e.g., "123.45 FLOW")
      return truncateBalance(balanceFromStore, 12);
    }

    return null;
  }, [isLoadingTokens, isLoading, isEVM, flowToken, balanceFromStore]);

  const nftText = useMemo(() => {
    // Hide NFT count while loading
    if (isLoadingTokens || isLoading) {
      return '';
    }

    if (nftCount === 0) {
      return '';
    }
    return ` | ${nftCount} NFT${nftCount !== 1 ? 's' : ''}`;
  }, [isLoadingTokens, isLoading, nftCount]);

  const displayText = useMemo(
    () => (balanceText ? balanceText + nftText : null),
    [balanceText, nftText]
  );

  const content = (
    <>
      <Text
        size="sm"
        weight="normal"
        className={isDark ? 'text-white/80' : 'text-black/80'}
        style={{ marginBottom: 12 }}
      >
        {title}
      </Text>

      {/* Account Row - using Select Tokens layout structure */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4 flex-1">
          {/* Enhanced Account Icon Container - with parent emoji support */}
          <View
            className="relative items-center justify-center w-11 h-11"
            style={{
              marginLeft: shouldShowParentEmoji ? 10 : 5,
            }}
          >
            {/* Parent Emoji Container - positioned at top-left */}
            {shouldShowParentEmoji && (
              <View
                className="absolute rounded-full items-center justify-center w-5 h-5 z-10"
                style={{
                  left: -6.5, // 3.5px from parent container left (10px - 3.5px = 6.5px offset)
                  top: -4,
                  backgroundColor: account.parentEmoji?.color || '#F0F0F0',
                }}
              >
                <Text
                  size="xs"
                  className="text-center leading-3"
                  style={{
                    fontSize: 8,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                >
                  {account.parentEmoji?.emoji}
                </Text>
              </View>
            )}

            {/* Main account icon */}
            <View className="w-10 h-10 items-center justify-center">
              <WalletAvatar
                value={account.avatar || account.emojiInfo?.emoji || '👤'}
                fallback={account.emojiInfo?.emoji || '👤'}
                size={36}
                highlight={account.isActive}
                backgroundColor={account.emojiInfo?.color}
              />
            </View>
          </View>

          {/* Account Details */}
          <View className="flex-1">
            <View className="gap-0.5">
              {/* Account Name with Link Icon and EVM Chip */}
              <View className="flex-row items-center gap-1">
                {isLinkedAccount((account as any).type) && (
                  <View className="mr-0.5">
                    <Link width={16} height={16} />
                  </View>
                )}
                <Text
                  size="sm"
                  weight="semibold"
                  className={isDark ? 'text-white' : 'text-black'}
                  style={{
                    lineHeight: 17,
                    letterSpacing: -0.084,
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                  }}
                >
                  {account.name}
                </Text>
                {isEVM && <EVMChip />}
              </View>

              {/* Account Address */}
              <AddressText
                style={{
                  fontSize: 12,
                  fontWeight: '400',
                  lineHeight: 17,
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                }}
                value={account.address}
              />

              {/* Balance and NFT count */}
              <View className="h-5 mb-1">
                {isLoading || isLoadingTokens ? (
                  <Skeleton isDark={isDark} style={{ height: 16, width: 96 }} />
                ) : displayText ? (
                  <Text
                    size="xs"
                    weight="normal"
                    className={isDark ? 'text-white/70' : 'text-black/70'}
                    style={{
                      lineHeight: 17,
                      includeFontPadding: false,
                    }}
                  >
                    {displayText}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* Edit Button */}
        {showEditButton && (
          <View>
            <EditButton onPress={onEditPress} />
          </View>
        )}
      </View>
    </>
  );

  return showBackground ? (
    <View
      className="w-full rounded-2xl p-4 mt-5"
      style={{
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F2F2F7',
      }}
    >
      {content}
    </View>
  ) : (
    <View>{content}</View>
  );
};
