/**
 * Storage interfaces based on Flow Wallet Kit iOS StorageProtocol
 * Provides abstraction for secure key storage and account metadata caching
 */

/**
 * SecureStorage interface - handles encrypted key material only
 * Based on iOS KeychainStorage implementation
 */
export interface SecureStorage {
  /**
   * Store encrypted data securely
   * @param id - Unique identifier for the data
   * @param encryptedData - Encrypted data to store
   */
  store(id: string, encryptedData: string): Promise<void>;

  /**
   * Retrieve encrypted data
   * @param id - Unique identifier for the data
   * @returns Encrypted data or null if not found
   */
  retrieve(id: string): Promise<string | null>;

  /**
   * Remove stored data
   * @param id - Unique identifier for the data
   * @returns True if data was removed, false if not found
   */
  remove(id: string): Promise<boolean>;

  /**
   * Check if data exists
   * @param id - Unique identifier for the data
   * @returns True if data exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Get all stored keys
   * @returns Array of all stored key identifiers
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Find keys by keyword
   * @param keyword - Keyword to search for
   * @returns Array of matching key identifiers
   */
  findKey(keyword: string): Promise<string[]>;

  /**
   * Remove all stored data
   */
  removeAll(): Promise<void>;
}

/**
 * CacheStorage interface - handles account metadata and application cache
 * Uses platform storage from @onflow/frw-context
 */
export interface CacheStorage {
  /**
   * Set cache data
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Optional time-to-live in milliseconds
   */
  set(key: string, value: any, ttl?: number): Promise<void>;

  /**
   * Get cache data
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get(key: string): Promise<any>;

  /**
   * Remove cache data
   * @param key - Cache key
   * @returns True if data was removed
   */
  remove(key: string): Promise<boolean>;

  /**
   * Clear cache by prefix
   * @param prefix - Key prefix to match
   * @returns Number of keys removed
   */
  clearByPrefix(prefix: string): Promise<number>;

  /**
   * Clear all cache
   */
  clear(): Promise<void>;

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): Promise<CacheStats>;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  totalKeys: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
}

/**
 * Storage migration callback
 */
export type StorageMigrationCallback = (oldVersion: number, newVersion: number) => Promise<void>;

/**
 * Storage configuration
 */
export interface StorageConfig {
  version: number;
  serviceName: string;
  migrationCallback?: StorageMigrationCallback;
}
