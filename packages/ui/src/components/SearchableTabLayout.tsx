import { Scan } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, Button, useThemeName } from 'tamagui';

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
  // Make content area full-bleed (cancel page horizontal padding)
  contentFullBleed?: boolean;
  // Horizontal padding for header/search/tabs area
  headerPaddingHorizontal?: number | string;
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
  contentFullBleed = false,
  headerPaddingHorizontal = '$4',
}: SearchableTabLayoutProps) {
  const themeName = useThemeName();

  // Use Tamagui's built-in theme detection
  const isDarkMode = themeName?.includes('dark') || false;
  const iconColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
  return (
    <YStack flex={1}>
      {/* Search Box */}
      <YStack mb={searchSpacing} px={headerPaddingHorizontal as any}>
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
              <Scan size={24} color={iconColor} theme="outline" />
            </Button>
          )}
        </XStack>
      </YStack>

      {/* Tabs */}
      {tabSegments.length > 0 ? (
        <YStack mb={tabSpacing} px={headerPaddingHorizontal as any}>
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
      <YStack flex={1} mx={contentFullBleed ? ('$-4' as any) : 0}>
        {children}
      </YStack>
    </YStack>
  );
}
