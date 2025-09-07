/**
 * Wallet types based on Flow Wallet Kit iOS Wallet implementation
 */

import { type FlowAccountData, type EVMAccountData } from './account';
import { type Chain } from './chain';
import { type KeyType } from './key';
import { type SecureStorage, type CacheStorage } from './storage';

/**
 * Wallet data interface
 */
export interface WalletData {
  id: string;
  name: string;
  type: KeyType;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

/**
 * Wallet configuration
 */
export interface WalletConfig {
  secureStorage: SecureStorage;
  cacheStorage: CacheStorage;
  networks: string[];
  defaultNetwork?: string;
}

/**
 * Wallet creation parameters
 */
export interface CreateWalletParams {
  name: string;
  type: KeyType;
  mnemonic?: string; // for mnemonic wallets
  privateKey?: string; // for private key wallets
  password: string;
  metadata?: Record<string, any>;
}

/**
 * Import wallet parameters
 */
export interface ImportWalletParams {
  name: string;
  mnemonic?: string;
  privateKey?: string;
  password: string;
  derivationIndexes?: number[]; // which accounts to derive
  metadata?: Record<string, any>;
}

/**
 * Wallet account map type
 */
export type WalletAccountMap = Map<string, FlowAccountData | EVMAccountData>;

/**
 * Wallet state interface
 */
export interface WalletState {
  loaded: boolean;
  unlocked: boolean;
  accounts: WalletAccountMap;
  selectedAccount?: string; // account address
}

/**
 * Account derivation parameters
 */
export interface AccountDerivationParams {
  keyIndex: number;
  chain: Chain;
  network: string;
  name?: string;
}

/**
 * Wallet operation result
 */
export interface WalletOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Wallet account discovery parameters
 */
export interface AccountDiscoveryParams {
  chain: Chain;
  network: string;
  startIndex?: number;
  maxAccounts?: number;
  includeEmpty?: boolean;
}

/**
 * Account discovery result
 */
export interface AccountDiscoveryResult {
  accounts: (FlowAccountData | EVMAccountData)[];
  nextIndex: number;
  hasMore: boolean;
}

/**
 * Wallet backup data
 */
export interface WalletBackupData {
  version: string;
  walletData: WalletData;
  encryptedMnemonic?: string;
  encryptedPrivateKey?: string;
  accounts: (FlowAccountData | EVMAccountData)[];
  metadata: {
    exportedAt: number;
    appVersion: string;
  };
}

/**
 * Wallet restore parameters
 */
export interface WalletRestoreParams {
  backupData: WalletBackupData;
  password: string;
  newName?: string;
  selectiveAccounts?: string[]; // addresses to restore
}

/**
 * Wallet cache keys
 */
export const WALLET_CACHE_KEYS = {
  WALLET_DATA: (walletId: string) => `wallet:${walletId}`,
  WALLET_ACCOUNTS: (walletId: string) => `wallet_accounts:${walletId}`,
  WALLET_STATE: (walletId: string) => `wallet_state:${walletId}`,
  ACCOUNT_DISCOVERY: (walletId: string, chain: Chain, network: string) =>
    `discovery:${walletId}:${chain}:${network}`,
} as const;
