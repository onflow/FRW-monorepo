import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { XStack, YStack, Text } from 'tamagui';

import { NFTCard } from './NFTCard';
import { RefreshView } from './RefreshView';
import { Button } from '../foundation/Button';
import { Skeleton } from '../foundation/Skeleton';

export interface NFTData {
  id: string;
  name: string;
  image: string;
  thumbnail?: string;
  collection?: string;
  amount?: string | number;
  contractType?: string; // 'ERC721' | 'ERC1155'
}

export interface NFTGridProps {
  isExtension?: boolean;
  totalCount?: number;
  // Data
  data: NFTData[];
  selectedIds?: string[];

  // Loading states
  isLoading?: boolean;
  loadingProgress?: number; // 0-100 percentage

  // Empty states
  emptyTitle?: string;
  emptyMessage?: string;
  showClearSearch?: boolean;
  clearSearchText?: string;

  // Error states
  error?: string;
  retryText?: string;

  // Actions
  onNFTSelect?: (id: string) => void;
  onNFTPress?: (id: string) => void;
  onRetry?: () => void;
  onClearSearch?: () => void;

  // Account info for From Account avatar
  accountEmoji?: string;
  accountAvatar?: string;
  accountName?: string;
  accountColor?: string;

  // Layout
  gap?: string;
  aspectRatio?: number;

  // Virtualization options
  enableVirtualization?: boolean;
  itemsPerBatch?: number;
  loadMoreThreshold?: number;
}

