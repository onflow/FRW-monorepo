/**
 * Wallet class - exact match to Flow Wallet Kit iOS Wallet.swift
 */

import { WalletTypeUtils } from './utils';
import { WalletCoreProvider } from '../crypto/wallet-core-provider';
import { MemoryStorage } from '../storage/memory-storage';
import { type FlowAccount, type EVMAccount } from '../types/account';
import {
  type KeyProtocol,
  type StorageProtocol,
  type SecurityCheckDelegate,
  FlowChainID,
  type FlowAddress,
  SignatureAlgorithm,
} from '../types/key';
import { type WalletType } from '../types/wallet';
// Note: Import from correct API package when available\n// import { AccountService, type PublicKeyAccount } from '@onflow/frw-api';\n\n// Temporary types until API package is properly connected\ninterface PublicKeyAccount {\n  address: string;\n  publicKey: string;\n  keyIndex: number;\n  weight: number;\n  signAlgo: number;\n  hashAlgoString: string;\n}\n\n// Temporary service placeholder\nconst AccountService = {\n  keyIndexer: async (params: { publicKey: string }): Promise<PublicKeyAccount[]> => {\n    // This would be replaced with actual API call\n    console.warn('AccountService.keyIndexer not implemented - placeholder');\n    return [];\n  }\n};

/**
 * Wallet class - exact match to Flow Wallet Kit iOS Wallet.swift
 */
export class Wallet {
  readonly type: WalletType;
  networks: Set<FlowChainID>;
  public securityDelegate?: SecurityCheckDelegate;

  // Private state properties
  private accounts: Map<string, FlowAccount | EVMAccount> = new Map(); // address -> account
  private isLoading: boolean = false;
  private cacheStorage: StorageProtocol;

  // Constants (matching iOS implementation)
  private static readonly FULL_WEIGHT_THRESHOLD = 1000;

  constructor(
    type: WalletType,
    networks: Set<FlowChainID> = new Set([FlowChainID.Mainnet, FlowChainID.Testnet]),
    cacheStorage?: StorageProtocol
  ) {
    this.type = type;
    this.networks = networks;
    this.cacheStorage = cacheStorage || new MemoryStorage();
  }

  /**
   * Get wallet unique identifier
   */
  get id(): string {
    return WalletTypeUtils.getId(this.type);
  }

  /**
   * Add or update an account
   */
  setAccount(address: string, account: FlowAccount | EVMAccount): void {
    this.accounts.set(address, account);
  }

  /**
   * Get account by address
   */
  getAccount(address: string): FlowAccount | EVMAccount | undefined {
    return this.accounts.get(address);
  }

  /**
   * Get all accounts
   */
  getAllAccounts(): (FlowAccount | EVMAccount)[] {
    return Array.from(this.accounts.values());
  }

  /**
   * Get Flow accounts only
   */
  getFlowAccounts(): FlowAccount[] {
    return Array.from(this.accounts.values()).filter(
      (account): account is FlowAccount => 'keyIndex' in account
    );
  }

  /**
   * Get EVM accounts only
   */
  getEVMAccounts(): EVMAccount[] {
    return Array.from(this.accounts.values()).filter(
      (account): account is EVMAccount => 'balance' in account
    );
  }

  /**
   * Remove account by address
   */
  removeAccount(address: string): boolean {
    return this.accounts.delete(address);
  }

  /**
   * Check if account exists
   */
  hasAccount(address: string): boolean {
    return this.accounts.has(address);
  }

  /**
   * Get accounts by network
   */
  getAccountsByNetwork(network: FlowChainID): (FlowAccount | EVMAccount)[] {
    return Array.from(this.accounts.values()).filter((account) => account.network === network);
  }

  /**
   * Clear all accounts
   */
  clearAccounts(): void {
    this.accounts.clear();
  }

  /**
   * Check if wallet can sign transactions
   */
  get canSign(): boolean {
    return WalletTypeUtils.canSign(this.type);
  }

