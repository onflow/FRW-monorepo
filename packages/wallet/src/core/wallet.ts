/**
 * Wallet class - based on Flow Wallet Kit iOS Wallet implementation
 * Main wallet management class for private key-based multi-account management
 */

import { AccountFactory } from '../accounts/account-factory';
import { type BaseAccount } from '../accounts/base-account';
import { type FlowAccountData, type EVMAccountData } from '../types/account';
import { Chain } from '../types/chain';
import { WalletOperationError, StorageError, AccountError, KeyError } from '../types/errors';
import { KeyType, type EncryptedKeyData } from '../types/key';
import { DefaultNetworks } from '../types/network';
import {
  type WalletData,
  type WalletConfig,
  type WalletState,
  type WalletAccountMap,
  type CreateWalletParams,
  type ImportWalletParams,
  type AccountDerivationParams,
  type AccountDiscoveryParams,
  type AccountDiscoveryResult,
  type WalletBackupData,
  type WalletRestoreParams,
  WALLET_CACHE_KEYS,
} from '../types/wallet';

/**
 * Main Wallet class for managing accounts and keys
 * Based on iOS Flow Wallet Kit Wallet.swift pattern
 */
export class Wallet {
  private accountFactory: AccountFactory;
  private state: WalletState;

  constructor(
    private data: WalletData,
    private config: WalletConfig
  ) {
    this.accountFactory = new AccountFactory(config.secureStorage, config.cacheStorage);

    this.state = {
      loaded: false,
      unlocked: false,
      accounts: new Map(),
      selectedAccount: undefined,
    };
  }

