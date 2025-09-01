import type { TokenModel, User, RecentRecipient } from '@onflow/frw-types';

// Re-export types for external use
export type { RecentRecipient };

/**
 * Generic wrapper for all stored data with versioning and metadata
 */
export type StorageData<T> = T & {
  version: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Wallet configuration data model
 */
export interface WalletConfig {
  address: string;
  keyIndex: number;
  network: string;
}

/**
 * Application settings data model
 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  notifications: boolean;
}

/**
 * Authentication data model
 */
export interface AuthData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Generic cache data model
 */
export interface CacheData {
  [key: string]: unknown;
}

/**
 * Query cache data structure for TanStack Query persistence
 */
export interface QueryCacheEntry {
  data: unknown;
  dataUpdatedAt: number;
  error: unknown;
  errorUpdatedAt: number;
  fetchFailureCount: number;
  fetchFailureReason: unknown;
  fetchMeta: unknown;
  isInvalidated: boolean;
  state: 'loading' | 'error' | 'success';
}

export interface QueryCacheData {
  [queryKey: string]: QueryCacheEntry;
}

/**
 * Storage key definitions with their corresponding data types
 * All data is automatically wrapped with StorageData<T> for versioning
 */
export interface StorageKeyMap {
  tokens: StorageData<TokenModel[]>;
  user: StorageData<User>;
  wallet: StorageData<WalletConfig>;
  settings: StorageData<AppSettings>;
  auth: StorageData<AuthData>;
  cache: StorageData<CacheData>;
  recentRecipients: StorageData<RecentRecipient[]>;

  // TanStack Query cache persistence - namespaced to avoid conflicts
  'tanstack-query-cache': StorageData<QueryCacheData>;
}
