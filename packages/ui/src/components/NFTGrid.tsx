import React from 'react';
import { XStack, YStack, Text, Button } from 'tamagui';

import { NFTCard } from './NFTCard';
import { RefreshView } from './RefreshView';
import { Skeleton } from '../foundation/Skeleton';

export interface NFTData {
  id: string;
  name: string;
  image: string;
  thumbnail?: string;
  collection?: string;
  amount?: string | number;
}

export interface NFTGridProps {
  // Data
  data: NFTData[];
  selectedIds?: string[];

  // Loading states
  isLoading?: boolean;

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
  onNFTPress?: (nft: NFTData) => void;
  onRetry?: () => void;
  onClearSearch?: () => void;

  // Layout
  gap?: number;
  aspectRatio?: number;
}

export function NFTGrid({
  data,
  selectedIds = [],
  isLoading = false,
  emptyTitle,
  emptyMessage,
  showClearSearch = false,
  clearSearchText = 'Clear Search',
  error,
  retryText = 'Retry',
  onNFTSelect,
  onNFTPress,
  onRetry,
  onClearSearch,
  gap = 12,
  aspectRatio = 1,
}: NFTGridProps) {
  const columns = 2;

  // Loading skeleton - group into rows like the main content
  const renderSkeleton = () => {
    const skeletonRows = [];
    for (let i = 0; i < 6; i += columns) {
      const rowItems = Array.from({ length: Math.min(columns, 6 - i) }, (_, index) => (
        <YStack key={`skeleton-${i + index}`} gap={7}>
          <Skeleton width={164} height={164} borderRadius="$4" />
          <YStack gap={-3}>
            <Skeleton height={24} width="80%" mb="$2" />
            <Skeleton height={20} width="60%" />
          </YStack>
        </YStack>
      ));

      skeletonRows.push(
        <XStack key={`skeleton-row-${i}`} justify="space-between" width={343}>
          {rowItems}
        </XStack>
      );
    }

    return <YStack gap={25}>{skeletonRows}</YStack>;
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
    <YStack flex={1} justify="center" items="center" py="$8">
      <Text fontSize="$6" fontWeight="600" color="$color" mb="$2" textAlign="center">
        {emptyTitle || 'No NFTs Found'}
      </Text>

      <Text fontSize="$4" color="$textSecondary" mb="$6" textAlign="center" maxWidth={280}>
        {emptyMessage || 'No NFTs available in this collection.'}
      </Text>

      {showClearSearch && onClearSearch && (
        <Button
          variant="outlined"
          onPress={onClearSearch}
          bg="$bg2"
          borderColor="$borderColor"
          color="$color"
        >
          {clearSearchText}
        </Button>
      )}
    </YStack>
  );

  // Show loading skeleton
  if (isLoading) {
    return renderSkeleton();
  }

  // Show error state
  if (error) {
    return renderError();
  }

  // Show empty state
  if (data.length === 0) {
    return renderEmpty();
  }

  // Group NFTs into rows
  const rows = [];
  for (let i = 0; i < data.length; i += columns) {
    rows.push(data.slice(i, i + columns));
  }

  // Main grid content
  return (
    <YStack gap={25}>
      {rows.map((row, rowIndex) => (
        <XStack key={`row-${rowIndex}`} justify="space-between" width={343}>
          {row.map((nft) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              selected={selectedIds.includes(nft.id)}
              onPress={() => onNFTPress?.(nft)}
              onSelect={() => onNFTSelect?.(nft.id)}
              showAmount={!!nft.amount}
              aspectRatio={aspectRatio}
            />
          ))}
        </XStack>
      ))}
    </YStack>
  );
}
