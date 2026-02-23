import { bridge, navigation } from '@onflow/frw-context';
import {
  activityQueries,
  activityQueryKeys,
  groupActivityByDate,
  useWalletStore,
  walletSelectors,
} from '@onflow/frw-stores';
import type { ActivityItem, ActivityGroup } from '@onflow/frw-types';
import {
  ActivitySkeleton,
  BackgroundWrapper,
  ExtensionHeader,
  RefreshView,
  Text,
  YStack,
  XStack,
  ActivityCard,
  ActivityGroupHeader,
  ScrollView,
  Separator,
  Skeleton,
} from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 15;

export interface ActivityScreenProps {
  /** Optional callback when an activity item is pressed (used when embedded as tab) */
  onActivityPress?: (item: ActivityItem) => void;
}

/**
 * Activity Screen - displays transaction history grouped by date
 * Following MVVM pattern with TanStack Query integration
 *
 * Supports both Flow (Cadence) and Flow-EVM transactions
 */
export function ActivityScreen({ onActivityPress }: ActivityScreenProps = {}): ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';

  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);
  const address = activeAccount?.address ?? '';

  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<ActivityItem[]>([]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: activityQueryKeys.list(address, network, offset, PAGE_SIZE),
    queryFn: () => activityQueries.fetchActivity(address, network, offset, PAGE_SIZE),
    enabled: !!address,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data) return;
    if (offset === 0) {
      setAllItems(data.items);
    } else {
      setAllItems((prev) => [...prev, ...data.items]);
    }
  }, [data, offset]);

  const hasMore = useMemo(() => {
    // Re-read latest response from cache to check hasMore
    return allItems.length > 0 && allItems.length % PAGE_SIZE === 0;
  }, [allItems]);

  const groupedActivity = useMemo((): ActivityGroup[] => {
    return groupActivityByDate(allItems);
  }, [allItems]);

  const handleActivityPress = useCallback(
    (item: ActivityItem) => {
      logger.debug('[ActivityScreen] Activity item pressed:', item.id);
      if (onActivityPress) {
        onActivityPress(item);
      } else {
        navigation.navigate('ActivityDetail', { item });
      }
    },
    [onActivityPress]
  );

  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + PAGE_SIZE);
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

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

      <ScrollView flex={1}>
        <YStack flex={1} pb="$4">
          {/* Screen title for non-extension - centered */}
          {!isExtension && (
            <XStack px="$4" pt="$4" pb="$2" justify="center">
              <Text fontSize="$4" fontWeight="700" color="$text1">
                {t('activity.title', 'Activity')}
              </Text>
            </XStack>
          )}

          {/* Loading skeleton on first fetch */}
          {isLoading && <ActivitySkeleton count={6} />}

          {/* Error state */}
          {!isLoading && isError && (
            <RefreshView
              type="error"
              title={t('activity.errorTitle', 'Failed to load')}
              message={t(
                'activity.errorMessage',
                'Could not fetch your activity. Please try again.'
              )}
              onRefresh={handleRetry}
              refreshText={t('activity.retry', 'Retry')}
            />
          )}

          {/* Empty state */}
          {!isLoading && !isError && groupedActivity.length === 0 && (
            <RefreshView
              type="empty"
              title={t('activity.emptyTitle', 'No activity yet')}
              message={t('activity.emptyMessage', 'Your transactions will appear here.')}
            />
          )}

          {/* Activity groups */}
          {!isLoading &&
            !isError &&
            groupedActivity.map((group) => (
              <YStack key={group.date}>
                <ActivityGroupHeader title={group.date} />
                <YStack mx="$4" bg="$bg1" rounded="$4" px="$3">
                  {group.items.map((item, index) => (
                    <YStack key={`${item.id}-${index}`}>
                      <ActivityCard item={item} onPress={() => handleActivityPress(item)} />
                      {index < group.items.length - 1 && (
                        <Separator borderColor="$light25" borderWidth={0.5} />
                      )}
                    </YStack>
                  ))}
                </YStack>
              </YStack>
            ))}

          {/* Load more */}
          {!isLoading && !isError && hasMore && (
            <YStack items="center" pt="$4" pb="$2">
              {isFetching ? (
                <YStack gap="$2" w="100%" px="$4">
                  <Skeleton height={64} borderRadius={12} />
                  <Skeleton height={64} borderRadius={12} />
                </YStack>
              ) : (
                <YStack
                  bg="$bg1"
                  rounded="$4"
                  mx="$4"
                  w="100%"
                  height={48}
                  items="center"
                  justify="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handleLoadMore}
                  cursor="pointer"
                >
                  <Text fontSize={14} fontWeight="500" color="$text2">
                    {t('activity.loadMore', 'Load more')}
                  </Text>
                </YStack>
              )}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </BackgroundWrapper>
  );
}
