import React, { useMemo, useState, useCallback } from 'react';
import { XStack, YStack, Text, ScrollView } from 'tamagui';

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

  // Memoize visible data for performance
  const visibleData = useMemo(() => {
    if (!enableVirtualization || isExtension) {
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

  // Reset visible count when data changes
  const prevDataLength = React.useRef(data.length);
  React.useEffect(() => {
    if (prevDataLength.current !== data.length) {
      setVisibleItemCount(itemsPerBatch);
      prevDataLength.current = data.length;
    }
  }, [data.length, itemsPerBatch]);

  // Memoized scroll handler
  const handleScroll = useCallback(
    (event: any) => {
      if (!enableVirtualization) return;

      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent || {};
      if (!layoutMeasurement || !contentOffset || !contentSize) return;

      const paddingToBottom = loadMoreThreshold;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

      if (isCloseToBottom && visibleItemCount < data.length) {
        handleLoadMore();
      }
    },
    [enableVirtualization, loadMoreThreshold, visibleItemCount, data.length, handleLoadMore]
  );

  // Memoize rows for performance
  const rows = useMemo(() => {
    const result: NFTData[][] = [];
    for (let i = 0; i < visibleData.length; i += columns) {
      result.push(visibleData.slice(i, i + columns));
    }
    return result;
  }, [visibleData, columns]);

  // Show loading indicator at bottom when loading more
  const shouldShowLoadMoreIndicator = useMemo(() => {
    return (
      enableVirtualization && visibleItemCount < data.length && visibleItemCount > itemsPerBatch
    );
  }, [enableVirtualization, visibleItemCount, data.length, itemsPerBatch]);

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
        <YStack height="$2" width="$46" position="relative" bg="$grayBg1" overflow="hidden">
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
        <Button variant="outline" onPress={onClearSearch}>
          {clearSearchText}
        </Button>
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

  // Main grid content with ScrollView
  return (
    <ScrollView
      flex={1}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={true}
    >
      <YStack gap="$4" pb="$4" px="$0">
        {rows.map((row, rowIndex) => (
          <XStack key={`row-${rowIndex}`} gap="$4" justify="space-between" width="100%" px="$0">
            {row.map((nft, nftIndex) => (
              <YStack
                key={nft.id}
                flex={1}
                maxWidth="calc(50% - 8px)"
                mr={nftIndex === 0 ? '$2' : '$0'}
                ml={nftIndex === 1 ? '$2' : '$0'}
              >
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
            {/* Fill empty space if row has only one item */}
            {row.length === 1 && <YStack flex={1} maxWidth="calc(50% - 8px)" ml="$2" />}
          </XStack>
        ))}

        {/* Load more indicator */}
        {shouldShowLoadMoreIndicator && (
          <YStack py="$4" items="center" justify="center">
            <Skeleton width="50%" height="$4" borderRadius="$2" animated />
            <Skeleton width="30%" height="$3" borderRadius="$2" animated mt="$2" />
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
