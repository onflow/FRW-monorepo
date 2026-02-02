import { bridge, navigation } from '@onflow/frw-context';
import type { ActivityItem } from '@onflow/frw-types';
import {
  ActivityDetailRow,
  Avatar,
  BackgroundWrapper,
  ChainBadge,
  ExtensionHeader,
  Separator,
  Stack,
  Text,
  YStack,
  XStack,
  ScrollView,
} from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import { useCallback, useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

export interface ActivityDetailScreenProps {
  /** The activity item to display (from navigation params) */
  item: ActivityItem;
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
 * ActivityDetailScreen - Full screen for displaying activity/transaction details
 *
 * Shows transaction information including amount, status, addresses, fees, etc.
 * Opens as a full screen with back navigation.
 */
export function ActivityDetailScreen({ item }: ActivityDetailScreenProps): ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';

  // Translation strings
  const sentTitle = t('activity.sent', 'Sent');
  const receivedTitle = t('activity.received', 'Received');
  const interactionTitle = t('activity.detail.appInteraction', 'App Interaction');
  const youSentLabel = t('activity.detail.youSent', 'You Sent');
  const fromLabel = t('activity.detail.from', 'From');
  const toLabel = t('activity.detail.to', 'To');
  const dateLabel = t('activity.detail.date', 'Date');
  const statusLabel = t('activity.detail.status', 'Status');
  const networkLabel = t('activity.detail.network', 'Network');
  const transactionFeeLabel = t('activity.detail.transactionFee', 'Transaction Fee');
  const coveredByFlowWallet = t('activity.detail.coveredByFlowWallet', 'Covered by Flow Wallet');
  const viewOnExplorerText = t('activity.detail.viewOnExplorer', 'View on block explorer');
  const statusPending = t('activity.status.pending', 'Pending');
  const statusSuccess = t('activity.status.success', 'Success');
  const statusFailed = t('activity.status.failed', 'Failed');
  const statusExpired = t('activity.status.expired', 'Expired');
  const networkFlow = t('activity.detail.networkFlow', 'Flow');
  const networkEvm = t('activity.detail.networkEvm', 'Flow EVM');

  // Derive display values from item
  const { title, statusColor, statusText, amountDisplay, amountColor, isInteraction, isEvm } =
    useMemo(() => {
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
          aColor = '$text1';
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

  // Handle view on block explorer
  const handleViewExplorer = useCallback(() => {
    const isEvmTx = item.walletType === 'evm';
    let baseUrl: string;

    if (isEvmTx) {
      baseUrl =
        network === 'mainnet' ? 'https://evm.flowscan.io' : 'https://evm-testnet.flowscan.io';
    } else {
      baseUrl = network === 'mainnet' ? 'https://flowscan.io' : 'https://testnet.flowscan.io';
    }

    const txUrl = `${baseUrl}/tx/${item.hash}`;
    logger.debug('[ActivityDetailScreen] Opening block explorer:', txUrl);
    Linking.openURL(txUrl);
  }, [item, network]);

  return (
    <BackgroundWrapper backgroundColor="$bg">
      {isExtension && (
        <ExtensionHeader
          title={title}
          help={false}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}

      <ScrollView flex={1}>
        <YStack p="$4" gap="$4">
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
            {/* Date - only shown for transfers, not for app interactions */}
            {!isInteraction && (
              <>
                <ActivityDetailRow label={dateLabel} value={formatDate(item.time)} />
                <Separator borderColor="$border1" />
              </>
            )}

            {/* Status */}
            <ActivityDetailRow label={statusLabel} value={statusText} valueColor={statusColor} />
            <Separator borderColor="$border1" />

            {/* Network */}
            <ActivityDetailRow label={networkLabel} value={isEvm ? networkEvm : networkFlow} />
            <Separator borderColor="$border1" />

            {/* Transaction Fee */}
            <ActivityDetailRow
              label={transactionFeeLabel}
              value="0.00"
              showStrikethrough
              originalValue="0.001"
              showFlowLogo
              secondaryText={coveredByFlowWallet}
            />
          </YStack>

          {/* View on block explorer button */}
          <YStack
            bg="$white"
            rounded="$4"
            height={52}
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.9 }}
            onPress={handleViewExplorer}
            cursor="pointer"
            mb="$6"
          >
            <Text fontSize="$4" fontWeight="600" color="$black">
              {viewOnExplorerText}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </BackgroundWrapper>
  );
}
