import { Platform, PixelRatio, TextStyle } from 'react-native';

// Function to detect device manufacturer
const getDeviceManufacturer = (): string => {
  if (Platform.OS !== 'android') {
    return 'unknown';
  }

  try {
    // Use React Native built-in Platform.constants to get device information
    const constants = Platform.constants;

    if (constants && typeof constants === 'object') {
      const constantsObj = constants as Record<string, unknown>;
      const manufacturer =
        constantsObj.Manufacturer || constantsObj.Brand || constantsObj.Model || 'unknown';

      const manufacturerLower = String(manufacturer).toLowerCase();

      // Check common manufacturer names
      if (manufacturerLower.includes('oneplus')) return 'oneplus';
      if (manufacturerLower.includes('oppo')) return 'oppo';
      if (manufacturerLower.includes('lg')) return 'lg';
      if (manufacturerLower.includes('samsung')) return 'samsung';
      if (manufacturerLower.includes('huawei')) return 'huawei';
      if (manufacturerLower.includes('xiaomi')) return 'xiaomi';

      return manufacturerLower;
    }

    return 'unknown';
  } catch (error) {
    console.warn('Failed to detect device manufacturer:', error);
    return 'unknown';
  }
};

/**
 * Get manufacturer-specific font fixes
 */
const getManufacturerSpecificFix = (): TextStyle => {
  const manufacturer = getDeviceManufacturer();

  // Apply Roboto font for manufacturers with problematic default fonts
  return ['oneplus', 'oppo', 'lg', 'huawei', 'xiaomi', 'unknown', 'google', 'genymotion'].includes(
    manufacturer
  )
    ? { fontFamily: 'Roboto' }
    : {};
};

/**
 * Shared Android text fix utility
 * This addresses the text cutoff issue on Android devices
 */
export const getAndroidTextFix = (disableFix: boolean = false): TextStyle => {
  if (Platform.OS !== 'android' || disableFix) {
    return {};
  }

  const fontScale = PixelRatio.getFontScale();
  const manufacturerFix = getManufacturerSpecificFix();

  return {
    // Manufacturer-specific fixes
    ...manufacturerFix,

    // Primary fix: transparent border (most effective)
    borderRightWidth: 4 * fontScale,
    borderColor: 'transparent',

    // Backup fixes for various Android devices
    includeFontPadding: false,
    textAlignVertical: 'center' as const,

    // Additional padding for safety
    paddingRight: 2,

    // Ensure correct line height
    lineHeight: undefined,
  };
};

/**
 * Hook for getting Android text fix styles
 * @param disableFix - Whether to disable the fix
 * @returns TextStyle object with Android fixes
 */
export const useAndroidTextFix = (disableFix: boolean = false): TextStyle => {
  return getAndroidTextFix(disableFix);
};

/**
 * Global default props for React Native Text components
 * This can be applied globally to set default behavior
 */
export const getGlobalTextProps = () => {
  if (Platform.OS === 'android') {
    return {
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    };
  }
  return {};
};

/**
 * Add additional fixes for problematic text
 * For example, adding spaces before and after text (as a last resort)
 */
export const addTextSpacingFix = (text: string): string => {
  if (Platform.OS !== 'android') {
    return text;
  }

  // Add invisible spaces before and after text as a fallback fix
  return `  ${text}  `;
};

/**
 * Debug function: Get current device manufacturer information
 */
export const getDeviceInfo = () => {
  if (Platform.OS !== 'android') {
    return { manufacturer: 'ios', platform: Platform.OS };
  }

  const manufacturer = getDeviceManufacturer();
  return {
    manufacturer,
    platform: Platform.OS,
    version: Platform.Version,
    constants: Platform.constants,
  };
};
