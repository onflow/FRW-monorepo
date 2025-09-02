/**
 * Simple cache interface specifically designed for TanStack Query
 * Optimized for high-performance key-value operations without metadata overhead
 */
export interface Cache {
  /**
   * Get cached data by key
   * @param key - Cache key (usually TanStack Query hash)
   * @returns Promise resolving to cached data or null if not found
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Set cached data by key
   * @param key - Cache key (usually TanStack Query hash)
   * @param value - Data to cache
   * @param ttl - Optional time-to-live in milliseconds
   */
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Check if a cache key exists
   * @param key - Cache key to check
   * @returns Promise resolving to true if key exists
   */
  has(key: string): Promise<boolean>;

  /**
   * Delete cached data by key
   * @param key - Cache key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Get all cache keys
   * @returns Promise resolving to array of all cache keys
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Get all keys matching a prefix
   * @param prefix - Key prefix to match (e.g., 'tanquery:')
   * @returns Promise resolving to array of matching keys
   */
  getKeysByPrefix(prefix: string): Promise<string[]>;

  /**
   * Clear all cached data
   */
  clear(): Promise<void>;

  /**
   * Clear all keys matching a prefix
   * @param prefix - Key prefix to match
   */
  clearByPrefix(prefix: string): Promise<void>;

  /**
   * Get cache size information
   * @returns Promise resolving to cache statistics
   */
  getStats?(): Promise<{
    keyCount: number;
    estimatedSize?: number;
  }>;
}
