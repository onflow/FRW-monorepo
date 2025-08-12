import { ChevronRight, Copy, Edit } from '@onflow/frw-icons';
import React from 'react';
import { Card, XStack, YStack, Avatar, Text, Button } from 'tamagui';

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
  avatarSize = 40,
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
        width={avatarSize * 0.6}
        height={avatarSize * 0.6}
        borderRadius="$10"
        backgroundColor="$bg3"
        items="center"
        justify="center"
      >
        <Text fontSize="$2" color="$textSecondary" fontWeight="600">
          {type.charAt(0).toUpperCase()}
        </Text>
      </YStack>
    );
  };

  const truncateAddress = (addr: string, startLength = 6, endLength = 4) => {
    if (addr.length <= startLength + endLength + 3) return addr;
    return `${addr.slice(0, startLength)}...${addr.slice(-endLength)}`;
  };

  return (
    <Card
      p="$3"
      bg={backgroundColor || '$bg2'}
      borderRadius="$4"
      pressStyle={pressStyle || { opacity: 0.8, scale: 0.98 }}
      disabled={isDisabled}
      onPress={onPress}
      opacity={isDisabled ? 0.5 : 1}
      borderColor={isSelected ? '$primary' : 'transparent'}
      borderWidth={isSelected ? 2 : 0}
    >
      <XStack items="center" gap="$3">
        {/* Avatar/Icon */}
        <Avatar circular size={avatarSize}>
          {avatar ? (
            <Avatar.Image src={avatar} />
          ) : (
            <Avatar.Fallback bg="$bg3" items="center" justify="center">
              {getTypeIcon()}
            </Avatar.Fallback>
          )}
        </Avatar>

        {/* Content */}
        <YStack flex={1} gap="$1">
          <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>
            {name}
          </Text>

          <Text fontSize="$3" color="$textSecondary" numberOfLines={1} fontFamily="$mono">
            {truncateAddress(address)}
          </Text>

          {showBalance && balance && (
            <Text fontSize="$3" color="$textSecondary" numberOfLines={1}>
              {isLoading ? '...' : balance}
            </Text>
          )}
        </YStack>

        {/* Action Buttons */}
        <XStack gap="$2" items="center">
          {showCopyButton && onCopy && (
            <Button
              size="$2"
              variant="ghost"
              icon={Copy}
              onPress={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              circular
            />
          )}

          {showEditButton && onEdit && (
            <Button
              size="$2"
              variant="ghost"
              icon={Edit}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              circular
            />
          )}

          {onPress && <ChevronRight size={16} color="gray" />}
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
  <RecipientItem {...props} type="contact" showEditButton />
);

export const RecentItem = (props: Omit<RecipientItemProps, 'type'>) => (
  <RecipientItem {...props} type="recent" />
);

export const UnknownAddressItem = (props: Omit<RecipientItemProps, 'type'>) => (
  <RecipientItem {...props} type="unknown" showCopyButton />
);
