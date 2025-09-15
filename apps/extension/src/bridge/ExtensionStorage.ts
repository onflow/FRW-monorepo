import type { Storage, StorageKeyMap } from '@onflow/frw-context';

import { chromeStorage } from '@/extension-shared/chrome-storage';

// Extend Chrome storage interface to include getKeys method
interface ChromeStorageWithKeys extends chrome.storage.StorageArea {
  getKeys(): Promise<string[]>;
}

/**
 * Extension Storage Implementation
 * Implements the context Storage interface using Chrome storage
 */
export class ExtensionStorage implements Storage {
  private readonly storageArea = chromeStorage;

  async get<K extends keyof StorageKeyMap>(key: K): Promise<StorageKeyMap[K] | undefined> {
    try {
      // ChromeStorage.get() returns the value directly, not wrapped in an object
      const value = await this.storageArea.get(key as string);

      if (!value) return undefined;

      // Parse JSON if string, return as-is if object
      return typeof value === 'string' ? JSON.parse(value) : (value as StorageKeyMap[K]);
    } catch (error) {
      console.error(`Failed to get ${key as string}:`, error);
      return undefined;
    }
  }

  async set<K extends keyof StorageKeyMap>(
    key: K,
    value: Omit<StorageKeyMap[K], 'version' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      const now = Date.now();
      const existingData = await this.get(key);

      const dataWithMetadata = {
        ...value,
        version: '1.0.0',
        createdAt: existingData?.createdAt ?? now,
        updatedAt: now,
      } as StorageKeyMap[K];

      // ChromeStorage.set() expects raw data, not JSON string
      await this.storageArea.set(key as string, dataWithMetadata);
    } catch (error) {
      throw new Error(`Storage write failed: ${error}`);
    }
  }

  async has<K extends keyof StorageKeyMap>(key: K): Promise<boolean> {
    try {
      const value = await this.storageArea.get(key as string);
      return value !== undefined;
    } catch {
      return false;
    }
  }

  async delete<K extends keyof StorageKeyMap>(key: K): Promise<void> {
    try {
      await this.storageArea.remove(key as string);
    } catch (error) {
      console.error(`Failed to delete ${key as string}:`, error);
    }
  }

  async getAllKeys(): Promise<(keyof StorageKeyMap)[]> {
    try {
      const keys = await (this.storageArea as unknown as ChromeStorageWithKeys).getKeys();

      const validKeys: (keyof StorageKeyMap)[] = [];

      const storageKeys = Object.keys({} as StorageKeyMap) as (keyof StorageKeyMap)[];

      const isValidStorageKey = (key: string): key is keyof StorageKeyMap => {
        return storageKeys.includes(key as keyof StorageKeyMap);
      };

      for (const key of keys) {
        if (isValidStorageKey(key)) {
          validKeys.push(key);
        }
      }
      return validKeys;
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  async clearAll(): Promise<void> {
    try {
      await this.storageArea.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}
