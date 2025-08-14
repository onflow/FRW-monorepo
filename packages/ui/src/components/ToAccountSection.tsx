import { Edit } from '@onflow/frw-icons';
import { type WalletAccount } from '@onflow/frw-types';
import React from 'react';
import { YStack, XStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';

export interface ToAccountSectionProps {
  account: WalletAccount;
  isAccountIncompatible?: boolean;
  onEditPress?: () => void;
  onLearnMorePress?: () => void;
  showEditButton?: boolean;
  title?: string;
  backgroundColor?: string;
  borderRadius?: string | number;
  contentPadding?: number;
  showAvatar?: boolean;
  avatarSize?: number;
}

export const ToAccountSection: React.FC<ToAccountSectionProps> = ({
  account,
  isAccountIncompatible = false,
  onEditPress,
  onLearnMorePress,
  showEditButton = true,
  title = 'To account',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  borderRadius = 16,
  contentPadding = 16,
  showAvatar = true,
  avatarSize = 36,
}) => {
  return (
    <YStack bg={backgroundColor} rounded={borderRadius} gap="$3" pt="$4" px="$4" pb="$6">
      {/* Section Header */}
      <Text fontSize="$2" fontWeight="400" color="rgba(255, 255, 255, 0.8)" lineHeight={16}>
        {title}
      </Text>

      {/* Incompatible Account Header */}
      {isAccountIncompatible && (
        <XStack justifyContent="space-between" alignItems="flex-end">
          <Text fontSize="$3" fontWeight="400" color="rgba(255, 255, 255, 0.8)" lineHeight={16}>
            Incompatible Account
          </Text>
          {onLearnMorePress && (
            <Text
              fontSize="$3"
              fontWeight="400"
              color="#16FF99"
              lineHeight={16}
              onPress={onLearnMorePress}
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
            >
              Learn more
            </Text>
          )}
        </XStack>
      )}

      {/* Account Row */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        px="$1"
        py="$2"
        opacity={isAccountIncompatible ? 0.6 : 1}
      >
        <XStack alignItems="center" gap="$4" flex={1}>
          {/* Avatar */}
          {showAvatar && (
            <Avatar
              src={account.avatar}
              fallback={account.name?.charAt(0) || 'A'}
              size={avatarSize}
              borderColor={isAccountIncompatible ? '#D9D9D9' : '#00EF8B'}
              borderWidth={1}
            />
          )}

          {/* Account Details */}
          <YStack flex={1} gap="$0.5">
            <Text color="$white" fontSize="$3" fontWeight="600" lineHeight={17} numberOfLines={1}>
              {account.name || 'Unknown Account'}
            </Text>
            <Text color="#B3B3B3" fontWeight="400" fontSize="$2" lineHeight={17}>
              {account.address}
            </Text>
          </YStack>
        </XStack>

        {/* Edit Icon */}
        {showEditButton && onEditPress && (
          <XStack
            width={24}
            height={24}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={onEditPress}
            cursor="pointer"
            opacity={isAccountIncompatible ? 0.5 : 1}
          >
            <Edit size={18} color={isAccountIncompatible ? '#FFFFFF' : '#767676'} theme="outline" />
          </XStack>
        )}
      </XStack>
    </YStack>
  );
};
