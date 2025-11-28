import { createThemeBuilder } from '@tamagui/theme-builder';

// Flow Wallet Brand Colors (from Figma design system)
const flowColors = {
  // Primary brand colors (different for light and dark modes)
  primaryLight: '#00B877', // Flow brand green for light mode (same as primary)
  primaryDark: '#00EF8B', // Flow brand green for dark mode
  primary: '#00B877', // Default fallback (light mode) — alias of primaryLight

  // Light mode primary with opacity
  primaryLight20: 'rgba(0, 184, 119, 0.2)', // 20% opacity
  primaryLight10: 'rgba(0, 184, 119, 0.1)', // 10% opacity

  // Dark mode primary with opacity
  primaryDark20: 'rgba(0, 239, 139, 0.2)', // 20% opacity
  primaryDark10: 'rgba(0, 239, 139, 0.1)', // 10% opacity

  // Light Mode surfaces (from Figma)
  surfaceLight1: '#FFFFFF', // 100% - primary background — alias of white
  surfaceLight2: '#F2F2F7', // light mode cards/surfaces
  surfaceLight3: 'rgba(118, 118, 118, 0.5)', // 50% - secondary surfaces
  surfaceLight4: 'rgba(0, 13, 7, 0.25)', // 25% - tertiary surfaces

  // Dark Mode surfaces (from Figma)
  surfaceDark1: '#000000', // 100% - primary background
  surfaceDarkDrawer: '#121212',
  surfaceDark2: '#1A1A1A', // 100% - cards/surfaces
  surfaceDark3: 'rgba(255, 255, 255, 0.5)', // 50% - secondary (inverted)
  surfaceDark4: 'rgba(170, 170, 176, 0.25)', // 25% - tertiary surfaces
  surfaceDark5: '#2a2a2a', // 100% - tertiary surfaces

  // Text colors Light Mode (from Figma)
  textLight1: '#000000', // 100% - primary text
  textLight2: '#767676', // 100% - secondary text
  textLight3: 'rgba(0, 13, 7, 0.1)', // 10% - tertiary text
  textLight4: '#FFFFFF', // alias of white

  // Text colors Dark Mode (from Figma)
  textDark1: '#FFFFFF', // 100% - primary text — alias of white
  textDark2: '#B3B3B3', // 100% - secondary text
  textDark3: 'rgba(255, 255, 255, 0.1)', // 10% - tertiary text
  textDark4: '#000D07',

  // System colors (consistent across modes from Figma)
  success: '#12B76A', // Success green
  warning: '#FDB022', // Warning orange
  error: '#F04438', // Error red

  // System colors with transparency (10%)
  success10: 'rgba(18, 183, 106, 0.1)', // Success green 10%
  warning10: 'rgba(253, 176, 34, 0.1)', // Warning orange 10%
  error10: 'rgba(240, 68, 56, 0.1)', // Error red 10%

  // Accent colors
  accentEVM: '#627EEA', // EVM chip background color (COA - Cadence Owned Account)
  accentEOA: '#FF8A00', // EOA chip background color (Externally Owned Account)

  // Essential grayscale (minimal set)
  white: '#ffffff', // used by surfaceLight1, textLight4, textDark1
  black: '#000000', // also used as inverse bg in light mode

  // Light accent colors (for use with opacity in dark mode)
  light80: 'rgba(255, 255, 255, 0.8)', // 80% white
  light40: 'rgba(255, 255, 255, 0.4)', // 40% white
  light25: 'rgba(255, 255, 255, 0.25)', // 25% white
  light10: 'rgba(255, 255, 255, 0.1)', // 10% white — same value used by darkBg1 and darkBorder1
  light15: 'rgba(255, 255, 255, 0.15)', // 15% white
  light50: 'rgba(255, 255, 255, 0.5)', // 50% white
  light5: 'rgba(255, 255, 255, 0.05)', // 5% white

  lightBg1: 'rgba(242, 242, 247, 1)',

  lightBorder1: 'rgba(0, 0, 0, 0.1)',
  // Dark accent colors (for use with opacity in light mode)
  dark80: 'rgba(0, 0, 0, 0.8)', // 80% black
  dark40: 'rgba(0, 0, 0, 0.4)', // 40% black
  dark25: 'rgba(0, 0, 0, 0.25)', // 25% black
  dark10: 'rgba(0, 0, 0, 0.1)', // 10% black — same value as lightBorder1 and shadowLight
  dark5: 'rgba(0, 0, 0, 0.05)', // 5% black

  darkBg1: 'rgba(255, 255, 255, 0.1)',
  grayBg1: '#373737',

  darkBorder1: 'rgba(255, 255, 255, 0.1)',
  light35: 'rgba(255, 255, 255, 0.35)', // 35% white

  // Shadow colors for light mode
  shadowLight: 'rgba(0, 0, 0, 0.1)', // alias of dark10 / lightBorder1
  shadowLightHover: 'rgba(0, 0, 0, 0.15)',
  shadowLightPress: 'rgba(0, 0, 0, 0.2)',
  shadowLightFocus: 'rgba(0, 184, 119, 0.3)', // same value as shadowDarkFocus

  // Shadow colors for dark mode
  shadowDark: 'rgba(0, 0, 0, 0.3)',
  shadowDarkHover: 'rgba(0, 0, 0, 0.4)', // alias of dark40
  shadowDarkPress: 'rgba(0, 0, 0, 0.5)',
  shadowDarkFocus: 'rgba(0, 184, 119, 0.3)',
};

