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

  // NFT-specific translations
  const youReceivedLabel = t('activity.detail.youReceived', 'You Received');
  const nftsFromLabel = t('activity.detail.nftsFrom', 'NFTS from {{collection}}');
  const nftCountLabel = t('activity.detail.nftCount', '{{count}} NFTS');
  const accountLabel = t('activity.detail.account', 'Account');

  // Derive display values from item
  const {
    title,
    statusColor,
    statusText,
    amountDisplay,
    amountColor,
    isInteraction,
    isNft,
    isEvm,
    nftTitle,
    nftCountDisplay,
  } = useMemo(() => {
    const isInteractionType = item.type === 'interaction';
    const isNftType = item.type === 'nft';
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

    // NFT-specific display values
    let nftTitleText = '';
    let nftCount = '';
    if (isNftType) {
      // Use token as collection name, or title if token is empty
      const collectionName = item.token || item.title || 'NFT';
      nftTitleText = nftsFromLabel.replace('{{collection}}', collectionName);

      // Parse amount as NFT count
      const count = parseInt(item.amount, 10) || 1;
      const prefix = item.transferType === 'sent' ? '-' : '+';
      nftCount = `${prefix}${count} ${count === 1 ? 'NFT' : 'NFTS'}`;
    }

    return {
      title: headerTitle,
      statusColor: sColor,
      statusText: sText,
      amountDisplay: aDisplay,
      amountColor: aColor,
      isInteraction: isInteractionType,
      isNft: isNftType,
      isEvm: isEvmWallet,
      nftTitle: nftTitleText,
      nftCountDisplay: nftCount,
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
    nftsFromLabel,
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
          {/* Token/NFT Icon */}
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

            {/* Title display based on transaction type */}
            {isInteraction ? (
              <Text fontSize={24} fontWeight="600" color="$text1" text="center">
                {item.title || 'Flow'}
              </Text>
            ) : isNft ? (
              <Text fontSize={24} fontWeight="600" color="$text1" text="center">
                {nftTitle}
              </Text>
            ) : (
              amountDisplay && (
                <Text fontSize={24} fontWeight="600" color={amountColor as any} text="center">
                  {amountDisplay}
                </Text>
              )
            )}
          </YStack>

          {/* NFT: You Sent/Received row with count */}
          {isNft && (
            <XStack justify="space-between" items="center" px="$2">
              <Text fontSize={14} fontWeight="400" color="$text2" lineHeight={20}>
                {item.transferType === 'sent' ? youSentLabel : youReceivedLabel}
              </Text>
              <Text
                fontSize={14}
                fontWeight="500"
                color={item.transferType === 'sent' ? '$error' : '$primary'}
                lineHeight={20}
              >
                {nftCountDisplay}
              </Text>
            </XStack>
          )}

          {/* NFT: Single image preview */}
          {isNft && item.image && (
            <XStack justify="center" px="$2">
              <Avatar
                src={item.image}
                alt={item.token || 'NFT'}
                fallback="?"
                size={100}
                rounded="$3"
              />
            </XStack>
          )}

          {/* FT: Amount row for sent transactions */}
          {!isInteraction && !isNft && item.transferType === 'sent' && amountDisplay && (
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

            {/* Account row - show when receiver has profile info (user's own account) */}
            {item.receiverProfile && item.transferType === 'received' && (
              <>
                <Separator borderColor="$border1" />
                <ActivityDetailRow
                  label={accountLabel}
                  value={item.receiverProfile.name}
                  valueColor="$text1"
                />
              </>
            )}

            {/* Account row for sent - show sender profile if available */}
            {item.senderProfile && item.transferType === 'sent' && (
              <>
                <Separator borderColor="$border1" />
                <ActivityDetailRow
                  label={accountLabel}
                  value={item.senderProfile.name}
                  valueColor="$text1"
                />
              </>
            )}

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
