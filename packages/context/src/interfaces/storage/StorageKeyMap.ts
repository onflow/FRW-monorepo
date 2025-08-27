import type { TokenModel } from '@onflow/frw-types';

/**
 * Generic wrapper for all stored data with versioning and metadata
 */
export type StorageData<T> = T & {
  version: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Storage key definitions with their corresponding data types
 * All data is automatically wrapped with StorageData<T> for versioning
 */
export interface StorageKeyMap {
  tokens: StorageData<TokenModel[]>;
}