// Centralized palette pairs by index to avoid per-theme overrides.
// Array index corresponds to the template index mapping below. Keep order stable.
type PalettePair = { light: string; dark: string };
const palettePairs: PalettePair[] = [
  // 0 - main background
  { light: flowColors.surfaceLight1, dark: flowColors.surfaceDark1 },
  // 1 - background (hover/secondary)
  { light: flowColors.surfaceLight2, dark: flowColors.surfaceDark2 },
  // 2 - background (press/tertiary)
  { light: flowColors.surfaceLight3, dark: flowColors.surfaceDark4 },
  // 3 - background (quaternary/inverted)
  { light: flowColors.surfaceLight4, dark: flowColors.surfaceDark3 },
  // 4 - text (tertiary)
  { light: flowColors.textLight3, dark: flowColors.textDark3 },
  // 5 - text (secondary)
  { light: flowColors.textLight2, dark: flowColors.textDark2 },
  // 6 - text (primary)
  { light: flowColors.textLight1, dark: flowColors.textDark1 },
  // 7 - alt background
  { light: flowColors.lightBg1, dark: flowColors.darkBg1 },
  // 8 - border
  { light: flowColors.lightBorder1, dark: flowColors.darkBorder1 },
  // 9 - text (quaternary)
  { light: flowColors.textLight4, dark: flowColors.textDark4 },
  // 10 - drawer background
  { light: flowColors.surfaceLight1, dark: flowColors.surfaceDarkDrawer },
  // 11 - inverse background
  { light: flowColors.black, dark: flowColors.white },
  // 12 - inverse text
  { light: flowColors.white, dark: flowColors.black },
  // 13 - subtle background (5%)
  { light: flowColors.dark5, dark: flowColors.light5 },
  // 14 - subtle background (10%)
  { light: flowColors.dark10, dark: flowColors.light10 },
  // 15 - primary
  { light: flowColors.primaryLight, dark: flowColors.primaryDark },
  // 16 - primary 20%
  { light: flowColors.primaryLight20, dark: flowColors.primaryDark20 },
  // 17 - primary 10% / primaryLight
  { light: flowColors.primaryLight10, dark: flowColors.primaryDark10 },
  // 18 - shadow
  { light: flowColors.shadowLight, dark: flowColors.shadowDark },
  // 19 - shadow (hover)
  { light: flowColors.shadowLightHover, dark: flowColors.shadowDarkHover },
  // 20 - shadow (press)
  { light: flowColors.shadowLightPress, dark: flowColors.shadowDarkPress },
  // 21 - shadow (focus)
  { light: flowColors.shadowLightFocus, dark: flowColors.shadowDarkFocus },
  // 22 - bgGlass (glassmorphic background)
  { light: flowColors.dark5, dark: flowColors.light10 },
  // 23 - borderGlass (glassmorphic border)
  { light: flowColors.dark10, dark: flowColors.light15 },
  // 24 - iconGlass (glassmorphic icon)
  { light: flowColors.dark40, dark: flowColors.light50 },
];

