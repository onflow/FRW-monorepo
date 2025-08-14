import { InfoIcon } from '@onflow/frw-icons';
import { type WalletAccount } from '@onflow/frw-types';
import React from 'react';
import { YStack, XStack } from 'tamagui';

import { SendSectionHeader } from './SendSectionHeader';
import { Avatar } from '../foundation/Avatar';
import { Button } from '../foundation/Button';
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
  incompatibilityMessage?: string;
}

export const ToAccountSection: React.FC<ToAccountSectionProps> = ({
  account,
  isAccountIncompatible = false,
  onEditPress,
  onLearnMorePress,
  showEditButton = true,
  title = 'To Account',
  backgroundColor = '$gray1',
  borderRadius = '$4',
  contentPadding = 16,
  showAvatar = true,
  avatarSize = 40,
  incompatibilityMessage = 'This account may not support the transaction type',
}) => {
  return (
    <YStack bg={backgroundColor} rounded={borderRadius} p={contentPadding} gap="$3">
      {/* Section Header */}
      <SendSectionHeader title={title} onEditPress={onEditPress} showEditButton={showEditButton} />

      {/* Account Info */}
      <XStack items="center" gap="$3">
        {/* Avatar */}
        {showAvatar && (
          <Avatar
            src={account.avatar}
            fallback={account.name?.charAt(0) || 'A'}
            size={avatarSize}
          />
        )}

        {/* Account Details */}
        <YStack flex={1} gap="$1">
          <Text fontSize="$4" fontWeight="600" color="$color">
            {account.name || 'Unknown Account'}
          </Text>
          <Text fontSize="$3" color="$gray11" fontFamily="$mono">
            {account.address}
          </Text>
        </YStack>
      </XStack>

      {/* Account Compatibility Warning */}
      {isAccountIncompatible && (
        <XStack bg="$yellow2" rounded="$3" p="$3" gap="$2" items="flex-start">
          <InfoIcon size={16} color="$yellow11" mt="$1" />
          <YStack flex={1} gap="$2">
            <Text fontSize="$3" color="$yellow12" fontWeight="500">
              Account Compatibility Warning
            </Text>
            <Text fontSize="$2" color="$yellow11" lineHeight="$1">
              {incompatibilityMessage}
            </Text>
            {onLearnMorePress && (
              <Button size="small" variant="ghost" onPress={onLearnMorePress}>
                Learn More
              </Button>
            )}
          </YStack>
        </XStack>
      )}
    </YStack>
  );
};
