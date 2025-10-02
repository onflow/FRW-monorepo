import { Edit, Link } from '@onflow/frw-icons';
import { type WalletAccount } from '@onflow/frw-types';
import React, { useState } from 'react';
import { YStack, XStack } from 'tamagui';

import { AddressText } from './AddressText';
import { InfoDialog } from './InfoDialog';
import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';

export interface ToAccountSectionProps {
  account: WalletAccount;
  fromAccount?: WalletAccount;
  isAccountIncompatible?: boolean;
  onEditPress?: () => void;
  showEditButton?: boolean;
  title: string;
  backgroundColor?: string;
  borderRadius?: string | number;
  contentPadding?: number;
  showAvatar?: boolean;
  avatarSize?: number;
  isLinked?: boolean;
  // Text strings for i18n
  incompatibleAccountText?: string;
  learnMoreText?: string;
  unknownAccountText?: string;
  dialogTitle?: string;
  dialogButtonText?: string;
  dialogDescriptionMain?: string;
  dialogDescriptionSecondary?: string;
}

export const ToAccountSection: React.FC<ToAccountSectionProps> = ({
  account,
  fromAccount, // For conditional border logic
  isAccountIncompatible = false,
  onEditPress,
  showEditButton = true,
  title,
  backgroundColor,
  borderRadius = '$4',
  contentPadding: _contentPadding = 16,
  showAvatar = true,
  avatarSize = 36,
  isLinked = false,
  // Text strings for i18n
  incompatibleAccountText = 'Incompatible Account',
  learnMoreText = 'Learn more',
  unknownAccountText = 'Unknown Account',
  dialogTitle = 'Account Compatibility',
  dialogButtonText = 'Okay',
  dialogDescriptionMain = 'Flow Wallet manages your EVM and your Cadence accounts on Flow. EVM accounts are compatible with EVM apps, and Cadence accounts are compatible with Cadence apps.',
  dialogDescriptionSecondary = 'If an application is on EVM or Cadence, only compatible accounts will be available to connect.',
}) => {
  // Internal state for compatibility dialog
  const [isCompatibilityDialogVisible, setIsCompatibilityDialogVisible] = useState(false);

  // Theme-aware background color (use prop if provided, otherwise use theme-based default)
  const dynamicBackgroundColor = backgroundColor || '$bg1';

  // Handle learn more press - show internal dialog
  const handleLearnMorePress = () => {
    setIsCompatibilityDialogVisible(true);
  };

  const handleDialogClose = () => {
    setIsCompatibilityDialogVisible(false);
  };
  return (
    <YStack
      bg={dynamicBackgroundColor as any}
      rounded={borderRadius as any}
      gap={12}
      pt={16}
      t={-25}
      px={16}
      pb={24}
      width="100%"
    >
      {/* Section Header */}
      <Text fontSize="$3" fontWeight="400" lineHeight={16}>
        {title}
      </Text>

      {/* Incompatible Account Header */}
      {isAccountIncompatible && (
        <XStack justify="space-between" items="flex-end">
          <Text fontSize="$3" fontWeight="400" lineHeight={16}>
            {incompatibleAccountText}
          </Text>
          <Text
            fontSize="$3"
            fontWeight="400"
            color="$primary"
            lineHeight={16}
            onPress={handleLearnMorePress}
            cursor="pointer"
            pressStyle={{ opacity: 0.7 }}
          >
            {learnMoreText}
          </Text>
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
              height="$9"
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
                    ? '$textSecondary'
                    : fromAccount && account.address === fromAccount.address
                      ? '$primary'
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
                  width="$4.5"
                  height="$4.5"
                  rounded={9}
                  bg={account.parentEmoji.color || '$bg2'}
                  borderWidth={2}
                  borderColor="$bg2"
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
          <XStack ml="$3">
            <YStack width={151.34} gap="$0.5">
              {/* Account Name with linked icon and EVM badge */}
              <XStack items="center" gap="$1">
                {isLinked && <Link size={12.8} color="#767676" theme="outline" />}
                <Text fontSize="$3" fontWeight="600" lineHeight={17} numberOfLines={1}>
                  {account.name || unknownAccountText}
                </Text>
                {/* EVM Badge - inline with name */}
                {account.type === 'evm' && (
                  <XStack
                    bg="$accentEVM"
                    rounded="$4"
                    px="$1"
                    items="center"
                    justify="center"
                    height="$4"
                  >
                    <Text
                      fontSize={8}
                      fontWeight="400"
                      color="#FFFFFF"
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
          <XStack justify="flex-end" items="center" gap="$4">
            <XStack
              width="$6"
              height="$6"
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

      {/* Account Compatibility InfoDialog */}
      <InfoDialog
        visible={isCompatibilityDialogVisible}
        title={dialogTitle}
        buttonText={dialogButtonText}
        onButtonClick={handleDialogClose}
        onClose={handleDialogClose}
      >
        <YStack gap="$5" w="100%">
          <Text fontSize="$4" fontWeight="400" color="$text" text="center" lineHeight={20}>
            {dialogDescriptionMain}
          </Text>
          <Text fontSize="$4" fontWeight="400" color="$text" text="center" lineHeight={20}>
            {dialogDescriptionSecondary}
          </Text>
        </YStack>
      </InfoDialog>
    </YStack>
  );
};
