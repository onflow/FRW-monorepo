/**
 * Mock storage implementations for testing
 * Provides in-memory storage with test utilities
 */

/**
 * Mock secure storage implementation for testing
 * Simulates encrypted storage behavior
 */
export class MockSecureStorage {
  private storage = new Map<string, string>();

  async store(key: string, data: string): Promise<void> {
    this.storage.set(key, data);
  }

  async retrieve(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async remove(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async findKey(keyword: string): Promise<string[]> {
    return Array.from(this.storage.keys()).filter((key) => key.includes(keyword));
  }

  async removeAll(): Promise<void> {
    this.storage.clear();
  }

  // Test utility methods
  size(): number {
    return this.storage.size;
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }

  getSnapshot(): Record<string, string> {
    return Object.fromEntries(this.storage);
  }
}

/**
 * Mock cache storage implementation for testing
 * Includes TTL support and cache statistics
 */
export class MockCacheStorage {
  private storage = new Map<string, { data: any; expiry?: number }>();
  private hitCount = 0;
  private missCount = 0;

  async set(key: string, data: any, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + ttl : undefined;
    this.storage.set(key, { data, expiry });
  }

  async get(key: string): Promise<any> {
    const entry = this.storage.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if expired
    if (entry.expiry && Date.now() > entry.expiry) {
      this.storage.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.data;
  }

  async remove(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }

  async clearByPrefix(prefix: string): Promise<number> {
    let count = 0;
    const keysToDelete: string[] = [];

    for (const key of this.storage.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
        count++;
      }
    }

    for (const key of keysToDelete) {
      this.storage.delete(key);
    }

    return count;
  }

  async clear(): Promise<void> {
    this.storage.clear();
    this.resetStats();
  }

  async getStats(): Promise<{
    totalKeys: number;
    hitCount: number;
    missCount: number;
    totalSize: number;
  }> {
    const totalSize = JSON.stringify(Object.fromEntries(this.storage)).length;

    return {
      totalKeys: this.storage.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      totalSize,
    };
  }

  // Test utility methods
  size(): number {
    return this.storage.size;
  }

  has(key: string): boolean {
    const entry = this.storage.get(key);
    if (!entry) return false;

    // Check if expired
    if (entry.expiry && Date.now() > entry.expiry) {
      this.storage.delete(key);
      return false;
    }

    return true;
  }

  expireKey(key: string): void {
    const entry = this.storage.get(key);
    if (entry) {
      this.storage.set(key, { ...entry, expiry: Date.now() - 1 });
    }
  }

  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }

  getSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};
    for (const [key, entry] of this.storage) {
      // Skip expired entries
      if (!entry.expiry || Date.now() <= entry.expiry) {
        snapshot[key] = entry.data;
      }
    }
    return snapshot;
  }
}

/**
 * Create a complete mock storage setup for testing
 */
export function createMockStorageSetup() {
  const secureStorage = new MockSecureStorage();
  const cacheStorage = new MockCacheStorage();

  return {
    secureStorage,
    cacheStorage,
    reset: () => {
      secureStorage.clear();
      cacheStorage.clear();
    },
    getSnapshot: () => ({
      secure: secureStorage.getSnapshot(),
      cache: cacheStorage.getSnapshot(),
    }),
    getStats: async () => {
      const cacheStats = await cacheStorage.getStats();
      return {
        secureKeys: secureStorage.size(),
        cacheKeys: cacheStats.totalKeys,
        cacheHits: cacheStats.hitCount,
        cacheMisses: cacheStats.missCount,
        cacheTotalSize: cacheStats.totalSize,
      };
    },
  };
}
