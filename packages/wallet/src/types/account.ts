/**
 * Account types based on Flow Wallet Kit iOS Account implementation
 */

import { type Chain } from './chain';
import { type AccountKey } from './key';

/**
 * Base account interface
 */
export interface BaseAccountData {
  address: string;
  chain: Chain;
  network: string;
  keyIndex?: number; // undefined for watch-only accounts
  name?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Flow-specific account data
 */
export interface FlowAccountData extends BaseAccountData {
  chain: Chain.Flow;
  keyId?: number;
  signAlgo?: string;
  hashAlgo?: string;
  balance?: string;
  keys?: AccountKey[];
  contracts?: Record<string, any>;
  storage?: {
    used: number;
    capacity: number;
  };
}

/**
 * EVM-specific account data
 */
export interface EVMAccountData extends BaseAccountData {
  chain: Chain.EVM;
  balance?: string;
  nonce?: number;
  tokens?: EVMToken[];
}

/**
 * COA (Cadence Owned Account) data
 */
export interface COAData {
  address: string;
  balance: string;
  nonce: number;
  deployed: boolean;
  parentAddress: string;
  createdAt: number;
}

/**
 * Child account data
 */
export interface ChildAccountData {
  address: string;
  name?: string;
  type: string; // e.g., 'dapper', 'custodial'
  parentAddress: string;
  metadata?: Record<string, any>;
}

/**
 * EVM token data
 */
export interface EVMToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  logoUri?: string;
}

/**
 * Account signing result
 */
export interface AccountSigningResult {
  signature: string;
  keyId?: number; // Flow-specific
  signAlgo?: string; // Flow-specific
  hashAlgo?: string; // Flow-specific
}

/**
 * Account creation parameters
 */
export interface CreateAccountParams {
  address: string;
  network: string;
  keyIndex?: number;
  name?: string;
  metadata?: Record<string, any>;
}

/**
 * Account cache key generators
 */
export const ACCOUNT_CACHE_KEYS = {
  ACCOUNT_DATA: (address: string, network: string) => `account:${network}:${address}`,
  ACCOUNT_KEYS: (address: string, network: string) => `account_keys:${network}:${address}`,
  COA_DATA: (address: string, network: string) => `coa:${network}:${address}`,
  CHILD_ACCOUNTS: (address: string, network: string) => `children:${network}:${address}`,
  EVM_TOKENS: (address: string, network: string) => `evm_tokens:${network}:${address}`,
} as const;

/**
 * Account query options
 */
export interface AccountQueryOptions {
  includeKeys?: boolean;
  includeContracts?: boolean;
  includeStorage?: boolean;
  includeCOA?: boolean;
  includeChildren?: boolean;
  useCache?: boolean;
  cacheTimeout?: number; // in milliseconds
}

/**
 * Account update parameters
 */
export interface AccountUpdateParams {
  name?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}
