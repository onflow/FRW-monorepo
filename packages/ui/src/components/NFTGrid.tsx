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
  contractType?: string; // 'ERC721' | 'ERC1155'
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
}: NFTGridProps) {
  const columns = 2;

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
      <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" textAlign="center">
        {emptyTitle || 'No NFTs Found'}
      </Text>

      <Text
        fontSize="$4"
        color="$textSecondary"
        mb="$8"
        textAlign="center"
        maxWidth="$24"
        lineHeight="$5"
      >
        {emptyMessage || 'No NFTs available in this collection.'}
      </Text>

      {showClearSearch && onClearSearch && (
        <Button
          variant="outlined"
          onPress={onClearSearch}
          bg="$bg2"
          borderColor="$borderColor"
          color="$color"
          px="$4"
          py="$3"
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
  const rows: NFTData[][] = [];
  for (let i = 0; i < data.length; i += columns) {
    rows.push(data.slice(i, i + columns));
  }
  let idx = -1;

  // Main grid content
  return (
    <YStack gap="$4">
      {rows.map((row, rowIndex) => (
        <XStack key={`row-${rowIndex}`} gap="$4" justify="flex-start" width="100%">
          {row.map((nft) => {
            idx = idx + 1;
            return (
              <YStack key={nft.id} width="50%" flex={0}>
                <NFTCard
                  idx={idx}
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
            );
          })}
        </XStack>
      ))}
    </YStack>
  );
}
