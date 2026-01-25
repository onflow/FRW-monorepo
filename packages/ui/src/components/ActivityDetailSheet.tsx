import { Close, FlowLogo } from '@onflow/frw-icons';
import type { ActivityItem } from '@onflow/frw-types';
import React, { useMemo } from 'react';
import { Sheet, Stack, View, XStack, YStack, useTheme } from 'tamagui';

import { ChainBadge } from './ChainBadge';
import { Avatar } from '../foundation/Avatar';
import { Separator } from '../foundation/Separator';
import { Text } from '../foundation/Text';

export interface ActivityDetailSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** The activity item to display */
  item: ActivityItem | null;
  /** Callback when the sheet is closed */
  onClose: () => void;
  /** Callback when "View on block explorer" is pressed */
  onViewExplorer?: (item: ActivityItem) => void;
  /** Whether running in extension mode */
  isExtension?: boolean;
  // Translation props
  sentTitle?: string;
  receivedTitle?: string;
  interactionTitle?: string;
  youSentLabel?: string;
  fromLabel?: string;
  toLabel?: string;
  dateLabel?: string;
  statusLabel?: string;
  networkLabel?: string;
  transactionFeeLabel?: string;
  networkFeeLabel?: string;
  coveredByFlowWallet?: string;
  viewOnExplorerText?: string;
  statusPending?: string;
  statusSuccess?: string;
  statusFailed?: string;
  statusExpired?: string;
  networkFlow?: string;
  networkEvm?: string;
}

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
 * Formats a timestamp to a readable date string
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Detail row component for displaying label-value pairs
 */
function DetailRow({
  label,
  value,
  valueColor = '$text2',
  secondaryText,
  showStrikethrough = false,
  originalValue,
  showFlowLogo = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  secondaryText?: string;
  showStrikethrough?: boolean;
  originalValue?: string;
  showFlowLogo?: boolean;
}): React.ReactElement {
  return (
    <YStack>
      <XStack justify="space-between" items="center" py="$3">
        <Text fontSize={14} fontWeight="400" color="$text2" lineHeight={20}>
          {label}
        </Text>

        <XStack items="center" gap="$2">
          {showStrikethrough && originalValue && (
            <Text
              fontSize={14}
              fontWeight="400"
              color="$text2"
              lineHeight={20}
              textDecorationLine="line-through"
              opacity={0.6}
            >
              {originalValue}
            </Text>
          )}
          <Text fontSize={14} fontWeight="400" color={valueColor as any} lineHeight={20}>
            {value}
          </Text>
          {showFlowLogo && <FlowLogo size={16} theme="multicolor" />}
        </XStack>
      </XStack>

      {secondaryText && (
        <XStack justify="flex-end" mt={-8} mb="$1">
          <Text fontSize={12} fontWeight="400" color="$text2" opacity={0.6} lineHeight={16}>
            {secondaryText}
          </Text>
        </XStack>
      )}
    </YStack>
  );
}

/**
 * ActivityDetailSheet - A modal sheet for displaying activity/transaction details
 *
 * Shows transaction information including amount, status, addresses, fees, etc.
 * Opens as an overlay modal from the bottom of the screen.
 */
