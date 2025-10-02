import { createThemeBuilder } from '@tamagui/theme-builder';

// Flow Wallet Brand Colors (from Figma design system)
const flowColors = {
  // Primary brand colors (different for light and dark modes)
  primaryLight: '#00B877', // Flow brand green for light mode
  primaryDark: '#00EF8B', // Flow brand green for dark mode
  primary: '#00B877', // Default fallback (light mode)

  // Light mode primary with opacity
  primaryLight20: 'rgba(0, 184, 119, 0.2)', // 20% opacity
  primaryLight10: 'rgba(0, 184, 119, 0.1)', // 10% opacity

  // Dark mode primary with opacity
  primaryDark20: 'rgba(0, 239, 139, 0.2)', // 20% opacity
  primaryDark10: 'rgba(0, 239, 139, 0.1)', // 10% opacity

  // Light Mode surfaces (from Figma)
  surfaceLight1: '#FFFFFF', // 100% - primary background
  surfaceLight2: '#F2F2F7', // light mode cards/surfaces
  surfaceLight3: 'rgba(118, 118, 118, 0.5)', // 50% - secondary surfaces
  surfaceLight4: 'rgba(0, 13, 7, 0.25)', // 25% - tertiary surfaces

  // Dark Mode surfaces (from Figma)
  surfaceDark1: '#000000', // 100% - primary background
  surfaceDarkDrawer: '#121212',
  surfaceDark2: '#1A1A1A', // 100% - cards/surfaces
  surfaceDark3: 'rgba(255, 255, 255, 0.5)', // 50% - secondary (inverted)
  surfaceDark4: 'rgba(170, 170, 176, 0.25)', // 25% - tertiary surfaces

  // Text colors Light Mode (from Figma)
  textLight1: '#000000', // 100% - primary text
  textLight2: '#767676', // 100% - secondary text
  textLight3: 'rgba(0, 13, 7, 0.1)', // 10% - tertiary text
  textLight4: '#FFFFFF',

  // Text colors Dark Mode (from Figma)
  textDark1: '#FFFFFF', // 100% - primary text
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
  accentEVM: '#627EEA', // EVM chip background color

  // Essential grayscale (minimal set)
  white: '#ffffff',
  black: '#000000',

  // Light accent colors (for use with opacity in dark mode)
  light80: 'rgba(255, 255, 255, 0.8)', // 80% white
  light40: 'rgba(255, 255, 255, 0.4)', // 40% white
  light25: 'rgba(255, 255, 255, 0.25)', // 25% white
  light10: 'rgba(255, 255, 255, 0.1)', // 10% white
  light5: 'rgba(255, 255, 255, 0.05)', // 5% white

  lightBg1: 'rgba(242, 242, 247, 1)',

  lightBorder1: 'rgba(0, 0, 0, 0.1)',
  // Dark accent colors (for use with opacity in light mode)
  dark80: 'rgba(0, 0, 0, 0.8)', // 80% black
  dark40: 'rgba(0, 0, 0, 0.4)', // 40% black
  dark25: 'rgba(0, 0, 0, 0.25)', // 25% black
  dark10: 'rgba(0, 0, 0, 0.1)', // 10% black
  dark5: 'rgba(0, 0, 0, 0.05)', // 10% black

  darkBg1: 'rgba(255, 255, 255, 0.1)',
  grayBg1: '#373737',

  darkBorder1: 'rgba(255, 255, 255, 0.1)',

  // Separator colors for dividers
  separatorLight: 'rgba(0, 0, 0, 0.1)', // 10% black for light mode
  separatorDark: 'rgba(255, 255, 255, 0.1)', // 10% white for dark mode

  // Card background colors
  cardBgLight: '$bg2', // Uses the secondary background in light mode
  cardBgDark: '$light10', // 10% white for dark mode

  // Icon colors (high contrast)
  iconLight: 'rgba(0, 0, 0, 0.8)', // 80% black for light mode
  iconDark: 'rgba(255, 255, 255, 0.8)', // 80% white for dark mode

  // Avatar fallback colors (when no emoji info)
  avatarBgLight: 'rgba(0, 0, 0, 0.9)', // 90% black for light mode
  avatarBgDark: 'rgba(255, 255, 255, 0.25)', // 25% white for dark mode
  avatarTextLight: 'rgba(255, 255, 255, 0.9)', // 90% white text on dark bg
  avatarTextDark: 'rgba(0, 0, 0, 0.9)', // 90% black text on light bg

  // Shadow colors for light mode
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowLightHover: 'rgba(0, 0, 0, 0.15)',
  shadowLightPress: 'rgba(0, 0, 0, 0.2)',
  shadowLightFocus: 'rgba(0, 184, 119, 0.3)',

  // Shadow colors for dark mode
  shadowDark: 'rgba(0, 0, 0, 0.3)',
  shadowDarkHover: 'rgba(0, 0, 0, 0.4)',
  shadowDarkPress: 'rgba(0, 0, 0, 0.5)',
  shadowDarkFocus: 'rgba(0, 184, 119, 0.3)',
};

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
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
};

