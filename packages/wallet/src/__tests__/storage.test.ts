/**
 * Test suite for Storage implementations
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
  MockSecureStorage,
  MockCacheStorage,
  createMockStorageSetup,
} from '../storage/mock-storage';

describe('Storage Implementations', () => {
  describe('MockSecureStorage', () => {
    let storage: MockSecureStorage;

    beforeEach(() => {
      storage = new MockSecureStorage();
    });

    it('should store and retrieve data', async () => {
      const testData = 'encrypted_test_data';

      await storage.store('test_key', testData);
      const retrieved = await storage.retrieve('test_key');

      expect(retrieved).toBe(testData);
    });

    it('should return null for non-existent keys', async () => {
      const retrieved = await storage.retrieve('non_existent_key');
      expect(retrieved).toBeNull();
    });

    it('should check if key exists', async () => {
      await storage.store('test_key', 'data');

      expect(await storage.exists('test_key')).toBe(true);
      expect(await storage.exists('non_existent')).toBe(false);
    });

    it('should remove data', async () => {
      await storage.store('test_key', 'data');

      const removed = await storage.remove('test_key');
      expect(removed).toBe(true);

      const retrieved = await storage.retrieve('test_key');
      expect(retrieved).toBeNull();
    });

    it('should return false when removing non-existent key', async () => {
      const removed = await storage.remove('non_existent');
      expect(removed).toBe(false);
    });

    it('should get all keys', async () => {
      await storage.store('key1', 'data1');
      await storage.store('key2', 'data2');

      const keys = await storage.getAllKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBe(2);
    });

    it('should find keys by keyword', async () => {
      await storage.store('wallet_key_1', 'data1');
      await storage.store('wallet_key_2', 'data2');
      await storage.store('other_key', 'data3');

      const walletKeys = await storage.findKey('wallet');
      expect(walletKeys).toContain('wallet_key_1');
      expect(walletKeys).toContain('wallet_key_2');
      expect(walletKeys).not.toContain('other_key');
    });

    it('should remove all data', async () => {
      await storage.store('key1', 'data1');
      await storage.store('key2', 'data2');

      await storage.removeAll();

      expect(storage.size()).toBe(0);
      expect(await storage.getAllKeys()).toEqual([]);
    });
  });

  describe('MockCacheStorage', () => {
    let cache: MockCacheStorage;

    beforeEach(() => {
      cache = new MockCacheStorage();
    });

    it('should store and retrieve data', async () => {
      const testData = { key: 'value', number: 42 };

      await cache.set('test_key', testData);
      const retrieved = await cache.get('test_key');

      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      const retrieved = await cache.get('non_existent_key');
      expect(retrieved).toBeNull();
    });

    it('should handle TTL expiration', async () => {
      await cache.set('test_key', 'data', 1); // 1ms TTL

      // Wait for expiration with a bit more margin
      await new Promise((resolve) => setTimeout(resolve, 10));

      const retrieved = await cache.get('test_key');
      expect(retrieved).toBeNull();
    });

    it('should remove data', async () => {
      await cache.set('test_key', 'data');

      const removed = await cache.remove('test_key');
      expect(removed).toBe(true);

      const retrieved = await cache.get('test_key');
      expect(retrieved).toBeNull();
    });

    it('should clear by prefix', async () => {
      await cache.set('prefix_key1', 'data1');
      await cache.set('prefix_key2', 'data2');
      await cache.set('other_key', 'data3');

      const count = await cache.clearByPrefix('prefix');
      expect(count).toBe(2);

      expect(await cache.get('prefix_key1')).toBeNull();
      expect(await cache.get('prefix_key2')).toBeNull();
      expect(await cache.get('other_key')).toBe('data3');
    });

    it('should clear all data', async () => {
      await cache.set('key1', 'data1');
      await cache.set('key2', 'data2');

      await cache.clear();

      expect(cache.size()).toBe(0);
    });

    it('should provide cache statistics', async () => {
      await cache.set('key1', 'data1');
      await cache.get('key1'); // hit
      await cache.get('non_existent'); // miss

      const stats = await cache.getStats();

      expect(stats.totalKeys).toBe(1);
      expect(stats.hitCount).toBe(1);
      expect(stats.missCount).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('should handle manual expiration for testing', () => {
      cache.set('test_key', 'data');
      expect(cache.has('test_key')).toBe(true);

      cache.expireKey('test_key');

      // Key should now be expired
      cache.get('test_key').then((result) => {
        expect(result).toBeNull();
      });
    });
  });

  describe('Storage Setup', () => {
    it('should create complete storage setup', () => {
      const setup = createMockStorageSetup();

      expect(setup.secureStorage).toBeInstanceOf(MockSecureStorage);
      expect(setup.cacheStorage).toBeInstanceOf(MockCacheStorage);
      expect(typeof setup.reset).toBe('function');
      expect(typeof setup.getSnapshot).toBe('function');
      expect(typeof setup.getStats).toBe('function');
    });

    it('should reset storage setup', async () => {
      const setup = createMockStorageSetup();

      await setup.secureStorage.store('test', 'data');
      await setup.cacheStorage.set('test', 'data');

      const statsBefore = await setup.getStats();
      expect(statsBefore.secureKeys).toBe(1);
      expect(statsBefore.cacheKeys).toBe(1);

      setup.reset();

      const statsAfter = await setup.getStats();
      expect(statsAfter.secureKeys).toBe(0);
      expect(statsAfter.cacheKeys).toBe(0);
    });

    it('should provide storage snapshots', async () => {
      const setup = createMockStorageSetup();

      await setup.secureStorage.store('secure_key', 'secure_data');
      await setup.cacheStorage.set('cache_key', 'cache_data');

      const snapshot = setup.getSnapshot();

      expect(snapshot.secure).toEqual({ secure_key: 'secure_data' });
      expect(snapshot.cache).toEqual({ cache_key: 'cache_data' });
    });
  });
});