export function ActivityDetailSheet({
  visible,
  item,
  onClose,
  onViewExplorer,
  isExtension = false,
  sentTitle = 'Sent',
  receivedTitle = 'Received',
  interactionTitle = 'App Interaction',
  youSentLabel = 'You Sent',
  fromLabel = 'From',
  toLabel = 'To',
  dateLabel = 'Date',
  statusLabel = 'Status',
  networkLabel = 'Network',
  transactionFeeLabel = 'Transaction Fee',
  networkFeeLabel = 'Network Fee',
  coveredByFlowWallet = 'Covered by Flow Wallet',
  viewOnExplorerText = 'View on block explorer',
  statusPending = 'Pending',
  statusSuccess = 'Success',
  statusFailed = 'Failed',
  statusExpired = 'Expired',
  networkFlow = 'Flow',
  networkEvm = 'Flow EVM',
}: ActivityDetailSheetProps): React.ReactElement | null {
  const theme = useTheme();

  // Derive display values from item
  const { title, statusColor, statusText, amountDisplay, amountColor, isInteraction, isEvm } =
    useMemo(() => {
      if (!item) {
        return {
          title: '',
          statusColor: '$text2',
          statusText: '',
          amountDisplay: '',
          amountColor: '$text1',
          isInteraction: false,
          isEvm: false,
        };
      }

      const isInteractionType = item.type === 'interaction';
      const isEvmWallet = item.walletType === 'evm';

      // Determine title based on type
      let headerTitle = '';
      if (isInteractionType) {
        headerTitle = interactionTitle;
      } else if (item.transferType === 'sent') {
        headerTitle = sentTitle;
      } else {
        headerTitle = receivedTitle;
      }

      // Status color and text
      let sColor = '$text2';
      let sText = statusPending;
      if (item.error || item.status === 'failed') {
        sColor = '$error';
        sText = statusFailed;
      } else if (item.status === 'expired') {
        sColor = '$error';
        sText = statusExpired;
      } else if (item.status === 'pending') {
        sColor = '$text2';
        sText = statusPending;
      } else {
        sColor = '$primary';
        sText = statusSuccess;
      }

      // Amount display and color
      let aDisplay = '';
      let aColor = '$text1';
      if (item.amount && item.token) {
        if (item.transferType === 'sent') {
          aDisplay = `-${item.amount} ${item.token}`;
          aColor = '$error';
        } else {
          aDisplay = `+${item.amount} ${item.token}`;
          aColor = '$primary';
        }
      }

      return {
        title: headerTitle,
        statusColor: sColor,
        statusText: sText,
        amountDisplay: aDisplay,
        amountColor: aColor,
        isInteraction: isInteractionType,
        isEvm: isEvmWallet,
      };
    }, [
      item,
      sentTitle,
      receivedTitle,
      interactionTitle,
      statusPending,
      statusSuccess,
      statusFailed,
      statusExpired,
    ]);

  if (!item) return null;

  return (
    <Sheet
      modal
      open={visible}
      onOpenChange={(open) => !open && onClose()}
      snapPointsMode={!isExtension ? 'fit' : undefined}
      dismissOnSnapToBottom
      snapPoints={isExtension ? [85] : undefined}
      animation={isExtension ? 'quick' : 'lazy'}
    >
      <Sheet.Overlay
        animation={isExtension ? 'quick' : 'lazy'}
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        bg="rgba(0,0,0,0.5)"
      />
      {!isExtension && <Sheet.Handle bg="$gray8" />}
      <Sheet.Frame
        bg="$bgDrawer"
        borderTopLeftRadius={isExtension ? 0 : '$6'}
        borderTopRightRadius={isExtension ? 0 : '$6'}
        animation={isExtension ? 'quick' : 'lazy'}
        enterStyle={{ y: 1000 }}
        exitStyle={{ y: 1000 }}
      >
        <YStack p="$4" gap="$4">
          {/* Header */}
          <XStack items="center" width="100%">
            <View width={32} height={32} />
            <View flex={1} items="center">
              <Text fontSize="$5" fontWeight="700" color="$text1" text="center">
                {title}
              </Text>
            </View>
            <XStack
              width={32}
              height={32}
              items="center"
              justify="center"
              rounded="$4"
              pressStyle={{ opacity: 0.8 }}
              onPress={onClose}
              cursor="pointer"
            >
              <Close size={24} color={theme.text2?.val || '#767676'} />
            </XStack>
          </XStack>

          {/* Token Icon */}
          <YStack items="center" gap="$3" py="$2">
            <Stack position="relative">
              <Avatar
                src={item.image}
                alt={item.token || item.title}
                fallback={item.token?.[0] || item.title?.[0] || '?'}
                size={80}
              />
              {isEvm && <ChainBadge chain="evm" size={24} />}
            </Stack>

            {/* Amount or Title for interactions */}
            {isInteraction ? (
              <Text fontSize={24} fontWeight="600" color="$text1" text="center">
                {item.title || 'Flow'}
              </Text>
            ) : (
              amountDisplay && (
                <Text fontSize={24} fontWeight="600" color={amountColor as any} text="center">
                  {amountDisplay}
                </Text>
              )
            )}
          </YStack>

          {/* Amount row for sent transactions */}
          {!isInteraction && item.transferType === 'sent' && amountDisplay && (
            <XStack justify="space-between" items="center" px="$2">
              <Text fontSize={14} fontWeight="400" color="$text2" lineHeight={20}>
                {youSentLabel}
              </Text>
              <Text fontSize={14} fontWeight="500" color="$error" lineHeight={20}>
                {amountDisplay}
              </Text>
            </XStack>
          )}

          {/* Address row */}
          {!isInteraction && (
            <XStack justify="space-between" items="center" px="$2">
              <Text fontSize={14} fontWeight="400" color="$text2" lineHeight={20}>
                {item.transferType === 'sent' ? toLabel : fromLabel}
              </Text>
              <Text fontSize={14} fontWeight="400" color="$text2" lineHeight={20}>
                {truncateAddress(item.transferType === 'sent' ? item.receiver : item.sender)}
              </Text>
            </XStack>
          )}

          {/* Details Card */}
          <YStack bg="$bg1" rounded="$4" px="$4">
            {/* Date */}
            <DetailRow label={dateLabel} value={formatDate(item.time)} />
            <Separator borderColor="$border1" />

            {/* Status */}
            <DetailRow label={statusLabel} value={statusText} valueColor={statusColor} />
            <Separator borderColor="$border1" />

            {/* Network */}
            <DetailRow label={networkLabel} value={isEvm ? networkEvm : networkFlow} />
            <Separator borderColor="$border1" />

            {/* Transaction Fee */}
            <DetailRow
              label={transactionFeeLabel}
              value="0.00"
              showStrikethrough
              originalValue="0.001"
              showFlowLogo
              secondaryText={coveredByFlowWallet}
            />
            <Separator borderColor="$border1" />

            {/* Network Fee */}
            <DetailRow label={networkFeeLabel} value="$0.15 FLOW" />
          </YStack>

          {/* View on block explorer button */}
          <YStack
            bg="$white"
            rounded="$4"
            height={52}
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.9 }}
            onPress={() => onViewExplorer?.(item)}
            cursor="pointer"
            mb="$6"
          >
            <Text fontSize="$4" fontWeight="600" color="$black">
              {viewOnExplorerText}
            </Text>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
