import type { WalletAccount } from '@onflow/frw-types';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { isEVMAccount } from '@/lib';
import { Link } from 'icons';
import { EVMChip, Skeleton, Text } from 'ui';

import { CopyIcon } from '../icons/CopyIcon';
import { ContactAvatar } from '../media/ContactAvatar';
import { WalletAvatar } from '../media/WalletAvatar';
import AddressText from '../typography/AddressText';

// Import unified type instead of defining locally

interface WalletAccountSectionProps {
  account: WalletAccount;
  isAccountIncompatible?: boolean;
  onAccountPress?: () => void;
  showCopyIcon?: boolean;
  onCopyPress?: (address: string) => void;
  useLetterAvatar?: boolean; // New prop to control avatar type
  balanceData?: string; // New prop to display balance data
  isSelectedFromAccount?: boolean; // New prop to show green border for active from account
  showBalance?: boolean; // Whether to show balance section at all
  isBalanceLoading?: boolean; // Whether balance is loading (show skeleton)
}

// Style for name text with specific letter spacing and flex behavior
const NAME_TEXT_STYLE = {
  letterSpacing: -0.084,
  flexShrink: 1,
};

// Check if account should show link icon (only for child and evm types)
const isLinkedAccount = (accountType?: string) => {
  return accountType === 'child' || accountType === 'evm';
};

const WalletAccountSectionComponent: React.FC<WalletAccountSectionProps> = ({
  account,
  isAccountIncompatible = false,
  onAccountPress,
  showCopyIcon = false,
  onCopyPress,
  useLetterAvatar = false,
  balanceData,
  isSelectedFromAccount = false,
  showBalance = false,
  isBalanceLoading = false,
}) => {
  const { isDark } = useTheme();
  // Pre-calculate opacity class
  const containerOpacityClass = isAccountIncompatible ? 'opacity-60' : 'opacity-100';

  // Check if should show parent emoji
  const shouldShowParentEmoji = isLinkedAccount(account.type) && account.parentEmoji?.emoji;

  const handleCopyPress = () => {
    if (onCopyPress) {
      onCopyPress(account.address);
    }
  };

  return (
    <View>
      {/* Incompatible Accounts Header */}
      {isAccountIncompatible && (
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-fg-2 text-sm leading-4">Incompatible Account</Text>
          <TouchableOpacity>
            <Text className="text-primary text-sm leading-4 text-right">Learn more</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Account Card with conditional opacity */}
      <TouchableOpacity
        onPress={onAccountPress}
        activeOpacity={0.7}
        className={`py-2 ${containerOpacityClass}`}
      >
        <View>
          {/* Account Row - exact Figma layout with space-between */}
          <View className="flex-row items-center justify-between gap-3">
            {/* Account Info Container */}
            <View className="flex-row items-center flex-1">
              {/* Enhanced Account Icon Container - with parent emoji support */}
              <View
                className="relative items-center justify-center w-9 h-9"
                style={{
                  marginLeft: shouldShowParentEmoji ? 10 : 5,
                }}
              >
                {/* Parent Emoji Container - positioned at top-left */}
                {shouldShowParentEmoji && (
                  <View
                    className="absolute rounded-full items-center justify-center w-5 h-5 z-10 border-[1.5px] border-surface-1 dark:border-surface-base"
                    style={{
                      left: -6.5, // 3.5px from parent container left (10px - 3.5px = 6.5px offset)
                      top: -4,
                      backgroundColor: account.parentEmoji?.color || '#F0F0F0',
                    }}
                  >
                    <Text
                      className="text-center text-[8px] leading-3"
                      style={{
                        textAlignVertical: 'center',
                        includeFontPadding: false,
                      }}
                      disableAndroidFix={true}
                    >
                      {account.parentEmoji?.emoji}
                    </Text>
                  </View>
                )}

                {/* Main account icon - conditional rendering based on useLetterAvatar */}
                {useLetterAvatar ? (
                  <ContactAvatar name={account.name} size={36} highlight={isSelectedFromAccount} />
                ) : (
                  <WalletAvatar
                    value={account.avatar || account.emojiInfo?.emoji || '👤'}
                    fallback={account.emojiInfo?.emoji || '👤'}
                    size={36}
                    highlight={isSelectedFromAccount}
                    backgroundColor={account.emojiInfo?.color}
                  />
                )}
              </View>

              {/* Account Details - fixed position from parent container left */}
              <View
                className="flex-1"
                style={{
                  marginLeft: shouldShowParentEmoji ? 11 : 16, // Compensate for icon position change
                }}
              >
                <View className="gap-0.5">
                  {/* Account Name with EVM Chip */}
                  <View
                    className="flex-row items-center gap-0.5"
                    style={{ flexWrap: 'nowrap', minWidth: 0 }}
                  >
                    {isLinkedAccount(account.type) && (
                      <View className="mr-0.5">
                        <Link width={16} height={16} />
                      </View>
                    )}
                    <Text
                      className="text-fg-1"
                      style={{
                        fontSize: 14,
                        fontWeight: '600', // semi-bold
                        lineHeight: 17,
                        letterSpacing: -0.084,
                        flexShrink: 1,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {account.name}
                    </Text>
                    {isEVMAccount({ address: account.address }) && <EVMChip />}
                  </View>

                  {/* Account Address */}
                  <AddressText
                    value={account.address}
                    className="text-fg-2 min-w-[120px]"
                    style={{
                      fontSize: 12,
                      fontWeight: '400',
                      lineHeight: 17,
                    }}
                  />

                  {/* Balance display */}
                  {showBalance && (
                    <View className="h-4">
                      {isBalanceLoading ? (
                        <Skeleton isDark={isDark} className="h-4 w-20" />
                      ) : (
                        <Text
                          className="text-fg-2"
                          style={{
                            fontSize: 12,
                            fontWeight: '400',
                            lineHeight: 17,
                          }}
                        >
                          {balanceData || '0 FLOW'}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Copy Icon - only show for address book items */}
            {showCopyIcon && (
              <TouchableOpacity
                onPress={handleCopyPress}
                className="w-6 h-6 items-center justify-center"
                activeOpacity={0.7}
              >
                <CopyIcon width={24} height={24} opacity={0.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const WalletAccountSection = React.memo(
  WalletAccountSectionComponent,
  (prevProps, nextProps) => {
    // Custom comparison function, only re-render when key properties change
    return (
      prevProps.account.id === nextProps.account.id &&
      prevProps.account.name === nextProps.account.name &&
      prevProps.account.emojiInfo?.emoji === nextProps.account.emojiInfo?.emoji &&
      prevProps.account.parentEmoji?.emoji === nextProps.account.parentEmoji?.emoji &&
      prevProps.account.avatar === nextProps.account.avatar &&
      prevProps.account.address === nextProps.account.address &&
      prevProps.account.isActive === nextProps.account.isActive &&
      prevProps.isAccountIncompatible === nextProps.isAccountIncompatible &&
      prevProps.showCopyIcon === nextProps.showCopyIcon &&
      prevProps.useLetterAvatar === nextProps.useLetterAvatar &&
      prevProps.balanceData === nextProps.balanceData &&
      prevProps.isSelectedFromAccount === nextProps.isSelectedFromAccount &&
      prevProps.showBalance === nextProps.showBalance &&
      prevProps.isBalanceLoading === nextProps.isBalanceLoading
    );
  }
);
