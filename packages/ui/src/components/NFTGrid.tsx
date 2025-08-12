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
  columns?: number;
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
  columns = 2,
  gap = 12,
  aspectRatio = 1,
}: NFTGridProps) {
  // Loading skeleton
  const renderSkeleton = () => (
    <XStack flexWrap="wrap" gap={gap}>
      {Array.from({ length: 6 }).map((_, index) => (
        <YStack key={`skeleton-${index}`} width={`${(100 - (columns - 1) * gap * 2) / columns}%`}>
          <YStack bg="$bg2" rounded="$4" p="$3">
            <Skeleton
              width="100%"
              height="auto"
              aspectRatio={aspectRatio}
              borderRadius="$3"
              mb="$3"
            />
            <Skeleton height="$1" width="80%" mb="$2" />
            <Skeleton height="$0.75" width="60%" />
          </YStack>
        </YStack>
      ))}
    </XStack>
  );

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

  // Main grid content
  return (
    <XStack flexWrap="wrap" gap={gap} justifyContent="space-between">
      {data.map((nft) => (
        <YStack
          key={nft.id}
          width={`${(100 - (columns - 1) * gap * 2) / columns}%`}
          maxWidth={`${(100 - (columns - 1) * gap * 2) / columns}%`}
        >
          <NFTCard
            nft={nft}
            selected={selectedIds.includes(nft.id)}
            onPress={() => onNFTPress?.(nft)}
            onSelect={() => onNFTSelect?.(nft.id)}
            showAmount={!!nft.amount}
            aspectRatio={aspectRatio}
          />
        </YStack>
      ))}
    </XStack>
  );
}
