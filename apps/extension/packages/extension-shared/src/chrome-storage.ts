import { type Storage, type StorageChange, type AreaName } from '@onflow/frw-data-model';

import { consoleError } from '@onflow/frw-shared/utils';

/**
 * Chrome Extension Storage Implementation
 * This provides Chrome storage functionality for extensions
 */

class ChromeStorage implements Storage {
  // Session storage operations
  async getSession<T = unknown>(key: string): Promise<T | undefined> {
    const result = await chrome.storage.session?.get(key);
    return key ? (result[key] as T | undefined) : (result as T | undefined);
  }

  async setSession(key: string, value: unknown): Promise<void> {
    return chrome.storage.session?.set({ [key]: value });
  }

  async removeSession(key: string): Promise<void> {
    await chrome.storage.session?.remove(key);
  }

  async clearSession(): Promise<void> {
    await chrome.storage.session.clear();
  }

  // Local storage operations
  async get<T = unknown>(key: string): Promise<T | undefined> {
    const result = await chrome.storage.local.get(key);
    return key ? (result[key] as T | undefined) : (result as T | undefined);
  }

  async set(key: string, value: unknown): Promise<void> {
    return chrome.storage.local.set({ [key]: value });
  }

  async remove(key: string): Promise<void> {
    await chrome.storage.local.remove(key);
  }

  async clear(): Promise<void> {
    await chrome.storage.local.clear();
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
    const newValue = JSON.stringify(item);
    return await this.set(key, newValue);
  }

  private async checkExpiry(value: unknown, key: string): Promise<unknown> {
    if (!value || typeof value !== 'string') {
      return value;
    }

    try {
      const item = JSON.parse(value);
      const now = new Date();
      if (now.getTime() > item.expiry) {
        await this.remove(key);
        return null;
      }
      return item.value;
    } catch (error) {
      consoleError('Error parsing storage data', error);
      try {
        await this.remove(key);
      } catch (error) {
        consoleError('Error removing expired storage data', error);
      }
      return null;
    }
  }

  // Storage change listeners
  addStorageListener(
    callback: (changes: { [key: string]: StorageChange }, namespace: AreaName) => void
  ): void {
    chrome.storage.onChanged.addListener(callback);
  }

  removeStorageListener(
    callback: (changes: { [key: string]: StorageChange }, namespace: AreaName) => void
  ): void {
    chrome.storage.onChanged.removeListener(callback);
  }
}

/**
 * Chrome storage implementation for extensions
 */
export const chromeStorage: Storage = new ChromeStorage();
