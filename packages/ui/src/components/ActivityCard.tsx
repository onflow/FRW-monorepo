import { ArrowDownLeft, ArrowUpRight } from '@onflow/frw-icons';
import type { ActivityItem } from '@onflow/frw-types';
import React from 'react';
import { Stack, Text, XStack, YStack, useTheme } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import type { ActivityCardProps } from '../types';
import { ChainBadge } from './ChainBadge';

/**
 * Truncates an address for display
 */
function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address || address.length <= startLength + endLength + 3) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Status type for color mapping
 */
type StatusType = 'error' | 'pending' | 'success';

/**
 * Gets the status type for an activity item
 */
function getStatusType(item: ActivityItem): StatusType {
  if (item.error || item.status === 'failed' || item.status === 'expired') {
    return 'error';
  }
  if (item.status === 'pending') {
    return 'pending';
  }
  return 'success';
}

/**
 * Maps status type to theme token for text color
 */
function getStatusColor(statusType: StatusType): string {
  switch (statusType) {
    case 'error':
      return '$error';
    case 'pending':
      return '$text2';
    case 'success':
      return '$success';
  }
}

/**
 * Gets the status display text
 */
function getStatusText(item: ActivityItem): string {
  if (item.error) {
    return 'Failed';
  }
  switch (item.status) {
    case 'pending':
      return 'Pending';
    case 'sealed':
    case 'finalized':
    case 'executed':
      return 'Success';
    case 'expired':
      return 'Expired';
    case 'failed':
      return 'Failed';
    default:
      return item.status;
  }
}

/**
 * ActivityCard displays a single transaction/activity item
 * Follows the Figma design with icon, title, address, amount, and status
 */
export function ActivityCard({ item, onPress }: ActivityCardProps): React.ReactElement {
  const theme = useTheme();
  const { title, token, image, amount, sender, receiver, transferType, type } = item;

  // Get status type for color theming
  const statusType = getStatusType(item);
  const isPending = statusType === 'pending';

  // Get resolved colors for icon components (they need actual color values)
  const directionIconColor = isPending ? theme.text2?.val : theme.success?.val;

  // Check if this is an EVM wallet transaction (show chain badge)
  const isEvm = item.walletType === 'evm';

  // Check if this is an app interaction (no transfer direction shown)
  const isInteraction = type === 'interaction';

  // Determine the address to show based on transfer direction
  const addressLabel = transferType === 'sent' ? 'To' : 'From';
  const addressValue = transferType === 'sent' ? receiver : sender;

  // Format amount with sign
  const displayAmount = amount ? `${transferType === 'sent' ? '-' : '+'}${amount} ${token}` : '';

  // Subtitle for interaction type
  const subtitle = isInteraction ? 'Flow' : `${addressLabel}: ${truncateAddress(addressValue)}`;

  return (
    <Stack
      {...(onPress && {
        pressStyle: { opacity: 0.7 },
        hoverStyle: { bg: '$bg1' },
        onPress: onPress,
        cursor: 'pointer',
      })}
      items="center"
      justify="center"
      width="100%"
      py="$3"
      px="$4"
    >
      <XStack items="center" gap="$3" width="100%">
        {/* Icon with optional EVM chain badge */}
        <Stack position="relative">
          <Avatar src={image} alt={token} fallback={token?.[0] || title?.[0] || '?'} size={48} />
          {isEvm && <ChainBadge chain="evm" />}
        </Stack>

        {/* Content */}
        <YStack flex={1} gap="$1">
          {/* Top row: Title + Amount */}
          <XStack justify="space-between" items="center" gap="$2">
            <XStack items="center" gap="$1.5" flex={1} shrink={1}>
              {/* Direction icon inline with title (not for interactions or self transfers) */}
              {!isInteraction && transferType !== 'self' && (
                <YStack
                  width={18}
                  height={18}
                  rounded={9}
                  bg={isPending ? '$subtleBg10' : '$success10'}
                  items="center"
                  justify="center"
                >
                  {transferType === 'sent' ? (
                    <ArrowUpRight size={12} color={directionIconColor} theme="outline" />
                  ) : (
                    <ArrowDownLeft size={12} color={directionIconColor} theme="outline" />
                  )}
                </YStack>
              )}
              <Text
                fontWeight="600"
                fontSize={15}
                color="$text1"
                numberOfLines={1}
                lineHeight="$1"
                shrink={1}
              >
                {title || (transferType === 'sent' ? `Sent ${token}` : `Received ${token}`)}
              </Text>
            </XStack>

            {displayAmount && (
              <Text
                fontSize={14}
                fontWeight="500"
                color="$text1"
                numberOfLines={1}
                text="right"
                lineHeight="$1"
              >
                {displayAmount}
              </Text>
            )}
          </XStack>

          {/* Bottom row: Address/Subtitle + Status */}
          <XStack items="center" gap="$1" justify="space-between">
            <Text color="$text2" fontSize={13} fontWeight="400" numberOfLines={1} lineHeight="$1">
              {subtitle}
            </Text>

            <Text fontSize={13} fontWeight="500" color={getStatusColor(statusType) as any}>
              {getStatusText(item)}
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </Stack>
  );
}