  // Getters for wallet data
  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get type(): KeyType {
    return this.data.type;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  get metadata(): Record<string, any> | undefined {
    return this.data.metadata;
  }

  get isLoaded(): boolean {
    return this.state.loaded;
  }

  get isUnlocked(): boolean {
    return this.state.unlocked;
  }

  get accounts(): WalletAccountMap {
    return this.state.accounts;
  }

  get selectedAccount(): string | undefined {
    return this.state.selectedAccount;
  }

  get networks(): string[] {
    return this.config.networks;
  }

  /**
   * Create a new wallet
   */
  static async create(params: CreateWalletParams, config: WalletConfig): Promise<Wallet> {
    const walletData: WalletData = {
      id: this.generateWalletId(),
      name: params.name,
      type: params.type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: params.metadata,
    };

    const wallet = new Wallet(walletData, config);

    // Store encrypted key material
    await wallet.storeKeyMaterial(params);

    // Cache wallet data
    await wallet.saveToCache();

    return wallet;
  }

  /**
   * Import existing wallet
   */
  static async import(params: ImportWalletParams, config: WalletConfig): Promise<Wallet> {
    // Validate mnemonic or private key
    if (params.mnemonic) {
      await this.validateMnemonic(params.mnemonic);
    } else if (params.privateKey) {
      await this.validatePrivateKey(params.privateKey);
    } else {
      throw WalletOperationError.invalidWalletType('Unknown key type');
    }

    const keyType = params.mnemonic ? KeyType.MNEMONIC : KeyType.PRIVATE_KEY;

    const walletData: WalletData = {
      id: this.generateWalletId(),
      name: params.name,
      type: keyType,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: params.metadata,
    };

    const wallet = new Wallet(walletData, config);

    // Store encrypted key material
    await wallet.storeKeyMaterial({
      name: params.name,
      type: keyType,
      mnemonic: params.mnemonic,
      privateKey: params.privateKey,
      password: params.password,
      metadata: params.metadata,
    });

    // Derive and add initial accounts
    if (params.derivationIndexes) {
      for (const index of params.derivationIndexes) {
        // Derive Flow account
        await wallet.deriveAccount({
          keyIndex: index,
          chain: Chain.Flow,
          network: config.defaultNetwork || DefaultNetworks[Chain.Flow].name,
          name: `Flow Account ${index + 1}`,
        });

        // Derive EVM account
        await wallet.deriveAccount({
          keyIndex: index,
          chain: Chain.EVM,
          network: DefaultNetworks[Chain.EVM].name,
          name: `EVM Account ${index + 1}`,
        });
      }
    }

    // Cache wallet data
    await wallet.saveToCache();

    return wallet;
  }

  /**
   * Load wallet from storage
   */
  async load(password: string): Promise<void> {
    if (this.state.loaded) {
      return;
    }

    try {
      // Verify password by attempting to decrypt key material
      await this.verifyPassword(password);

      // Load cached accounts
      await this.loadAccountsFromCache();

      this.state.loaded = true;
      this.state.unlocked = true;
    } catch (error) {
      throw WalletOperationError.invalidPassword({ error });
    }
  }

  /**
   * Lock the wallet
   */
  async lock(): Promise<void> {
    this.state.unlocked = false;
    // Clear sensitive data from memory
    // Implementation depends on key management strategy
  }

  /**
   * Unlock the wallet
   */
  async unlock(password: string): Promise<void> {
    if (!this.state.loaded) {
      await this.load(password);
      return;
    }

    try {
      await this.verifyPassword(password);
      this.state.unlocked = true;
    } catch (error) {
      throw WalletOperationError.invalidPassword({ error });
    }
  }

  /**
   * Account Management Methods
   */

  /**
   * Get all accounts
   */
  async fetchAllAccounts(): Promise<WalletAccountMap> {
    if (!this.state.loaded) {
      throw WalletOperationError.walletNotInitialized();
    }

    // Refresh accounts from cache and blockchain
    await this.loadAccountsFromCache();

    return this.state.accounts;
  }

  /**
   * Get account by address
   */
  async fetchAccount(address: string): Promise<BaseAccount | null> {
    const account = this.state.accounts.get(address);

    if (!account) {
      return null;
    }

    // Refresh account data
    await account.refreshAccountData();

    return account;
  }

  /**
   * Add account to wallet
   */
  async addAccount(accountData: FlowAccountData | EVMAccountData): Promise<BaseAccount> {
    if (this.state.accounts.has(accountData.address)) {
      throw AccountError.accountExists(accountData.address);
    }

    const account = this.accountFactory.createAccount(accountData, this.id);

    this.state.accounts.set(accountData.address, account);

    // Update cache
    await this.saveAccountToCache(account);
    await this.saveToCache();

    return account;
  }

  /**
   * Remove account from wallet
   */
  async removeAccount(address: string): Promise<boolean> {
    const account = this.state.accounts.get(address);

    if (!account) {
      return false;
    }

    // Clear account cache
    await account.clearCache();

    // Remove from wallet
    this.state.accounts.delete(address);

    // Update wallet cache
    await this.saveToCache();

    return true;
  }

  /**
   * Derive new account from wallet key
   */
  async deriveAccount(params: AccountDerivationParams): Promise<BaseAccount> {
    if (!this.state.unlocked) {
      throw WalletOperationError.walletLocked();
    }

    if (this.type === KeyType.WATCH_ONLY) {
      throw WalletOperationError.invalidWalletType('Cannot derive accounts from watch-only wallet');
    }

    // This will be implemented with TrustWallet Core integration
    throw new Error(
      'Account derivation not yet implemented - requires TrustWallet Core integration'
    );
  }

  /**
   * Create watch-only account
   */
  async createWatchAccount(
    address: string,
    chain: Chain,
    network: string,
    name?: string
  ): Promise<BaseAccount> {
    // Validate address format
    if (!this.isValidAddress(address, chain)) {
      throw AccountError.invalidAddress(address);
    }

    let account: BaseAccount;

    if (chain === Chain.Flow) {
      account = this.accountFactory.createWatchOnlyFlowAccount(address, network, this.id, name);
    } else {
      account = this.accountFactory.createWatchOnlyEVMAccount(address, network, this.id, name);
    }

    // Query account data from blockchain
    await account.refreshAccountData();

    // Add to wallet
    this.state.accounts.set(address, account);

    // Update cache
    await this.saveAccountToCache(account);
    await this.saveToCache();

    return account;
  }

  /**
   * Discover accounts for this wallet
   */
  async discoverAccounts(params: AccountDiscoveryParams): Promise<AccountDiscoveryResult> {
    if (this.type === KeyType.WATCH_ONLY) {
      throw WalletOperationError.invalidWalletType(
        'Cannot discover accounts for watch-only wallet'
      );
    }

    // This will be implemented with blockchain integration
    throw new Error('Account discovery not yet implemented - requires blockchain integration');
  }

  /**
   * Select active account
   */
  async selectAccount(address: string): Promise<void> {
    const account = this.state.accounts.get(address);

    if (!account) {
      throw AccountError.accountNotFound(address);
    }

    this.state.selectedAccount = address;

    // Update cache
    await this.saveToCache();
  }

  /**
   * Get currently selected account
   */
  getSelectedAccount(): BaseAccount | null {
    if (!this.state.selectedAccount) {
      return null;
    }

    return this.state.accounts.get(this.state.selectedAccount) || null;
  }

  /**
   * Backup and Restore Methods
   */

  /**
   * Create wallet backup
   */
  async createBackup(password: string): Promise<WalletBackupData> {
    if (!this.state.unlocked) {
      throw WalletOperationError.walletLocked();
    }

    try {
      // Get encrypted key material
      const encryptedKeyData = await this.config.secureStorage.retrieve(this.id);

      if (!encryptedKeyData) {
        throw StorageError.keyNotFound(this.id);
      }

      const keyData = JSON.parse(encryptedKeyData) as EncryptedKeyData;

      const backupData: WalletBackupData = {
        version: '1.0.0',
        walletData: this.data,
        encryptedMnemonic: keyData.encryptedMnemonic,
        encryptedPrivateKey: keyData.encryptedPrivateKey,
        accounts: Array.from(this.state.accounts.values()).map((account) => account.toJSON()),
        metadata: {
          exportedAt: Date.now(),
          appVersion: '1.0.0', // Should come from app context
        },
      };

      return backupData;
    } catch (error) {
      throw WalletOperationError.backupFailed({ error });
    }
  }

  /**
   * Restore wallet from backup
   */
  static async restoreFromBackup(
    params: WalletRestoreParams,
    config: WalletConfig
  ): Promise<Wallet> {
    try {
      const walletData = {
        ...params.backupData.walletData,
        id: this.generateWalletId(), // Generate new ID
        name: params.newName || params.backupData.walletData.name,
        updatedAt: Date.now(),
      };

      const wallet = new Wallet(walletData, config);

      // Restore key material
      const keyData: EncryptedKeyData = {
        id: wallet.id,
        type: walletData.type,
        encryptedMnemonic: params.backupData.encryptedMnemonic,
        encryptedPrivateKey: params.backupData.encryptedPrivateKey,
        metadata: {
          curve: 'P256', // Default - should be from backup
          createdAt: walletData.createdAt,
        },
      };

      await config.secureStorage.store(wallet.id, JSON.stringify(keyData));

      // Restore accounts
      const accountsToRestore = params.selectiveAccounts
        ? params.backupData.accounts.filter((acc) =>
            params.selectiveAccounts!.includes(acc.address)
          )
        : params.backupData.accounts;

      for (const accountData of accountsToRestore) {
        const account = wallet.accountFactory.createAccount(accountData, wallet.id);
        wallet.state.accounts.set(accountData.address, account);
      }

      // Cache wallet data
      await wallet.saveToCache();

      return wallet;
    } catch (error) {
      throw WalletOperationError.restoreFailed({ error });
    }
  }

  /**
   * Storage and Cache Methods
   */

  /**
   * Save wallet to cache
   */
  async saveToCache(): Promise<void> {
    const cacheData = {
      data: this.data,
      state: {
        ...this.state,
        accounts: undefined, // Don't cache the account instances
      },
      accountAddresses: Array.from(this.state.accounts.keys()),
    };

    const cacheKey = WALLET_CACHE_KEYS.WALLET_DATA(this.id);
    await this.config.cacheStorage.set(cacheKey, cacheData);
  }

  /**
   * Load wallet from cache
   */
  async loadFromCache(): Promise<void> {
    const cacheKey = WALLET_CACHE_KEYS.WALLET_DATA(this.id);
    const cached = await this.config.cacheStorage.get(cacheKey);

    if (cached) {
      this.data = cached.data;
      this.state = {
        ...cached.state,
        accounts: new Map(),
      };
    }
  }

  /**
   * Load accounts from cache
   */
  private async loadAccountsFromCache(): Promise<void> {
    const cacheKey = WALLET_CACHE_KEYS.WALLET_ACCOUNTS(this.id);
    const cached = await this.config.cacheStorage.get(cacheKey);

    if (cached && Array.isArray(cached)) {
      for (const accountData of cached) {
        const account = this.accountFactory.createAccount(accountData, this.id);
        this.state.accounts.set(accountData.address, account);
      }
    }
  }

  /**
   * Save account to cache
   */
  private async saveAccountToCache(account: BaseAccount): Promise<void> {
    await account.cacheAccountData(account.toJSON());
  }

  /**
   * Private utility methods
   */

  private async storeKeyMaterial(params: CreateWalletParams): Promise<void> {
    const keyData: EncryptedKeyData = {
      id: this.id,
      type: params.type,
      encryptedMnemonic: params.mnemonic
        ? await this.encryptData(params.mnemonic, params.password)
        : undefined,
      encryptedPrivateKey: params.privateKey
        ? await this.encryptData(params.privateKey, params.password)
        : undefined,
      metadata: {
        curve: 'P256', // Default curve
        createdAt: Date.now(),
        name: params.name,
      },
    };

    await this.config.secureStorage.store(this.id, JSON.stringify(keyData));
  }

  private async verifyPassword(password: string): Promise<void> {
    const encryptedData = await this.config.secureStorage.retrieve(this.id);

    if (!encryptedData) {
      throw StorageError.keyNotFound(this.id);
    }

    try {
      const keyData = JSON.parse(encryptedData) as EncryptedKeyData;

      // Try to decrypt to verify password
      if (keyData.encryptedMnemonic) {
        await this.decryptData(keyData.encryptedMnemonic, password);
      } else if (keyData.encryptedPrivateKey) {
        await this.decryptData(keyData.encryptedPrivateKey, password);
      }
    } catch (error) {
      throw StorageError.decryptionFailed({ error });
    }
  }

  private async encryptData(data: string, password: string): Promise<string> {
    // This will be implemented with proper encryption
    // For now, just return the data (NOT SECURE)
    return Buffer.from(data).toString('base64');
  }

  private async decryptData(encryptedData: string, password: string): Promise<string> {
    // This will be implemented with proper decryption
    // For now, just decode (NOT SECURE)
    return Buffer.from(encryptedData, 'base64').toString();
  }

  private isValidAddress(address: string, chain: Chain): boolean {
    if (chain === Chain.Flow) {
      return /^0x[a-fA-F0-9]{16}$/.test(address);
    } else {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
  }

  private static generateWalletId(): string {
    return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async validateMnemonic(mnemonic: string): Promise<void> {
    // This will be implemented with BIP39 validation
    // For now, just check basic format
    const words = mnemonic.trim().split(' ');
    if (words.length !== 12 && words.length !== 24) {
      throw KeyError.invalidMnemonic();
    }
  }

  private static async validatePrivateKey(privateKey: string): Promise<void> {
    // This will be implemented with proper validation
    // For now, just check basic format
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      throw KeyError.invalidPrivateKey();
    }
  }

  /**
   * Get wallet summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      accountCount: this.state.accounts.size,
      selectedAccount: this.state.selectedAccount,
      isLoaded: this.state.loaded,
      isUnlocked: this.state.unlocked,
      networks: this.config.networks,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
