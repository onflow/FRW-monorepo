import { describe, it, expect } from 'vitest';

import { Platform, PlatformType, SelectTokensScreen } from '../index';

describe('UI Package', () => {
  it('should export Platform utilities from context', () => {
    expect(Platform).toBeDefined();
    expect(PlatformType).toBeDefined();

    // Platform enum values should be defined
    expect(PlatformType.WEB).toBe('web');
    expect(PlatformType.CHROME_EXTENSION).toBe('extension');
    expect(PlatformType.REACT_NATIVE_IOS).toBe('ios');
    expect(PlatformType.REACT_NATIVE_ANDROID).toBe('android');
  });

  it('should export UI components', () => {
    expect(SelectTokensScreen).toBeDefined();
    expect(typeof SelectTokensScreen).toBe('function');
  });
});
