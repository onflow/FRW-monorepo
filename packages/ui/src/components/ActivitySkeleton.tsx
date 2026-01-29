import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Skeleton } from '../foundation/Skeleton';
import type { ActivitySkeletonProps } from '../types';

/**
 * Single activity item skeleton
 */
function ActivityItemSkeleton(): React.ReactElement {
  return (
    <XStack items="center" gap="$3" py="$3" px="$4" width="100%">
      {/* Avatar skeleton */}
      <Skeleton width={48} height={48} borderRadius={24} />

      {/* Content skeleton */}
      <YStack flex={1} gap="$2">
        {/* Top row */}
        <XStack justify="space-between" items="center">
          <Skeleton width={120} height={14} borderRadius={4} />
          <Skeleton width={80} height={14} borderRadius={4} />
        </XStack>

        {/* Bottom row */}
        <XStack justify="space-between" items="center">
          <Skeleton width={100} height={12} borderRadius={4} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </XStack>
      </YStack>
    </XStack>
  );
}

/**
 * ActivitySkeleton displays loading placeholders for activity items
 * Used while activity data is being fetched
 */
export function ActivitySkeleton({ count = 5 }: ActivitySkeletonProps): React.ReactElement {
  return (
    <YStack width="100%">
      {/* Date header skeleton */}
      <XStack py="$3" px="$4">
        <Skeleton width={80} height={13} borderRadius={4} />
      </XStack>

      {/* Activity items skeleton */}
      {Array.from({ length: count }).map((_, index) => (
        <ActivityItemSkeleton key={`skeleton-${index}`} />
      ))}
    </YStack>
  );
}
