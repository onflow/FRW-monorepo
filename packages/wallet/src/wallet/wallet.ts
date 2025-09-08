/**
 * Wallet class - exact match to Flow Wallet Kit iOS Wallet.swift
 */

import { WalletTypeUtils } from './utils';
import { WalletCoreProvider } from '../crypto/wallet-core-provider';
import { KeyIndexerService, type PublicKeyAccount } from '../services/key-indexer';
import { MemoryStorage } from '../storage/memory-storage';
import { type FlowAccount, type EVMAccount } from '../types/account';
import { Chain } from '../types/chain';
import {
  type KeyProtocol,
  type StorageProtocol,
  type SecurityCheckDelegate,
  SignatureAlgorithm,
  type Network,
  type FlowNetwork,
  type EVMNetworkConfig,
  NETWORKS,
  BIP44_PATHS,
} from '../types/key';
import { type WalletType } from '../types/wallet';

/**
 * Account change listener callback
 */
export type AccountsListener = (accounts: Map<string, FlowAccount | EVMAccount>) => void;

/**
 * Loading state listener callback
 */
export type LoadingListener = (isLoading: boolean) => void;

/**
 * Wallet class - exact match to Flow Wallet Kit iOS Wallet.swift
 */
export class Wallet {
  readonly type: WalletType;
  networks: Set<Network>;
  public securityDelegate?: SecurityCheckDelegate;

  // Private state properties
  private accounts: Map<string, FlowAccount | EVMAccount> = new Map(); // address -> account
  private isLoading: boolean = false;
  private cacheStorage: StorageProtocol;

  // Event listeners
  private accountsListeners: Set<AccountsListener> = new Set();
  private loadingListeners: Set<LoadingListener> = new Set();

  // Constants (matching iOS implementation)
  private static readonly FULL_WEIGHT_THRESHOLD = 1000;

