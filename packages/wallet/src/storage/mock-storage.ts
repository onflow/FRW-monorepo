/**
 * Mock storage implementations for testing
 * Based on Flow Wallet Kit iOS testing patterns
 */

import { type SecureStorage, type CacheStorage, type CacheStats } from '../types/storage';

/**
 * Mock SecureStorage for testing purposes
 */
export class MockSecureStorage implements SecureStorage {
  private storage = new Map<string, string>();
  private keys = new Set<string>();

  async store(id: string, encryptedData: string): Promise<void> {
    this.storage.set(id, encryptedData);
    this.keys.add(id);
  }

  async retrieve(id: string): Promise<string | null> {
    return this.storage.get(id) || null;
  }

  async remove(id: string): Promise<boolean> {
    const existed = this.storage.has(id);
    this.storage.delete(id);
    this.keys.delete(id);
    return existed;
  }

  async exists(id: string): Promise<boolean> {
    return this.storage.has(id);
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.keys);
  }

  async findKey(keyword: string): Promise<string[]> {
    const allKeys = await this.getAllKeys();
    return allKeys.filter((key) => key.includes(keyword));
  }

  async removeAll(): Promise<void> {
    this.storage.clear();
    this.keys.clear();
  }

  // Test utilities
  size(): number {
    return this.storage.size;
  }

  clear(): void {
    this.storage.clear();
    this.keys.clear();
  }

  getStorageSnapshot(): Record<string, string> {
    return Object.fromEntries(this.storage);
  }
}

/**
 * Mock CacheStorage for testing purposes
 */
export class MockCacheStorage implements CacheStorage {
  private cache = new Map<string, { value: any; expiresAt?: number }>();
  private stats = {
    hitCount: 0,
    missCount: 0,
  };

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const entry: { value: any; expiresAt?: number } = { value };

    if (ttl) {
      entry.expiresAt = Date.now() + ttl;
    }

    this.cache.set(key, entry);
  }

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.missCount++;
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.missCount++;
      return null;
    }

    this.stats.hitCount++;
    return entry.value;
  }

  async remove(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clearByPrefix(prefix: string): Promise<number> {
    let count = 0;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats.hitCount = 0;
    this.stats.missCount = 0;
  }

  async getStats(): Promise<CacheStats> {
    const totalSize = Array.from(this.cache.values()).reduce((size, entry) => {
      // Rough size estimation
      return size + JSON.stringify(entry.value).length;
    }, 0);

    return {
      totalKeys: this.cache.size,
      totalSize,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
    };
  }

  // Test utilities
  size(): number {
    return this.cache.size;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  getCacheSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};

    for (const [key, entry] of this.cache.entries()) {
      snapshot[key] = entry.value;
    }

    return snapshot;
  }

  // Simulate cache expiration for testing
  expireKey(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.expiresAt = Date.now() - 1;
    }
  }

  // Set custom expiration time
  setExpiration(key: string, expirationTime: number): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.expiresAt = expirationTime;
    }
  }
}

/**
 * Factory functions for creating mock storage instances
 */
export function createMockSecureStorage(): MockSecureStorage {
  return new MockSecureStorage();
}

export function createMockCacheStorage(): MockCacheStorage {
  return new MockCacheStorage();
}

/**
 * Create a complete mock storage setup for testing
 */
export function createMockStorageSetup() {
  const secureStorage = createMockSecureStorage();
  const cacheStorage = createMockCacheStorage();

  return {
    secureStorage,
    cacheStorage,

    // Utility methods for testing
    reset: () => {
      secureStorage.clear();
      cacheStorage.clear();
    },

    getSnapshot: () => ({
      secure: secureStorage.getStorageSnapshot(),
      cache: cacheStorage.getCacheSnapshot(),
    }),

    getStats: async () => ({
      secureKeys: secureStorage.size(),
      cacheKeys: cacheStorage.size(),
      cacheStats: await cacheStorage.getStats(),
    }),
  };
}
