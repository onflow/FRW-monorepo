import { queryClient } from '@onflow/frw-context';
import { activityService } from '@onflow/frw-services';
import {
  FlatQueryDomain,
  addressType,
  type ActivityDetailResponse,
  type ActivityItem,
  type ActivityGroup,
  type ActivityListResponse,
} from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

/**
 * Query Keys Factory for Activity data
 */
export const activityQueryKeys = {
  all: [FlatQueryDomain.TRANSACTIONS] as const,
  address: (address: string, network: string = 'mainnet') =>
    [...activityQueryKeys.all, address, network] as const,
  list: (address: string, network: string = 'mainnet', offset: number = 0, limit: number = 15) =>
    [...activityQueryKeys.address(address, network), 'list', offset, limit] as const,
  detail: (txId: string, network: string = 'mainnet') =>
    [...activityQueryKeys.all, 'detail', txId, network] as const,
};

/**
 * Query Functions - Pure data fetching logic
 */
export const activityQueries = {
  /**
   * Fetch detailed information for a single transaction
   */
  fetchActivityDetail: async (
    txId: string,
    address: string,
    network: string = 'mainnet'
  ): Promise<ActivityDetailResponse | null> => {
    if (!txId || !address) return null;

    try {
      const walletType = addressType(address);
      const service = activityService(walletType);
      return await service.getActivityDetail(txId, network);
    } catch (error: unknown) {
      logger.error('[ActivityQuery] Error fetching activity detail:', error);
      throw error;
    }
  },

  /**
   * Fetch activity list for an address
   */
  fetchActivity: async (
    address: string,
    network: string = 'mainnet',
    offset: number = 0,
    limit: number = 15
  ): Promise<ActivityListResponse> => {
    if (!address) {
      return { items: [], total: 0, hasMore: false };
    }

    try {
      const walletType = addressType(address);
      const service = activityService(walletType);

      const response = await service.getActivity(address, network, offset, limit);

      logger.debug('[ActivityQuery] Fetched activity:', {
        address,
        network,
        offset,
        limit,
        count: response.items.length,
        total: response.total,
      });

      return response;
    } catch (error: unknown) {
      logger.error('[ActivityQuery] Error fetching activity:', error);
      throw error;
    }
  },
};

/**
 * Groups activity items by date for display
 * Returns groups like "Today", "Yesterday", "May 28, 2025"
 */
export function groupActivityByDate(items: ActivityItem[]): ActivityGroup[] {
  if (!items || items.length === 0) {
    return [];
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;

  // Group items by date
  const groupMap = new Map<string, { timestamp: number; items: ActivityItem[] }>();

  for (const item of items) {
    const itemDate = new Date(item.time);
    const itemDateStart = new Date(
      itemDate.getFullYear(),
      itemDate.getMonth(),
      itemDate.getDate()
    ).getTime();

    let dateLabel: string;
    if (itemDateStart === today) {
      dateLabel = 'Today';
    } else if (itemDateStart === yesterday) {
      dateLabel = 'Yesterday';
    } else {
      // Format as "May 28, 2025"
      dateLabel = itemDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    const existing = groupMap.get(dateLabel);
    if (existing) {
      existing.items.push(item);
    } else {
      groupMap.set(dateLabel, { timestamp: itemDateStart, items: [item] });
    }
  }

  // Convert to array and sort by timestamp (most recent first)
  const groups: ActivityGroup[] = Array.from(groupMap.entries()).map(([date, data]) => ({
    date,
    timestamp: data.timestamp,
    items: data.items.sort((a, b) => b.time - a.time),
  }));

  return groups.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Activity helper functions
 */
export const activityHelpers = {
  /**
   * Fetch and cache activity data
   */
  fetchActivity: async (
    address: string,
    network: string = 'mainnet',
    offset: number = 0,
    limit: number = 15
  ): Promise<ActivityListResponse> => {
    return queryClient.fetchQuery({
      queryKey: activityQueryKeys.list(address, network, offset, limit),
      queryFn: () => activityQueries.fetchActivity(address, network, offset, limit),
      staleTime: 0, // Financial data should always be fresh
    });
  },

  /**
   * Get cached activity data without triggering fetch
   */
  getActivity: (
    address: string,
    network: string = 'mainnet',
    offset: number = 0,
    limit: number = 15
  ): ActivityListResponse | undefined => {
    return queryClient.getQueryData<ActivityListResponse>(
      activityQueryKeys.list(address, network, offset, limit)
    );
  },

  /**
   * Invalidate activity cache for an address
   */
  invalidateActivity: (address: string, network?: string): void => {
    if (network) {
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.address(address, network),
      });
    } else {
      // Invalidate all networks for this address
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[1] === address;
        },
      });
    }
  },

  /**
   * Invalidate all activity cache
   */
  invalidateAllActivity: (): void => {
    queryClient.invalidateQueries({
      queryKey: activityQueryKeys.all,
    });
  },

  /**
   * Check if activity data is loading
   */
  isLoading: (
    address: string,
    network: string = 'mainnet',
    offset: number = 0,
    limit: number = 15
  ): boolean => {
    const query = queryClient.getQueryCache().find({
      queryKey: activityQueryKeys.list(address, network, offset, limit),
    });
    return query?.state.fetchStatus === 'fetching';
  },

  /**
   * Group activity items by date
   */
  groupByDate: groupActivityByDate,
};
