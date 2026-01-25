import { ArrowDownLeft, ArrowRight, ArrowUpRight } from '@onflow/frw-icons';
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
 * Truncates a token name for display (max 12 chars)
 */
function truncateToken(token: string, maxLength = 12): string {
  if (!token || token.length <= maxLength) {
    return token;
  }
  return `${token.slice(0, maxLength)}...`;
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
 * Uses $primary for success to match Flow brand green
 */
function getStatusColor(statusType: StatusType): string {
  switch (statusType) {
    case 'error':
      return '$error';
    case 'pending':
      return '$text2';
    case 'success':
      return '$primary';
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
 * Direction indicator - inline with title text
 * Uses $primary for success to match Flow brand green
 */
function DirectionBadge({
  transferType,
  statusType,
}: {
  transferType: 'sent' | 'received' | 'self';
  statusType: StatusType;
}): React.ReactElement {
  const theme = useTheme();

  // Get background color based on status - use $primary for success
  const bgColor =
    statusType === 'success' ? '$primary' : statusType === 'error' ? '$error' : '$text2';
  // Use dark gray for the arrow icon (from theme)
  const iconColor = theme.black?.val;

  return (
    <YStack width={18} height={18} rounded={9} bg={bgColor} items="center" justify="center">
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
 * Designed to be used within an ActivityCardGroup - no individual card background
 * The group container provides the shared background and separators
 */
export function ActivityCard({ item, onPress }: ActivityCardProps): React.ReactElement {
  const { title, token, image, amount, sender, receiver, transferType, type } = item;
  const theme = useTheme();

  // Get status type for color theming
  const statusType = getStatusType(item);

  // Check if this is an EVM wallet transaction (show chain badge)
  const isEvm = item.walletType === 'evm';

  // Check if this is an app interaction (no transfer direction shown)
  const isInteraction = type === 'interaction';

  // Determine the address to show based on transfer direction
  // For 'sent' transfers, show the receiver (destination)
  // For 'received' transfers, show the sender (source)
  const addressLabel = transferType === 'sent' ? 'To' : 'From';
  const addressValue = transferType === 'sent' ? receiver : sender;

  // Format amount with sign (token name is already shown in title, so no need to repeat)
  const displayAmount = amount ? `${transferType === 'sent' ? '-' : '+'}${amount}` : '';

  // Check if this is a self-transfer with both profile avatars
  const hasBothProfiles = item.senderProfile && item.receiverProfile;

  // Subtitle text for non-self transfers
  // Don't show subtitle for errored transactions
  const getSubtitleText = (): string => {
    if (item.error) return '';
    if (isInteraction) return 'Flow';
    // If address is empty/missing, show the token name instead
    if (!addressValue) return truncateToken(token) || 'Flow';
    return `${addressLabel}: ${truncateAddress(addressValue)}`;
  };

  return (
    <XStack
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.7 } : undefined}
      cursor={onPress ? 'pointer' : undefined}
      items="center"
      gap="$3"
      width="100%"
      py="$3"
    >
      {/* Icon with optional chain badge */}
      <Stack position="relative">
        <Avatar src={image} alt={token} fallback={token?.[0] || title?.[0] || '?'} size={44} />
        {isEvm && <ChainBadge chain="evm" size={18} />}
      </Stack>

      {/* Content */}
      <YStack flex={1} gap="$1">
        {/* Top row: Direction badge + Title + Amount */}
        <XStack justify="space-between" items="center" gap="$2">
          <XStack items="center" gap="$2" flex={1} shrink={1}>
            {/* Direction indicator inline with title */}
            {/* Show for non-interactions, or errored transactions (API may report errored sends as interactions) */}
            {(!isInteraction || item.error) && transferType !== 'self' && (
              <DirectionBadge transferType={transferType} statusType={statusType} />
            )}
            <Text
              fontWeight="600"
              fontSize="$4"
              color="$text1"
              numberOfLines={1}
              lineHeight={22}
              flex={1}
              shrink={1}
            >
              {isInteraction
                ? title || 'Flow'
                : transferType === 'sent'
                  ? `Sent ${truncateToken(token)}`
                  : `Received ${truncateToken(token)}`}
            </Text>
          </XStack>

          {displayAmount && (
            <Stack shrink={1} maxW="50%">
              <Text fontSize="$4" fontWeight="500" color="$text1" numberOfLines={1} lineHeight={22}>
                {displayAmount}
              </Text>
            </Stack>
          )}
        </XStack>

        {/* Bottom row: Address/Subtitle + Status */}
        <XStack items="center" gap="$1" justify="space-between">
          {/* For self-transfers, show sender → receiver emoji avatars */}
          {hasBothProfiles ? (
            <XStack items="center" gap="$1.5">
              <Avatar
                fallback={item.senderProfile!.emoji}
                bgColor={item.senderProfile!.color}
                size={20}
              />
              <ArrowRight size={12} color={theme.text2?.val} theme="outline" />
              <Avatar
                fallback={item.receiverProfile!.emoji}
                bgColor={item.receiverProfile!.color}
                size={20}
              />
            </XStack>
          ) : (
            <Text
              color="$text2"
              fontSize={14}
              fontWeight="400"
              numberOfLines={1}
              lineHeight={20}
              flex={1}
              shrink={1}
            >
              {getSubtitleText()}
            </Text>
          )}

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
  );
}