// Size system
export const size = {
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
  '$4.25': 17, // For lineHeight in onboarding components
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
  $21: 30, // Special size for larger onboarding text (30px)
  $31: 124,
  $32: 128,
  $33: 132,
  $34: 136,
  $35: 140,
  $36: 144,
  $37: 148,
  $38: 152,
  $39: 156,
  $40: 160,
  $41: 164,
  $42: 168,
  $43: 172,
  $44: 176,
  $45: 180,
  $46: 184,
  $47: 188,
  $48: 192,
  $49: 196,
  $50: 200,
  $51: 204,
  $52: 208,
  $53: 212,
  $54: 216,
  $55: 220,
  $56: 224,
  $57: 228,
  $58: 232,
  $59: 236,
  $60: 240,
  $61: 244,
  $62: 248,
  '$84.75': 339, // For AccountCreationLoadingState progress section width
};

// Space system (includes negative values)
export const space = {
  ...size,
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

// Z-index system
export const zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
};

// Radius system
export const radius = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 14,
  true: 16,
  5: 20,
  6: 24,
  '6.75': 27,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  13: 54, // For BackupOptionCard recommended badge
};

// Create themes using createThemeBuilder
const themesBuilder = createThemeBuilder()
  // Add palettes - these define the color gradients from background to foreground
  .addPalettes({
    // Light palette from centralized pairs
    light: palettePairs.map((p) => p.light),
    // Dark palette from centralized pairs
    dark: palettePairs.map((p) => p.dark),
  })
  // Add templates - these map palette indices to theme property names
  .addTemplates({
    base: {
      // Background colors
      background: 0, // Use palette[0] for main background
      backgroundHover: 1, // Use palette[1] for hover states
      backgroundPress: 2, // Use palette[2] for press states
      backgroundFocus: 17, // use primary10 index per theme
      backgroundStrong: 1, // Use palette[1] for strong backgrounds
      background4: 4,
      backgroundTransparent: 'transparent',

      // Surface colors - long names
      surface1: 0,
      surface2: 1,
      surface3: 2,
      surface4: 3,

      // Surface colors - shortcuts like Tailwind
      bg: 0, // $bg - primary background
      bg1: 7,
      bg2: 1, // $bg2 - secondary background
      bg3: 2, // $bg3 - tertiary background
      bg4: 3, // $bg4 - quaternary background
      bg5: 11, // $bg5 - quintary background
      bgDrawer: 10, // $bgDrawer - drawer background (maps to surfaceDarkDrawer #121212 in dark mode)

      // Border colors - long names
      border1: 8,
      borderColor: 2,
      borderColorHover: 3,
      borderColorPress: flowColors.primary,
      borderColorFocus: flowColors.primary,

      // Border colors - shortcuts
      border: 2, // $border
      borderHover: 3, // $borderHover
      borderFocus: flowColors.primary, // $borderFocus

      // Text colors - long names
      color: 6, // Use palette[6] for primary text
      colorHover: 6,
      colorPress: 6,
      colorFocus: 6,
      colorTransparent: 'transparent',

      // Text variations - numbered
      text1: 6, // primary text
      text2: 5, // secondary text
      text3: 4, // tertiary text
      text4: 9, // quaternary text

      // Text shortcuts - semantic names like Tailwind
      text: 6, // $text - primary text
      textSecondary: 5, // $textSecondary
      textTertiary: 4, // $textTertiary
      textMuted: 5, // $textMuted

      // Interactive states
      placeholderColor: 5,
      placeholder: 5, // $placeholder shortcut
      outlineColor: flowColors.primary,
      outline: flowColors.primary, // $outline shortcut

      // Shadows via palette indices
      shadowColor: 18,
      shadowColorHover: 19,
      shadowColorPress: 20,
      shadowColorFocus: 21,
      // Shadow shortcuts
      shadow: 18, // $shadow
      shadowHover: 19, // $shadowHover
      shadowPress: 20, // $shadowPress
      shadowFocus: 21, // $shadowFocus

      // System colors - long names
      successColor: flowColors.success,
      warningColor: flowColors.warning,
      errorColor: flowColors.error,

      // System colors - shortcuts
      success: flowColors.success, // $success
      warning: flowColors.warning, // $warning
      error: flowColors.error, // $error
      success10: flowColors.success10, // $success10 (10% transparency)
      warning10: flowColors.warning10, // $warning10 (10% transparency)
      error10: flowColors.error10, // $error10 (10% transparency)

      // Primary colors via palette indices
      primaryColor: 15,
      primary20: 16,
      primary10: 17,

      // Primary colors - shortcuts
      primary: 15, // $primary
      primaryLight: 17, // $primaryLight (10%)
      primaryStrong: 15, // $primaryStrong

      // Essential grayscale colors
      white: flowColors.white,
      black: flowColors.black,

      // Accent colors
      accentEVM: flowColors.accentEVM, // $accentEVM
      accentEOA: flowColors.accentEOA, // $accentEOA

      // Light accent shortcuts (for dark mode usage)
      light80: flowColors.light80, // $light80
      light40: flowColors.light40, // $light40
      light25: flowColors.light25, // $light25
      light10: flowColors.light10, // $light10
      light5: flowColors.light5, // $light5

      // Dark accent shortcuts (for light mode usage)
      dark80: flowColors.dark80, // $dark80
      dark40: flowColors.dark40, // $dark40
      dark25: flowColors.dark25, // $dark25
      dark10: flowColors.dark10, // $dark10
      dark5: flowColors.dark5, // $dark5

      // Theme-aware glassmorphic colors
      bgGlass: 22, // $bgGlass -> palette[22] (light: black 25%, dark: white 10%)
      borderGlass: 23, // $borderGlass -> palette[23] (light: black 10%, dark: white 35%)
      iconGlass: 24, // $iconGlass -> palette[24] (light: black 80%, dark: white 50%)

      // Theme-aware subtle backgrounds via palette indices
      subtleBg: 13, // $subtleBg -> palette[13] (light: black 5%, dark: white 5%)
      subtleBg10: 14, // $subtleBg10 -> palette[14] (light: black 10%, dark: white 10%)

      // Inverse button tokens (theme-aware via palette indexes)
      // Use text1 as bg (index 6): black in light, white in dark
      // Use background (index 0) as text: white in light, black in dark
      inverseBg: 11, // $inverseBg -> palette[11]
      inverseText: 12, // $inverseText -> palette[12]
    },
  })
  // Add specific themes that use the templates and palettes
  .addThemes({
    light: {
      template: 'base',
      palette: 'light',
    },
    dark: {
      template: 'base',
      palette: 'dark',
    },
  });

// Build and export the themes
export const themes = themesBuilder.build();

// For backward compatibility - export individual themes
export const lightTheme = themes.light;
export const darkTheme = themes.dark;

// Export color tokens for use in tamagui config
export const colorTokens = {
  color: flowColors,
};

// Also export individual colors as tokens for direct use
export const flowColorTokens = flowColors;
