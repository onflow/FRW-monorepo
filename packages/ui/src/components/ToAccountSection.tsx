import { Edit, Link } from '@onflow/frw-icons';
import { type WalletAccount } from '@onflow/frw-types';
import React from 'react';
import { YStack, XStack } from 'tamagui';

import { AddressText } from './AddressText';
import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';

export interface ToAccountSectionProps {
  account: WalletAccount;
  fromAccount?: WalletAccount;
  isAccountIncompatible?: boolean;
  onEditPress?: () => void;
  onLearnMorePress?: () => void;
  showEditButton?: boolean;
  title: string;
  backgroundColor?: string;
  borderRadius?: string | number;
  contentPadding?: number;
  showAvatar?: boolean;
  avatarSize?: number;
  isLinked?: boolean;
}

export const ToAccountSection: React.FC<ToAccountSectionProps> = ({
  account,
  fromAccount, // For conditional border logic
  isAccountIncompatible = false,
  onEditPress,
  onLearnMorePress,
  showEditButton = true,
  title,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  borderRadius = 16,
  contentPadding: _contentPadding = 16,
  showAvatar = true,
  avatarSize = 36,
  isLinked = false,
}) => {
  return (
    <YStack
      bg={backgroundColor as any}
      rounded={borderRadius as any}
      gap={12}
      pt={16}
      t={-25}
      px={16}
      pb={24}
      width="100%"
    >
      {/* Section Header */}
      <Text fontSize="$2" fontWeight="400" color="rgba(255, 255, 255, 0.8)" lineHeight={16}>
        {title}
      </Text>

      {/* Incompatible Account Header */}
      {isAccountIncompatible && (
        <XStack justify="space-between" items="flex-end">
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
        items="center"
        justify="space-between"
        gap={12}
        opacity={isAccountIncompatible ? 0.6 : 1}
      >
        {/* Left Side: Account Info - Fixed width of 217px */}
        <XStack items="center" width={217}>
          {/* Avatar Container - 46x36 with 5px left offset */}
          {showAvatar && (
            <XStack
              width={46}
              height={36}
              items="center"
              justify="flex-start"
              pl={5}
              position="relative"
            >
              <Avatar
                src={account.avatar}
                fallback={account.emojiInfo?.emoji || account.name?.charAt(0).toUpperCase()}
                bgColor={account.emojiInfo?.color}
                size={avatarSize}
                borderColor={
                  isAccountIncompatible
                    ? '#D9D9D9'
                    : fromAccount && account.address === fromAccount.address
                      ? '#00EF8B'
                      : undefined
                }
                borderWidth={
                  isAccountIncompatible || (fromAccount && account.address === fromAccount.address)
                    ? 1
                    : undefined
                }
              />
              {/* Parent emoji overlay bubble for linked accounts */}
              {account.parentEmoji && (
                <YStack
                  position="absolute"
                  left={-1}
                  top={-2}
                  width={18}
                  height={18}
                  rounded={9}
                  bg="#D9D9D9"
                  borderWidth={2}
                  borderColor="rgba(10, 10, 11, 0.8)"
                  items="center"
                  justify="center"
                  overflow="hidden"
                >
                  <Text fontSize={8} fontWeight="600" lineHeight={12}>
                    {account.parentEmoji.emoji}
                  </Text>
                </YStack>
              )}
            </XStack>
          )}

          {/* Account Details - Fixed width with 12px gap from avatar */}
          <XStack ml={12}>
            <YStack width={151.34} gap={2}>
              {/* Account Name with linked icon and EVM badge */}
              <XStack items="center" gap={4}>
                {isLinked && <Link size={12.8} color="rgba(255, 255, 255, 0.5)" />}
                <Text
                  color="$white"
                  fontSize="$3"
                  fontWeight="600"
                  lineHeight={17}
                  numberOfLines={1}
                >
                  {account.name || 'Unknown Account'}
                </Text>
                {/* EVM Badge - inline with name */}
                {account.type === 'evm' && (
                  <XStack
                    bg="$accentEVM"
                    rounded="$4"
                    px={4}
                    items="center"
                    justify="center"
                    height={16}
                  >
                    <Text
                      fontSize={8}
                      fontWeight="400"
                      color="$white"
                      lineHeight={9.7}
                      letterSpacing={0.128}
                    >
                      EVM
                    </Text>
                  </XStack>
                )}
              </XStack>

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
                color={isAccountIncompatible ? '#FFFFFF' : '#767676'}
                theme="outline"
              />
            </XStack>
          </XStack>
        )}
      </XStack>
    </YStack>
  );
};
