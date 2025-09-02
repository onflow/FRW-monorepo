import type { StorageKeyMap } from './StorageKeyMap';

/**
 * Type-safe storage interface for business data
 * Automatically handles versioning and metadata for all stored data
 * All operations are async to support different storage implementations
 */
export interface Storage {
  /**
   * Get typed data for the given storage key
   * @param key - Storage key from StorageKeyMap
   * @returns Promise resolving to the stored data with proper typing, or undefined if not found
   */
  get<K extends keyof StorageKeyMap>(key: K): Promise<StorageKeyMap[K] | undefined>;

  /**
   * Set typed data for the given storage key
   * Automatically adds/updates version, createdAt, and updatedAt metadata
   * @param key - Storage key from StorageKeyMap
   * @param value - The data to store (metadata will be added automatically)
   * @throws Error if the value cannot be set
   */
  set<K extends keyof StorageKeyMap>(
    key: K,
    value: Omit<StorageKeyMap[K], 'version' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Check if a storage key exists
   * @param key - Storage key to check
   * @returns Promise resolving to true if the key exists
   */
  has<K extends keyof StorageKeyMap>(key: K): Promise<boolean>;

  /**
   * Delete data for the given storage key
   * @param key - Storage key to delete
   */
  delete<K extends keyof StorageKeyMap>(key: K): Promise<void>;

  /**
   * Get all storage keys
   * @returns Promise resolving to array of all storage keys
   */
  getAllKeys(): Promise<(keyof StorageKeyMap)[]>;

  /**
   * Clear all stored data
   */
  clearAll(): Promise<void>;

  /**
   * Set or update the encryption key for all data (platform-specific)
   * @param key - Encryption key (max 16 bytes) or undefined to remove encryption
   * @throws Error if the instance cannot be recrypted
   */
  recrypt?(key: string | undefined): Promise<void>;

  /**
   * Optimize storage space and clear memory cache (platform-specific)
   */
  trim?(): Promise<void>;
}
