/**
 * @onflow/frw-wallet - TypeScript wallet package for private key-based multi-account management
 * Based on Flow Wallet Kit iOS implementation patterns
 */

// Core wallet functionality
export { Wallet } from './core/wallet';

// Account classes
export { BaseAccount } from './accounts/base-account';
export { FlowAccount } from './accounts/flow-account';
export { EVMAccount } from './accounts/evm-account';
export { AccountFactory } from './accounts/account-factory';

// Storage implementations
export { createSecureStorage, PlatformSecureStorage } from './storage/secure-storage';
export { createCacheStorage, PlatformCacheStorage } from './storage/cache-storage';
export {
  createMockSecureStorage,
  createMockCacheStorage,
  createMockStorageSetup,
  MockSecureStorage,
  MockCacheStorage,
} from './storage/mock-storage';

// Type definitions
export type * from './types';

// Error classes
export {
  WalletError,
  StorageError,
  KeyError,
  AccountError,
  NetworkError,
  WalletOperationError,
} from './types/errors';

// Constants and utilities
export { BIP44_PATHS } from './types/key';
export { ACCOUNT_CACHE_KEYS } from './types/account';
export { WALLET_CACHE_KEYS } from './types/wallet';
