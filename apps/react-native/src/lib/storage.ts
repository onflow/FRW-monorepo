import type { Storage } from '@onflow/frw-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

// In-memory cache for synchronous operations
class AsyncStorageCache {
  private cache: Map<string, string> = new Map();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = this._doInitialize();
    await this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      
      for (const [key, value] of items) {
        if (value !== null) {
          this.cache.set(key, value);
        }
      }
      this.initialized = true;
    } catch (error) {
      console.error('Storage initialization error:', error);
      this.initialized = true; // Continue with empty cache
    }
  }

  async set(key: string, value: string): Promise<void> {
    await this.initialize();
    this.cache.set(key, value);
    
    // Async persist to AsyncStorage
    AsyncStorage.setItem(key, value).catch(error => {
      console.error('Storage persist error:', error);
    });
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
    
    // Async remove from AsyncStorage
    AsyncStorage.removeItem(key).catch(error => {
      console.error('Storage remove error:', error);
    });
  }

  contains(key: string): boolean {
    return this.cache.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  clearAll(): void {
    this.cache.clear();
    
    // Async clear AsyncStorage
    AsyncStorage.clear().catch(error => {
      console.error('Storage clear error:', error);
    });
  }
}

const storageCache = new AsyncStorageCache();

// Storage implementation that matches the Storage interface
export const storage: Storage = {
  set: (key: string, value: boolean | string | number | ArrayBuffer): void => {
    let stringValue: string;
    
    if (value instanceof ArrayBuffer) {
      // Convert ArrayBuffer to base64 string using Buffer
      const bytes = new Uint8Array(value);
      stringValue = Buffer.from(bytes).toString('base64');
    } else {
      stringValue = String(value);
    }
    
    // Use fire-and-forget async operation
    storageCache.set(key, stringValue);
  },

  getBoolean: (key: string): boolean | undefined => {
    const value = storageCache.get(key);
    if (value === undefined) return undefined;
    return value === 'true';
  },

  getString: (key: string): string | undefined => {
    return storageCache.get(key);
  },

  getNumber: (key: string): number | undefined => {
    const value = storageCache.get(key);
    if (value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  },

  getBuffer: (key: string): ArrayBufferLike | undefined => {
    const value = storageCache.get(key);
    if (value === undefined) return undefined;
    
    try {
      // Convert base64 string back to ArrayBuffer
      const buffer = Buffer.from(value, 'base64');
      return buffer.buffer;
    } catch {
      return undefined;
    }
  },

  contains: (key: string): boolean => {
    return storageCache.contains(key);
  },

  delete: (key: string): void => {
    storageCache.delete(key);
  },

  getAllKeys: (): string[] => {
    return storageCache.getAllKeys();
  },

  clearAll: (): void => {
    storageCache.clearAll();
  },

  recrypt: (_key: string | undefined): void => {
    // AsyncStorage doesn't support encryption, this is a no-op
    console.warn('Storage recrypt is not supported with AsyncStorage');
  },

  trim: (): void => {
    // AsyncStorage doesn't require manual trimming, this is a no-op
  },
};

// AsyncStorage adapter for Zustand
export const asyncStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};
