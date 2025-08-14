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
  showAvatar = true,
  avatarSize = 36,
}) => {
  return (
    <YStack bg={backgroundColor} rounded={borderRadius} gap={12} p={16} pb={24} w={343}>
      {/* Section Header */}
      <Text
        fontSize={12}
        fontWeight="400"
        color="rgba(255, 255, 255, 0.8)"
        lineHeight="1.33"
        alignSelf="stretch"
      >
        {title}
      </Text>

      {/* Incompatible Account Header */}
      {isAccountIncompatible && (
        <XStack justify="space-between" items="flex-end">
          <Text fontSize={12} fontWeight="400" color="rgba(255, 255, 255, 0.8)" lineHeight="1.33">
            Incompatible Account
          </Text>
          {onLearnMorePress && (
            <Text
              fontSize={12}
              fontWeight="400"
              color="#16FF99"
              lineHeight="1.33"
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
        items="center"
        justify="space-between"
        alignSelf="stretch"
        gap={12}
        opacity={isAccountIncompatible ? 0.6 : 1}
      >
        {/* Account Display */}
        <XStack items="center" gap={12} w={217}>
          {/* Avatar Container */}
          <YStack w={46} h={36} justify="center" items="flex-start">
            {showAvatar && (
              <Avatar
                src={account.avatar}
                fallback={account.name?.charAt(0) || 'A'}
                size={avatarSize}
                borderColor={isAccountIncompatible ? '#D9D9D9' : '#FFD787'}
                borderWidth={0}
                bg="#FFD787"
              />
            )}
          </YStack>

          {/* Account Details */}
          <YStack gap={2} w={151} flex={1}>
            <XStack items="center" gap={4}>
              <Text
                color="#FFFFFF"
                fontSize={14}
                fontWeight="600"
                lineHeight="1.2"
                letterSpacing="-0.6%"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {account.name || 'Unknown Account'}
              </Text>
            </XStack>
            <Text
              color="#B3B3B3"
              fontWeight="400"
              fontSize={12}
              lineHeight="1.4"
              alignSelf="stretch"
            >
              {account.address}
            </Text>
          </YStack>
        </XStack>

        {/* Edit Icon */}
        {showEditButton && onEditPress && (
          <XStack justify="flex-end" items="center" gap={16}>
            <XStack
              w={24}
              h={24}
              items="center"
              justify="center"
              pressStyle={{ opacity: 0.7 }}
              onPress={onEditPress}
              cursor="pointer"
              opacity={isAccountIncompatible ? 0.5 : 1}
            >
              <Edit size={24} color="#767676" theme="outline" />
            </XStack>
          </XStack>
        )}
      </XStack>
    </YStack>
  );
};
