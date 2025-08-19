import { Copy, Link } from '@onflow/frw-icons';
import React from 'react';
import { Card, XStack, YStack, Text } from 'tamagui';

import { AddressText } from './AddressText';
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

  // Actions
  onPress?: () => void;
  onCopy?: () => void;

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
  onPress,
  onCopy,
  pressStyle,
}: RecipientItemProps): React.JSX.Element {
  return (
    <Card
      mb="$0.75"
      bg="transparent"
      borderRadius="$4"
      pressStyle={pressStyle || { opacity: 0.8, scale: 0.98 }}
      disabled={isDisabled}
      onPress={onPress}
      opacity={isDisabled ? 0.5 : 1}
      borderColor={isSelected ? '$primary' : 'transparent'}
      borderWidth={isSelected ? 2 : 0}
    >
      <XStack items="center">
        {/* Avatar/Icon Container with fixed frame matching Figma specs */}
        <XStack width={46} height={36} position="relative">
          {/* Main Avatar Circle - Always show background */}
          <YStack
            position="absolute"
            style={{
              left: 5,
              top: 0,
            }}
            width={avatarSize}
            height={avatarSize}
            rounded={avatarSize / 2}
            bg="$light25"
            items="center"
            justify="center"
          >
            <Text
              fontSize={18}
              color="$light80"
              fontWeight="600"
              lineHeight={18 * 1.2}
              letterSpacing={-0.1}
            >
              {avatar || (type === 'account' ? '🦊' : type.charAt(0).toUpperCase())}
            </Text>
          </YStack>

          {/* Small overlay avatar for parent account */}
          {parentAvatar && (
            <YStack
              position="absolute"
              style={{
                left: -1,
                top: -2,
              }}
              width={18}
              height={18}
              rounded={9}
              bg="$textSecondary"
              borderWidth={2}
              borderColor="$bg"
              items="center"
              justify="center"
              p={1}
            >
              <Text fontSize={10} fontWeight="600">
                {parentAvatar}
              </Text>
            </YStack>
          )}
        </XStack>

        {/* Content */}
        <YStack flex={1} gap={2} width={151.34} ml="$0.75">
          <XStack items="center" gap="$1">
            <XStack items="center" gap={4}>
              {isLinked && <Link size={12.8} color="rgba(255, 255, 255, 0.5)" />}
              <Text
                fontSize={14}
                fontWeight="600"
                color="$white"
                numberOfLines={1}
                lineHeight={16.8}
                letterSpacing={-0.084}
              >
                {name}
              </Text>
            </XStack>
            {isEVM && (
              <XStack bg="#627EEA" rounded="$4" px={4} items="center" justify="center" height={16}>
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
            color="$textMuted"
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
        <XStack gap="$2" items="center">
          {showCopyButton && onCopy && (
            <XStack
              width={24}
              height={24}
              opacity={0.5}
              onPress={(e: React.BaseSyntheticEvent) => {
                e.stopPropagation();
                onCopy();
              }}
              cursor="pointer"
            >
              <Copy size={24} color="#FFFFFF" />
            </XStack>
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
