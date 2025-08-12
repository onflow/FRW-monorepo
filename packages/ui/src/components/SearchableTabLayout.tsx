import React from 'react';
import { YStack } from 'tamagui';

import { AddressSearchBox } from './AddressSearchBox';
import { SegmentedControl } from '../foundation/SegmentedControl';
import { BackgroundWrapper } from '../layout/BackgroundWrapper';

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
  contentPadding?: number;
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
  contentPadding = 16,
  backgroundColor = '$background',
}: SearchableTabLayoutProps) {
  return (
    <BackgroundWrapper backgroundColor={backgroundColor}>
      <YStack flex={1} px={contentPadding} pt="$2">
        {/* Search Box */}
        <YStack mb={searchSpacing}>
          <AddressSearchBox
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            showScanButton={showScanButton}
            onScanPress={onScanPress}
          />
        </YStack>

        {/* Tabs */}
        <YStack mb={tabSpacing}>
          <SegmentedControl
            segments={tabSegments}
            value={activeTab}
            onChange={onTabChange}
            fullWidth={fullWidthTabs}
          />
        </YStack>

        {/* Content */}
        <YStack flex={1}>{children}</YStack>
      </YStack>
    </BackgroundWrapper>
  );
}
