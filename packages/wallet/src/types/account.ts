/**
 * Account types - data models only (exact match to Flow Wallet Kit iOS)
 */

import { type Chain } from './chain';
import {
  type FlowAddress,
  type FlowChainID,
  type Network,
  type FlowNetwork,
  type EVMNetworkConfig,
} from './key';

/**
 * Base account interface with shared properties
 */
export interface BaseAccount {
  address: FlowAddress;
  chain: Chain;
  network: Network;
  name?: string;
  description?: string;
  icon?: string; // URL string
}

/**
 * Flow account specific properties and methods
 */
export interface FlowAccount extends BaseAccount {
  chain: Chain.Flow;
  network: FlowNetwork;
  keyIndex?: number;
  publicKey?: string;
  hashAlgorithm?: string;
  signatureAlgorithm?: string;
  weight?: number;
}

/**
 * EVM account specific properties and methods
 */
export interface EVMAccount extends BaseAccount {
  chain: Chain.EVM;
  network: EVMNetworkConfig;
  balance?: string;
  nonce?: number;
  publicKey?: string;
}

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
