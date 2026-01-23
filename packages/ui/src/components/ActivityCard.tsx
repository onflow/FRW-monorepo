import { ArrowDownLeft, ArrowUpRight, CheckCircleFill } from '@onflow/frw-icons';
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
 * Status badge component - overlays on the token icon
 */
function StatusBadge({
  statusType,
  transferType,
}: {
  statusType: StatusType;
  transferType: 'sent' | 'received' | 'self';
}): React.ReactElement {
  const theme = useTheme();

  // Get colors based on status
  const bgColor =
    statusType === 'success' ? '$success' : statusType === 'error' ? '$error' : '$text2';
  const iconColor = theme.white?.val || '#FFFFFF';

  // For success, show checkmark with small direction arrow
  if (statusType === 'success') {
    return (
      <YStack
        position="absolute"
        r={-2}
        b={-2}
        width={20}
        height={20}
        items="center"
        justify="center"
      >
        <CheckCircleFill size={20} color={theme.success?.val} theme="filled" />
        {/* Small direction arrow overlay */}
        <YStack
          position="absolute"
          r={-4}
          t={-4}
          width={14}
          height={14}
          rounded={7}
          bg="$bg"
          items="center"
          justify="center"
        >
          <YStack width={12} height={12} rounded={6} bg={bgColor} items="center" justify="center">
            {transferType === 'sent' ? (
              <ArrowUpRight size={8} color={iconColor} theme="outline" />
            ) : (
              <ArrowDownLeft size={8} color={iconColor} theme="outline" />
            )}
          </YStack>
        </YStack>
      </YStack>
    );
  }

  // For pending/error, just show direction arrow in appropriate color
  return (
    <YStack
      position="absolute"
      r={-2}
      b={-2}
      width={20}
      height={20}
      rounded={10}
      bg={bgColor}
      items="center"
      justify="center"
      borderWidth={2}
      borderColor="$bg"
    >
      {transferType === 'sent' ? (
        <ArrowUpRight size={12} color={iconColor} theme="outline" />
      ) : (
        <ArrowDownLeft size={12} color={iconColor} theme="outline" />
      )}
    </YStack>
  );
}

/**
 * ActivityCard displays a single transaction/activity item
 * Follows the Figma design with card background, icon with status badge, title, address, amount, and status
 */
export function ActivityCard({ item, onPress }: ActivityCardProps): React.ReactElement {
  const { title, token, image, amount, sender, receiver, transferType, type } = item;

  // Get status type for color theming
  const statusType = getStatusType(item);

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
    <Stack px="$4" py="$1.5">
      <XStack
        {...(onPress && {
          pressStyle: { opacity: 0.7 },
          hoverStyle: { bg: '$bg2' },
          onPress: onPress,
          cursor: 'pointer',
        })}
        items="center"
        gap="$3"
        width="100%"
        bg="$bg1"
        rounded="$4"
        p="$3"
      >
        {/* Icon with status badge and optional chain badge */}
        <Stack position="relative">
          <Avatar src={image} alt={token} fallback={token?.[0] || title?.[0] || '?'} size={44} />
          {isEvm && <ChainBadge chain="evm" size={18} />}
          {/* Status badge - only show for transfers, not interactions */}
          {!isInteraction && transferType !== 'self' && (
            <StatusBadge statusType={statusType} transferType={transferType} />
          )}
        </Stack>

        {/* Content */}
        <YStack flex={1} gap="$1">
          {/* Top row: Title + Amount */}
          <XStack justify="space-between" items="center" gap="$2">
            <Text
              fontWeight="600"
              fontSize={16}
              color="$text1"
              numberOfLines={1}
              lineHeight={22}
              flex={1}
              shrink={1}
            >
              {title || (transferType === 'sent' ? `Sent ${token}` : `Received ${token}`)}
            </Text>

            {displayAmount && (
              <Text fontSize={16} fontWeight="500" color="$text1" numberOfLines={1} lineHeight={22}>
                {displayAmount}
              </Text>
            )}
          </XStack>

          {/* Bottom row: Address/Subtitle + Status */}
          <XStack items="center" gap="$1" justify="space-between">
            <Text color="$text2" fontSize={14} fontWeight="400" numberOfLines={1} lineHeight={20}>
              {subtitle}
            </Text>

            <Text
              fontSize={14}
              fontWeight="500"
              color={getStatusColor(statusType) as any}
              lineHeight={20}
            >
              {getStatusText(item)}
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </Stack>
  );
}
