import { createThemeBuilder } from '@tamagui/theme-builder';

// Flow Wallet Brand Colors (same as mobile but for extension)
const flowColors = {
  // Primary brand color
  primary: '#00EF8B', // Flow brand green
  primary20: 'rgba(0, 239, 139, 0.2)', // 20% opacity
  primary10: 'rgba(0, 239, 139, 0.1)', // 10% opacity

  // Light Mode surfaces
  surfaceLight1: '#FFFFFF', // 100% - primary background
  surfaceLight2: '#F2F2F7', // light mode cards/surfaces
  surfaceLight3: '#767676', // 50% - secondary surfaces
  surfaceLight4: '#000D07', // 25% - tertiary surfaces

  // Dark Mode surfaces
  surfaceDark1: '#000000', // 100% - primary background
  surfaceDark2: '#1A1A1A', // 100% - cards/surfaces
  surfaceDark3: '#FFFFFF', // 50% - secondary (inverted)
  surfaceDark4: '#AAAAB0', // 25% - tertiary surfaces

  // Text colors Light Mode
  textLight1: '#000000', // 100% - primary text
  textLight2: '#767676', // 100% - secondary text
  textLight3: '#000D07', // 10% - tertiary text

  // Text colors Dark Mode
  textDark1: '#FFFFFF', // 100% - primary text
  textDark2: '#B3B3B3', // 100% - secondary text
  textDark3: '#FFFFFF', // 10% - tertiary text

  // System colors
  success: '#12B76A', // Success green
  warning: '#FDB022', // Warning orange
  error: '#F04438', // Error red

  // System colors with transparency
  success10: 'rgba(18, 183, 106, 0.1)', // Success green 10%
  warning10: 'rgba(253, 176, 34, 0.1)', // Warning orange 10%
  error10: 'rgba(240, 68, 56, 0.1)', // Error red 10%

  // Essential grayscale
  white: '#ffffff',
  black: '#000000',

  // Light accent colors
  light80: 'rgba(255, 255, 255, 0.8)', // 80% white
  light40: 'rgba(255, 255, 255, 0.4)', // 40% white
  light25: 'rgba(255, 255, 255, 0.25)', // 25% white
  light10: 'rgba(255, 255, 255, 0.1)', // 10% white
  light5: 'rgba(255, 255, 255, 0.05)', // 5% white

  // Dark accent colors
  dark80: 'rgba(0, 0, 0, 0.8)', // 80% black
  dark40: 'rgba(0, 0, 0, 0.4)', // 40% black
  dark25: 'rgba(0, 0, 0, 0.25)', // 25% black
  dark10: 'rgba(0, 0, 0, 0.1)', // 10% black

  // Shadow colors for light mode
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowLightHover: 'rgba(0, 0, 0, 0.15)',
  shadowLightPress: 'rgba(0, 0, 0, 0.2)',
  shadowLightFocus: 'rgba(0, 239, 139, 0.3)',

  // Shadow colors for dark mode
  shadowDark: 'rgba(0, 0, 0, 0.3)',
  shadowDarkHover: 'rgba(0, 0, 0, 0.4)',
  shadowDarkPress: 'rgba(0, 0, 0, 0.5)',
  shadowDarkFocus: 'rgba(0, 239, 139, 0.3)',
};

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

