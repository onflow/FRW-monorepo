import { memoryStorage } from './memory-storage';
import {
  type Storage,
  type StorageConfig,
  type StorageChange,
  type AreaName,
} from './storage-types';

/**
 * Global storage manager
 */
class StorageManager {
  private static instance: StorageManager;
  private storageImplementation: Storage;
  private initialized = false;

  private constructor() {
    // Default to in-memory storage for platform independence
    this.storageImplementation = memoryStorage;
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Initialize the storage system with a custom implementation
   */
  initialize(config: StorageConfig): void {
    this.storageImplementation = config.implementation;
    this.initialized = true;
  }

  /**
   * Auto-initialize storage (uses memory storage by default)
   * Only switches to Chrome storage if explicitly configured via initialize()
   */
  autoInitialize(): void {
    if (this.initialized) {
      return;
    }
    // Use memory storage by default - no automatic Chrome detection
    this.storageImplementation = memoryStorage;
  }

  /**
   * Get the current storage implementation
   */
  getStorage(): Storage {
    // Auto-initialize if not already done
    if (!this.initialized) {
      this.autoInitialize();
    }
    return this.storageImplementation;
  }
}

// Manual initialization with custom implementation
export function initializeStorage(config: StorageConfig): void {
  StorageManager.getInstance().initialize(config);
}

// Local storage functions
export async function getLocalData<T = unknown>(key: string): Promise<T | undefined> {
  return StorageManager.getInstance().getStorage().get<T>(key);
}

export async function setLocalData<T>(key: string, value: T): Promise<void> {
  return StorageManager.getInstance().getStorage().set(key, value);
}

export async function removeLocalData(key: string): Promise<void> {
  return StorageManager.getInstance().getStorage().remove(key);
}

export async function clearLocalData(): Promise<void> {
  return StorageManager.getInstance().getStorage().clear();
}

// Session storage functions
export async function getSessionData<T = unknown>(key: string): Promise<T | undefined> {
  return StorageManager.getInstance().getStorage().getSession<T>(key);
}

export async function setSessionData<T>(key: string, value: T): Promise<void> {
  return StorageManager.getInstance().getStorage().setSession(key, value);
}

export async function removeSessionData(key: string): Promise<void> {
  return StorageManager.getInstance().getStorage().removeSession(key);
}

export async function clearSessionData(): Promise<void> {
  return StorageManager.getInstance().getStorage().clearSession();
}

// Storage listener functions
export function addStorageListener(
  callback: (changes: { [key: string]: StorageChange }, namespace: AreaName) => void
): void {
  StorageManager.getInstance().getStorage().addStorageListener(callback);
}

export function removeStorageListener(
  callback: (changes: { [key: string]: StorageChange }, namespace: AreaName) => void
): void {
  StorageManager.getInstance().getStorage().removeStorageListener(callback);
}

// Re-export main types that are part of the public API
export type { Storage, StorageConfig, StorageChange, AreaName };
