import { Scan } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, Button } from 'tamagui';

import { SearchBar } from './SearchBar';
import { SegmentedControl } from '../foundation/SegmentedControl';

export interface SearchableTabLayoutProps {
  // Header
  title?: string;
  showHeader?: boolean;

  // Search
  searchValue: string;
  searchPlaceholder?: string;
  showScanButton?: boolean;
  onSearchChange: (value: string) => void;
  onScanPress?: () => void;

  // Tabs
  tabSegments: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  fullWidthTabs?: boolean;

  // Content
  children: React.ReactNode;

  // Layout
  headerSpacing?: number;
  searchSpacing?: number;
  tabSpacing?: number;
  contentPadding?: number | string;
  backgroundColor?: string;
}

export function SearchableTabLayout({
  title,
  showHeader = true,
  searchValue,
  searchPlaceholder = 'Search...',
  showScanButton = false,
  onSearchChange,
  onScanPress,
  tabSegments,
  activeTab,
  onTabChange,
  fullWidthTabs = true,
  children,
  headerSpacing = 16,
  searchSpacing = 16,
  tabSpacing = 16,
  contentPadding = '$4',
  backgroundColor = '$background',
}: SearchableTabLayoutProps) {
  return (
    <YStack flex={1}>
      {/* Search Box */}
      <YStack mb={searchSpacing}>
        <XStack gap={17} items="center">
          <YStack flex={1}>
            <SearchBar
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder={searchPlaceholder}
              width="100%"
            />
          </YStack>

          {/* Scan Button */}
          {showScanButton && (
            <Button
              w={44}
              h={44}
              circular
              bg="transparent"
              borderWidth={0}
              onPress={onScanPress}
              pressStyle={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              hoverStyle={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              disabled={!onScanPress}
            >
              <Scan size={24} color="#FFFFFF" theme="outline" />
            </Button>
          )}
        </XStack>
      </YStack>

      {/* Tabs */}
      {tabSegments.length > 0 ? (
        <YStack mb={tabSpacing}>
          <SegmentedControl
            segments={tabSegments}
            value={activeTab}
            onChange={onTabChange}
            fullWidth={fullWidthTabs}
          />
        </YStack>
      ) : (
        ''
      )}

      {/* Content */}
      <YStack flex={1}>{children}</YStack>
    </YStack>
  );
}
