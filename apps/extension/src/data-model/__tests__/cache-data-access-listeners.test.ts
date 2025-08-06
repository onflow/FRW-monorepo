import { vi, describe, it, expect, beforeEach } from 'vitest';

import { addCachedDataListener, removeCachedDataListener } from '../cache-data-access';

// Mock storage functions
const mockListeners: ((...args: any[]) => void)[] = [];

vi.mock('../storage', () => ({
  addStorageListener: vi.fn((listener) => {
    mockListeners.push(listener);
  }),
  removeStorageListener: vi.fn((listener) => {
    const index = mockListeners.indexOf(listener);
    if (index > -1) mockListeners.splice(index, 1);
  }),
}));

describe('cache-data-access listeners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListeners.length = 0;
  });

  it('should add and remove a listener', () => {
    const key = 'test-key';
    const callback = vi.fn();

    addCachedDataListener(key, callback);

    expect(mockListeners.length).toBe(1);

    removeCachedDataListener(key, callback);

    expect(mockListeners.length).toBe(0);
    expect(mockListeners.length).toBe(0);
  });
});
