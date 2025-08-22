import { Edit } from '@onflow/frw-icons';
import { type WalletAccount } from '@onflow/frw-types';
import { SendArrowDivider } from '@onflow/frw-ui';
import React from 'react';
import { YStack, XStack } from 'tamagui';

import { AddressText } from './AddressText';
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
  borderRadius?: number;
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
  backgroundColor = '$light10',
  borderRadius = 16,
  contentPadding: _contentPadding = 16,
  showAvatar = true,
  avatarSize = 36,
}) => {
  return (
    <YStack
      bg={backgroundColor}
      rounded={borderRadius}
      gap={12}
      p={16}
      pb={24}
      width="100%"
      mt={5}
      style={{ position: 'relative' }}
    >
      {/* Section Header */}
      <div
        style={{
          height: '0',
          paddingTop: '$0',
          margin: '$0',
          position: 'relative',
          top: '-48px',
        }}
      >
        <SendArrowDivider variant="arrow" />
      </div>

      <Text
        fontSize={12}
        fontWeight="400"
        color="$textSecondary"
        lineHeight="1.33"
        alignSelf="stretch"
      >
        {title}
      </Text>

      {/* Incompatible Account Header */}
      {isAccountIncompatible && (
        <XStack justify="space-between" items="flex-end">
          <Text fontSize="$3" fontWeight="400" color="$textSecondary" lineHeight={16}>
            Incompatible Account
          </Text>
          {onLearnMorePress && (
            <Text
              fontSize="$3"
              fontWeight="400"
              color="$primary"
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
        items="center"
        justify="space-between"
        gap={12}
        opacity={isAccountIncompatible ? 0.6 : 1}
      >
        {/* Left Side: Account Info - Fixed width of 217px */}
        <XStack items="center" width={217}>
          {/* Avatar Container - 46x36 with 5px left offset */}
          {showAvatar && (
            <XStack width={46} height={36} items="center" justify="flex-start" pl={5}>
              <Avatar
                src={account.avatar}
                fallback={(account as any)?.emoji || account.name?.charAt(0) || 'A'}
                size={avatarSize}
                borderColor={isAccountIncompatible ? '$textSecondary' : '$primary'}
                borderWidth={1}
              />
            </XStack>
          )}

          {/* Account Details - Fixed width with 12px gap from avatar */}
          <XStack ml={12}>
            <YStack width={151.34} gap={2}>
              <Text color="$white" fontSize="$3" fontWeight="600" lineHeight={17} numberOfLines={1}>
                {account.name || 'Unknown Account'}
              </Text>
              <AddressText
                address={account.address}
                truncate={true}
                startLength={6}
                endLength={4}
              />
            </YStack>
          </XStack>
        </XStack>

        {/* Right Side: Edit Icon */}
        {showEditButton && onEditPress && (
          <XStack justify="flex-end" items="center" gap={16}>
            <XStack
              width={24}
              height={24}
              items="center"
              justify="center"
              pressStyle={{ opacity: 0.7 }}
              onPress={onEditPress}
              cursor="pointer"
              opacity={isAccountIncompatible ? 0.5 : 1}
            >
              <Edit
                size={24}
                color={isAccountIncompatible ? '$white' : '$textSecondary'}
                theme="outline"
              />
            </XStack>
          </XStack>
        )}
      </XStack>
    </YStack>
  );
};
