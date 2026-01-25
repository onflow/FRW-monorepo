import { bridge, navigation } from '@onflow/frw-context';
import { activityQueryKeys, activityQueries, groupActivityByDate } from '@onflow/frw-stores';
import type { ActivityItem, ActivityGroup } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  ExtensionHeader,
  Text,
  YStack,
  XStack,
  ActivityCard,
  ActivityDetailSheet,
  ActivityGroupHeader,
  ActivitySkeleton,
  RefreshView,
  ScrollView,
  Separator,
} from '@onflow/frw-ui';
import { logger, retryConfigs } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, RefreshControl } from 'react-native';

/**
 * Activity Screen - displays transaction history grouped by date
 * Following MVVM pattern with TanStack Query integration
 *
 * Supports both Flow (Cadence) and Flow-EVM transactions
 */
export function ActivityScreen(): ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';

  // Get current address and network from bridge
  const address = bridge.getSelectedAddress() || '';
  const network = bridge.getNetwork() || 'mainnet';

  // State for detail sheet
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null);
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);

  // Fetch activity data using TanStack Query
  const {
    data: activityData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: activityQueryKeys.list(address, network, 0, 50),
    queryFn: () => activityQueries.fetchActivity(address, network, 0, 50),
    enabled: !!address,
    staleTime: 0, // Always fresh for financial data
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...retryConfigs.critical,
  });

  // Group activity items by date
  const groupedActivity = useMemo((): ActivityGroup[] => {
    const items = activityData?.items ?? [];
    return groupActivityByDate(items);
  }, [activityData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    logger.debug('[ActivityScreen] Refreshing activity data');
    refetch();
  }, [refetch]);

  // Handle activity item press - open detail sheet
  const handleActivityPress = useCallback((item: ActivityItem) => {
    logger.debug('[ActivityScreen] Activity item pressed:', item.id);
    setSelectedItem(item);
    setIsDetailSheetVisible(true);
  }, []);

  // Handle detail sheet close
  const handleDetailSheetClose = useCallback(() => {
    setIsDetailSheetVisible(false);
    // Delay clearing selected item to allow sheet animation to complete
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  // Handle view on block explorer
  const handleViewExplorer = useCallback(
    (item: ActivityItem) => {
      const baseUrl = network === 'mainnet' ? 'https://flowscan.io' : 'https://testnet.flowscan.io';
      const txUrl = `${baseUrl}/tx/${item.hash}`;
      logger.debug('[ActivityScreen] Opening block explorer:', txUrl);
      Linking.openURL(txUrl);
    },
    [network]
  );

  // Render loading state
  if (isLoading && !activityData) {
    return (
      <BackgroundWrapper backgroundColor="$bg">
        {isExtension && (
          <ExtensionHeader
            title={t('activity.title', 'Activity')}
            help={false}
            onGoBack={() => navigation.goBack()}
            onNavigate={(link: string) => navigation.navigate(link)}
          />
        )}
        <ActivitySkeleton count={5} />
      </BackgroundWrapper>
    );
  }

  // Render error state
  if (error && !activityData) {
    return (
      <BackgroundWrapper backgroundColor="$bg">
        {isExtension && (
          <ExtensionHeader
            title={t('activity.title', 'Activity')}
            help={false}
            onGoBack={() => navigation.goBack()}
            onNavigate={(link: string) => navigation.navigate(link)}
          />
        )}
        <RefreshView
          type="error"
          title={t('activity.error', 'Failed to load activity')}
          message={t('activity.errorMessage', 'Please try again')}
          onRefresh={handleRefresh}
          refreshText={t('common.retry', 'Retry')}
        />
      </BackgroundWrapper>
    );
  }

  // Render empty state
  if (groupedActivity.length === 0) {
    return (
      <BackgroundWrapper backgroundColor="$bg">
        {isExtension && (
          <ExtensionHeader
            title={t('activity.title', 'Activity')}
            help={false}
            onGoBack={() => navigation.goBack()}
            onNavigate={(link: string) => navigation.navigate(link)}
          />
        )}
        <RefreshView
          type="empty"
          title={t('activity.empty', 'No activity yet')}
          message={t('activity.emptyMessage', 'Your transaction history will appear here')}
          onRefresh={handleRefresh}
          refreshText={t('common.refresh', 'Refresh')}
        />
      </BackgroundWrapper>
    );
  }

  // Render activity list
  return (
    <BackgroundWrapper backgroundColor="$bg">
      {isExtension && (
        <ExtensionHeader
          title={t('activity.title', 'Activity')}
          help={false}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}

      <ScrollView
        flex={1}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
      >
        <YStack flex={1} pb="$4">
          {/* Screen title for non-extension - centered */}
          {!isExtension && (
            <XStack px="$4" pt="$4" pb="$2" justify="center">
              <Text fontSize="$4" fontWeight="700" color="$text1">
                {t('activity.title', 'Activity')}
              </Text>
            </XStack>
          )}

          {/* Activity groups */}
          {groupedActivity.map((group) => (
            <YStack key={group.date}>
              {/* Date header */}
              <ActivityGroupHeader title={group.date} />

              {/* Activity cards container with shared background */}
              <YStack mx="$4" bg="$bg1" rounded="$4" px="$3">
                {group.items.map((item, index) => (
                  <YStack key={`${item.id}-${index}`}>
                    <ActivityCard item={item} onPress={() => handleActivityPress(item)} />
                    {/* Separator between cards, not after last card */}
                    {index < group.items.length - 1 && (
                      <Separator borderColor="$light25" borderWidth={0.5} />
                    )}
                  </YStack>
                ))}
              </YStack>
            </YStack>
          ))}
        </YStack>
      </ScrollView>

      {/* Activity Detail Sheet */}
      <ActivityDetailSheet
        visible={isDetailSheetVisible}
        item={selectedItem}
        onClose={handleDetailSheetClose}
        onViewExplorer={handleViewExplorer}
        isExtension={isExtension}
        sentTitle={t('activity.sent', 'Sent')}
        receivedTitle={t('activity.received', 'Received')}
        interactionTitle={t('activity.detail.appInteraction', 'App Interaction')}
        youSentLabel={t('activity.detail.youSent', 'You Sent')}
        fromLabel={t('activity.detail.from', 'From')}
        toLabel={t('activity.detail.to', 'To')}
        dateLabel={t('activity.detail.date', 'Date')}
        statusLabel={t('activity.detail.status', 'Status')}
        networkLabel={t('activity.detail.network', 'Network')}
        transactionFeeLabel={t('activity.detail.transactionFee', 'Transaction Fee')}
        networkFeeLabel={t('activity.detail.networkFee', 'Network Fee')}
        coveredByFlowWallet={t('activity.detail.coveredByFlowWallet', 'Covered by Flow Wallet')}
        viewOnExplorerText={t('activity.detail.viewOnExplorer', 'View on block explorer')}
        statusPending={t('activity.status.pending', 'Pending')}
        statusSuccess={t('activity.status.success', 'Success')}
        statusFailed={t('activity.status.failed', 'Failed')}
        statusExpired={t('activity.status.expired', 'Expired')}
        networkFlow={t('activity.detail.networkFlow', 'Flow')}
        networkEvm={t('activity.detail.networkEvm', 'Flow EVM')}
      />
    </BackgroundWrapper>
  );
}
