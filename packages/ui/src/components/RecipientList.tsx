import React from 'react';
import { ScrollView, YStack, XStack, Text, useThemeName } from 'tamagui';

import { RecipientItem, type RecipientItemProps } from './RecipientItem';
import { RefreshView } from './RefreshView';
import { Skeleton } from '../foundation/Skeleton';

export interface RecipientData extends Omit<RecipientItemProps, 'onPress' | 'onEdit' | 'onCopy'> {
  id: string;
}

export interface RecipientSection {
  title?: string;
  data: RecipientData[];
}

export interface RecipientListProps {
  // Data
  sections?: RecipientSection[];
  data?: RecipientData[];

  // Loading states
  isLoading?: boolean;
  isRefreshing?: boolean;

  // Empty states
  emptyTitle?: string;
  emptyMessage?: string;

  // Error states
  error?: string;
  retryButtonText?: string;
  errorDefaultMessage?: string;

  // Callbacks
  onItemPress?: (item: RecipientData) => void;
  onItemEdit?: (item: RecipientData) => void;
  onItemCopy?: (item: RecipientData) => void;
  onItemAddToAddressBook?: (item: RecipientData) => void;
  onRefresh?: () => void;
  onRetry?: () => void;

  // Display options
  showSeparators?: boolean;
  showSectionHeaders?: boolean;
  itemSpacing?: number;
  sectionSpacing?: number;

  // Style
  contentPadding?: number;
}

export function RecipientList({
  sections,
  data,
  isLoading = false,
  isRefreshing = false,
  emptyTitle,
  emptyMessage,
  error,
  retryButtonText = 'Retry',
  errorDefaultMessage = 'Failed to load recipients',
  onItemPress,
  onItemEdit,
  onItemCopy,
  onItemAddToAddressBook,
  onRefresh,
  onRetry,
  showSeparators = true,
  showSectionHeaders = true,
  itemSpacing = 8,
  sectionSpacing = 16,
  contentPadding = 16,
}: RecipientListProps) {
  const themeName = useThemeName();

  // Use Tamagui's built-in theme detection
  const isDarkMode = themeName?.includes('dark') || false;
  const dividerColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Normalize data - either use sections or create a single section from data
  const normalizedSections = sections || (data ? [{ data }] : []);

  // Calculate total items for loading state
  const totalItems = normalizedSections.reduce((sum, section) => sum + section.data.length, 0);

  // Loading skeleton
  const renderSkeleton = () => (
    <YStack gap={itemSpacing} p={contentPadding}>
      {Array.from({ length: 8 }).map((_, index) => (
        <YStack key={`skeleton-${index}`} p="$3">
          <XStack items="center" gap="$3">
            <Skeleton width="$4" height="$4" borderRadius="$10" />
            <YStack flex={1} gap="$2">
              <Skeleton height="$1" width="60%" />
              <Skeleton height="$0.75" width="40%" />
            </YStack>
            <Skeleton width="$1" height="$1" borderRadius="$2" />
          </XStack>
        </YStack>
      ))}
    </YStack>
  );

  // Empty state
  const renderEmpty = () => <RefreshView type="empty" title={emptyTitle} message={emptyMessage} />;

  // Error state
  const renderError = () => (
    <RefreshView
      type="error"
      message={error || errorDefaultMessage}
      onRefresh={onRetry}
      refreshText={retryButtonText}
    />
  );

  // Render individual item
  const renderItem = (item: RecipientData) => (
    <RecipientItem
      key={item.id}
      {...item}
      onPress={() => onItemPress?.(item)}
      onEdit={() => onItemEdit?.(item)}
      onCopy={() => onItemCopy?.(item)}
      onAddToAddressBook={() => onItemAddToAddressBook?.(item)}
    />
  );

  // Render section
  const renderSection = (section: RecipientSection, sectionIndex: number) => (
    <YStack
      key={`section-${sectionIndex}`}
      gap={itemSpacing}
      mb={sectionIndex < normalizedSections.length - 1 ? sectionSpacing : 0}
    >
      {/* Section Header */}
      {showSectionHeaders && section.title && (
        <YStack mb="$2">
          <Text fontSize="$3" fontWeight="600" color="$textSecondary" mb="$1">
            {section.title}
          </Text>
          {showSeparators && (
            <YStack mt={'$2'} mb={'$2'} height={1} bg={dividerColor} w="100%" ml={0} />
          )}
        </YStack>
      )}

      {/* Section Items */}
      {section.data.map((item, itemIndex) => (
        <YStack key={item.id}>
          {renderItem(item)}
          {showSeparators && (
            <YStack mt={'$2'} mb={'$2'} height={1} bg={dividerColor} w="100%" ml={0} />
          )}
        </YStack>
      ))}
    </YStack>
  );

  // Show loading skeleton
  if (isLoading && !isRefreshing) {
    return renderSkeleton();
  }

  // Show error state
  if (error && !isRefreshing) {
    return renderError();
  }

  // Show empty state
  if (totalItems === 0 && !isLoading && !isRefreshing) {
    return renderEmpty();
  }

  // Main content
  return (
    <ScrollView flex={1} showsVerticalScrollIndicator={false}>
      <YStack p={contentPadding}>{normalizedSections.map(renderSection)}</YStack>
    </ScrollView>
  );
}
