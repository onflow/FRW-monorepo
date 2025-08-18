// Extension-specific theme configuration - compact sizing for extension UI

import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

import { colorTokens, themes, zIndex } from '../theme';

// Extension-specific size system with smaller values for compact UI
export const extensionSize = {
  $0: 0,
  '$0.25': 1,
  '$0.5': 2,
  '$0.75': 3,
  $1: 4,
  '$1.5': 6,
  $2: 8,
  '$2.5': 10,
  $3: 12,
  '$3.5': 14,
  $4: 16,
  $true: 16,
  '$4.5': 18,
  $5: 20,
  $6: 24,
  $7: 28,
  $8: 32,
  $9: 36,
  $10: 40,
  $11: 44,
  $12: 48,
  $13: 52,
  $14: 56,
  $15: 60,
  $16: 64,
  $17: 68,
  $18: 72,
  $19: 76,
  $20: 80,
};

// Extension space system (includes negative values)
export const extensionSpace = {
  ...extensionSize,
  '$-0.25': -1,
  '$-0.5': -2,
  '$-0.75': -3,
  '$-1': -4,
  '$-1.5': -6,
  '$-2': -8,
  '$-2.5': -10,
  '$-3': -12,
  '$-3.5': -14,
  '$-4': -16,
  '$-4.5': -18,
  '$-5': -20,
  '$-6': -24,
  '$-7': -28,
  '$-8': -32,
  '$-9': -36,
  '$-10': -40,
  '$-11': -44,
  '$-12': -48,
  '$-13': -52,
  '$-14': -56,
  '$-15': -60,
  '$-16': -64,
  '$-17': -68,
  '$-18': -72,
  '$-19': -76,
  '$-20': -80,
};

// Radius system (smaller values for extension)
export const extensionRadius = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 14,
  true: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
};

// Create extension tamagui config
export const extensionTamaguiConfig = createTamagui({
  ...defaultConfig,
  // Use the same themes as mobile for consistent colors
  themes,
  tokens: {
    ...defaultConfig.tokens,
    // Use the same color tokens as mobile
    ...colorTokens,
    // Use extension-specific sizing tokens for compact UI
    size: extensionSize,
    space: extensionSpace,
    zIndex, // Same z-index system as mobile
    radius: extensionRadius,
  },
});

export type ExtensionTamaguiConfig = typeof extensionTamaguiConfig;

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends ExtensionTamaguiConfig {}
}
