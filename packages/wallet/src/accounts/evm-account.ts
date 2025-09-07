/**
 * EVMAccount class - EVM blockchain account implementation
 * Handles Ethereum Virtual Machine compatible chains
 */

import { BaseAccount } from './base-account';
import {
  type EVMAccountData,
  type AccountSigningResult,
  type EVMToken,
  ACCOUNT_CACHE_KEYS,
} from '../types/account';
import { AccountError, NetworkError } from '../types/errors';
import { type SecureStorage, type CacheStorage } from '../types/storage';

/**
 * EVM blockchain account implementation
 * Supports Ethereum, Polygon, Arbitrum, Optimism, etc.
 */
export class EVMAccount extends BaseAccount {
  protected data: EVMAccountData;

  constructor(
    data: EVMAccountData,
    walletId: string,
    secureStorage: SecureStorage,
    cacheStorage: CacheStorage
  ) {
    super(data, walletId, secureStorage, cacheStorage);
    this.data = data;
  }

  // EVM-specific getters
  get balance(): string | undefined {
    return this.data.balance;
  }

  get nonce(): number | undefined {
    return this.data.nonce;
  }

  get tokens(): EVMToken[] {
    return this.data.tokens || [];
  }

  /**
   * Get BIP44 derivation path for EVM
   */
  getDerivationPath(): string {
    const basePath = this.getBaseDerivationPath();
    return `${basePath}${this.keyIndex || 0}`;
  }

  /**
   * Check if account can sign transactions
   */
  canSign(): boolean {
    return !this.isWatchOnly();
  }

