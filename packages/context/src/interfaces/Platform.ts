/**
 * Platform enumeration and related types
 * Defines all supported platforms for the Flow Reference Wallet
 */

export enum PlatformType {
  REACT_NATIVE_IOS = 'ios',
  REACT_NATIVE_ANDROID = 'android',
  CHROME_EXTENSION = 'extension',
  WEB = 'web',
}

/**
 * Platform detection utility interface
 * Each platform implementation should provide this information
 */
export interface PlatformInfo {
  readonly type: PlatformType;
  readonly isReactNative: boolean;
  readonly isExtension: boolean;
  readonly isWeb: boolean;
  readonly isMobile: boolean;
}

/**
 * Platform detector interface - implemented by each platform
 */
export interface PlatformDetector {
  getPlatformInfo(): PlatformInfo;
  getPlatformType(): PlatformType;
}

/**
 * Utility functions for platform checking
 */
export class Platform {
  private static _info: PlatformInfo | null = null;

  static init(detector: PlatformDetector): void {
    Platform._info = detector.getPlatformInfo();
  }

  static get info(): PlatformInfo {
    if (!Platform._info) {
      throw new Error('Platform not initialized. Call Platform.init() first.');
    }
    return Platform._info;
  }

  static get type(): PlatformType {
    return Platform.info.type;
  }

  static get isReactNative(): boolean {
    return Platform.info.isReactNative;
  }

  static get isExtension(): boolean {
    return Platform.info.isExtension;
  }

  static get isWeb(): boolean {
    return Platform.info.isWeb;
  }

  static get isMobile(): boolean {
    return Platform.info.isMobile;
  }

  static get isIOS(): boolean {
    return Platform.type === PlatformType.REACT_NATIVE_IOS;
  }

  static get isAndroid(): boolean {
    return Platform.type === PlatformType.REACT_NATIVE_ANDROID;
  }
}
