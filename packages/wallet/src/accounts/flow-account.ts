/**
 * FlowAccount class - based on Flow Wallet Kit iOS Account implementation
 * Handles Flow blockchain specific functionality
 */

import { BaseAccount } from './base-account';
import {
  type FlowAccountData,
  type AccountSigningResult,
  type COAData,
  type ChildAccountData,
  ACCOUNT_CACHE_KEYS,
} from '../types/account';
import { AccountError, NetworkError } from '../types/errors';
import { type AccountKey, type FlowSignatureParams } from '../types/key';
import { type SecureStorage, type CacheStorage } from '../types/storage';

/**
 * Flow blockchain account implementation
 * Based on iOS Flow Wallet Kit Account.swift pattern
 */
export class FlowAccount extends BaseAccount {
  protected data: FlowAccountData;

  constructor(
    data: FlowAccountData,
    walletId: string,
    secureStorage: SecureStorage,
    cacheStorage: CacheStorage
  ) {
    super(data, walletId, secureStorage, cacheStorage);
    this.data = data;
  }

  // Flow-specific getters
  get keyId(): number | undefined {
    return this.data.keyId;
  }

  get signAlgo(): string | undefined {
    return this.data.signAlgo;
  }

  get hashAlgo(): string | undefined {
    return this.data.hashAlgo;
  }

  get balance(): string | undefined {
    return this.data.balance;
  }

  get keys(): AccountKey[] {
    return this.data.keys || [];
  }

  get contracts(): Record<string, any> | undefined {
    return this.data.contracts;
  }

  get storage(): { used: number; capacity: number } | undefined {
    return this.data.storage;
  }

  /**
   * Get BIP44 derivation path for Flow
   */
  getDerivationPath(): string {
    const basePath = this.getBaseDerivationPath();
    return `${basePath}${this.keyIndex || 0}`;
  }

  /**
   * Check if account can sign transactions
   */
  canSign(): boolean {
    if (this.isWatchOnly()) {
      return false;
    }

    // Check if we have a valid signing key
    const signingKey = this.findSigningKey();
    return signingKey !== null;
  }

  /**
   * Sign message with Flow-specific parameters
   * Based on iOS Flow Wallet Kit signing pattern
   */
  async sign(message: string, password: string): Promise<AccountSigningResult> {
    if (!this.canSign()) {
      throw AccountError.watchOnlySign(this.address);
    }

    const signingKey = this.findSigningKey();
    if (!signingKey) {
      throw AccountError.accountNotFound(this.address, { reason: 'No signing key found' });
    }

    try {
      // Get private key for signing
      const privateKey = await this.getPrivateKey(password);

      // Create Flow signature parameters
      const signatureParams: FlowSignatureParams = {
        keyId: signingKey.index,
        signAlgo: signingKey.signAlgo,
        hashAlgo: signingKey.hashAlgo,
      };

      // Sign with TrustWallet Core (to be implemented)
      const signature = await this.signWithFlowParams(message, privateKey, signatureParams);

      return {
        signature,
        keyId: signatureParams.keyId,
        signAlgo: signatureParams.signAlgo,
        hashAlgo: signatureParams.hashAlgo,
      };
    } catch (error) {
      throw AccountError.accountQueryFailed(this.address, { operation: 'sign', error });
    }
  }

  /**
   * Get private key for this account
   */
  async getPrivateKey(password: string): Promise<string> {
    if (this.isWatchOnly()) {
      throw AccountError.watchOnlySign(this.address);
    }

    const keyMaterial = await this.deriveKeyMaterial(password);

    if (!keyMaterial.privateKey) {
      throw AccountError.accountNotFound(this.address, { reason: 'Private key not available' });
    }

    return keyMaterial.privateKey;
  }

  /**
   * Get public key for this account
   */
  async getPublicKey(password?: string): Promise<string> {
    if (this.isWatchOnly()) {
      // For watch-only, derive from address or use cached key data
      return this.derivePublicKeyFromAddress();
    }

    if (!password) {
      throw new Error('Password required for non-watch-only accounts');
    }

    const keyMaterial = await this.deriveKeyMaterial(password);
    return keyMaterial.publicKey;
  }

  /**
   * Find the appropriate signing key for this account
   * Based on iOS Flow Wallet Kit findKeyInAccount method
   */
  findSigningKey(): AccountKey | null {
    const accountKeys = this.keys;

    if (accountKeys.length === 0) {
      return null;
    }

    // Find non-revoked key with highest weight
    const validKeys = accountKeys.filter((key) => !key.revoked);

    if (validKeys.length === 0) {
      return null;
    }

    // Sort by weight (descending) and return the first one
    validKeys.sort((a, b) => b.weight - a.weight);
    return validKeys[0];
  }

