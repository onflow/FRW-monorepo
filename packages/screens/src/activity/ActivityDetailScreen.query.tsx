import { bridge, navigation } from '@onflow/frw-context';
import {
  activityQueries,
  activityQueryKeys,
  useWalletStore,
  walletSelectors,
} from '@onflow/frw-stores';
import { mapActivityStatus, type ActivityItem } from '@onflow/frw-types';
import {
  ActivityDetailRow,
  Avatar,
  BackgroundWrapper,
  ChainBadge,
  ExtensionHeader,
  Separator,
  Skeleton,
  Stack,
  Text,
  YStack,
  XStack,
  ScrollView,
} from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
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
 * Formats a timestamp or ISO date string to a readable date string
 */
function formatDate(time: number | string): string {
  const date = typeof time === 'string' ? new Date(time) : new Date(time);
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

  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);
  const address = activeAccount?.address ?? item.sender;

  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: activityQueryKeys.detail(item.hash, network),
    queryFn: () => activityQueries.fetchActivityDetail(item.hash, address, network),
    enabled: !!item.hash,
    staleTime: 5 * 60 * 1000,
  });

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

  // Derive display values — prefer detail API data where available, fall back to list item
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
    displayImage,
    displayTime,
    assets,
  } = useMemo(() => {
    const isInteractionType = item.type === 'interaction';
    const isNftType = item.type === 'nft';
    const isEvmWallet = item.walletType === 'evm';

    // Prefer detail assets — richer image and per-asset amounts
    const detailAssets = detail?.assets ?? [];
    const primaryAsset = detailAssets[0];

    const effectiveImage = primaryAsset?.thumbnail || item.image;
    const effectiveTime = detail?.time ?? item.time;

    // Prefer detail status/error — more authoritative than list response
    const effectiveStatus = detail ? mapActivityStatus(detail.status) : item.status;
    const effectiveError = detail ? detail.error : item.error;

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
    if (effectiveError || effectiveStatus === 'failed') {
      sColor = '$error';
      sText = statusFailed;
    } else if (effectiveStatus === 'expired') {
      sColor = '$error';
      sText = statusExpired;
    } else if (effectiveStatus === 'pending') {
      sColor = '$text2';
      sText = statusPending;
    } else {
      sColor = '$primary';
      sText = statusSuccess;
    }

    // Amount display — use detail total amount + list token name for FT
    // For multi-asset, the hero display shows detail.amount (total)
    const effectiveAmount = detail?.amount || item.amount;
    const effectiveToken = primaryAsset?.id || item.token;

    let aDisplay = '';
    let aColor = '$text1';
    if (effectiveAmount && effectiveToken) {
      if (item.transferType === 'sent') {
        aDisplay = `-${effectiveAmount} ${effectiveToken}`;
        aColor = '$text1';
      } else {
        aDisplay = `+${effectiveAmount} ${effectiveToken}`;
        aColor = '$primary';
      }
    }

    // NFT-specific display values
    let nftTitleText = '';
    let nftCount = '';
    if (isNftType) {
      const collectionName = effectiveToken || item.title || 'NFT';
      nftTitleText = nftsFromLabel.replace('{{collection}}', collectionName);

      const count = parseInt(effectiveAmount, 10) || 1;
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
      displayImage: effectiveImage,
      displayTime: effectiveTime,
      assets: detailAssets,
    };
  }, [
    item,
    detail,
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
                src={displayImage}
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
            ) : isDetailLoading ? (
              <Skeleton width={140} height={32} borderRadius={8} />
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
          {isNft && displayImage && (
            <XStack justify="center" px="$2">
              <Avatar
                src={displayImage}
                alt={item.token || 'NFT'}
                fallback="?"
                size={100}
                rounded="$3"
              />
            </XStack>
          )}

          {/* FT: Multi-asset rows when detail returns multiple assets */}
          {!isInteraction && !isNft && assets.length > 1 && (
            <YStack gap="$2">
              {assets.map((asset) => (
                <XStack key={asset.id} justify="space-between" items="center" px="$2">
                  <XStack items="center" gap="$2">
                    <Avatar
                      src={asset.thumbnail}
                      alt={asset.id}
                      fallback={asset.id?.[0] || '?'}
                      size={24}
                    />
                    <Text fontSize={14} fontWeight="400" color="$text2" lineHeight={20}>
                      {asset.id}
                    </Text>
                  </XStack>
                  <Text
                    fontSize={14}
                    fontWeight="500"
                    color={item.transferType === 'sent' ? '$error' : '$primary'}
                    lineHeight={20}
                  >
                    {item.transferType === 'sent' ? `-${asset.amount}` : `+${asset.amount}`}
                  </Text>
                </XStack>
              ))}
            </YStack>
          )}

          {/* FT: Single asset amount row for sent transactions */}
          {!isInteraction && !isNft && assets.length <= 1 && item.transferType === 'sent' && (
            <XStack justify="space-between" items="center" px="$2">
              <Text fontSize={14} fontWeight="400" color="$text2" lineHeight={20}>
                {youSentLabel}
              </Text>
              {isDetailLoading ? (
                <Skeleton width={80} height={16} borderRadius={4} />
              ) : (
                <Text fontSize={14} fontWeight="500" color="$error" lineHeight={20}>
                  {amountDisplay}
                </Text>
              )}
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
                <ActivityDetailRow
                  label={dateLabel}
                  value={isDetailLoading ? '' : formatDate(displayTime)}
                  skeleton={isDetailLoading}
                />
                <Separator borderColor="$light25" borderWidth={0.5} />
              </>
            )}

            {/* Status */}
            <ActivityDetailRow
              label={statusLabel}
              value={isDetailLoading ? '' : statusText}
              valueColor={isDetailLoading ? undefined : statusColor}
              skeleton={isDetailLoading}
            />
            <Separator borderColor="$light25" borderWidth={0.5} />

            {/* Network */}
            <ActivityDetailRow label={networkLabel} value={isEvm ? networkEvm : networkFlow} />

            {/* Account row - show when receiver has profile info (user's own account) */}
            {item.receiverProfile && item.transferType === 'received' && (
              <>
                <Separator borderColor="$light25" borderWidth={0.5} />
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
                <Separator borderColor="$light25" borderWidth={0.5} />
                <ActivityDetailRow
                  label={accountLabel}
                  value={item.senderProfile.name}
                  valueColor="$text1"
                />
              </>
            )}

            {/* Transaction Fee */}
            {item.transferType === 'sent' && (
              <>
                <Separator borderColor="$light25" borderWidth={0.5} />
                <ActivityDetailRow
                  label={transactionFeeLabel}
                  value={isDetailLoading ? '' : detail?.fee || '0.00'}
                  showStrikethrough={!isDetailLoading && !detail?.fee}
                  originalValue={!isDetailLoading && !detail?.fee ? '0.001' : undefined}
                  showFlowLogo={!isDetailLoading}
                  secondaryText={!isDetailLoading && !detail?.fee ? coveredByFlowWallet : undefined}
                  skeleton={isDetailLoading}
                />
              </>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      {/* View on block explorer button - anchored to bottom */}
      <YStack px="$4" pb="$6" pt="$2">
        <YStack
          bg="$white"
          rounded="$4"
          height={52}
          items="center"
          justify="center"
          pressStyle={{ opacity: 0.9 }}
          onPress={handleViewExplorer}
          cursor="pointer"
        >
          <Text fontSize="$4" fontWeight="600" color="$black">
            {viewOnExplorerText}
          </Text>
        </YStack>
      </YStack>
    </BackgroundWrapper>
  );
}
