import type { Storage, StorageKeyMap } from '@onflow/frw-context';

import { chromeStorage } from '@/extension-shared/chrome-storage';

/**
 * Extension Storage Implementation
 * Implements the context Storage interface using Chrome storage
 */
export class ExtensionStorage implements Storage {
  private readonly storageArea = chromeStorage;

  async get<K extends keyof StorageKeyMap>(key: K): Promise<StorageKeyMap[K] | undefined> {
    try {
      const data = (await this.storageArea.get(key as string)) as Record<string, unknown>;
      const value = data[key as string];

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

      await this.storageArea.set(key as string, JSON.stringify(dataWithMetadata));
    } catch (error) {
      console.error(`Failed to set ${key as string}:`, error);
      throw new Error(`Storage write failed: ${error}`);
    }
  }

  async has<K extends keyof StorageKeyMap>(key: K): Promise<boolean> {
    try {
      const data = (await this.storageArea.get(key as string)) as Record<string, unknown>;
      return data[key as string] !== undefined;
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
      // Chrome storage doesn't have a direct getAllKeys method, so we'll return an empty array
      // In a real implementation, you might want to maintain a separate key registry
      return [];
    } catch {
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

  // Optional methods for platform-specific functionality
  async recrypt?(key: string | undefined): Promise<void> {
    // Chrome storage doesn't support encryption, so this is a no-op
    console.warn('recrypt() is not supported in Chrome storage');
  }

  async trim?(): Promise<void> {
    // Chrome storage doesn't need trimming, so this is a no-op
    console.warn('trim() is not supported in Chrome storage');
  }
}
