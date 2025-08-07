/**
 * Cross-platform RefreshControl component
 * Uses native RefreshControl on React Native, custom implementation on Web/Extension
 */

import { type ReactNode } from 'react';

import { Platform } from './Platform';

interface RefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  tintColor?: string;
}

export function RefreshControl({
  refreshing,
  onRefresh,
  tintColor,
}: RefreshControlProps): ReactNode {
  if (Platform.isReactNative) {
    try {
      const { RefreshControl: RNRefreshControl } = require('react-native');
      return (
        <RNRefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />
      );
    } catch {
      // React Native RefreshControl not available
    }
  }

  // For web/extension, we handle refresh in the ScrollView component
  return null;
}

// Hook for pull-to-refresh functionality on web
export function usePullToRefresh(
  onRefresh: () => void,
  refreshing: boolean
): { onRefresh: () => void; refreshing: boolean } {
  if (Platform.isWeb || Platform.isExtension) {
    // Web implementation could use touch events for pull-to-refresh
    // For now, we'll rely on manual refresh buttons
    return {
      onRefresh,
      refreshing,
    };
  }

  return {
    onRefresh,
    refreshing,
  };
}
