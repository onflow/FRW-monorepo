import { createTheme } from '@tamagui/core';

// Color palettes
const colors = {
  // Gray scale
  gray1: '#fcfcfc',
  gray2: '#f9f9f9',
  gray3: '#f0f0f0',
  gray4: '#e8e8e8',
  gray5: '#e0e0e0',
  gray6: '#d9d9d9',
  gray7: '#cecece',
  gray8: '#bbbbbb',
  gray9: '#8d8d8d',
  gray10: '#838383',
  gray11: '#646464',
  gray12: '#202020',

  // Blue scale
  blue1: '#fbfdff',
  blue2: '#f4faff',
  blue3: '#e6f4fe',
  blue4: '#d0e9ff',
  blue5: '#b2daff',
  blue6: '#8cc8ff',
  blue7: '#5eb0ef',
  blue8: '#0091ff',
  blue9: '#0588f0',
  blue10: '#0d74ce',
  blue11: '#0c5f9e',
  blue12: '#113264',

  // Green scale
  green1: '#fbfefc',
  green2: '#f4fbf6',
  green3: '#e6f6ea',
  green4: '#d6f1dd',
  green5: '#c4e8ca',
  green6: '#addcb9',
  green7: '#8ecea2',
  green8: '#65ba83',
  green9: '#46a758',
  green10: '#3d9a50',
  green11: '#297c3b',
  green12: '#1b5e20',

  // Red scale
  red1: '#fffcfc',
  red2: '#fff7f7',
  red3: '#feebec',
  red4: '#ffdbdc',
  red5: '#ffc9cb',
  red6: '#f9b2b5',
  red7: '#f09497',
  red8: '#e5686b',
  red9: '#e54d2e',
  red10: '#dc4d2e',
  red11: '#cd372b',
  red12: '#8c1e1a',

  // Yellow scale
  yellow1: '#fdfdf9',
  yellow2: '#fefce8',
  yellow3: '#fffbeb',
  yellow4: '#fef3c7',
  yellow5: '#fde68a',
  yellow6: '#fcd34d',
  yellow7: '#fbbf24',
  yellow8: '#f59e0b',
  yellow9: '#d97706',
  yellow10: '#b45309',
  yellow11: '#92400e',
  yellow12: '#78350f',

  // White and black
  white1: '#ffffff',
  white2: '#fefefe',
  black1: '#000000',
  black2: '#1a1a1a',
};

// Size system
export const size = {
  $0: 0,
  '$0.25': 2,
  '$0.5': 4,
  '$0.75': 8,
  $1: 20,
  '$1.5': 24,
  $2: 28,
  '$2.5': 32,
  $3: 36,
  '$3.5': 40,
  $4: 44,
  $true: 44,
  '$4.5': 48,
  $5: 52,
  $6: 64,
  $7: 74,
  $8: 84,
  $9: 94,
  $10: 104,
  $11: 124,
  $12: 144,
  $13: 164,
  $14: 184,
  $15: 204,
  $16: 224,
  $17: 224,
  $18: 244,
  $19: 264,
  $20: 284,
};

// Space system (includes negative values)
export const space = {
  ...size,
  '$-0.25': -2,
  '$-0.5': -4,
  '$-0.75': -8,
  '$-1': -20,
  '$-1.5': -24,
  '$-2': -28,
  '$-2.5': -32,
  '$-3': -36,
  '$-3.5': -40,
  '$-4': -44,
  '$-4.5': -48,
  '$-5': -52,
  '$-6': -64,
  '$-7': -74,
  '$-8': -84,
  '$-9': -94,
  '$-10': -104,
  '$-11': -124,
  '$-12': -144,
  '$-13': -164,
  '$-14': -184,
  '$-15': -204,
  '$-16': -224,
  '$-17': -224,
  '$-18': -244,
  '$-19': -264,
  '$-20': -284,
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
  1: 3,
  2: 5,
  3: 7,
  4: 9,
  true: 9,
  5: 10,
  6: 16,
  7: 19,
  8: 22,
  9: 26,
  10: 34,
  11: 42,
  12: 50,
};

// Light theme
export const lightTheme = createTheme({
  background: colors.white1,
  backgroundHover: colors.gray2,
  backgroundPress: colors.gray3,
  backgroundFocus: colors.blue2,
  backgroundStrong: colors.gray4,
  backgroundTransparent: 'transparent',

  borderColor: colors.gray6,
  borderColorHover: colors.gray7,
  borderColorPress: colors.gray8,
  borderColorFocus: colors.blue8,

  color: colors.gray12,
  colorHover: colors.gray12,
  colorPress: colors.gray12,
  colorFocus: colors.gray12,
  colorTransparent: 'transparent',

  placeholderColor: colors.gray9,
  outlineColor: colors.blue8,
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowColorHover: 'rgba(0, 0, 0, 0.15)',
  shadowColorPress: 'rgba(0, 0, 0, 0.2)',
  shadowColorFocus: 'rgba(0, 145, 255, 0.3)',

  // Color tokens
  ...colors,
});

// Dark theme
export const darkTheme = createTheme({
  background: colors.black2,
  backgroundHover: '#2a2a2a',
  backgroundPress: '#3a3a3a',
  backgroundFocus: '#1e3a5f',
  backgroundStrong: '#4a4a4a',
  backgroundTransparent: 'transparent',

  borderColor: '#404040',
  borderColorHover: '#505050',
  borderColorPress: '#606060',
  borderColorFocus: colors.blue8,

  color: colors.gray1,
  colorHover: colors.gray1,
  colorPress: colors.gray1,
  colorFocus: colors.gray1,
  colorTransparent: 'transparent',

  placeholderColor: colors.gray8,
  outlineColor: colors.blue8,
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowColorHover: 'rgba(0, 0, 0, 0.4)',
  shadowColorPress: 'rgba(0, 0, 0, 0.5)',
  shadowColorFocus: 'rgba(0, 145, 255, 0.4)',

  // Color tokens (inverted grays for dark mode)
  gray1: colors.gray12,
  gray2: colors.gray11,
  gray3: colors.gray10,
  gray4: colors.gray9,
  gray5: colors.gray8,
  gray6: colors.gray7,
  gray7: colors.gray6,
  gray8: colors.gray5,
  gray9: colors.gray4,
  gray10: colors.gray3,
  gray11: colors.gray2,
  gray12: colors.gray1,

  // Keep blues the same
  ...Object.fromEntries(
    Object.entries(colors).filter(
      ([key]) => key.startsWith('blue') || key.startsWith('white') || key.startsWith('black')
    )
  ),
});

// Export color tokens for use in tamagui config
export const colorTokens = {
  color: colors,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
