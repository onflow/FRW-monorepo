/**
 * EVMAccount class for handling EVM-based accounts
 * Can be a standalone EVM account or a COA (Cadence Owned Account)
 */

import { type FlowAccount } from './FlowAccount';
import {
  type FlowChainID,
  type KeyProtocol,
  type SecurityCheckDelegate,
  SignatureAlgorithm,
  HashAlgorithm,
} from '../types/key';


/**
 * EVM Account class for handling EVM-based accounts
 */
export class EVMAccount {
  readonly address: string;
  readonly chainID: FlowChainID;
  readonly key?: KeyProtocol;
  readonly parentFlowAccount?: FlowAccount; // If this is a COA

  // State
  isLoading: boolean = false;
  balance?: string;
  nonce?: number;
  securityDelegate?: SecurityCheckDelegate;

  constructor(
    address: string,
    chainID: FlowChainID,
    key?: KeyProtocol,
    parentFlowAccount?: FlowAccount
  ) {
    this.address = address.startsWith('0x') ? address : `0x${address}`;
    this.chainID = chainID;
    this.key = key;
    this.parentFlowAccount = parentFlowAccount;
  }

  // Computed properties
  get canSign(): boolean {
    return this.key !== undefined;
  }

  get hexAddr(): string {
    return this.address.replace('0x', '');
  }

  get isLinkedToCOA(): boolean {
    return this.parentFlowAccount !== undefined;
  }

  get isCOA(): boolean {
    return this.isLinkedToCOA;
  }

  // EVM-specific signing method
  async signTransaction(transactionData: Uint8Array): Promise<Uint8Array> {
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

    // EVM typically uses secp256k1 with Keccak256 (but we'll use what's available)
    return await this.key.sign(
      transactionData,
      SignatureAlgorithm.ECDSA_secp256k1,
      // Note: EVM uses Keccak256, but we'll use SHA3_256 as available hash algorithm
      HashAlgorithm.SHA3_256
    );
  }

  // Methods
  async fetchBalance(): Promise<string> {
    // This would fetch balance from EVM RPC
    this.balance = '0';
    return this.balance;
  }

  async fetchNonce(): Promise<number> {
    // This would fetch nonce from EVM RPC
    this.nonce = 0;
    return this.nonce;
  }

  async fetchAccount(): Promise<void> {
    try {
      this.isLoading = true;
      await Promise.all([this.fetchBalance(), this.fetchNonce()]);
    } finally {
      this.isLoading = false;
    }
  }

  // Helper methods
  get shortAddress(): string {
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }

  get displayName(): string {
    if (this.isCOA && this.parentFlowAccount) {
      return `COA of ${this.parentFlowAccount.address.slice(0, 8)}...`;
    }
    return `EVM Account (${this.shortAddress})`;
  }
}
