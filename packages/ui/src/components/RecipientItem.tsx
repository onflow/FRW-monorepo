import { Copy, Edit } from '@onflow/frw-icons';
import React from 'react';
import { Card, XStack, YStack, Avatar, Text } from 'tamagui';

import { AddressText } from './AddressText';
import { Button } from '../foundation/Button';

export interface RecipientItemProps {
  // Core recipient data
  name: string;
  address: string;
  type: 'account' | 'contact' | 'recent' | 'unknown';

  // Display options
  balance?: string;
  isLoading?: boolean;
  showBalance?: boolean;
  showEditButton?: boolean;
  showCopyButton?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;

  // Avatar/Icon
  avatar?: string;
  avatarSize?: number;

  // Actions
  onPress?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;

  // Styling
  backgroundColor?: string;
  pressStyle?: object;
}

export function RecipientItem({
  name,
  address,
  type,
  balance,
  isLoading = false,
  showBalance = false,
  showEditButton = false,
  showCopyButton = false,
  isSelected = false,
  isDisabled = false,
  avatar,
  avatarSize = 36,
  onPress,
  onEdit,
  onCopy,
  backgroundColor,
  pressStyle,
}: RecipientItemProps) {
  const getTypeIcon = () => {
    // For now, we'll use a simple circle as placeholder
    // Can be enhanced later with specific icons for each type
    return (
      <YStack
        width={avatarSize}
        height={avatarSize}
        borderRadius="$10"
        backgroundColor="$orange8"
        items="center"
        justify="center"
      >
        <Text fontSize={18} color="$white1" fontWeight="600">
          {type === 'account' ? '🦊' : type.charAt(0).toUpperCase()}
        </Text>
      </YStack>
    );
  };

  return (
    <Card
      p={0}
      bg="transparent"
      borderRadius="$4"
      pressStyle={pressStyle || { opacity: 0.8, scale: 0.98 }}
      disabled={isDisabled}
      onPress={onPress}
      opacity={isDisabled ? 0.5 : 1}
      borderColor={isSelected ? '$primary' : 'transparent'}
      borderWidth={isSelected ? 2 : 0}
    >
      <XStack items="center" gap={12} p="$3">
        {/* Avatar/Icon Container with fixed frame */}
        <XStack w={46} h={36} items="center" justify="flex-start" position="relative">
          <YStack
            position="absolute"
            left={5}
            top={0}
            w={avatarSize}
            h={avatarSize}
            borderRadius="$10"
            bg="$orange8"
            items="center"
            justify="center"
          >
            {avatar ? (
              <Avatar circular size={avatarSize}>
                <Avatar.Image src={avatar} />
              </Avatar>
            ) : (
              getTypeIcon()
            )}
          </YStack>
        </XStack>

        {/* Content */}
        <YStack flex={1} gap={2} w={151.34}>
          <XStack items="center" gap="$1">
            <Text
              fontSize={14}
              fontWeight="600"
              color="$white1"
              numberOfLines={1}
              lineHeight={20}
              letterSpacing={-0.084}
            >
              {name}
            </Text>
          </XStack>

          <AddressText
            address={address}
            fontSize={12}
            fontWeight="400"
            color="#B3B3B3"
            lineHeight={16.8}
          />

          {showBalance && balance && (
            <Text
              fontSize={12}
              fontWeight="400"
              color="#B3B3B3"
              numberOfLines={1}
              lineHeight={16.8}
            >
              {isLoading ? '...' : balance}
            </Text>
          )}
        </YStack>

        {/* Action Buttons */}
        <XStack gap="$2" items="center">
          {showCopyButton && onCopy && (
            <XStack
              width={24}
              height={24}
              opacity={0.5}
              onPress={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              cursor="pointer"
            >
              <Copy size={24} color="#FFFFFF" />
            </XStack>
          )}

          {showEditButton && onEdit && (
            <Button
              size="small"
              variant="ghost"
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit size={16} />
            </Button>
          )}
        </XStack>
      </XStack>
    </Card>
  );
}

// Type variants for easier usage
export const AccountItem = (props: Omit<RecipientItemProps, 'type'>) => (
  <RecipientItem {...props} type="account" showBalance />
);

export const ContactItem = (props: Omit<RecipientItemProps, 'type'>) => (
  <RecipientItem {...props} type="contact" showCopyButton />
);

export const RecentItem = (props: Omit<RecipientItemProps, 'type'>) => (
  <RecipientItem {...props} type="recent" />
);

export const UnknownAddressItem = (props: Omit<RecipientItemProps, 'type'>) => (
  <RecipientItem {...props} type="unknown" showCopyButton />
);