export function NFTGrid({
  data,
  selectedIds = [],
  isLoading = false,
  loadingProgress = 0,
  emptyTitle,
  emptyMessage,
  showClearSearch = false,
  clearSearchText = 'Clear Search',
  error,
  retryText = 'Retry',
  onNFTSelect = () => {},
  onNFTPress = () => {},
  onRetry,
  onClearSearch,
  accountEmoji,
  accountAvatar,
  accountName,
  accountColor,
  gap = '$3',
  aspectRatio = 1,
  enableVirtualization = true,
  itemsPerBatch = 20,
  loadMoreThreshold = 10,
  isExtension = false,
  totalCount = 51,
}: NFTGridProps) {
  const columns = 2;

  // Virtualization state
  const [visibleItemCount, setVisibleItemCount] = useState(itemsPerBatch);
  const loadMoreRef = useRef<any>(null); // Generic ref for both web (HTMLDivElement) and React Native

  // Memoize visible data for performance
  const visibleData = useMemo(() => {
    if (!enableVirtualization) {
      return data;
    }
    return data.slice(0, visibleItemCount);
  }, [data, visibleItemCount, enableVirtualization]);

  // Load more items when scrolling
  const handleLoadMore = useCallback(() => {
    if (!enableVirtualization || visibleItemCount >= data.length) {
      return;
    }

    const newCount = Math.min(visibleItemCount + itemsPerBatch, data.length);
    setVisibleItemCount(newCount);
  }, [enableVirtualization, visibleItemCount, data.length, itemsPerBatch]);

  // Intersection Observer for load more (Web only - React Native uses different approach)
  useEffect(() => {
    if (!enableVirtualization || !loadMoreRef.current) return;

    // Check if IntersectionObserver is available (Web environment)
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && visibleItemCount < data.length) {
            handleLoadMore();
          }
        },
        {
          rootMargin: '100px', // Start loading 100px before the trigger comes into view
          threshold: 0.1,
        }
      );

      observer.observe(loadMoreRef.current);

      return () => observer.disconnect();
    }
  }, [enableVirtualization, visibleItemCount, data.length, handleLoadMore]);

  // React Native lazy loading - automatically load more when approaching the end
  useEffect(() => {
    if (!enableVirtualization || isExtension) return;

    // In React Native, automatically load more items when we're showing close to all visible items
    const remainingItems = data.length - visibleItemCount;
    const shouldLoadMore = remainingItems > 0 && remainingItems <= loadMoreThreshold;

    if (shouldLoadMore) {
      const timer = setTimeout(() => {
        handleLoadMore();
      }, 100); // Small delay to prevent rapid updates

      return () => clearTimeout(timer);
    }
  }, [enableVirtualization, visibleItemCount, data.length, loadMoreThreshold, handleLoadMore]);

  // Reset visible count when data changes
  const prevDataLength = React.useRef(data.length);
  React.useEffect(() => {
    if (prevDataLength.current !== data.length) {
      setVisibleItemCount(itemsPerBatch);
      prevDataLength.current = data.length;
    }
  }, [data.length, itemsPerBatch]);

  // Memoize rows for performance
  const rows = useMemo(() => {
    const result: NFTData[][] = [];
    for (let i = 0; i < visibleData.length; i += columns) {
      result.push(visibleData.slice(i, i + columns));
    }
    return result;
  }, [visibleData, columns]);

  // Loading skeleton - match the responsive 2-column layout
  const renderSkeleton = () => {
    const skeletonRows: React.ReactElement[] = [];
    for (let i = 0; i < 6; i += columns) {
      const rowItems = Array.from({ length: Math.min(columns, 6 - i) }, (_, index) => (
        <YStack key={`skeleton-${i + index}`} width="50%" flex={0} gap="$1.5">
          <Skeleton width="100%" height="$41" borderRadius="$4" />
          <YStack gap="$1">
            <Skeleton height="$4" width="80%" />
            <Skeleton height="$3" width="60%" />
          </YStack>
        </YStack>
      ));

      skeletonRows.push(
        <XStack key={`skeleton-row-${i}`} gap="$4" justify="flex-start" width="100%">
          {rowItems}
        </XStack>
      );
    }

    return <YStack gap="$4">{skeletonRows}</YStack>;
  };

  // Loading state with progress bar - based on Figma design
  const renderLoading = () => {
    const progress = Math.min(Math.max(loadingProgress, 0), 100);
    const progressWidth = `${progress}%`;

    return (
      <YStack
        flex={1}
        justify="center"
        items="center"
        gap="$2.5"
        px="$0"
        py="$0"
        mt="$-20"
        width="100%"
      >
        {/* Loading text and percentage */}
        <XStack justify="space-between" items="center" width="$34">
          <Text fontSize="$4" fontWeight="400" color="white">
            Loading NFTs
          </Text>
          <Text fontSize="$4" fontWeight="400" color="white">
            {Math.round(progress)}%
          </Text>
        </XStack>

        {/* Progress bar */}
        <YStack
          height="$2"
          width="$46"
          position="relative"
          bg="$grayBg1"
          overflow="hidden"
          style={{ borderRadius: 10 }}
        >
          {/* Progress fill */}
          <YStack
            height="100%"
            style={{ width: progressWidth, borderRadius: 10, left: 0, top: 0 }}
            bg="#00ef8b"
            position="absolute"
          />
        </YStack>
      </YStack>
    );
  };

  // Error state
  const renderError = () => (
    <RefreshView
      type="error"
      message={error || 'Failed to load NFTs'}
      onRefresh={onRetry}
      refreshText={retryText}
    />
  );

  // Empty state
  const renderEmpty = () => (
    <YStack flex={1} justify="center" items="center" px="$6" py="$12">
      <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" style={{ textAlign: 'center' }}>
        {emptyTitle || 'No NFTs Found'}
      </Text>

      <Text
        fontSize="$4"
        color="$textSecondary"
        mb="$8"
        style={{ textAlign: 'center' }}
        lineHeight="$5"
      >
        {emptyMessage || 'No NFTs available in this collection.'}
      </Text>

      {showClearSearch && onClearSearch && (
        <YStack mt="$4" items="center">
          <Button variant="outline" size="medium" onPress={onClearSearch}>
            {clearSearchText}
          </Button>
        </YStack>
      )}
    </YStack>
  );

  // Show loading skeleton
  if (isLoading) {
    if (totalCount > 50) {
      return renderLoading();
    } else {
      return renderSkeleton();
    }
  }

  // Show error state
  if (error) {
    return renderError();
  }

  // Show empty state
  if (data.length === 0) {
    return renderEmpty();
  }

  // Main grid content
  return (
    <YStack gap="$4" pr={!isExtension && '$4'}>
      {rows.map((row, rowIndex) => (
        <XStack key={`row-${rowIndex}`} gap="$4" justify="flex-start" width="100%">
          {row.map((nft) => (
            <YStack key={nft.id} width="50%" flex={0}>
              <NFTCard
                nft={nft}
                size="medium"
                selected={selectedIds.includes(nft.id)}
                onPress={() => onNFTPress(nft.id)}
                onSelect={() => onNFTSelect(nft.id)}
                aspectRatio={aspectRatio}
                accountEmoji={accountEmoji}
                accountAvatar={accountAvatar}
                accountName={accountName}
                accountColor={accountColor}
              />
            </YStack>
          ))}
        </XStack>
      ))}

      {/* Load more trigger - invisible element for intersection observer */}
      {enableVirtualization && visibleItemCount < data.length && (
        <YStack ref={loadMoreRef} items="center" py="$4">
          <Text fontSize="$3" color="$textSecondary">
            Loading more NFTs... ({visibleItemCount} of {data.length})
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
