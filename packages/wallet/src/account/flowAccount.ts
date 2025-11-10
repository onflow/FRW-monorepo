/**
 * FlowAccount class - exact match to Flow Wallet Kit iOS Account.swift
 */

import { type CadenceService } from '@onflow/frw-cadence';

import { COA } from './coa';
import { type ChildAccount } from '../types/account';
import {
  type FlowAddress,
  type FlowChainID,
  type FlowAccountData,
  type FlowTransaction,
  type FlowSigner,
  type KeyProtocol,
  type SecurityCheckDelegate,
  SignatureAlgorithm,
  type FlowAccountKey,
} from '../types/key';

/**
 * FlowAccount class - exact match to Flow Wallet Kit iOS Account.swift
 */
export class FlowAccount implements FlowSigner {
  // Properties
  readonly account: FlowAccountData;
  readonly chainID: FlowChainID;
  readonly key?: KeyProtocol;
  readonly cadenceService: CadenceService;

  // Optional linked accounts
  childs?: ChildAccount[];
  coa?: COA;

  // State
  isLoading: boolean = false;
  securityDelegate?: SecurityCheckDelegate;

  constructor(
    account: FlowAccountData,
    chainID: FlowChainID,
    cadenceService: CadenceService,
    key?: KeyProtocol
  ) {
    this.account = account;
    this.chainID = chainID;
    this.key = key;
    this.cadenceService = cadenceService;
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

  get fullWeightKeys(): FlowAccountKey[] {
    return this.account.keys.filter((key) => !key.revoked && key.weight >= 1000);
  }

  get hasFullWeightKey(): boolean {
    return this.fullWeightKeys.length > 0;
  }

  // FlowSigner implementation
  get address(): FlowAddress {
    return this.account.address;
  }

  get keyIndex(): number {
    // Return 0 as default - actual key index will be resolved asynchronously in findKeyInAccount
    return 0;
  }

  async sign(signableData: Uint8Array, _transaction?: FlowTransaction): Promise<Uint8Array> {
    const signKeys = await this.findKeyInAccount();
    const signKey = signKeys?.[0];
    if (!this.canSign || !this.key || !signKey) {
      throw new Error('Cannot sign: no key available');
    }

    // Perform security check if delegate is set
    if (this.securityDelegate) {
      const authorized = await this.securityDelegate.performSecurityCheck();
      if (!authorized) {
        throw new Error('Security check failed');
      }
    }

    // Use the key to sign with the key's algorithms
    return await this.key.sign(signableData, signKey.signAlgo, signKey.hashAlgo);
  }

  // Methods
  async fetchAccount(): Promise<void> {
    try {
      this.isLoading = true;
      await this.loadLinkedAccounts();
    } finally {
      this.isLoading = false;
    }
  }

  async loadLinkedAccounts(): Promise<{ vms: COA | null; childs: ChildAccount[] }> {
    const [vms, childs] = await Promise.all([this.fetchVM(), this.fetchChild()]);
    return { vms, childs };
  }

  async fetchChild(): Promise<ChildAccount[]> {
    try {
      const childAddresses = await this.cadenceService.getChildAddresses(this.account.address);
      const childMetadata = await this.cadenceService.getChildAccountMeta(this.account.address);

      const childAccounts: ChildAccount[] = childAddresses.map((address: string) => {
        const metadata = childMetadata[address] as Record<string, unknown> | undefined;
        return {
          id: address,
          address,
          network: this.chainID,
          parentAddress: this.account.address,
          name: metadata?.name as string | undefined,
          description: metadata?.description as string | undefined,
          icon: (metadata?.thumbnail as Record<string, unknown>)?.url as string | undefined,
        };
      });

      this.childs = childAccounts;
      return childAccounts;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch child accounts:', error);
      this.childs = [];
      return [];
    }
  }

  async fetchVM(): Promise<COA | null> {
    try {
      const evmAddressHex = await this.cadenceService.getAddr(this.account.address);
      if (!evmAddressHex) {
        this.coa = undefined;
        return null;
      }

      const coa = new COA(evmAddressHex, this.chainID);
      this.coa = coa;
      return coa;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch COA:', error);
      this.coa = undefined;
      return null;
    }
  }

  async findKeyInAccount(): Promise<FlowAccountKey[] | null> {
    if (!this.key) return null;

    const keys: FlowAccountKey[] = [];

    // Get public keys for both supported algorithms
    try {
      const p256PublicKey = await this.key.publicKey(SignatureAlgorithm.ECDSA_P256, undefined);
      if (p256PublicKey) {
        // Convert Uint8Array to hex string (React Native compatible - no Buffer)
        const p256PublicKeyHex = Array.from(p256PublicKey)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        const p256Keys = this.account.keys.filter(
          (key) => !key.revoked && key.weight >= 1000 && key.publicKey.hex === p256PublicKeyHex
        );
        keys.push(...p256Keys);
      }
    } catch {
      // Ignore if this algorithm is not supported
    }

    try {
      const secp256k1PublicKey = await this.key.publicKey(
        SignatureAlgorithm.ECDSA_secp256k1,
        undefined
      );
      if (secp256k1PublicKey) {
        // Convert Uint8Array to hex string (React Native compatible - no Buffer)
        const secp256k1PublicKeyHex = Array.from(secp256k1PublicKey)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        const secpKeys = this.account.keys.filter(
          (key) => !key.revoked && key.weight >= 1000 && key.publicKey.hex === secp256k1PublicKeyHex
        );
        keys.push(...secpKeys);
      }
    } catch {
      // Ignore if this algorithm is not supported
    }

    return keys.length > 0 ? keys : null;
  }

  async createCOA(): Promise<string> {
    if (!this.canSign) {
      throw new Error('Cannot create COA: no signing key available');
    }

    // This would need to be implemented with the actual transaction
    throw new Error('createCOA() not implemented - requires Flow transaction integration');
  }
}
