/**
 * Simple web storage implementation for unit tests
 * This serves as an example of how to implement platform-specific storage
 */

import { type StorageProtocol } from '../types/key';

/**
 * Web storage implementation using localStorage
 * For testing purposes only - production apps should use more secure storage
 */
export class TestWebStorage implements StorageProtocol {
  private keyPrefix: string;

  constructor(keyPrefix: string = 'test_wallet_') {
    this.keyPrefix = keyPrefix;
  }

  private prefixKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private unprefixKey(key: string): string {
    return key.startsWith(this.keyPrefix) ? key.slice(this.keyPrefix.length) : key;
  }

  get allKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        keys.push(this.unprefixKey(key));
      }
    }
    return keys;
  }

  async findKey(keyword: string): Promise<string[]> {
    return this.allKeys.filter((key) => key.includes(keyword));
  }

  async get(key: string): Promise<Uint8Array | null> {
    try {
      const prefixedKey = this.prefixKey(key);
      const value = localStorage.getItem(prefixedKey);

      if (!value) {
        return null;
      }

      // Parse JSON and convert array back to Uint8Array
      const data = JSON.parse(value);
      if (data && Array.isArray(data.bytes)) {
        return new Uint8Array(data.bytes);
      }

      return null;
    } catch (error) {
      console.error(`Failed to get key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: Uint8Array): Promise<void> {
    try {
      const prefixedKey = this.prefixKey(key);

      // Convert Uint8Array to JSON-serializable format
      const data = {
        bytes: Array.from(value),
        timestamp: Date.now(),
        type: 'test_encrypted_key_data',
      };

      localStorage.setItem(prefixedKey, JSON.stringify(data));
    } catch (error) {
      throw new Error(`Failed to set key ${key}: ${error}`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const prefixedKey = this.prefixKey(key);
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      throw new Error(`Failed to remove key ${key}: ${error}`);
    }
  }

  async removeAll(): Promise<void> {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.keyPrefix)) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      throw new Error(`Failed to remove all wallet keys: ${error}`);
    }
  }

  // Test utility methods

  /**
   * Clear all test data (for test cleanup)
   */
  clearAll(): void {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): { totalKeys: number; walletKeys: number } {
    let walletKeys = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        walletKeys++;
      }
    }

    return {
      totalKeys: localStorage.length,
      walletKeys,
    };
  }
}
