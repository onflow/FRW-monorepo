/**
 * SecureStorage implementation using @onflow/frw-context
 * Based on Flow Wallet Kit iOS KeychainStorage pattern
 */

import type { Storage } from '@onflow/frw-context';

import { StorageError } from '../types/errors';
import { type SecureStorage, type StorageConfig } from '../types/storage';

/**
 * Platform-agnostic secure storage implementation
 * Uses the encrypted storage layer from @onflow/frw-context
 */
export class PlatformSecureStorage implements SecureStorage {
  private storage: Storage;
  private serviceName: string;

  constructor(storage: Storage, config: StorageConfig) {
    this.storage = storage;
    this.serviceName = config.serviceName;
  }

  /**
   * Generate storage key with service prefix
   */
  private getStorageKey(id: string): string {
    return `${this.serviceName}.${id}`;
  }

  async store(id: string, encryptedData: string): Promise<void> {
    try {
      const key = this.getStorageKey(id);
      await this.storage.set(key, {
        data: encryptedData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
      });
    } catch (error) {
      throw StorageError.saveFailed({ id, error });
    }
  }

  async retrieve(id: string): Promise<string | null> {
    try {
      const key = this.getStorageKey(id);
      const stored = await this.storage.get(key);

      if (!stored) {
        return null;
      }

      // Handle legacy format or direct string storage
      if (typeof stored === 'string') {
        return stored;
      }

      // Handle structured storage format
      if (stored.data) {
        return stored.data;
      }

      return null;
    } catch (error) {
      throw StorageError.loadCacheFailed({ id, error });
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const key = this.getStorageKey(id);
      const existed = await this.exists(id);

      if (existed) {
        await this.storage.remove(key);
        return true;
      }

      return false;
    } catch (error) {
      throw StorageError.saveFailed({ id, operation: 'remove', error });
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const data = await this.retrieve(id);
      return data !== null;
    } catch (error) {
      // If retrieve fails, assume key doesn't exist
      return false;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      // This is a limitation - Storage interface doesn't expose key enumeration
      // For now, we maintain a separate index
      const indexKey = this.getStorageKey('__keys_index__');
      const index = await this.storage.get(indexKey);

      if (!index || !Array.isArray(index)) {
        return [];
      }

      return index;
    } catch (error) {
      return [];
    }
  }

  async findKey(keyword: string): Promise<string[]> {
    try {
      const allKeys = await this.getAllKeys();
      return allKeys.filter((key) => key.includes(keyword));
    } catch (error) {
      return [];
    }
  }

  async removeAll(): Promise<void> {
    try {
      const allKeys = await this.getAllKeys();

      // Remove all data keys
      for (const id of allKeys) {
        await this.remove(id);
      }

      // Remove the index
      const indexKey = this.getStorageKey('__keys_index__');
      await this.storage.remove(indexKey);
    } catch (error) {
      throw StorageError.saveFailed({ operation: 'removeAll', error });
    }
  }

  /**
   * Private method to update keys index
   */
  private async updateKeysIndex(id: string, operation: 'add' | 'remove'): Promise<void> {
    try {
      const indexKey = this.getStorageKey('__keys_index__');
      let index = (await this.storage.get(indexKey)) || [];

      if (!Array.isArray(index)) {
        index = [];
      }

      if (operation === 'add' && !index.includes(id)) {
        index.push(id);
      } else if (operation === 'remove') {
        index = index.filter((key: string) => key !== id);
      }

      await this.storage.set(indexKey, index);
    } catch (error) {
      // Non-critical error, log but don't throw
      console.warn('Failed to update keys index:', error);
    }
  }

  /**
   * Override store to update index
   */
  async storeWithIndex(id: string, encryptedData: string): Promise<void> {
    await this.store(id, encryptedData);
    await this.updateKeysIndex(id, 'add');
  }

  /**
   * Override remove to update index
   */
  async removeWithIndex(id: string): Promise<boolean> {
    const result = await this.remove(id);
    if (result) {
      await this.updateKeysIndex(id, 'remove');
    }
    return result;
  }
}

/**
 * Factory function to create SecureStorage instance
 */
export function createSecureStorage(
  storage: Storage,
  config: Partial<StorageConfig> = {}
): SecureStorage {
  const fullConfig: StorageConfig = {
    version: 1,
    serviceName: 'com.onflow.frw.wallet',
    ...config,
  };

  return new PlatformSecureStorage(storage, fullConfig);
}
