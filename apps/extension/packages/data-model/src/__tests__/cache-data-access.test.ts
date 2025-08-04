import { vi, describe, it, expect, beforeEach } from 'vitest';

import {
  getCachedData,
  triggerRefresh,
  addCachedDataListener,
  removeCachedDataListener,
} from '../cache-data-access';
import { type CacheDataItem } from '../data-cache-types';
import { initializeStorage } from '../storage';
import { memoryStorage } from '../storage/memory-storage';

describe('cache-data-access', () => {
  beforeEach(async () => {
    // Initialize storage with memory storage for tests
    initializeStorage({ implementation: memoryStorage });
    // Clear all storage data between tests
    await memoryStorage.clear();
    await memoryStorage.clearSession();
    vi.clearAllMocks();
  });

  describe('getCachedData', () => {
    it('should return data if it exists and is not expired', async () => {
      const key = 'test-key';
      const data: CacheDataItem = { value: 'test-value', expiry: Date.now() + 10000 };

      // Set data directly using memory storage
      await memoryStorage.setSession(key, data);

      const result = await getCachedData(key);
      expect(result).toBe('test-value');
    });

    it('should trigger refresh and return stale data if data is expired', async () => {
      const key = 'test-key';
      const data: CacheDataItem = { value: 'test-value', expiry: Date.now() - 10000 };

      await memoryStorage.setSession(key, data);

      const result = await getCachedData(key);
      expect(result).toBe('test-value');

      // Check that refresh was triggered
      const refreshKey = `${key}-refresh`;
      const refreshData = await memoryStorage.getSession(refreshKey);
      expect(refreshData).toBeDefined();
    });

    it('should trigger refresh and return undefined if data does not exist', async () => {
      const key = 'test-key';

      const result = await getCachedData(key);
      expect(result).toBeUndefined();

      // Check that refresh was triggered
      const refreshKey = `${key}-refresh`;
      const refreshData = await memoryStorage.getSession(refreshKey);
      expect(refreshData).toBeDefined();
    });
  });

  describe('triggerRefresh', () => {
    it('should set the refresh key', async () => {
      const key = 'test-key';

      triggerRefresh(key);

      const refreshKey = `${key}-refresh`;
      const refreshData = await memoryStorage.getSession(refreshKey);
      expect(refreshData).toBeDefined();
    });
  });

  describe('listeners', () => {
    it('should add and remove listener', () => {
      const key = 'test-key';
      const callback = vi.fn();

      addCachedDataListener(key, callback);
      expect(callback).not.toHaveBeenCalled();

      removeCachedDataListener(key, callback);
    });

    it('should call update callback when relevant change occurs', async () => {
      const key = 'test-key';
      const callback = vi.fn();

      addCachedDataListener(key, callback);

      // Simulate change
      const data: CacheDataItem = { value: 'new-value', expiry: Date.now() + 10000 };
      await memoryStorage.setSession(key, data);

      expect(callback).toHaveBeenCalledWith(key, 'new-value');
    });

    it('should not call callback for irrelevant changes', async () => {
      const key = 'test-key';
      const callback = vi.fn();

      addCachedDataListener(key, callback);

      // Simulate change to different key
      await memoryStorage.setSession('different-key', 'value');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should not call callback if area is not session', async () => {
      const key = 'test-key';
      const callback = vi.fn();

      addCachedDataListener(key, callback);

      // Simulate change to local storage
      await memoryStorage.set(key, 'value');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callback with undefined for invalid data', async () => {
      const key = 'test-key';
      const callback = vi.fn();

      addCachedDataListener(key, callback);

      // Simulate change with invalid data
      await memoryStorage.setSession(key, 'invalid-data');

      expect(callback).toHaveBeenCalledWith(key, undefined);
    });
  });
});