// Create themes using createThemeBuilder
const themesBuilder = createThemeBuilder()
  // Add palettes - these define the color gradients from background to foreground
  .addPalettes({
    // Light palette: light background to dark foreground
    light: [
      flowColors.surfaceLight1, // 0 - lightest background
      flowColors.surfaceLight2, // 1 - light background
      flowColors.surfaceLight3, // 2 - medium background
      flowColors.surfaceLight4, // 3 - dark background
      flowColors.textLight3, // 4 - light text
      flowColors.textLight2, // 5 - medium text
      flowColors.textLight1, // 6 - darkest text
      flowColors.lightBg1, // 7 - light background
      flowColors.lightBorder1, // 8 - light border
      flowColors.textLight4, // 9 - light text
      flowColors.surfaceLight1, // 10 - drawer background in light mode (same as main bg)
    ],
    // Dark palette: dark background to light foreground
    dark: [
      flowColors.surfaceDark1, // 0 - darkest background
      flowColors.surfaceDark2, // 1 - dark background
      flowColors.surfaceDark4, // 2 - medium background
      flowColors.surfaceDark3, // 3 - light background (inverted)
      flowColors.textDark3, // 4 - dim text
      flowColors.textDark2, // 5 - medium text
      flowColors.textDark1, // 6 - brightest text
      flowColors.darkBg1, // 7 - light background
      flowColors.darkBorder1, // 8 - dark border
      flowColors.textDark4, // 9 - dark text
      flowColors.surfaceDarkDrawer, // 10 - drawer background (#121212)
    ],
  })
  // Add templates - these map palette indices to theme property names
  .addTemplates({
    base: {
      // Background colors
      background: 0, // Use palette[0] for main background
      backgroundHover: 1, // Use palette[1] for hover states
      backgroundPress: 2, // Use palette[2] for press states
      backgroundFocus: flowColors.primaryLight10, // Custom focus color
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

      // Shadows - using theme-specific values
      shadowColor: flowColors.shadowLight,
      shadowColorHover: flowColors.shadowLightHover,
      shadowColorPress: flowColors.shadowLightPress,
      shadowColorFocus: flowColors.shadowLightFocus,
      // Shadow shortcuts
      shadow: flowColors.shadowLight, // $shadow
      shadowHover: flowColors.shadowLightHover, // $shadowHover
      shadowPress: flowColors.shadowLightPress, // $shadowPress
      shadowFocus: flowColors.shadowLightFocus, // $shadowFocus

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

      // Primary colors - long names
      primaryColor: flowColors.primaryLight, // Will be overridden per theme
      primary20: flowColors.primaryLight20, // Will be overridden per theme
      primary10: flowColors.primaryLight10, // Will be overridden per theme

      // Primary colors - shortcuts
      primary: flowColors.primaryLight, // $primary - will be overridden per theme
      primaryLight: flowColors.primaryLight10, // $primaryLight (10%) - will be overridden per theme
      primaryStrong: flowColors.primaryLight, // $primaryStrong - will be overridden per theme

      // Essential grayscale colors
      white: flowColors.white,
      black: flowColors.black,

      // Accent colors
      accentEVM: flowColors.accentEVM, // $accentEVM

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

      // Separator and card background tokens
      separator: 'rgba(0, 0, 0, 0.1)', // $separator - will be overridden per theme
      cardBg: 'rgba(0, 0, 0, 0.05)', // $cardBg - will be overridden per theme

      // Icon and avatar tokens
      icon: 'rgba(0, 0, 0, 0.8)', // $icon - will be overridden per theme
      avatarBg: 'rgba(0, 0, 0, 0.9)', // $avatarBg - will be overridden per theme
      avatarText: 'rgba(255, 255, 255, 0.9)', // $avatarText - will be overridden per theme
    },
  })
  // Add specific themes that use the templates and palettes
  .addThemes({
    light: {
      template: 'base',
      palette: 'light',
      // Light mode uses light primary colors
      primaryColor: flowColors.primaryLight,
      primary: flowColors.primaryLight,
      primaryStrong: flowColors.primaryLight,
      primary20: flowColors.primaryLight20,
      primary10: flowColors.primaryLight10,
      primaryLight: flowColors.primaryLight10,
      backgroundFocus: flowColors.primaryLight10,
      // Light mode separator and card background
      separator: '$dark10',
      cardBg: '$bg2',
      // Light mode icon and avatar
      icon: '$dark80',
      avatarBg: '$text',
      avatarText: '$white',
    },
    dark: {
      template: 'base',
      palette: 'dark',
      // Dark mode uses dark primary colors
      primaryColor: flowColors.primaryDark,
      primary: flowColors.primaryDark,
      primaryStrong: flowColors.primaryDark,
      primary20: flowColors.primaryDark20,
      primary10: flowColors.primaryDark10,
      primaryLight: flowColors.primaryDark10,
      backgroundFocus: flowColors.primaryDark10,
      // Dark mode separator and card background
      separator: '$light10',
      cardBg: '$light10',
      // Dark mode icon and avatar
      icon: '$light80',
      avatarBg: '$light25',
      avatarText: '$black',
      // Override dark-specific shadow colors
      shadowColor: flowColors.shadowDark,
      shadowColorHover: flowColors.shadowDarkHover,
      shadowColorPress: flowColors.shadowDarkPress,
      shadowColorFocus: flowColors.shadowDarkFocus,
      shadow: flowColors.shadowDark, // $shadow
      shadowHover: flowColors.shadowDarkHover, // $shadowHover
      shadowPress: flowColors.shadowDarkPress, // $shadowPress
      shadowFocus: flowColors.shadowDarkFocus, // $shadowFocus
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
