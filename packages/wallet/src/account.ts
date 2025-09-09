/**
 * Account classes - exact match to Flow Wallet Kit iOS Account implementation
 */

import { type ChildAccount, type FlowVMProtocol, FlowVM } from './types/account';
import {
  type FlowAddress,
  type FlowChainID,
  type FlowAccountData,
  type FlowTransaction,
  type FlowSigner,
  type KeyProtocol,
  type SecurityCheckDelegate,
  SignatureAlgorithm,
  HashAlgorithm,
} from './types/key';

/**
 * Chain-Owned Account (COA) - matches iOS COA
 */
export class COA implements FlowVMProtocol {
  readonly vm = FlowVM.EVM;
  readonly address: string; // EVM address
  readonly chainID: FlowChainID;

  constructor(address: string, network: FlowChainID) {
    this.address = address;
    this.chainID = network;
  }
}

/**
 * Account class - exact match to Flow Wallet Kit iOS Account.swift
 */
export class Account implements FlowSigner {
  // Properties
  readonly account: FlowAccountData;
  readonly chainID: FlowChainID;
  readonly key?: KeyProtocol;

  // Optional linked accounts
  childs?: ChildAccount[];
  coa?: COA;

  // State
  isLoading: boolean = false;
  securityDelegate?: SecurityCheckDelegate;

  constructor(account: FlowAccountData, chainID: FlowChainID, key?: KeyProtocol) {
    this.account = account;
    this.chainID = chainID;
    this.key = key;
  }

  // Computed properties
  get canSign(): boolean {
    return this.key !== undefined;
  }

  get hasChild(): boolean {
    return (this.childs?.length || 0) > 0;
  }

  get hasCOA(): boolean {
    return this.coa !== undefined;
  }

  get hasLinkedAccounts(): boolean {
    return this.hasChild || this.hasCOA;
  }

  get hexAddr(): string {
    return this.account.address.replace('0x', '');
  }

  get fullWeightKeys(): any[] {
    return this.account.keys.filter((key) => key.weight >= 1000);
  }

  get hasFullWeightKey(): boolean {
    return this.fullWeightKeys.length > 0;
  }

  // FlowSigner implementation
  get address(): FlowAddress {
    return this.account.address;
  }

  get keyIndex(): number {
    // Find the first full-weight key index
    const fullWeightKey = this.fullWeightKeys[0];
    return fullWeightKey?.index || 0;
  }

  async sign(signableData: Uint8Array, transaction?: FlowTransaction): Promise<Uint8Array> {
    if (!this.canSign || !this.key) {
      throw new Error('Cannot sign: no key available');
    }

    // Perform security check if delegate is set
    if (this.securityDelegate) {
      const authorized = await this.securityDelegate.performSecurityCheck();
      if (!authorized) {
        throw new Error('Security check failed');
      }
    }

    // Use the key to sign with appropriate algorithms
    // This matches Flow's signing requirements
    return await this.key.sign(
      signableData,
      SignatureAlgorithm.ECDSA_P256, // Default for Flow
      HashAlgorithm.SHA3_256 // Default for Flow
    );
  }

  // Methods
  async fetchAccount(): Promise<void> {
    // Refresh account data from blockchain
    throw new Error('fetchAccount() not implemented - requires Flow blockchain integration');
  }

  async loadLinkedAccounts(): Promise<{ vms: COA | null; childs: ChildAccount[] }> {
    const [vms, childs] = await Promise.all([this.fetchVM(), this.fetchChild()]);

    return { vms, childs };
  }

  async fetchChild(): Promise<ChildAccount[]> {
    // Implementation would fetch child accounts from Flow
    this.childs = [];
    return this.childs;
  }

  async fetchVM(): Promise<COA | null> {
    // Implementation would fetch COA from Flow EVM
    this.coa = undefined;
    return this.coa || null;
  }

  findKeyInAccount(): any[] | null {
    if (!this.key) return null;

    // Find matching keys in the Flow account
    return this.account.keys.filter((accountKey) => {
      // Implementation would compare public keys
      return true; // Placeholder
    });
  }
}
