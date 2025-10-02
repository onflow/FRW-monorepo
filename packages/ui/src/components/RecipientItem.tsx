import { Copy, Link, UserRoundPlus } from '@onflow/frw-icons';
import React from 'react';
import { Button, Card, XStack, YStack, Text } from 'tamagui';

import { AddressText } from './AddressText';
import { Avatar } from '../foundation/Avatar';
import { Skeleton } from '../foundation/Skeleton';

export interface RecipientItemProps {
  // Core recipient data
  name: string;
  address: string;
  type: 'account' | 'contact' | 'recent' | 'unknown';

  // Display options
  balance?: string;
  isLoading?: boolean;
  showBalance?: boolean;
  showCopyButton?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isLinked?: boolean;
  isEVM?: boolean;

  // Avatar/Icon
  avatar?: string;
  avatarSize?: number;
  parentAvatar?: string; // Small overlay avatar for linked accounts
  emojiInfo: any;
  parentEmojiInfo: any;
  // Actions
  onPress?: () => void;
  onCopy?: () => void;
  onAddToAddressBook?: () => void;
  copiedFeedback?: string;

  // Styling
  pressStyle?: object;
}

export function RecipientItem({
  name,
  address,
  type,
  balance,
  isLoading = false,
  showBalance = false,
  showCopyButton = false,
  isSelected = false,
  isDisabled = false,
  isLinked = false,
  isEVM = false,
  avatar,
  avatarSize = 36,
  parentAvatar,
  emojiInfo,
  parentEmojiInfo,
  onPress,
  onCopy,
  onAddToAddressBook,
  copiedFeedback,
  pressStyle,
}: RecipientItemProps): React.JSX.Element {
  return (
    <Card
      bg="transparent"
      borderRadius={16}
      pressStyle={pressStyle || { opacity: 0.8, scale: 0.98 }}
      hoverStyle={{ width: '100%', opacity: 0.8 }}
      disabled={isDisabled}
      onPress={onPress}
      opacity={isDisabled ? 0.5 : 1}
      borderColor="transparent"
      borderWidth={0}
      p={0}
      minHeight={56}
      cursor="pointer"
    >
      <XStack items="center" justify="space-between" flex={1} p={0} height={56}>
        {/* Avatar/Icon Container with fixed frame matching Figma specs */}
        <XStack width={46} height={36} position="relative">
          {/* Main Avatar using proper Avatar component */}
          <YStack
            position="absolute"
            style={{
              left: 5,
              top: 0,
            }}
          >
            <Avatar
              src={avatar?.includes('https://') ? avatar : undefined}
              fallback={
                avatar ||
                emojiInfo?.emoji ||
                name?.charAt(0)?.toUpperCase() ||
                type.charAt(0).toUpperCase()
              }
              bgColor={emojiInfo?.color || '$bg2'}
              textColor={emojiInfo?.color ? undefined : '$text'}
              size={avatarSize}
            />
          </YStack>

          {/* Small overlay avatar for parent account */}
          {(isLinked || isEVM) && (parentAvatar || parentEmojiInfo) && (
            <YStack
              position="absolute"
              style={{
                left: -1,
                top: -2,
              }}
              width={18}
              height={18}
              rounded={9}
              bg={parentEmojiInfo?.color || '#D9D9D9'}
              borderWidth={2}
              borderColor="$bg2"
              items="center"
              justify="center"
              overflow="hidden"
            >
              <Text fontSize={8} fontWeight="600" lineHeight={12}>
                {parentEmojiInfo?.emoji || parentAvatar}
              </Text>
            </YStack>
          )}
        </XStack>

        {/* Content */}
        <YStack flex={1} gap={2} width={151.34} ml={16}>
          <XStack items="center" gap={4}>
            {(isLinked || isEVM) && <Link size={12.8} color="#767676" theme="outline" />}
            <Text
              fontSize={14}
              fontWeight="600"
              color="$text"
              numberOfLines={1}
              lineHeight={16.8}
              letterSpacing={-0.084}
            >
              {name || emojiInfo?.name}
            </Text>
            {isEVM && (
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
            address={address}
            fontSize={12}
            fontWeight="400"
            color="$textSecondary"
            lineHeight={16.8}
          />

          {showBalance &&
            (isLoading ? (
              <Skeleton width={80} height={16} />
            ) : balance ? (
              <Text
                fontSize={12}
                fontWeight="400"
                color="$textMuted"
                numberOfLines={1}
                lineHeight={16.8}
              >
                {balance}
              </Text>
            ) : null)}
        </YStack>

        {/* Action Buttons */}
        <XStack gap="$2" items="center" position="relative">
          {onAddToAddressBook && (
            <Card
              width="$6"
              height="$6"
              onPress={(e: React.BaseSyntheticEvent) => {
                e.stopPropagation();
                onAddToAddressBook();
              }}
              cursor="pointer"
              chromeless
              p={0}
              pressStyle={{ opacity: 0.3 }}
              items="center"
              justify="center"
            >
              <UserRoundPlus size={24} color="#767676" theme="outline" />
            </Card>
          )}
          {showCopyButton && onCopy && (
            <Button
              width="$6"
              height="$6"
              opacity={copiedFeedback ? 1 : 0.5}
              onPress={(e: React.BaseSyntheticEvent) => {
                e.stopPropagation();
                onCopy();
              }}
              bg="transparent"
              borderWidth={0}
              p={0}
              pressStyle={{ opacity: 0.3 }}
              items="center"
              justify="center"
              icon={<Copy size={24} color={copiedFeedback ? '#00EF8B' : '#767676'} />}
            ></Button>
          )}
          {copiedFeedback && (
            <YStack
              position="absolute"
              top={-30}
              right={0}
              bg="$primary"
              rounded={8}
              px={8}
              py={4}
              animation="quick"
              enterStyle={{ opacity: 0, scale: 0.9, y: 5 }}
              exitStyle={{ opacity: 0, scale: 0.9, y: 5 }}
            >
              <Text fontSize={12} fontWeight="600" color="$black">
                {copiedFeedback}
              </Text>
            </YStack>
          )}
        </XStack>
      </XStack>
    </Card>
  );
}

// Type variants for easier usage
export const AccountItem = (props: Omit<RecipientItemProps, 'type'>): React.JSX.Element => (
  <RecipientItem {...props} type="account" showBalance />
);

export const ContactItem = (props: Omit<RecipientItemProps, 'type'>): React.JSX.Element => (
  <RecipientItem {...props} type="contact" showCopyButton />
);

export const RecentItem = (props: Omit<RecipientItemProps, 'type'>): React.JSX.Element => (
  <RecipientItem {...props} type="recent" />
);

export const UnknownAddressItem = (props: Omit<RecipientItemProps, 'type'>): React.JSX.Element => (
  <RecipientItem {...props} type="unknown" showCopyButton />
);