  /**
   * Sign message with EVM parameters
   */
  async sign(message: string, password: string): Promise<AccountSigningResult> {
    if (!this.canSign()) {
      throw AccountError.watchOnlySign(this.address);
    }

    try {
      // Get private key for signing
      const privateKey = await this.getPrivateKey(password);

      // Sign with TrustWallet Core (to be implemented)
      const signature = await this.signWithEVMParams(message, privateKey);

      return {
        signature,
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
      // For watch-only, derive from address
      return this.derivePublicKeyFromAddress();
    }

    if (!password) {
      throw new Error('Password required for non-watch-only accounts');
    }

    const keyMaterial = await this.deriveKeyMaterial(password);
    return keyMaterial.publicKey;
  }

  /**
   * Load EVM token balances
   */
  async loadTokens(): Promise<EVMToken[]> {
    try {
      // Check cache first
      const cacheKey = ACCOUNT_CACHE_KEYS.EVM_TOKENS(this.address, this.network);
      const cachedTokens = await this.getCachedAccountData(cacheKey);

      if (cachedTokens && this.isCacheValid(cachedTokens.cachedAt)) {
        return cachedTokens;
      }

      // Query tokens from blockchain/API
      const tokens = await this.queryTokensFromNetwork();

      // Update local data
      this.data.tokens = tokens;

      // Cache the result
      await this.cacheAccountData(tokens, cacheKey);

      return tokens;
    } catch (error) {
      throw NetworkError.keyIndexerRequestFailed({ operation: 'loadTokens', error });
    }
  }

  /**
   * Get native token balance (ETH, MATIC, etc.)
   */
  async getNativeBalance(): Promise<string> {
    try {
      const balance = await this.queryNativeBalanceFromNetwork();

      // Update local data
      this.data.balance = balance;

      // Cache the result
      await this.cacheAccountData(
        { balance },
        ACCOUNT_CACHE_KEYS.ACCOUNT_DATA(this.address, this.network)
      );

      return balance;
    } catch (error) {
      throw NetworkError.keyIndexerRequestFailed({ operation: 'getNativeBalance', error });
    }
  }

  /**
   * Get transaction count (nonce)
   */
  async getTransactionCount(): Promise<number> {
    try {
      const nonce = await this.queryNonceFromNetwork();

      // Update local data
      this.data.nonce = nonce;

      return nonce;
    } catch (error) {
      throw NetworkError.keyIndexerRequestFailed({ operation: 'getTransactionCount', error });
    }
  }

  /**
   * Get token balance for specific token
   */
  async getTokenBalance(tokenAddress: string): Promise<string> {
    try {
      return await this.queryTokenBalanceFromNetwork(tokenAddress);
    } catch (error) {
      throw NetworkError.keyIndexerRequestFailed({ operation: 'getTokenBalance', error });
    }
  }

  /**
   * Refresh account data from network
   */
  async refreshAccountData(): Promise<void> {
    try {
      const [balance, nonce, tokens] = await Promise.all([
        this.getNativeBalance(),
        this.getTransactionCount(),
        this.loadTokens(),
      ]);

      // Update local data
      this.data = {
        ...this.data,
        balance,
        nonce,
        tokens,
        updatedAt: Date.now(),
      };

      // Update cache
      await this.cacheAccountData(this.data);
    } catch (error) {
      throw AccountError.accountQueryFailed(this.address, { error });
    }
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(typedData: any, password: string): Promise<string> {
    if (!this.canSign()) {
      throw AccountError.watchOnlySign(this.address);
    }

    try {
      const privateKey = await this.getPrivateKey(password);

      // Sign typed data with TrustWallet Core (to be implemented)
      return await this.signTypedDataWithEVM(typedData, privateKey);
    } catch (error) {
      throw AccountError.accountQueryFailed(this.address, { operation: 'signTypedData', error });
    }
  }

  /**
   * Private methods for network interactions
   */

  private async signWithEVMParams(message: string, privateKey: string): Promise<string> {
    // This will be implemented with TrustWallet Core integration
    // For now, throw not implemented error
    throw new Error('EVM signing not yet implemented - requires TrustWallet Core integration');
  }

  private async signTypedDataWithEVM(typedData: any, privateKey: string): Promise<string> {
    // This will be implemented with TrustWallet Core integration
    // For now, throw not implemented error
    throw new Error(
      'EVM typed data signing not yet implemented - requires TrustWallet Core integration'
    );
  }

  private async derivePublicKeyFromAddress(): Promise<string> {
    // For EVM, we can't derive public key from address alone
    // This would need to be cached from when the account was created
    const cachedData = await this.getCachedAccountData();

    if (cachedData && cachedData.publicKey) {
      return cachedData.publicKey;
    }

    throw new Error('Public key not available for watch-only EVM account');
  }

  private async queryTokensFromNetwork(): Promise<EVMToken[]> {
    // This will query token balances from network (e.g., using Alchemy, Infura, etc.)
    // Implementation depends on network provider integration
    throw new Error('Token query not yet implemented - requires network provider integration');
  }

  private async queryNativeBalanceFromNetwork(): Promise<string> {
    // This will query native balance from network
    // Implementation depends on network provider integration
    throw new Error(
      'Native balance query not yet implemented - requires network provider integration'
    );
  }

  private async queryNonceFromNetwork(): Promise<number> {
    // This will query transaction count from network
    // Implementation depends on network provider integration
    throw new Error('Nonce query not yet implemented - requires network provider integration');
  }

  private async queryTokenBalanceFromNetwork(tokenAddress: string): Promise<string> {
    // This will query specific token balance from network
    // Implementation depends on network provider integration
    throw new Error(
      'Token balance query not yet implemented - requires network provider integration'
    );
  }

  private isCacheValid(cachedAt: number, maxAgeMs = 30 * 1000): boolean {
    // EVM data changes more frequently, use shorter cache time
    return Date.now() - cachedAt < maxAgeMs;
  }

  /**
   * Validate EVM address format
   */
  protected validateAddress(address: string): boolean {
    // EVM addresses are 42 characters long and start with 0x
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get EVM-specific account summary
   */
  getEVMSummary() {
    return {
      ...this.getSummary(),
      balance: this.balance,
      nonce: this.nonce,
      tokensCount: this.tokens.length,
      totalTokenValue: this.calculateTotalTokenValue(),
    };
  }

  /**
   * Calculate total value of all tokens (requires price data)
   */
  private calculateTotalTokenValue(): string {
    // This would require price feed integration
    // For now, just return the count
    return this.tokens.length.toString();
  }

  /**
   * Get supported networks for this account type
   */
  static getSupportedNetworks(): string[] {
    return ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche', 'bsc'];
  }

  /**
   * Get network configuration
   */
  getNetworkConfig() {
    const networkConfigs: Record<string, any> = {
      ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        symbol: 'ETH',
        decimals: 18,
      },
      polygon: {
        chainId: 137,
        name: 'Polygon Mainnet',
        symbol: 'MATIC',
        decimals: 18,
      },
      // Add other network configurations as needed
    };

    return networkConfigs[this.network] || null;
  }
}
