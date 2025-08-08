// Tamagui configuration for React Native design system
import { createTamagui } from 'tamagui';

// Simple but complete configuration matching React Native design system
const config = createTamagui({
  tokens: {
    size: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      true: 16, // default size
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
      11: 44,
      12: 48,
    },
    space: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      true: 16, // default space
      5: 20,
      6: 24,
      7: 28,
      8: 32,
    },
    color: {
      // Primary colors
      primary: '#00b877', // green-light: rgb(0, 184, 119)
      primaryDark: '#16ff99', // green-dark: rgb(22, 255, 153)

      // System colors
      success: '#12b76a', // rgb(18, 183, 106)
      warning: '#fdb022', // rgb(253, 176, 34)
      error: '#f04438', // rgb(240, 68, 56)

      // Gray scale
      gray5: '#f2f2f7', // light mode
      gray10: '#767676',
      gray11: '#b3b3b3',
      red10: '#f04438',
      green10: '#16ff99',
    },
    radius: {
      0: 0,
      1: 3,
      2: 5,
      3: 7,
      4: 9,
      true: 9, // default radius
      5: 12,
      6: 15,
      7: 16,
      8: 20,
    },
    zIndex: {
      0: 0,
      1: 100,
      2: 200,
      3: 300,
      4: 400,
      5: 500,
    },
  },
  themes: {
    light: {
      background: '#ffffff',
      backgroundHover: '#f2f2f7', // surface-base
      backgroundPress: '#f2f2f7',
      backgroundFocus: '#f2f2f7',
      backgroundStrong: '#ffffff',
      backgroundTransparent: 'rgba(255, 255, 255, 0)',
      borderColor: '#f2f2f7',
      borderColorHover: '#767676',
      borderColorPress: '#767676',
      borderColorFocus: '#767676',

      color: '#000d07', // fg-1
      colorHover: '#000d07',
      colorPress: '#000d07',
      colorFocus: '#000d07',
      colorTransparent: 'rgba(0, 13, 7, 0)',
      placeholderColor: '#767676', // fg-2

      primary: '#00b877', // green-light
      secondary: '#767676', // fg-2

      gray5: '#f2f2f7',
      gray10: '#767676',
      gray11: '#767676',
      red10: '#f04438',
      green10: '#00b877',
      error: '#f04438',
      success: '#12b76a',
      warning: '#fdb022',

      shadowColor: 'rgba(0, 0, 0, 0.04)',
      shadowColorHover: 'rgba(0, 0, 0, 0.08)',
      shadowColorPress: 'rgba(0, 0, 0, 0.12)',
      shadowColorFocus: 'rgba(0, 0, 0, 0.12)',
    },
    dark: {
      background: '#1a1a1a', // surface-base dark
      backgroundHover: 'rgba(255, 255, 255, 0.1)', // light-4
      backgroundPress: 'rgba(255, 255, 255, 0.1)',
      backgroundFocus: 'rgba(255, 255, 255, 0.1)',
      backgroundStrong: '#1a1a1a',
      backgroundTransparent: 'rgba(26, 26, 26, 0)',
      borderColor: '#292929', // segment-border
      borderColorHover: '#b3b3b3',
      borderColorPress: '#b3b3b3',
      borderColorFocus: '#b3b3b3',

      color: '#ffffff', // fg-1 dark
      colorHover: '#ffffff',
      colorPress: '#ffffff',
      colorFocus: '#ffffff',
      colorTransparent: 'rgba(255, 255, 255, 0)',
      placeholderColor: '#b3b3b3', // fg-2 dark

      primary: '#16ff99', // green-dark
      secondary: '#b3b3b3', // fg-2 dark

      gray5: 'rgba(255, 255, 255, 0.1)', // light background elements
      gray10: '#b3b3b3', // secondary text
      gray11: '#b3b3b3', // secondary text
      red10: '#f04438', // error
      green10: '#16ff99', // success: same as primary
      error: '#f04438', // error color
      success: '#12b76a', // success
      warning: '#fdb022', // warning

      shadowColor: 'rgba(0, 0, 0, 0.04)',
      shadowColorHover: 'rgba(0, 0, 0, 0.08)',
      shadowColorPress: 'rgba(0, 0, 0, 0.12)',
      shadowColorFocus: 'rgba(0, 0, 0, 0.12)',
    },
  },
  fonts: {
    body: {
      family: 'Inter, system-ui, sans-serif',
      size: {
        1: 12, // text-xs
        2: 14, // text-sm
        3: 16, // text-base
        true: 16, // default
        4: 18, // text-lg
        5: 20,
        6: 24,
      },
      lineHeight: {
        1: 16, // line-height-xs
        2: 17, // line-height-sm
        3: 24, // line-height-base
        true: 24, // default
        4: 28, // line-height-lg
        5: 30,
        6: 36,
      },
      weight: {
        1: '400', // normal
        2: '500', // medium
        3: '600', // semibold
        4: '700', // bold
        true: '400', // default
      },
    },
  },
});

export { config };
export default config;
