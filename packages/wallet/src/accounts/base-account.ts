/**
 * BaseAccount abstract class - based on Flow Wallet Kit iOS Account implementation
 * Provides common functionality for all account types
 */

import {
  type BaseAccountData,
  type AccountSigningResult,
  ACCOUNT_CACHE_KEYS,
} from '../types/account';
import { type Chain } from '../types/chain';
import { AccountError, StorageError } from '../types/errors';
import { type KeyMaterial, BIP44_PATHS, type EncryptedKeyData } from '../types/key';
import { type SecureStorage, type CacheStorage } from '../types/storage';

/**
 * Abstract base class for all account types
 * Based on iOS Flow Wallet Kit Account class pattern
 */
export abstract class BaseAccount {
  protected secureStorage: SecureStorage;
  protected cacheStorage: CacheStorage;
  protected walletId: string;

  constructor(
    protected data: BaseAccountData,
    walletId: string,
    secureStorage: SecureStorage,
    cacheStorage: CacheStorage
  ) {
    this.walletId = walletId;
    this.secureStorage = secureStorage;
    this.cacheStorage = cacheStorage;
  }

  // Getters for account data
  get address(): string {
    return this.data.address;
  }

  get chain(): Chain {
    return this.data.chain;
  }

  get network(): string {
    return this.data.network;
  }

  get keyIndex(): number | undefined {
    return this.data.keyIndex;
  }

  get name(): string | undefined {
    return this.data.name;
  }

  get avatar(): string | undefined {
    return this.data.avatar;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  // Abstract methods that must be implemented by subclasses
  abstract sign(message: string, password: string): Promise<AccountSigningResult>;
  abstract canSign(): boolean;
  abstract getPrivateKey(password: string): Promise<string>;
  abstract getPublicKey(password?: string): Promise<string>;
  abstract getDerivationPath(): string;

  /**
   * Check if this is a watch-only account
   */
  isWatchOnly(): boolean {
    return this.keyIndex === undefined;
  }

  /**
   * Update account metadata
   */
  async updateMetadata(updates: Partial<BaseAccountData>): Promise<void> {
    this.data = {
      ...this.data,
      ...updates,
      updatedAt: Date.now(),
    };

    // Cache the updated data
    const cacheKey = ACCOUNT_CACHE_KEYS.ACCOUNT_DATA(this.address, this.network);
    await this.cacheStorage.set(cacheKey, this.data);
  }

  /**
   * Get encrypted key data from secure storage
   */
  protected async getEncryptedKeyData(): Promise<EncryptedKeyData> {
    if (this.isWatchOnly()) {
      throw AccountError.watchOnlySign(this.address);
    }

    const encryptedData = await this.secureStorage.retrieve(this.walletId);

    if (!encryptedData) {
      throw StorageError.keyNotFound(this.walletId);
    }

    try {
      return JSON.parse(encryptedData);
    } catch (error) {
      throw StorageError.decryptionFailed({ walletId: this.walletId, error });
    }
  }

  /**
   * Derive key material for this account
   */
  protected async deriveKeyMaterial(password: string): Promise<KeyMaterial> {
    const encryptedKeyData = await this.getEncryptedKeyData();
    const derivationPath = this.getDerivationPath();

    // This will be implemented with TrustWallet Core integration
    // For now, throw not implemented error
    throw new Error('Key derivation not yet implemented - requires TrustWallet Core integration');
  }

  /**
   * Get base derivation path for this account type
   */
  protected getBaseDerivationPath(): string {
    switch (this.chain) {
      case 'flow':
        return BIP44_PATHS.FLOW;
      case 'evm':
        return BIP44_PATHS.EVM;
      default:
        throw AccountError.invalidAddress(this.address, { reason: 'Unknown chain type' });
    }
  }

  /**
   * Cache account data
   */
  async cacheAccountData(data: any, cacheKey?: string): Promise<void> {
    const key = cacheKey || ACCOUNT_CACHE_KEYS.ACCOUNT_DATA(this.address, this.network);
    await this.cacheStorage.set(key, {
      ...data,
      cachedAt: Date.now(),
    });
  }

  /**
   * Get cached account data
   */
  async getCachedAccountData(cacheKey?: string): Promise<any> {
    const key = cacheKey || ACCOUNT_CACHE_KEYS.ACCOUNT_DATA(this.address, this.network);
    return await this.cacheStorage.get(key);
  }

  /**
   * Clear account cache
   */
  async clearCache(): Promise<void> {
    const prefix = `account:${this.network}:${this.address}`;
    await this.cacheStorage.clearByPrefix(prefix);
  }

  /**
   * Validate account address format
   */
  protected validateAddress(address: string): boolean {
    // Basic validation - can be extended in subclasses
    return typeof address === 'string' && address.length > 0;
  }

  /**
   * Convert account to JSON for serialization
   */
  toJSON(): BaseAccountData {
    return {
      ...this.data,
    };
  }

  /**
   * Get account summary for display purposes
   */
  getSummary() {
    return {
      address: this.address,
      chain: this.chain,
      network: this.network,
      name: this.name,
      avatar: this.avatar,
      canSign: this.canSign(),
      isWatchOnly: this.isWatchOnly(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Compare accounts for equality
   */
  equals(other: BaseAccount): boolean {
    return (
      this.address === other.address && this.chain === other.chain && this.network === other.network
    );
  }

  /**
   * Get unique identifier for this account
   */
  getId(): string {
    return `${this.chain}:${this.network}:${this.address}`;
  }
}
