import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';

import storage from '@onflow/frw-extension-shared/storage';

import {
  getCachedData,
  triggerRefresh,
  addCachedDataListener,
  removeCachedDataListener,
} from '../cache-data-access';
import { type CacheDataItem } from '../data-cache-types';

vi.mock('@onflow/frw-extension-shared/storage', () => ({
  default: {
    getSession: vi.fn(),
    setSession: vi.fn(),
  },
}));

describe('cache-data-access', () => {
  const mockGetSession = storage.getSession as Mock;
  const mockSetSession = storage.setSession as Mock;

  // Mock chrome global
  const mockListeners: ((
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string
  ) => void)[] = [];
  global.chrome = {
    storage: {
      onChanged: {
        addListener: vi.fn((listener) => {
          mockListeners.push(listener);
        }),
        removeListener: vi.fn((listener) => {
          const index = mockListeners.indexOf(listener);
          if (index > -1) mockListeners.splice(index, 1);
        }),
      },
    },
  } as unknown as typeof chrome;

  beforeEach(() => {
    vi.clearAllMocks();
    mockListeners.length = 0;
  });

  describe('getCachedData', () => {
    it('should return data if it exists and is not expired', async () => {
      const key = 'test-key';
      const data: CacheDataItem = { value: 'test-value', expiry: Date.now() + 10000 };
      mockGetSession.mockResolvedValueOnce(data);

      const result = await getCachedData(key);
      expect(result).toBe('test-value');
      expect(mockSetSession).not.toHaveBeenCalled();
    });

    it('should trigger refresh and return stale data if data is expired', async () => {
      const key = 'test-key';
      const data: CacheDataItem = { value: 'test-value', expiry: Date.now() - 10000 };
      mockGetSession.mockResolvedValueOnce(data);
      mockSetSession.mockResolvedValueOnce(undefined);

      const result = await getCachedData(key);
      expect(result).toBe('test-value');
      expect(mockSetSession).toHaveBeenCalledWith(`${key}-refresh`, expect.any(Number));
    });

    it('should trigger refresh and return undefined if data does not exist', async () => {
      const key = 'test-key';
      mockGetSession.mockResolvedValueOnce(undefined);
      mockSetSession.mockResolvedValueOnce(undefined);

      const result = await getCachedData(key);
      expect(result).toBeUndefined();
      expect(mockSetSession).toHaveBeenCalledWith(`${key}-refresh`, expect.any(Number));
    });
  });

  describe('triggerRefresh', () => {
    it('should set the refresh key', () => {
      const key = 'test-key';
      mockSetSession.mockResolvedValueOnce(undefined);

      triggerRefresh(key);
      expect(mockSetSession).toHaveBeenCalledWith(`${key}-refresh`, expect.any(Number));
    });
  });

  describe('listeners', () => {
    it('should add and remove listener', () => {
      const key = 'test-key';
      const callback = vi.fn();

      addCachedDataListener(key, callback);
      expect(chrome.storage.onChanged.addListener).toHaveBeenCalledTimes(1);

      removeCachedDataListener(key, callback);
      expect(chrome.storage.onChanged.removeListener).toHaveBeenCalledTimes(1);
    });

    it('should call update callback when relevant change occurs', () => {
      const key = 'test-key';
      const callback = vi.fn();
      const changes = { [key]: { newValue: { value: 'new-value', expiry: Date.now() + 10000 } } };

      addCachedDataListener(key, callback);
      // Simulate change
      mockListeners[0](changes, 'session');

      expect(callback).toHaveBeenCalledWith(key, 'new-value');
    });

    it('should not call callback for irrelevant changes', () => {
      const key = 'test-key';
      const callback = vi.fn();
      const changes = {
        'other-key': { newValue: { value: 'new-value', expiry: Date.now() + 10000 } },
      };

      addCachedDataListener(key, callback);
      // Simulate change
      mockListeners[0](changes, 'session');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should not call callback if area is not session', () => {
      const key = 'test-key';
      const callback = vi.fn();
      const changes = { [key]: { newValue: { value: 'new-value', expiry: Date.now() + 10000 } } };

      addCachedDataListener(key, callback);
      // Simulate change in wrong area
      mockListeners[0](changes, 'local');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callback with undefined for invalid data', () => {
      const key = 'test-key';
      const callback = vi.fn();
      const changes = { [key]: { newValue: 'invalid' } }; // Not CacheDataItem

      addCachedDataListener(key, callback);
      // Simulate change
      mockListeners[0](changes, 'session');

      expect(callback).toHaveBeenCalledWith(key, undefined);
    });
  });
});
