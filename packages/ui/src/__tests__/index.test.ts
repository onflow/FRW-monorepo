import { describe, it, expect } from 'vitest';

import { Platform, getPlatformInfo } from '../primitives/Platform';

describe('UI Package', () => {
  it('should export Platform utilities', () => {
    expect(Platform).toBeDefined();
    expect(getPlatformInfo).toBeDefined();
    expect(typeof Platform.isReactNative).toBe('boolean');
    expect(typeof Platform.isWeb).toBe('boolean');
    expect(typeof Platform.isExtension).toBe('boolean');
  });

  it('should detect platform correctly', () => {
    const platformInfo = getPlatformInfo();
    expect(platformInfo).toHaveProperty('isReactNative');
    expect(platformInfo).toHaveProperty('isWeb');
    expect(platformInfo).toHaveProperty('isExtension');

    // In test environment, should detect as web
    expect(platformInfo.isWeb).toBe(true);
    expect(platformInfo.isReactNative).toBe(false);
    expect(platformInfo.isExtension).toBe(false);
  });
});
