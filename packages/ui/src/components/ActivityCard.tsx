import type { ActivityItem } from '@onflow/frw-types';
import React from 'react';
import { Stack, Text, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import type { ActivityCardProps } from '../types';
import { Badge } from './Badge';

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
 * Gets the status badge variant based on activity status
 */
function getStatusBadgeVariant(item: ActivityItem): 'success' | 'warning' | 'error' | 'default' {
  if (item.error || item.status === 'failed' || item.status === 'expired') {
    return 'error';
  }
  if (item.status === 'pending') {
    return 'warning';
  }
  if (item.status === 'sealed' || item.status === 'finalized' || item.status === 'executed') {
    return 'success';
  }
  return 'default';
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
 * Direction indicator badge component
 */
function DirectionBadge({ direction }: { direction: 'sent' | 'received' | 'self' }) {
  const isSent = direction === 'sent';
  const bgColor = '#41CC5D'; // Green for both sent and received

  return (
    <Stack
      pos="absolute"
      bottom={-2}
      right={-2}
      w={18}
      h={18}
      rounded={9}
      bg={bgColor}
      items="center"
      justify="center"
      borderWidth={2}
      borderColor="$bg"
    >
      <Text fontSize={10} color="white" fontWeight="700">
        {isSent ? '↗' : '↙'}
      </Text>
    </Stack>
  );
}

/**
 * ActivityCard displays a single transaction/activity item
 * Follows the design pattern with icon, title, address, amount, and status
 */
export function ActivityCard({ item, onPress }: ActivityCardProps): React.ReactElement {
  const { title, token, image, amount, sender, receiver, transferType, status } = item;

  // Determine the address to show based on transfer direction
  const addressLabel = transferType === 'sent' ? 'To' : 'From';
  const addressValue = transferType === 'sent' ? receiver : sender;

  // Format amount with sign
  const displayAmount = amount ? `${transferType === 'sent' ? '-' : '+'}${amount} ${token}` : '';

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
        {/* Icon with direction badge */}
        <Stack pos="relative">
          <Avatar src={image} alt={token} fallback={token?.[0] || title?.[0] || '?'} size={48} />
          {transferType !== 'self' && <DirectionBadge direction={transferType} />}
        </Stack>

        {/* Content */}
        <YStack flex={1} gap="$1">
          {/* Top row: Title + Amount */}
          <XStack justify="space-between" items="center" gap="$2">
            <XStack items="center" gap="$1.5" flex={1} shrink={1}>
              {/* Direction icon inline with title */}
              {transferType !== 'self' && (
                <Stack
                  w={16}
                  h={16}
                  rounded={8}
                  bg={status === 'pending' ? '$warning10' : '#41CC5D20'}
                  items="center"
                  justify="center"
                >
                  <Text
                    fontSize={10}
                    color={status === 'pending' ? '$warning' : '#41CC5D'}
                    fontWeight="700"
                  >
                    {transferType === 'sent' ? '↗' : '↙'}
                  </Text>
                </Stack>
              )}
              <Text
                fontWeight="600"
                fontSize={14}
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

          {/* Bottom row: Address + Status */}
          <XStack items="center" gap="$1" justify="space-between">
            <Text color="$text2" fontSize={13} fontWeight="400" numberOfLines={1} lineHeight="$1">
              {addressLabel}: {truncateAddress(addressValue)}
            </Text>

            <Badge variant={getStatusBadgeVariant(item)} size="small">
              {getStatusText(item)}
            </Badge>
          </XStack>
        </YStack>
      </XStack>
    </Stack>
  );
}
