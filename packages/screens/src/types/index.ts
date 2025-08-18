/**
 * Platform abstraction interfaces for screen package
 */

// Platform bridge interface - for screen-specific functionality
export interface PlatformBridge {
  getSelectedAddress(): string | null;
  getNetwork(): string;
  getCoins?(): any[] | null;
}

// Translation interface
export interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

// Theme interface
export interface ThemeContext {
  isDark: boolean;
}

// Common screen props
export interface BaseScreenProps {
  bridge: PlatformBridge;
  t: TranslationFunction;
}

// Tab types
export type TabType = 'Tokens' | 'NFTs';
