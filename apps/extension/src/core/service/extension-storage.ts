/**
 * Extension Storage Adapter for Wallet Package
 * Implements StorageProtocol using chrome.storage.local
 */

import type { StorageProtocol } from '@onflow/frw-wallet';

export class ExtensionStorage implements StorageProtocol {
  private version = '1.0';
  private keyPrefix = `wallet-${this.version}-`;

  async allKeys(): Promise<string[]> {
    // This is a synchronous property, but chrome.storage is async
    // We'll maintain a cache of keys or return empty array

    return await chrome.storage.local.getKeys();
  }

  async findKey(keyword: string): Promise<string[]> {
    try {
      // Get all keys from chrome storage
      const allKeys = await this.allKeys();

      // Filter keys that contain the keyword and have our prefix
      return allKeys
        .filter((key) => key.startsWith(this.keyPrefix) && key.includes(keyword))
        .map((key) => key.substring(this.keyPrefix.length)); // Remove prefix
    } catch (error) {
      console.error(`ExtensionStorage.findKey failed for keyword: ${keyword}`, error);
      return [];
    }
  }

  async get(key: string): Promise<Uint8Array | null> {
    try {
      const fullKey = `${this.keyPrefix}${key}`;
      const result = await chrome.storage.local.get(fullKey);
      const value = result[fullKey];

      if (value === undefined || value === null) {
        return null;
      }

      // If value is already a Uint8Array, return it
      if (value instanceof Uint8Array) {
        return value;
      }

      // If value is an array of numbers, convert to Uint8Array
      if (Array.isArray(value)) {
        return new Uint8Array(value);
      }

      // If value is a string, encode it
      if (typeof value === 'string') {
        return new TextEncoder().encode(value);
      }

      // If value is an object, serialize it
      const jsonString = JSON.stringify(value);
      return new TextEncoder().encode(jsonString);
    } catch (error) {
      console.error(`ExtensionStorage.get failed for key: ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: Uint8Array): Promise<void> {
    try {
      const fullKey = `${this.keyPrefix}${key}`;
      // Convert Uint8Array to regular array for chrome.storage
      const arrayValue = Array.from(value);
      await chrome.storage.local.set({ [fullKey]: arrayValue });
    } catch (error) {
      console.error(`ExtensionStorage.set failed for key: ${key}`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const fullKey = `${this.keyPrefix}${key}`;
      await chrome.storage.local.remove(fullKey);
    } catch (error) {
      console.error(`ExtensionStorage.remove failed for key: ${key}`, error);
      throw error;
    }
  }

  async removeAll(): Promise<void> {
    try {
      // Get all keys from storage
      const result = await chrome.storage.local.get(null);
      const keysToRemove = Object.keys(result).filter((key) => key.startsWith(this.keyPrefix));

      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
      }
    } catch (error) {
      console.error('ExtensionStorage.removeAll failed', error);
      throw error;
    }
  }
}