  /**
   * Load COA (Cadence Owned Account) data
   */
  async loadCOA(): Promise<COAData | null> {
    try {
      // Check cache first
      const cacheKey = ACCOUNT_CACHE_KEYS.COA_DATA(this.address, this.network);
      const cachedCOA = await this.getCachedAccountData(cacheKey);

      if (cachedCOA && this.isCacheValid(cachedCOA.cachedAt)) {
        return cachedCOA;
      }

      // Query COA from blockchain
      const coaData = await this.queryCOAFromBlockchain();

      if (coaData) {
        // Cache the result
        await this.cacheAccountData(coaData, cacheKey);
      }

      return coaData;
    } catch (error) {
      throw NetworkError.keyIndexerRequestFailed({ operation: 'loadCOA', error });
    }
  }

  /**
   * Create a new COA (Cadence Owned Account)
   */
  async createCOA(password: string): Promise<COAData> {
    if (!this.canSign()) {
      throw AccountError.watchOnlySign(this.address);
    }

    try {
      // Sign COA creation transaction
      const privateKey = await this.getPrivateKey(password);
      const coaResult = await this.executeCOACreationTransaction(privateKey);

      // Refresh COA data
      const coaData = await this.loadCOA();

      if (!coaData) {
        throw AccountError.coaCreationFailed();
      }

      return coaData;
    } catch (error) {
      throw AccountError.coaCreationFailed({ error });
    }
  }

  /**
   * Load child accounts
   */
  async loadChildren(): Promise<ChildAccountData[]> {
    try {
      // Check cache first
      const cacheKey = ACCOUNT_CACHE_KEYS.CHILD_ACCOUNTS(this.address, this.network);
      const cachedChildren = await this.getCachedAccountData(cacheKey);

      if (cachedChildren && this.isCacheValid(cachedChildren.cachedAt)) {
        return cachedChildren;
      }

      // Query children from blockchain
      const children = await this.queryChildAccountsFromBlockchain();

      // Cache the result
      await this.cacheAccountData(children, cacheKey);

      return children;
    } catch (error) {
      throw NetworkError.keyIndexerRequestFailed({ operation: 'loadChildren', error });
    }
  }

  /**
   * Refresh account data from blockchain
   */
  async refreshAccountData(): Promise<void> {
    try {
      const accountData = await this.queryAccountFromBlockchain();

      // Update local data
      this.data = {
        ...this.data,
        ...accountData,
        updatedAt: Date.now(),
      };

      // Update cache
      await this.cacheAccountData(this.data);
    } catch (error) {
      throw AccountError.accountQueryFailed(this.address, { error });
    }
  }

  /**
   * Private methods for blockchain interactions
   */

  private async signWithFlowParams(
    message: string,
    privateKey: string,
    params: FlowSignatureParams
  ): Promise<string> {
    // This will be implemented with TrustWallet Core integration
    // For now, throw not implemented error
    throw new Error('Flow signing not yet implemented - requires TrustWallet Core integration');
  }

  private async derivePublicKeyFromAddress(): Promise<string> {
    // This should query the blockchain to get the public key for this address
    // For now, throw not implemented error
    throw new Error('Public key derivation from address not yet implemented');
  }

  private async queryCOAFromBlockchain(): Promise<COAData | null> {
    // This will query the Flow blockchain for COA data
    // Implementation depends on Flow SDK integration
    throw new Error('COA query not yet implemented - requires Flow SDK integration');
  }

  private async queryChildAccountsFromBlockchain(): Promise<ChildAccountData[]> {
    // This will query the Flow blockchain for child accounts
    // Implementation depends on Flow SDK integration
    throw new Error('Child account query not yet implemented - requires Flow SDK integration');
  }

  private async queryAccountFromBlockchain(): Promise<Partial<FlowAccountData>> {
    // This will query the Flow blockchain for account data
    // Implementation depends on Flow SDK integration
    throw new Error('Account query not yet implemented - requires Flow SDK integration');
  }

  private async executeCOACreationTransaction(privateKey: string): Promise<any> {
    // This will execute a COA creation transaction on Flow
    // Implementation depends on Flow SDK integration
    throw new Error('COA creation not yet implemented - requires Flow SDK integration');
  }

  private isCacheValid(cachedAt: number, maxAgeMs = 5 * 60 * 1000): boolean {
    return Date.now() - cachedAt < maxAgeMs;
  }

  /**
   * Validate Flow address format
   */
  protected validateAddress(address: string): boolean {
    // Flow addresses start with 0x and are 18 characters long
    return /^0x[a-fA-F0-9]{16}$/.test(address);
  }

  /**
   * Get Flow-specific account summary
   */
  getFlowSummary() {
    return {
      ...this.getSummary(),
      keyId: this.keyId,
      signAlgo: this.signAlgo,
      hashAlgo: this.hashAlgo,
      balance: this.balance,
      keysCount: this.keys.length,
      hasContracts: !!this.contracts && Object.keys(this.contracts).length > 0,
      storage: this.storage,
    };
  }
}