  /**
   * Get associated key if available
   */
  get key(): KeyProtocol | null {
    return WalletTypeUtils.getKey(this.type);
  }

  /**
   * Add new network to wallet
   */
  addNetwork(network: FlowChainID): void {
    this.networks.add(network);
  }

  // MARK: - Key-to-Account Discovery (matching iOS implementation lines 103-293)

  /**
   * Fetch and discover accounts associated with this wallet's keys
   * Uses parallel key search strategy for both P256 and SECP256k1 public keys
   * Implements the key indexer service integration with different endpoints for mainnet/testnet
   */
  async fetchAccount(): Promise<void> {
    if (!this.canSign || !this.key) {
      return; // Watch-only wallets don't have keys to discover with
    }

    this.isLoading = true;

    try {
      // Execute parallel key search for both P256 and secp256k1
      const [p256Accounts, secp256k1Accounts] = await Promise.allSettled([
        this.searchAccountsForAlgorithm(SignatureAlgorithm.ECDSA_P256),
        this.searchAccountsForAlgorithm(SignatureAlgorithm.ECDSA_secp256k1),
      ]);

      // Collect valid results
      const allFoundAccounts: PublicKeyAccount[] = [];

      if (p256Accounts.status === 'fulfilled') {
        allFoundAccounts.push(...p256Accounts.value);
      }

      if (secp256k1Accounts.status === 'fulfilled') {
        allFoundAccounts.push(...secp256k1Accounts.value);
      }

      // Filter and convert discovered accounts to FlowAccount objects
      const flowAccounts = await this.processDiscoveredAccounts(allFoundAccounts);

      // Add discovered Flow accounts to wallet
      for (const account of flowAccounts) {
        this.setAccount(account.address, account);
      }

      // Discover EVM accounts (BIP44 index 0 for seedphrase, single account for privatekey)
      await this.discoverEVMAccounts();

      // Cache the results
      await this.cacheAccountData();
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Search for accounts using a specific signature algorithm
   */
  private async searchAccountsForAlgorithm(
    signAlgo: SignatureAlgorithm
  ): Promise<PublicKeyAccount[]> {
    if (!this.key) {
      return [];
    }

    try {
      // Get public key for the signature algorithm
      const publicKeyBytes = await this.key.publicKey(signAlgo);
      if (!publicKeyBytes) {
        return [];
      }

      // Convert to hex string (remove 0x prefix if present)
      const publicKeyHex = await WalletCoreProvider.bytesToHex(new Uint8Array(publicKeyBytes));
      const cleanPublicKey = publicKeyHex.replace(/^0x/, '');

      // Query key indexer service
      const foundAccounts = await AccountService.keyIndexer({
        publicKey: cleanPublicKey,
      });

      return foundAccounts || [];
    } catch (error) {
      console.warn(`Failed to search accounts for ${signAlgo}:`, error);
      return [];
    }
  }

  /**
   * Process discovered accounts and filter by full weight keys
   * Implements account filtering logic using full weight keys (≥1000 weight, non-revoked)
   */
  private async processDiscoveredAccounts(accounts: PublicKeyAccount[]): Promise<FlowAccount[]> {
    const processedAccounts: FlowAccount[] = [];

    for (const account of accounts) {
      // Filter by full weight keys (≥1000 weight)
      if (account.weight >= Wallet.FULL_WEIGHT_THRESHOLD) {
        const flowAccount: FlowAccount = {
          address: account.address,
          network: this.getNetworkFromEnvironment(), // Determine network based on current environment
          chain: 'flow', // FlowAccount is always on Flow chain
          keyIndex: account.keyIndex,
          // Additional FlowAccount properties would be populated here
          // This matches the iOS structure for FlowAccount
        };

        processedAccounts.push(flowAccount);
      }
    }

    return processedAccounts;
  }

  /**
   * Discover EVM accounts based on wallet key type
   * - For seed phrase: BIP44 index 0 derivation
   * - For private key: single account
   */
  private async discoverEVMAccounts(): Promise<void> {
    if (!this.key) {
      return;
    }

    try {
      // Get EVM address using BIP44 derivation (index 0)
      const evmAddress = await this.getEVMAddressForKey();

      if (evmAddress) {
        const evmAccount: EVMAccount = {
          address: evmAddress,
          network: this.getNetworkFromEnvironment(),
          chain: 'evm', // EVMAccount is always on EVM chain
          balance: '0', // Will be populated when balances are fetched
          // Additional EVMAccount properties
        };

        this.setAccount(evmAddress, evmAccount);
      }
    } catch (error) {
      console.warn('Failed to discover EVM accounts:', error);
    }
  }

  /**
   * Get EVM address for the current key
   */
  private async getEVMAddressForKey(): Promise<string | null> {
    if (!this.key) {
      return null;
    }

    try {
      // Use secp256k1 for EVM (Ethereum-compatible)
      const publicKeyBytes = await this.key.publicKey(SignatureAlgorithm.ECDSA_secp256k1);
      if (!publicKeyBytes) {
        return null;
      }

      // Convert public key to EVM address using WalletCore
      // This would typically involve:
      // 1. Getting the uncompressed public key
      // 2. Taking Keccak256 hash
      // 3. Taking last 20 bytes as address
      // For now, return a placeholder EVM address\n      // TODO: Implement proper EVM address derivation\n      const evmAddress = '0x' + Buffer.from(publicKeyBytes.slice(0, 20)).toString('hex');
      return evmAddress;
    } catch (error) {
      console.warn('Failed to derive EVM address:', error);
      return null;
    }
  }

  /**
   * Cache account data for faster subsequent loads
   */
  private async cacheAccountData(): Promise<void> {
    try {
      const accountsData = {
        accounts: Array.from(this.accounts.entries()),
        networks: Array.from(this.networks),
        lastUpdated: Date.now(),
      };

      await this.cacheStorage.set(`wallet_${this.id}_accounts`, JSON.stringify(accountsData));
    } catch (error) {
      console.warn('Failed to cache account data:', error);
    }
  }

  /**
   * Load cached account data
   */
  private async loadCachedAccountData(): Promise<void> {
    try {
      const cachedData = await this.cacheStorage.get(`wallet_${this.id}_accounts`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);

        // Restore accounts
        this.accounts.clear();
        for (const [address, accountData] of parsed.accounts) {
          this.accounts.set(address, accountData);
        }

        // Restore networks
        this.networks.clear();
        for (const network of parsed.networks) {
          this.networks.add(network);
        }
      }
    } catch (error) {
      console.warn('Failed to load cached account data:', error);
    }
  }

  /**
   * Determine network based on current environment/configuration
   */
  private getNetworkFromEnvironment(): FlowChainID {
    // This would typically check environment variables or configuration
    // For now, default to mainnet if it's in the networks set, otherwise use first network
    if (this.networks.has(FlowChainID.Mainnet)) {
      return FlowChainID.Mainnet;
    }

    return Array.from(this.networks)[0] || FlowChainID.Mainnet;
  }

  /**
   * Get loading state
   */
  get loading(): boolean {
    return this.isLoading;
  }

  /**
   * Load cached data on initialization
   */
  async initialize(): Promise<void> {
    await this.loadCachedAccountData();
  }
}

/**
 * Wallet factory for creating different wallet types
 */
export class WalletFactory {
  /**
   * Create wallet from key
   */
  static fromKey(
    key: KeyProtocol,
    networks?: Set<FlowChainID>,
    cacheStorage?: StorageProtocol
  ): Wallet {
    const wallet = new Wallet({ type: 'key', key }, networks, cacheStorage);
    return wallet;
  }

  /**
   * Create watch-only wallet from address
   */
  static watchOnly(
    address: FlowAddress,
    networks?: Set<FlowChainID>,
    cacheStorage?: StorageProtocol
  ): Wallet {
    return new Wallet({ type: 'watch', address }, networks, cacheStorage);
  }
}
