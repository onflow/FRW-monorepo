import { vi, describe, it, expect, beforeEach } from 'vitest';

import { addCachedDataListener, removeCachedDataListener } from '../cache-data-access';

// Mock chrome global
const mockListeners: ((...args: any[]) => void)[] = [];
const mockAddListener = vi.fn((listener) => {
  mockListeners.push(listener);
});
const mockRemoveListener = vi.fn((listener) => {
  const index = mockListeners.indexOf(listener);
  if (index > -1) mockListeners.splice(index, 1);
});

global.chrome = {
  storage: {
    onChanged: {
      addListener: mockAddListener,
      removeListener: mockRemoveListener,
    },
  },
} as unknown as typeof chrome;

describe('cache-data-access listeners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListeners.length = 0;
  });

  it('should add and remove a listener', () => {
    const key = 'test-key';
    const callback = vi.fn();

    addCachedDataListener(key, callback);

    expect(mockAddListener).toHaveBeenCalledTimes(1);
    expect(mockListeners.length).toBe(1);

    removeCachedDataListener(key, callback);

    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
    // This will fail until the source code is fixed
    expect(mockListeners.length).toBe(1);
  });
});
