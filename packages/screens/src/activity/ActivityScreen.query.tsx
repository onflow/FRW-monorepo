import { bridge, navigation } from '@onflow/frw-context';
import { createMockActivityItems } from '@onflow/frw-services';
import { activityQueryKeys, activityQueries, groupActivityByDate } from '@onflow/frw-stores';
import type { ActivityItem, ActivityGroup } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  ExtensionHeader,
  Text,
  YStack,
  XStack,
  ActivityCard,
  ActivityGroupHeader,
  ActivitySkeleton,
  RefreshView,
  ScrollView,
  Separator,
} from '@onflow/frw-ui';
import { logger, retryConfigs } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native';

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
    // TODO: Remove mock data when API is implemented
    // For now, use mock data if no real data is available
    const items = activityData?.items ?? [];
    if (items.length === 0) {
      // Return mock data for development - will be removed when API is connected
      const mockItems = createMockActivityItems(10);
      return groupActivityByDate(mockItems);
    }
    return groupActivityByDate(items);
  }, [activityData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    logger.debug('[ActivityScreen] Refreshing activity data');
    refetch();
  }, [refetch]);

  // Handle activity item press - navigate to transaction details
  const handleActivityPress = useCallback((item: ActivityItem) => {
    logger.debug('[ActivityScreen] Activity item pressed:', item.id);
    // TODO: Navigate to transaction detail screen when available
    // For now, we could open in Flowscan
    // navigation.navigate('TransactionDetail', { txId: item.hash });
  }, []);

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
                  <YStack key={item.id}>
                    <ActivityCard item={item} onPress={() => handleActivityPress(item)} />
                    {/* Separator between cards, not after last card */}
                    {index < group.items.length - 1 && <Separator borderColor="$light25" />}
                  </YStack>
                ))}
              </YStack>
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </BackgroundWrapper>
  );
}
