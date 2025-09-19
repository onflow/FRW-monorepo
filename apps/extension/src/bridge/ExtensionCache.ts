import { type Cache } from '@onflow/frw-context';

interface CacheEntry<T = unknown> {
  data: T;
  createdAt: number;
  expiresAt?: number;
}

/**
 * Chrome Session Storage implementation of the Cache interface
 * Uses session storage for temporary caching as requested
 */
export class ExtensionCache implements Cache {
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

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.createKey(key);
      const result = await chrome.storage.session.get(cacheKey);
      const value = result[cacheKey];

      if (value === undefined || value === null) {
        return null;
      }

      const entry = JSON.parse(value as string) as CacheEntry<T>;

      if (this.isExpired(entry)) {
        await chrome.storage.session.remove(cacheKey);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn(`[ExtensionCache] Failed to get key "${key}":`, error);
      return null;
    }
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const now = Date.now();
      const entry: CacheEntry<T> = {
        data: value,
        createdAt: now,
        ...(ttl && { expiresAt: now + ttl }),
      };

      const cacheKey = this.createKey(key);
      await chrome.storage.session.set({ [cacheKey]: JSON.stringify(entry) });
    } catch (error) {
      console.warn(`[ExtensionCache] Failed to set key "${key}":`, error);
      throw new Error(`Failed to cache key "${key}": ${error}`);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const cacheKey = this.createKey(key);
      const result = await chrome.storage.session.get(cacheKey);
      const value = result[cacheKey];

      if (value === undefined || value === null) return false;

      const entry = JSON.parse(value as string) as CacheEntry;
      if (this.isExpired(entry)) {
        await chrome.storage.session.remove(cacheKey);
        return false;
      }

      return true;
    } catch (error) {
      console.warn(`[ExtensionCache] Failed to check key "${key}":`, error);
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.createKey(key);
      await chrome.storage.session.remove(cacheKey);
    } catch (error) {
      console.warn(`[ExtensionCache] Failed to delete key "${key}":`, error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const allData = await chrome.storage.session.get(null);
      const allKeys = Object.keys(allData);
      return allKeys
        .filter((key) => key.startsWith(this.keyPrefix))
        .map((key) => key.replace(this.keyPrefix, ''));
    } catch (error) {
      console.warn('[ExtensionCache] Failed to get all keys:', error);
      return [];
    }
  }

  async getKeysByPrefix(prefix: string): Promise<string[]> {
    try {
      const allData = await chrome.storage.session.get(null);
      const allKeys = Object.keys(allData);
      const fullPrefix = this.createKey(prefix);
      return allKeys
        .filter((key) => key.startsWith(fullPrefix))
        .map((key) => key.replace(this.keyPrefix, ''));
    } catch (error) {
      console.warn(`[ExtensionCache] Failed to get keys by prefix "${prefix}":`, error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      const keysToDelete = await this.getAllKeys();
      const fullKeysToDelete = keysToDelete.map((key) => this.createKey(key));

      if (fullKeysToDelete.length > 0) {
        await chrome.storage.session.remove(fullKeysToDelete);
      }
    } catch (error) {
      console.warn('[ExtensionCache] Failed to clear cache:', error);
    }
  }

  async clearByPrefix(prefix: string): Promise<void> {
    try {
      const keysToDelete = await this.getKeysByPrefix(prefix);
      const fullKeysToDelete = keysToDelete.map((key) => this.createKey(key));

      if (fullKeysToDelete.length > 0) {
        await chrome.storage.session.remove(fullKeysToDelete);
      }
    } catch (error) {
      console.warn(`[ExtensionCache] Failed to clear keys by prefix "${prefix}":`, error);
    }
  }

  async getStats(): Promise<{ keyCount: number; estimatedSize?: number }> {
    try {
      const keys = await this.getAllKeys();
      return {
        keyCount: keys.length,
      };
    } catch (error) {
      return { keyCount: 0 };
    }
  }
}
