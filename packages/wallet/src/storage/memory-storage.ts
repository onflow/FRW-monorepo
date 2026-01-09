/**
 * Memory storage implementation - matches iOS KeychainStorage interface
 * For testing and development purposes
 */

import { type StorageProtocol } from '../types/key';

/**
 * In-memory storage implementation for testing
 * Matches iOS StorageProtocol interface
 */
export class MemoryStorage implements StorageProtocol {
  private storage = new Map<string, Uint8Array>();

  async allKeys(): Promise<string[]> {
    return new Promise((resolve) => {
      resolve(Array.from(this.storage.keys()));
    });
  }

  async findKey(keyword: string): Promise<string[]> {
    return await this.allKeys().then((keys) => keys.filter((key) => key.includes(keyword)));
  }

  async get(key: string): Promise<Uint8Array | null> {
    return this.storage.get(key) || null;
  }

  async set(key: string, value: Uint8Array): Promise<void> {
    this.storage.set(key, new Uint8Array(value));
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async removeAll(): Promise<void> {
    this.storage.clear();
  }

  // Additional methods for testing

  size(): number {
    return this.storage.size;
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }
}
