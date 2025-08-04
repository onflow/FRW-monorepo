import { consoleError } from '@onflow/frw-shared/utils';

import { type Storage, type StorageChange, type AreaName } from './storage-types';

/**
 * Memory Storage Implementation
 * This provides a simple in memory storage that works in javascript
 */

class MemoryStorage implements Storage {
  private localStorage = new Map<string, unknown>();
  private sessionStorage = new Map<string, unknown>();
  private listeners: Array<
    (changes: { [key: string]: StorageChange }, namespace: AreaName) => void
  > = [];

  // Session storage operations
  async getSession<T = unknown>(key: string): Promise<T | undefined> {
    return this.sessionStorage.get(key) as T | undefined;
  }

  async setSession(key: string, value: unknown): Promise<void> {
    const oldValue = this.sessionStorage.get(key);
    this.sessionStorage.set(key, value);
    this.notifyListeners(key, oldValue, value, 'session');
  }

  async removeSession(key: string): Promise<void> {
    const oldValue = this.sessionStorage.get(key);
    this.sessionStorage.delete(key);
    this.notifyListeners(key, oldValue, undefined, 'session');
  }

  async clearSession(): Promise<void> {
    const oldValues = new Map(this.sessionStorage);
    this.sessionStorage.clear();
    for (const [key, oldValue] of oldValues) {
      this.notifyListeners(key, oldValue, undefined, 'session');
    }
  }

  // Local storage operations
  async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.localStorage.get(key) as T | undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    const oldValue = this.localStorage.get(key);
    this.localStorage.set(key, value);
    this.notifyListeners(key, oldValue, value, 'local');
  }

  async remove(key: string): Promise<void> {
    const oldValue = this.localStorage.get(key);
    this.localStorage.delete(key);
    this.notifyListeners(key, oldValue, undefined, 'local');
  }

  async clear(): Promise<void> {
    const oldValues = new Map(this.localStorage);
    this.localStorage.clear();
    for (const [key, oldValue] of oldValues) {
      this.notifyListeners(key, oldValue, undefined, 'local');
    }
  }

  // TTL storage operations (with expiration)
  async getExpiry(key: string): Promise<unknown> {
    const data = await this.get(key);
    return this.checkExpiry(data, key);
  }

  async setExpiry(key: string, value: unknown, ttl: number): Promise<void> {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };
    await this.set(key, item);
  }

  private async checkExpiry(value: unknown, key: string): Promise<unknown> {
    if (!value || typeof value !== 'object') {
      return value;
    }

    const item = value as { value: unknown; expiry: number };
    if (!item.expiry) {
      return value;
    }

    const now = new Date();
    if (now.getTime() > item.expiry) {
      await this.remove(key);
      return null;
    }
    return item.value;
  }

  // Storage change listeners
  addStorageListener(
    callback: (changes: { [key: string]: StorageChange }, namespace: AreaName) => void
  ): void {
    this.listeners.push(callback);
  }

  removeStorageListener(
    callback: (changes: { [key: string]: StorageChange }, namespace: AreaName) => void
  ): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(
    key: string,
    oldValue: unknown,
    newValue: unknown,
    namespace: AreaName
  ): void {
    const change: StorageChange = {
      oldValue,
      newValue,
    };

    const changes = { [key]: change };
    for (const listener of this.listeners) {
      try {
        listener(changes, namespace);
      } catch (error) {
        consoleError('Error in storage listener:', error);
      }
    }
  }
}

/**
 * Default memory storage instance
 */
export const memoryStorage: Storage = new MemoryStorage();
