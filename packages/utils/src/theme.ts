// Simple theme interface for theme objects with background color detection
interface ThemeObject {
  background?: { val?: string };
  bg?: { val?: string };
  white?: { val?: string };
  black?: { val?: string };
  color?: { val?: string };
}

/**
 * Reliable dark mode detection for Tamagui themes.
 *
 * This helper function provides a consistent way to detect dark mode
 * across the application. It uses background color comparison since
 * theme.name is undefined in our Tamagui setup.
 *
 * @param theme - The Tamagui theme object from useTheme()
 * @returns true if dark mode is detected, false otherwise
 */
export function isDarkMode(theme: ThemeObject): boolean {
  // Use background color detection since theme.name is undefined
  // In dark mode: theme.background?.val === '#000000'
  // In light mode: theme.background?.val will be a different color (e.g., '#FFFFFF' or similar)
  return theme.background?.val === '#000000' || theme.bg?.val === '#000000';
}

/**
 * Get theme-aware text color for optimal contrast.
 *
 * @param theme - The Tamagui theme object from useTheme()
 * @param fallbackDark - Fallback color for dark mode (default: '#FFFFFF')
 * @param fallbackLight - Fallback color for light mode (default: '#000000')
 * @returns The appropriate text color value
 */
export function getThemeTextColor(
  theme: ThemeObject,
  fallbackDark = '#FFFFFF',
  fallbackLight = '#000000'
): string {
  const darkMode = isDarkMode(theme);

  // Use theme color token if available, otherwise fallback
  if (darkMode) {
    return theme.white?.val || theme.color?.val || fallbackDark;
  } else {
    return theme.black?.val || theme.color?.val || fallbackLight;
  }
}

/**
 * Get theme-aware background color for buttons and interactive elements.
 *
 * @param theme - The Tamagui theme object from useTheme()
 * @param fallbackDark - Fallback color for dark mode (default: '#FFFFFF')
 * @param fallbackLight - Fallback color for light mode (default: '#000000')
 * @returns The appropriate background color value
 */
export function getThemeBackgroundColor(
  theme: ThemeObject,
  fallbackDark = '#FFFFFF',
  fallbackLight = '#000000'
): string {
  const darkMode = isDarkMode(theme);

  // For backgrounds, typically we want contrasting colors
  if (darkMode) {
    return theme.white?.val || fallbackDark;
  } else {
    return theme.black?.val || fallbackLight;
  }
}

/**
 * Get theme-aware card background using appropriate tokens.
 *
 * @param theme - The Tamagui theme object from useTheme()
 * @returns The appropriate card background token
 */
export function getThemeCardBackground(theme: ThemeObject): string {
  // Return tokens that will be resolved by Tamagui
  // Dark mode: '$light10', Light mode: '$bg2'
  const darkMode = isDarkMode(theme);
  return darkMode ? '$light10' : '$bg2';
}