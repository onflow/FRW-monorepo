/**
 * Account types - data models only (exact match to Flow Wallet Kit iOS)
 */

import { type FlowAddress, type FlowChainID } from './key';

/**
 * Child account data structure - matches iOS ChildAccount
 */
export interface ChildAccount {
  id: FlowAddress;
  address: FlowAddress;
  network: FlowChainID;
  parentAddress: FlowAddress;
  name?: string;
  description?: string;
  icon?: string; // URL string
}

/**
 * Flow VM enumeration
 */
export enum FlowVM {
  EVM = 'EVM',
}

/**
 * Flow VM protocol
 */
export interface FlowVMProtocol {
  vm: FlowVM;
}

// Legacy exports for backward compatibility (to be removed later)
export interface BaseAccountData {
  address: string;
  chain: string;
  network: FlowChainID;
}

export interface AccountMetadata {
  name?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FlowAccountData extends BaseAccountData {
  keyIndex?: number;
}

export interface EVMAccountData extends BaseAccountData {
  balance?: string;
}
