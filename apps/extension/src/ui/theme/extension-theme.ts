// Extension theme configuration - uses package colors with extension-specific sizing

// Extension-specific size system with smaller values
export const extensionSize = {
  $0: 0,
  '$0.25': 2,
  '$0.5': 4,
  '$0.75': 6,
  $1: 8, // Reduced from 20 to 8
  '$1.5': 12, // Reduced from 24 to 12
  $2: 16, // Reduced from 28 to 16
  '$2.5': 20, // Reduced from 32 to 20
  $3: 24, // Reduced from 36 to 24
  '$3.5': 28, // Reduced from 40 to 28
  $4: 32, // Reduced from 44 to 32
  $true: 32, // Reduced from 44 to 32
  '$4.5': 36, // Reduced from 48 to 36
  $5: 40, // Reduced from 52 to 40
  $6: 48, // Reduced from 64 to 48
  $7: 56, // Reduced from 74 to 56
  $8: 64, // Reduced from 84 to 64
  $9: 72, // Reduced from 94 to 72
  $10: 80, // Reduced from 104 to 80
  $11: 88, // Reduced from 124 to 88
  $12: 96, // Reduced from 144 to 96
  $13: 104, // Reduced from 164 to 104
  $14: 112, // Reduced from 184 to 112
  $15: 120, // Reduced from 204 to 120
  $16: 128, // Reduced from 224 to 128
  $17: 136, // Reduced from 224 to 136
  $18: 144, // Reduced from 244 to 144
  $19: 152, // Reduced from 264 to 152
  $20: 160, // Reduced from 284 to 160
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

// Z-index system (same as mobile)
export const extensionZIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
};

// Radius system (smaller values for extension)
export const extensionRadius = {
  0: 0,
  1: 2, // Reduced from 3 to 2
  2: 4, // Reduced from 5 to 4
  3: 6, // Reduced from 7 to 6
  4: 8, // Reduced from 9 to 8
  true: 8, // Reduced from 9 to 8
  5: 10, // Same
  6: 12, // Reduced from 16 to 12
  7: 14, // Reduced from 19 to 14
  8: 16, // Reduced from 22 to 16
  9: 18, // Reduced from 26 to 18
  10: 20, // Reduced from 34 to 20
  11: 24, // Reduced from 42 to 24
  12: 28, // Reduced from 50 to 28
};

// No longer needed - using package themes directly
// Extension only customizes sizing, not colors or themes
