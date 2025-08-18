import { Copy, Link } from '@onflow/frw-icons';
import { Card, XStack, YStack, Avatar, Text } from 'tamagui';

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
  onPress,
  onCopy,
  pressStyle,
}: RecipientItemProps) {
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
        {/* Avatar/Icon Container with fixed frame matching Figma specs */}
        <XStack width={46} height={36} position="relative">
          {avatar ? (
            <Avatar
              src={avatar}
              size={avatarSize}
              fallback={type === 'account' ? '🦊' : type.charAt(0).toUpperCase()}
              style={{
                position: 'absolute',
                left: 5,
                top: 0,
              }}
            />
          ) : (
            <YStack
              position="absolute"
              left={5}
              top={0}
              width={avatarSize}
              height={avatarSize}
              borderRadius={avatarSize / 2}
              backgroundColor="rgba(255, 255, 255, 0.25)"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize={18}
                color="rgba(255, 255, 255, 0.8)"
                fontWeight="600"
                lineHeight={18 * 1.2}
                letterSpacing={-0.1}
              >
                {type === 'account' ? '🦊' : type.charAt(0).toUpperCase()}
              </Text>
            </YStack>
          )}
        </XStack>

        {/* Content */}
        <YStack flex={1} gap={2} width={151.34}>
          <XStack items="center" gap="$1">
            <XStack items="center" gap={4}>
              {isLinked && <Link size={12.8} color="rgba(255, 255, 255, 0.5)" />}
              <Text
                fontSize={14}
                fontWeight="600"
                color="#FFFFFF"
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
            address={address}
            fontSize={12}
            fontWeight="400"
            color="#B3B3B3"
            lineHeight={16.8}
          />

          {showBalance &&
            (isLoading ? (
              <Skeleton width={80} height={16} />
            ) : balance ? (
              <Text
                fontSize={12}
                fontWeight="400"
                color="#B3B3B3"
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
              onPress={(e: any) => {
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
