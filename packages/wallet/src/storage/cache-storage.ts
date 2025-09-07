/**
 * CacheStorage implementation using @onflow/frw-context
 * Based on Flow Wallet Kit iOS pattern for account metadata caching
 */

import type { Cache } from '@onflow/frw-context';

import { StorageError } from '../types/errors';
import { type CacheStorage, type CacheStats } from '../types/storage';

/**
 * Platform-agnostic cache storage implementation
 * Uses the high-performance cache layer from @onflow/frw-context
 */
export class PlatformCacheStorage implements CacheStorage {
  private cache: Cache;
  private keyPrefix: string;

  constructor(cache: Cache, keyPrefix = 'frw-wallet') {
    this.cache = cache;
    this.keyPrefix = keyPrefix;
  }

  /**
   * Generate cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      await this.cache.set(cacheKey, value, ttl);
    } catch (error) {
      throw StorageError.saveFailed({ key, error });
    }
  }

  async get(key: string): Promise<any> {
    try {
      const cacheKey = this.getCacheKey(key);
      return await this.cache.get(cacheKey);
    } catch (error) {
      throw StorageError.loadCacheFailed({ key, error });
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(key);
      const existed = (await this.cache.get(cacheKey)) !== null;

      if (existed) {
        await this.cache.remove(cacheKey);
        return true;
      }

      return false;
    } catch (error) {
      throw StorageError.saveFailed({ key, operation: 'remove', error });
    }
  }

  async clearByPrefix(prefix: string): Promise<number> {
    try {
      const fullPrefix = this.getCacheKey(prefix);
      return await this.cache.clearByPrefix(fullPrefix);
    } catch (error) {
      throw StorageError.saveFailed({ prefix, operation: 'clearByPrefix', error });
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cache.clearByPrefix(this.keyPrefix);
    } catch (error) {
      throw StorageError.saveFailed({ operation: 'clear', error });
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const platformStats = await this.cache.getStats();

      return {
        totalKeys: platformStats.totalKeys || 0,
        totalSize: platformStats.totalSize || 0,
        hitCount: platformStats.hitCount || 0,
        missCount: platformStats.missCount || 0,
      };
    } catch (error) {
      // Return default stats if platform doesn't support stats
      return {
        totalKeys: 0,
        totalSize: 0,
        hitCount: 0,
        missCount: 0,
      };
    }
  }

  /**
   * Batch operations for better performance
   */
  async setBatch(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      const promises = entries.map((entry) => this.set(entry.key, entry.value, entry.ttl));
      await Promise.all(promises);
    } catch (error) {
      throw StorageError.saveFailed({ operation: 'setBatch', error });
    }
  }

  async getBatch(keys: string[]): Promise<Record<string, any>> {
    try {
      const promises = keys.map(async (key) => {
        const value = await this.get(key);
        return { key, value };
      });

      const results = await Promise.all(promises);

      return results.reduce(
        (acc, { key, value }) => {
          if (value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );
    } catch (error) {
      throw StorageError.loadCacheFailed({ operation: 'getBatch', error });
    }
  }

  async removeBatch(keys: string[]): Promise<number> {
    try {
      const promises = keys.map((key) => this.remove(key));
      const results = await Promise.all(promises);

      return results.filter(Boolean).length;
    } catch (error) {
      throw StorageError.saveFailed({ operation: 'removeBatch', error });
    }
  }

  /**
   * Cache with automatic serialization for complex objects
   */
  async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        type: typeof value,
      });

      await this.set(key, serialized, ttl);
    } catch (error) {
      throw StorageError.saveFailed({ key, operation: 'setJSON', error });
    }
  }

  async getJSON(key: string): Promise<any> {
    try {
      const serialized = await this.get(key);

      if (!serialized) {
        return null;
      }

      if (typeof serialized === 'string') {
        const parsed = JSON.parse(serialized);
        return parsed.data;
      }

      // Direct object storage
      return serialized;
    } catch (error) {
      // If JSON parsing fails, return null
      return null;
    }
  }

  /**
   * Cache with expiration check
   */
  async setWithExpiration(key: string, value: any, expirationMs: number): Promise<void> {
    const expiresAt = Date.now() + expirationMs;

    const wrappedValue = {
      data: value,
      expiresAt,
    };

    await this.set(key, wrappedValue);
  }

  async getWithExpiration(key: string): Promise<any> {
    const wrapped = await this.get(key);

    if (!wrapped || !wrapped.expiresAt) {
      return wrapped;
    }

    if (Date.now() > wrapped.expiresAt) {
      // Expired, remove and return null
      await this.remove(key);
      return null;
    }

    return wrapped.data;
  }
}

/**
 * Factory function to create CacheStorage instance
 */
export function createCacheStorage(cache: Cache, keyPrefix?: string): CacheStorage {
  return new PlatformCacheStorage(cache, keyPrefix);
}
