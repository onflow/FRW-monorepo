import { type Cache } from '@onflow/frw-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T = unknown> {
  data: T;
  createdAt: number;
  expiresAt?: number;
}

/**
 * AsyncStorage implementation of the Cache interface
 * Optimized for TanStack Query caching with optional TTL support
 */
export class AsyncStorageCache implements Cache {
  private readonly keyPrefix: string;

  constructor(keyPrefix: string = 'cache:') {
    this.keyPrefix = keyPrefix;
  }

  private createKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    if (!entry.expiresAt) return false;
    return Date.now() > entry.expiresAt;
  }

  /**
   * Get cached data by key
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.createKey(key);
      const value = await AsyncStorage.getItem(cacheKey);

      if (value === null) {
        return null;
      }

      const entry = JSON.parse(value) as CacheEntry<T>;

      // Check if entry has expired
      if (this.isExpired(entry)) {
        // Auto-cleanup expired entries
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn(`[AsyncStorageCache] Failed to get key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set cached data by key
   */
  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const now = Date.now();
      const entry: CacheEntry<T> = {
        data: value,
        createdAt: now,
        ...(ttl && { expiresAt: now + ttl }),
      };

      const cacheKey = this.createKey(key);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      console.warn(`[AsyncStorageCache] Failed to set key "${key}":`, error);
      throw new Error(`Failed to cache key "${key}": ${error}`);
    }
  }

  /**
   * Check if a cache key exists
   */
  async has(key: string): Promise<boolean> {
    try {
      const cacheKey = this.createKey(key);
      const value = await AsyncStorage.getItem(cacheKey);

      if (value === null) return false;

      // Check if expired
      const entry = JSON.parse(value) as CacheEntry;
      if (this.isExpired(entry)) {
        // Auto-cleanup expired entries
        await AsyncStorage.removeItem(cacheKey);
        return false;
      }

      return true;
    } catch (error) {
      console.warn(`[AsyncStorageCache] Failed to check key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete cached data by key
   */
  async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.createKey(key);
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn(`[AsyncStorageCache] Failed to delete key "${key}":`, error);
    }
  }

  /**
   * Get all cache keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys
        .filter(key => key.startsWith(this.keyPrefix))
        .map(key => key.replace(this.keyPrefix, ''));
    } catch (error) {
      console.warn('[AsyncStorageCache] Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Get all keys matching a prefix
   */
  async getKeysByPrefix(prefix: string): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const fullPrefix = this.createKey(prefix);
      return allKeys
        .filter(key => key.startsWith(fullPrefix))
        .map(key => key.replace(this.keyPrefix, ''));
    } catch (error) {
      console.warn(`[AsyncStorageCache] Failed to get keys by prefix "${prefix}":`, error);
      return [];
    }
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    try {
      const keysToDelete = await this.getAllKeys();
      const fullKeysToDelete = keysToDelete.map(key => this.createKey(key));

      if (fullKeysToDelete.length > 0) {
        await AsyncStorage.multiRemove(fullKeysToDelete);
      }
    } catch (error) {
      console.warn('[AsyncStorageCache] Failed to clear cache:', error);
    }
  }

  /**
   * Clear all keys matching a prefix
   */
  async clearByPrefix(prefix: string): Promise<void> {
    try {
      const keysToDelete = await this.getKeysByPrefix(prefix);
      const fullKeysToDelete = keysToDelete.map(key => this.createKey(key));

      if (fullKeysToDelete.length > 0) {
        await AsyncStorage.multiRemove(fullKeysToDelete);
      }
    } catch (error) {
      console.warn(`[AsyncStorageCache] Failed to clear keys by prefix "${prefix}":`, error);
    }
  }

  /**
   * Get cache size information
   */
  async getStats(): Promise<{ keyCount: number; estimatedSize?: number }> {
    try {
      const keys = await this.getAllKeys();
      return {
        keyCount: keys.length,
        // AsyncStorage doesn't provide size info, so we skip estimatedSize
      };
    } catch (error) {
      console.warn('[AsyncStorageCache] Failed to get cache stats:', error);
      return { keyCount: 0 };
    }
  }

  /**
   * Cleanup expired entries (useful for periodic maintenance)
   */
  async cleanupExpired(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let cleanedCount = 0;

      for (const key of keys) {
        const data = await this.get(key); // This will auto-cleanup expired entries
        if (data === null) {
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.warn('[AsyncStorageCache] Failed to cleanup expired entries:', error);
      return 0;
    }
  }
}
