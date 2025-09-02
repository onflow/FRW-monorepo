import { type Storage, type StorageKeyMap } from '@onflow/frw-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage implementation of the Storage interface
 * Handles versioning and metadata automatically for all stored data
 */
export class AsyncStorageImpl implements Storage {
  private readonly VERSION = '1.0.0';

  /**
   * Get typed data for the given storage key
   */
  async get<K extends keyof StorageKeyMap>(key: K): Promise<StorageKeyMap[K] | undefined> {
    try {
      const value = await AsyncStorage.getItem(String(key));
      if (value === null) {
        return undefined;
      }
      return JSON.parse(value) as StorageKeyMap[K];
    } catch (error) {
      console.warn(`[AsyncStorageImpl] Failed to get key "${String(key)}":`, error);
      return undefined;
    }
  }

  /**
   * Set typed data for the given storage key
   * Automatically adds/updates version, createdAt, and updatedAt metadata
   */
  async set<K extends keyof StorageKeyMap>(
    key: K,
    value: Omit<StorageKeyMap[K], 'version' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      const now = Date.now();
      const existingData = await this.get(key);

      const dataWithMetadata = {
        ...value,
        version: this.VERSION,
        createdAt: existingData?.createdAt ?? now,
        updatedAt: now,
      } as StorageKeyMap[K];

      await AsyncStorage.setItem(String(key), JSON.stringify(dataWithMetadata));
    } catch (error) {
      throw new Error(`Failed to set key "${String(key)}": ${error}`);
    }
  }

  /**
   * Check if a storage key exists
   */
  async has<K extends keyof StorageKeyMap>(key: K): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(String(key));
      return value !== null;
    } catch (error) {
      console.warn(`[AsyncStorageImpl] Failed to check key "${String(key)}":`, error);
      return false;
    }
  }

  /**
   * Delete data for the given storage key
   */
  async delete<K extends keyof StorageKeyMap>(key: K): Promise<void> {
    try {
      await AsyncStorage.removeItem(String(key));
    } catch (error) {
      console.warn(`[AsyncStorageImpl] Failed to delete key "${String(key)}":`, error);
    }
  }

  /**
   * Get all storage keys
   */
  async getAllKeys(): Promise<(keyof StorageKeyMap)[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys as (keyof StorageKeyMap)[];
    } catch (error) {
      console.warn('[AsyncStorageImpl] Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.warn('[AsyncStorageImpl] Failed to clear all data:', error);
    }
  }

  /**
   * AsyncStorage doesn't support encryption - this is a no-op
   * For encryption, consider using Keychain services separately
   */
  async recrypt?(_key: string | undefined): Promise<void> {
    console.warn('[AsyncStorageImpl] Recrypt operation not supported by AsyncStorage');
  }

  /**
   * AsyncStorage doesn't need explicit trimming - this is a no-op
   */
  async trim?(): Promise<void> {
    // AsyncStorage handles memory management automatically
  }
}