// Create extension themes using createThemeBuilder
const extensionThemesBuilder = createThemeBuilder()
  // Add palettes - same as mobile
  .addPalettes({
    light: [
      flowColors.surfaceLight1, // 0 - lightest background
      flowColors.surfaceLight2, // 1 - light background
      flowColors.surfaceLight3, // 2 - medium background
      flowColors.surfaceLight4, // 3 - dark background
      flowColors.textLight3, // 4 - light text
      flowColors.textLight2, // 5 - medium text
      flowColors.textLight1, // 6 - darkest text
    ],
    dark: [
      flowColors.surfaceDark1, // 0 - darkest background
      flowColors.surfaceDark2, // 1 - dark background
      flowColors.surfaceDark4, // 2 - medium background
      flowColors.surfaceDark3, // 3 - light background (inverted)
      flowColors.textDark2, // 4 - dim text
      flowColors.textDark3, // 5 - medium text
      flowColors.textDark1, // 6 - brightest text
    ],
  })
  // Add templates - same theme structure as mobile
  .addTemplates({
    base: {
      // Background colors
      background: 0,
      backgroundHover: 1,
      backgroundPress: 2,
      backgroundFocus: flowColors.primary10,
      backgroundStrong: 1,
      backgroundTransparent: 'transparent',

      // Surface colors
      surface1: 0,
      surface2: 1,
      surface3: 2,
      surface4: 3,

      // Surface shortcuts
      bg: 0,
      bg2: 1,
      bg3: 2,
      bg4: 3,

      // Border colors
      borderColor: 2,
      borderColorHover: 3,
      borderColorPress: flowColors.primary,
      borderColorFocus: flowColors.primary,

      // Border shortcuts
      border: 2,
      borderHover: 3,
      borderFocus: flowColors.primary,

      // Text colors
      color: 6,
      colorHover: 6,
      colorPress: 6,
      colorFocus: 6,
      colorTransparent: 'transparent',

      // Text variations
      text1: 6,
      text2: 5,
      text3: 4,

      // Text shortcuts
      text: 6,
      textSecondary: 5,
      textTertiary: 4,
      textMuted: 5,

      // Interactive states
      placeholderColor: 5,
      placeholder: 5,
      outlineColor: flowColors.primary,
      outline: flowColors.primary,

      // Shadows
      shadowColor: flowColors.shadowLight,
      shadowColorHover: flowColors.shadowLightHover,
      shadowColorPress: flowColors.shadowLightPress,
      shadowColorFocus: flowColors.shadowLightFocus,
      shadow: flowColors.shadowLight,
      shadowHover: flowColors.shadowLightHover,
      shadowPress: flowColors.shadowLightPress,
      shadowFocus: flowColors.shadowLightFocus,

      // System colors
      successColor: flowColors.success,
      warningColor: flowColors.warning,
      errorColor: flowColors.error,
      success: flowColors.success,
      warning: flowColors.warning,
      error: flowColors.error,
      success10: flowColors.success10,
      warning10: flowColors.warning10,
      error10: flowColors.error10,

      // Primary colors
      primaryColor: flowColors.primary,
      primary20: flowColors.primary20,
      primary10: flowColors.primary10,
      primary: flowColors.primary,
      primaryLight: flowColors.primary10,
      primaryStrong: flowColors.primary,

      // Essential colors
      white: flowColors.white,
      black: flowColors.black,

      // Light accent shortcuts
      light80: flowColors.light80,
      light40: flowColors.light40,
      light25: flowColors.light25,
      light10: flowColors.light10,
      light5: flowColors.light5,

      // Dark accent shortcuts
      dark80: flowColors.dark80,
      dark40: flowColors.dark40,
      dark25: flowColors.dark25,
      dark10: flowColors.dark10,
    },
  })
  // Add themes
  .addThemes({
    light: {
      template: 'base',
      palette: 'light',
    },
    dark: {
      template: 'base',
      palette: 'dark',
      // Override dark-specific shadow colors
      shadowColor: flowColors.shadowDark,
      shadowColorHover: flowColors.shadowDarkHover,
      shadowColorPress: flowColors.shadowDarkPress,
      shadowColorFocus: flowColors.shadowDarkFocus,
      shadow: flowColors.shadowDark,
      shadowHover: flowColors.shadowDarkHover,
      shadowPress: flowColors.shadowDarkPress,
      shadowFocus: flowColors.shadowDarkFocus,
    },
  });

// Build and export the extension themes
export const extensionThemes = extensionThemesBuilder.build();

// Export color tokens for use in tamagui config
export const extensionColorTokens = {
  color: flowColors,
};

// Also export individual colors as tokens
export const flowColorTokens = flowColors;
