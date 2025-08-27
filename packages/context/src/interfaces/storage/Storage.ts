import type { StorageKeyMap } from './StorageKeyMap';

/**
 * Type-safe storage interface with unified get/set methods
 * Automatically handles versioning and metadata for all stored data
 */
export interface Storage {
  /**
   * Get typed data for the given storage key
   * @param key - Storage key from StorageKeyMap
   * @returns The stored data with proper typing, or undefined if not found
   */
  get<K extends keyof StorageKeyMap>(key: K): StorageKeyMap[K] | undefined;

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
  ): void;

  /**
   * Check if a storage key exists
   * @param key - Storage key to check
   * @returns true if the key exists
   */
  has<K extends keyof StorageKeyMap>(key: K): boolean;

  /**
   * Delete data for the given storage key
   * @param key - Storage key to delete
   */
  delete<K extends keyof StorageKeyMap>(key: K): void;

  /**
   * Get all storage keys
   * @returns Array of all storage keys
   */
  getAllKeys(): (keyof StorageKeyMap)[];

  /**
   * Clear all stored data
   */
  clearAll(): void;
}
