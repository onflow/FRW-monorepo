/**
 * Platform abstraction layer
 * Detects the current platform and provides platform-specific implementations
 */

export interface PlatformInfo {
  isReactNative: boolean;
  isWeb: boolean;
  isExtension: boolean;
}

export function getPlatformInfo(): PlatformInfo {
  // Check if we're in React Native
  const isReactNative: boolean =
    typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

  // Check if we're in a Chrome Extension
  const isExtension: boolean =
    typeof window !== 'undefined' &&
    typeof (window as { chrome?: { runtime?: { id?: string } } }).chrome !== 'undefined' &&
    Boolean((window as { chrome?: { runtime?: { id?: string } } }).chrome?.runtime) &&
    Boolean((window as { chrome?: { runtime?: { id?: string } } }).chrome?.runtime?.id);

  // Web environment (but not extension)
  const isWeb: boolean = !isReactNative && !isExtension;

  return {
    isReactNative,
    isWeb,
    isExtension,
  };
}

export const Platform = getPlatformInfo();
