// Extension-specific theme configuration - compact sizing for extension UI

import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

import { colorTokens, themes, zIndex } from '../theme';

// Extension-specific size system with smaller values for compact UI
export const extensionSize = {
  $0: 0,
  '$0.25': 2,
  '$0.5': 4,
  '$0.75': 6,
  $1: 8, // Reduced from mobile 20 to 8
  '$1.5': 12, // Reduced from mobile 24 to 12
  $2: 16, // Reduced from mobile 28 to 16
  '$2.5': 20, // Reduced from mobile 32 to 20
  $3: 24, // Reduced from mobile 36 to 24
  '$3.5': 28, // Reduced from mobile 40 to 28
  $4: 32, // Reduced from mobile 44 to 32
  $true: 32, // Reduced from mobile 44 to 32
  '$4.5': 36, // Reduced from mobile 48 to 36
  $5: 40, // Reduced from mobile 52 to 40
  $6: 48, // Reduced from mobile 64 to 48
  $7: 56, // Reduced from mobile 74 to 56
  $8: 64, // Reduced from mobile 84 to 64
  $9: 72, // Reduced from mobile 94 to 72
  $10: 80, // Reduced from mobile 104 to 80
  $11: 88, // Reduced from mobile 124 to 88
  $12: 96, // Reduced from mobile 144 to 96
  $13: 104, // Reduced from mobile 164 to 104
  $14: 112, // Reduced from mobile 184 to 112
  $15: 120, // Reduced from mobile 204 to 120
  $16: 128, // Reduced from mobile 224 to 128
  $17: 136, // Reduced from mobile 224 to 136
  $18: 144, // Reduced from mobile 244 to 144
  $19: 152, // Reduced from mobile 264 to 152
  $20: 160, // Reduced from mobile 284 to 160
};

// Extension space system (includes negative values)
export const extensionSpace = {
  ...extensionSize,
  '$-0.25': -2,
  '$-0.5': -4,
  '$-0.75': -6,
  '$-1': -8,
  '$-1.5': -12,
  '$-2': -16,
  '$-2.5': -20,
  '$-3': -24,
  '$-3.5': -28,
  '$-4': -32,
  '$-4.5': -36,
  '$-5': -40,
  '$-6': -48,
  '$-7': -56,
  '$-8': -64,
  '$-9': -72,
  '$-10': -80,
  '$-11': -88,
  '$-12': -96,
  '$-13': -104,
  '$-14': -112,
  '$-15': -120,
  '$-16': -128,
  '$-17': -136,
  '$-18': -144,
  '$-19': -152,
  '$-20': -160,
};

// Radius system (smaller values for extension)
export const extensionRadius = {
  0: 0,
  1: 2, // Reduced from mobile 3 to 2
  2: 4, // Reduced from mobile 5 to 4
  3: 6, // Reduced from mobile 7 to 6
  4: 8, // Reduced from mobile 9 to 8
  true: 8, // Reduced from mobile 9 to 8
  5: 10, // Same as mobile
  6: 12, // Reduced from mobile 16 to 12
  7: 14, // Reduced from mobile 19 to 14
  8: 16, // Reduced from mobile 22 to 16
  9: 18, // Reduced from mobile 26 to 18
  10: 20, // Reduced from mobile 34 to 20
  11: 24, // Reduced from mobile 42 to 24
  12: 28, // Reduced from mobile 50 to 28
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
