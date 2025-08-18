/**
 * Platform abstraction interfaces for screen package
 */

// Platform bridge interface - for screen-specific functionality
export interface PlatformBridge {
  getSelectedAddress(): string | null;
  getNetwork(): string;
  getCoins?(): any[] | null;
}

// Theme interface
export interface ThemeContext {
  isDark: boolean;
}

// Tab types
export type TabType = 'Tokens' | 'NFTs';
