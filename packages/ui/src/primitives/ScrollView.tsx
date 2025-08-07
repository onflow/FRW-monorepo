/**
 * Cross-platform ScrollView component
 * Uses native ScrollView on React Native, regular div with scroll on Web/Extension
 */

import React, { type ReactNode } from 'react';
import { YStack } from 'tamagui';

import { Platform } from './Platform';

interface ScrollViewProps {
  children: ReactNode;
  style?: Record<string, unknown>;
  refreshControl?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ScrollView({
  children,
  style,
  refreshControl,
  onRefresh: _onRefresh,
  refreshing,
}: ScrollViewProps): React.ReactElement {
  if (Platform.isReactNative) {
    // Use React Native ScrollView
    try {
      const { ScrollView: RNScrollView } = require('react-native');
      return (
        <RNScrollView style={[{ flex: 1 }, style]} refreshControl={refreshControl}>
          {children}
        </RNScrollView>
      );
    } catch {
      // React Native ScrollView not available, falling back to web version
    }
  }

  // Web/Extension fallback - use div with scroll
  return (
    <YStack
      flex={1}
      overflow="auto"
      style={{
        WebkitOverflowScrolling: 'touch',
        ...style,
      }}
    >
      {/* Web refresh indicator */}
      {refreshing && Platform.isWeb && (
        <YStack padding="$2" alignItems="center">
          <div
            style={{
              width: 20,
              height: 20,
              border: '2px solid #ddd',
              borderTop: '2px solid #666',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </YStack>
      )}
      {children}
    </YStack>
  );
}