  constructor(
    type: WalletType,
    networks: Set<Network> = new Set([
      NETWORKS.FLOW_MAINNET,
      NETWORKS.FLOW_TESTNET,
      NETWORKS.FLOW_EVM_MAINNET,
      NETWORKS.FLOW_EVM_TESTNET,
    ]),
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
    this.notifyAccountsListeners();
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
      (account): account is FlowAccount => account.chain === Chain.Flow
    );
  }

  /**
   * Get EVM accounts only
   */
  getEVMAccounts(): EVMAccount[] {
    return Array.from(this.accounts.values()).filter(
      (account): account is EVMAccount => account.chain === Chain.EVM
    );
  }

  /**
   * Remove account by address
   */
  removeAccount(address: string): boolean {
    const removed = this.accounts.delete(address);
    if (removed) {
      this.notifyAccountsListeners();
    }
    return removed;
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
  getAccountsByNetwork(network: Network): (FlowAccount | EVMAccount)[] {
    return Array.from(this.accounts.values()).filter((account) => account.network === network);
  }

  /**
   * Clear all accounts
   */
  clearAccounts(): void {
    this.accounts.clear();
    this.notifyAccountsListeners();
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
  addNetwork(network: Network): void {
    this.networks.add(network);
  }

  /**
   * Remove network from wallet
   */
  removeNetwork(network: Network): boolean {
    return this.networks.delete(network);
  }

  /**
   * Check if wallet supports a specific network
   */
  hasNetwork(network: Network): boolean {
    return this.networks.has(network);
  }

  /**
   * Get Flow networks only
   */
  getFlowNetworks(): FlowNetwork[] {
    return Array.from(this.networks).filter(
      (network): network is FlowNetwork => network.chain === Chain.Flow
    );
  }

  /**
   * Get EVM networks only
   */
  getEVMNetworks(): EVMNetworkConfig[] {
    return Array.from(this.networks).filter(
      (network): network is EVMNetworkConfig => network.chain === Chain.EVM
    );
  }

  /**
   * Clear all networks and set new ones
   */
  setNetworks(networks: Set<Network>): void {
    this.networks.clear();
    networks.forEach((network) => this.networks.add(network));
  }

  // MARK: - Event Listeners

  /**
   * Add listener for accounts changes
   */
  addAccountsListener(listener: AccountsListener): () => void {
    this.accountsListeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.accountsListeners.delete(listener);
    };
  }

  /**
   * Add listener for loading state changes
   */
  addLoadingListener(listener: LoadingListener): () => void {
    this.loadingListeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.loadingListeners.delete(listener);
    };
  }

  /**
   * Remove accounts listener
   */
  removeAccountsListener(listener: AccountsListener): void {
    this.accountsListeners.delete(listener);
  }

  /**
   * Remove loading listener
   */
  removeLoadingListener(listener: LoadingListener): void {
    this.loadingListeners.delete(listener);
  }

  /**
   * Clear all listeners
   */
  clearAllListeners(): void {
    this.accountsListeners.clear();
    this.loadingListeners.clear();
  }

  /**
   * Notify accounts listeners
   */
  private notifyAccountsListeners(): void {
    const accountsCopy = new Map(this.accounts);
    this.accountsListeners.forEach((listener) => {
      try {
        listener(accountsCopy);
      } catch (error) {
        console.error('Error in accounts listener:', error);
      }
    });
  }

  /**
   * Set loading state and notify listeners
   */
  private setLoadingState(loading: boolean): void {
    if (this.isLoading !== loading) {
      this.isLoading = loading;
      this.loadingListeners.forEach((listener) => {
        try {
          listener(loading);
        } catch (error) {
          console.error('Error in loading listener:', error);
        }
      });
    }
  }

  // MARK: - Key-to-Account Discovery (matching iOS implementation lines 103-293)

  /**
   * Fetch and discover accounts associated with this wallet's keys
   * Uses parallel key search strategy for both P256 and SECP256k1 public keys
   * Implements the key indexer service integration with different endpoints for mainnet/testnet
   */
  async fetchAccount(): Promise<void> {
    this.setLoadingState(true);

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
      this.setLoadingState(false);
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
      const publicKeyBytes = await this.key.publicKey(signAlgo, BIP44_PATHS.FLOW);
      if (!publicKeyBytes) {
        return [];
      }

      // Convert to hex string (remove 0x prefix if present)
      const publicKeyHex = await WalletCoreProvider.bytesToHex(new Uint8Array(publicKeyBytes));
      const cleanPublicKey = publicKeyHex.replace(/^0x/, '');

      // Query key indexer service for each Flow network
      const flowNetworks = this.getFlowNetworks();
      const allFoundAccounts: PublicKeyAccount[] = [];

      for (const flowNetwork of flowNetworks) {
        try {
          const foundAccounts = await KeyIndexerService.findAccountByKey(
            cleanPublicKey,
            flowNetwork.flowChainId
          );
          allFoundAccounts.push(...foundAccounts);
        } catch (error) {
          console.warn(`Failed to search accounts on ${flowNetwork.name}:`, error);
        }
      }

      return KeyIndexerService.filterByWeight(allFoundAccounts, Wallet.FULL_WEIGHT_THRESHOLD);
    } catch (error) {
      console.warn(`Failed to search accounts for ${signAlgo}:`, error);
      return [];
    }
  }

  /**
   * Process discovered accounts and filter by full weight keys
   * Implements account filtering logic using full weight keys (≥1000 weight, non-revoked)
   * Note: Filtering is now handled in KeyIndexerService, this method focuses on conversion
   */
  private async processDiscoveredAccounts(accounts: PublicKeyAccount[]): Promise<FlowAccount[]> {
    const processedAccounts: FlowAccount[] = [];
    const flowNetworks = this.getFlowNetworks();

    for (const account of accounts) {
      // Find the appropriate Flow network for this account
      // In a real implementation, we would determine this from the account data
      // For now, use the first Flow network as default
      const flowNetwork = flowNetworks[0] || NETWORKS.FLOW_MAINNET;

      const flowAccount: FlowAccount = {
        address: account.address,
        network: flowNetwork,
        chain: Chain.Flow,
        keyIndex: account.keyId, // Use keyId from PublicKeyAccount
        signatureAlgorithm: account.signing,
        hashAlgorithm: account.hashing,
        weight: account.weight,
      };

      processedAccounts.push(flowAccount);
    }

    return processedAccounts;
  }

  /**
   * Discover EVM accounts based on wallet key type - local computation only, no network requests
   * - For seed phrase: BIP44 index 0 derivation
   * - For private key: single account
   */
  private async discoverEVMAccounts(): Promise<void> {
    if (!this.key) {
      return;
    }

    try {
      // Get all EVM networks from wallet configuration
      const evmNetworks = this.getEVMNetworks();

      for (const evmNetwork of evmNetworks) {
        const evmAddress = await this.getEVMAddressForKey(evmNetwork);

        if (evmAddress) {
          const evmAccount: EVMAccount = {
            address: evmAddress,
            network: evmNetwork,
            chain: Chain.EVM,
            balance: '0', // Will be populated when balances are fetched
          };

          this.setAccount(`${evmNetwork.chainId}_${evmAddress}`, evmAccount);
        }
      }
    } catch (error) {
      console.warn('Failed to discover EVM accounts:', error);
    }
  }

  /**
   * Get EVM address for the current key using WalletCore - local computation only
   */
  private async getEVMAddressForKey(evmNetwork: EVMNetworkConfig): Promise<string | null> {
    if (!this.key) {
      return null;
    }

    try {
      // For seed phrase keys, use HD wallet derivation through WalletCore
      // For private key keys, derive address directly from the key

      // Get private key bytes for secp256k1 curve (EVM-compatible)
      const privateKeyBytes = await this.key.privateKey(
        SignatureAlgorithm.ECDSA_secp256k1,
        BIP44_PATHS.EVM
      );
      if (!privateKeyBytes) {
        return null;
      }

      // Use WalletCore to derive EVM address from private key - no network request needed
      const evmAddress = await WalletCoreProvider.deriveEVMAddressFromPrivateKey(
        new Uint8Array(privateKeyBytes)
      );
      return evmAddress;
    } catch (error) {
      console.warn(`Failed to derive EVM address for network ${evmNetwork.name}:`, error);
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

      await this.cacheStorage.set(
        `wallet_${this.id}_accounts`,
        new TextEncoder().encode(JSON.stringify(accountsData))
      );
    } catch (error) {
      console.warn('Failed to cache account data:', error);
    }
  }

  /**
   * Get loading state
   */
  get loading(): boolean {
    return this.isLoading;
  }

  /**
   * Initialize wallet - load cached data or fetch accounts if no cache exists
   */
  async initialize(): Promise<void> {
    // Try to load cached account data first
    const hasCachedData = await this.loadCachedAccountData();

    // If no cached data and wallet can sign, fetch accounts from networks
    if (!hasCachedData) {
      await this.fetchAccount();
    }
  }

  /**
   * Load cached account data with safe replacement strategy
   * @returns true if cached data was loaded, false otherwise
   */
  private async loadCachedAccountData(): Promise<boolean> {
    try {
      const cachedData = await this.cacheStorage.get(`wallet_${this.id}_accounts`);
      if (!cachedData) {
        return false;
      }

      const parsed = JSON.parse(new TextDecoder().decode(cachedData));

      // Check if cached data is not too old (e.g., 24 hours)
      const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const now = Date.now();
      if (parsed.lastUpdated && now - parsed.lastUpdated > maxCacheAge) {
        console.log('Cached data is too old, will fetch fresh data');
        return false;
      }

      // Validate cached data structure
      if (
        !parsed.accounts ||
        !Array.isArray(parsed.accounts) ||
        !parsed.networks ||
        !Array.isArray(parsed.networks)
      ) {
        console.warn('Invalid cached data structure');
        return false;
      }

      // Create temporary collections to validate data
      const tempAccounts = new Map<string, FlowAccount | EVMAccount>();
      const tempNetworks = new Set<Network>();

      try {
        // Validate and populate accounts
        for (const [address, accountData] of parsed.accounts) {
          if (typeof address === 'string' && accountData && typeof accountData === 'object') {
            tempAccounts.set(address, accountData);
          }
        }

        // Validate and populate networks
        for (const network of parsed.networks) {
          if (network && typeof network === 'object' && network.chain && network.name) {
            tempNetworks.add(network);
          }
        }

        // Only replace existing data if validation successful
        if (tempAccounts.size > 0 || tempNetworks.size > 0) {
          // Backup current state
          const oldAccounts = new Map(this.accounts);
          const oldNetworks = new Set(this.networks);

          try {
            // Replace with validated cached data
            this.accounts.clear();
            tempAccounts.forEach((account, address) => {
              this.accounts.set(address, account);
            });

            this.networks.clear();
            tempNetworks.forEach((network) => {
              this.networks.add(network);
            });

            console.log(`Loaded ${this.accounts.size} cached accounts for wallet ${this.id}`);

            // Notify listeners of the change
            this.notifyAccountsListeners();
            return true;
          } catch (replaceError) {
            // Restore backup if replacement fails
            console.error('Failed to replace cached data, restoring backup:', replaceError);
            this.accounts = oldAccounts;
            this.networks = oldNetworks;
            return false;
          }
        }

        return false;
      } catch (validationError) {
        console.warn('Failed to validate cached data:', validationError);
        return false;
      }
    } catch (error) {
      console.warn('Failed to load cached account data:', error);
      return false;
    }
  }
}
