import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'icons';
import { Text, WalletAvatar } from 'ui';

interface AccountCardProps {
  emoji: string | { emoji: string } | undefined;
  avatar?: string;
  name: string;
  address: string;
  backgroundColor?: string;
  defaultEmoji?: string;
  parentEmoji?: { emoji: string; color: string };
  type?: string;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  emoji,
  avatar,
  name,
  address,
  backgroundColor,
  defaultEmoji = '👤',
  parentEmoji,
  type,
}) => {
  const { isDark } = useTheme();
  const displayEmoji = typeof emoji === 'string' ? emoji : emoji?.emoji || defaultEmoji;

  // Check if account should show link icon (only for child and evm types)
  const isLinkedAccount = (accountType?: string) => {
    return accountType === 'child' || accountType === 'evm';
  };

  // Check if should show parent emoji
  const shouldShowParentEmoji = isLinkedAccount(type) && parentEmoji?.emoji;

  return (
    <View
      style={{
        alignItems: 'center',
        gap: 4,
        flex: 1,
      }}
    >
      {/* Enhanced Account Icon Container - with parent emoji support */}
      <View
        className="relative items-center justify-center"
        style={{
          width: 36,
          height: 36,
        }}
      >
        {/* Parent Emoji Container - positioned at top-left */}
        {shouldShowParentEmoji && (
          <View
            className="absolute rounded-full items-center justify-center w-4 h-4 z-10 border-[1px] border-white"
            style={{
              left: -2,
              top: -2,
              backgroundColor: parentEmoji?.color || '#F0F0F0',
            }}
          >
            <Text className="text-center text-[6px] leading-2">{parentEmoji?.emoji}</Text>
          </View>
        )}

        {/* Main account icon - use ContactAvatar for letter-based avatars when no proper emoji */}
        {avatar ||
        (emoji && typeof emoji === 'object' && emoji.emoji) ||
        (typeof emoji === 'string' && emoji !== '👤') ? (
          <WalletAvatar
            value={avatar || displayEmoji}
            fallback={displayEmoji}
            size={36}
            highlight={false}
            backgroundColor={backgroundColor}
          />
        ) : (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: isDark ? '#FFFFFF' : '#1A1A1A',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View
        style={{
          alignItems: 'center',
          alignSelf: 'stretch',
          gap: 4,
        }}
      >
        <View style={{ alignItems: 'center', gap: 4 }}>
          {/* Account Name with Link Icon */}
          <View className="flex-row items-center gap-1" style={{ flexWrap: 'wrap', minWidth: 0 }}>
            {isLinkedAccount(type) && (
              <View className="mr-0.5">
                <Link width={10} height={10} />
              </View>
            )}
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                lineHeight: 16.8,
                letterSpacing: -0.084,
                color: isDark ? '#FFFFFF' : '#1A1A1A',
                textAlign: 'center',
              }}
            >
              {name}
            </Text>
          </View>
          {/* {isEVMAccount({ address }) && <EVMChip />} */}
        </View>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '400',
            lineHeight: 16.8,
            color: isDark ? '#B3B3B3' : '#666666',
            textAlign: 'center',
            width: '100%',
          }}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {address}
        </Text>
      </View>
    </View>
  );
};
