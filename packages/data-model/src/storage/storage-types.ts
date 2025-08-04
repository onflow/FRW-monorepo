export type StorageChange = {
  oldValue?: unknown;
  newValue?: unknown;
};

export type AreaName = 'local' | 'sync' | 'session' | 'managed';

/**
 * Storage interface
 */
export interface Storage {
  // Session storage operations
  getSession<T = unknown>(key: string): Promise<T | undefined>;
  setSession(key: string, value: unknown): Promise<void>;
  removeSession(key: string): Promise<void>;
  clearSession(): Promise<void>;

  // Local storage operations
  get<T = unknown>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;

  getExpiry(key: string): Promise<unknown>;
  setExpiry(key: string, value: unknown, ttl: number): Promise<void>;

  // Storage change listeners
  addStorageListener(
    callback: (changes: { [key: string]: StorageChange }, namespace: AreaName) => void
  ): void;
  removeStorageListener(
    callback: (changes: { [key: string]: StorageChange }, namespace: AreaName) => void
  ): void;
}

/**
 * Storage configuration for initializing
 */
export interface StorageConfig {
  implementation: Storage;
}
