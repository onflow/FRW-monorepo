/**
 * Platform abstraction interfaces for screen package
 */

// Platform bridge interface
export interface PlatformBridge {
  getSelectedAddress(): string | null;
  getNetwork(): string;
  getCoins?(): any[] | null;
}

// Navigation interface
export interface NavigationProp {
  navigate(screen: string, params?: Record<string, unknown>): void;
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
  navigation: NavigationProp;
  bridge: PlatformBridge;
  t: TranslationFunction;
}

// Tab types
export type TabType = 'Tokens' | 'NFTs';
