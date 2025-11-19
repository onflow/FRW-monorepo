/**
 * Wallet Manager for Wallet Package Integration
 * Manages Wallet lifecycle and subscribes to account changes
 */

import {
  Wallet,
  WalletFactory,
  SeedPhraseKey,
  PrivateKey,
  NETWORKS,
  type AccountsListener,
} from '@onflow/frw-wallet';

import { getLocalData, setLocalData } from '@/data-model';
import { consoleError } from '@/shared/utils';

import { ExtensionStorage } from './extension-storage';
import keyringService from './keyring';
import userWalletService from './userWallet';

export class WalletManager {
  private wallet: Wallet | null = null;
  private storage: ExtensionStorage;
  private seedPhraseKey: SeedPhraseKey | null = null;
  private privateKey: PrivateKey | null = null;
  private currentUid: string | null = null;

  constructor() {
    this.storage = new ExtensionStorage();
  }

  /**
   * Initialize wallet with current keyring uid's private key
   */
  async init(uid?: string): Promise<void> {
    try {
      if (!keyringService.isUnlocked()) {
        return;
      }

      // Use provided uid or get current one
      const targetUid = uid || (await this.getCurrentUid());
      if (!targetUid) {
        throw new Error('No uid available for wallet initialization');
      }

      // If already initialized for this uid, skip
      if (this.wallet && this.currentUid === targetUid) {
        return;
      }

      // Clear previous wallet if different uid
      if (this.wallet && this.currentUid !== targetUid) {
        this.cleanup();
      }

      // Check what type of keyring is available
      const hdKeyrings = keyringService.getKeyringsByType('HD Key Tree');
      const simpleKeyrings = keyringService.getKeyringsByType('Simple Key Pair');

      if (hdKeyrings.length > 0) {
        // Try to get mnemonic from HD keyring
        const mnemonic = await keyringService.getMnemonicFromKeyring();

        if (!mnemonic) {
          throw new Error('No mnemonic available from HD keyring');
        }

        // Create SeedPhraseKey
        this.seedPhraseKey = await SeedPhraseKey.createAdvanced(
          {
            mnemonic,
            derivationPath: "m/44'/539'/0'/0/0", // Flow default path
            passphrase: '',
          },
          this.storage
        );

        // Create wallet using factory
        this.wallet = WalletFactory.createKeyWallet(
          this.seedPhraseKey,
          this.getNetworks(),
          this.storage
        );
      } else if (simpleKeyrings.length > 0) {
        // Try to get private key from Simple keyring
        const privateKey = await keyringService.getCurrentPrivateKey();

        if (!privateKey) {
          throw new Error('No private key available from Simple keyring');
        }

        // Create PrivateKey instead of SeedPhraseKey
        this.privateKey = await PrivateKey.createAdvanced(
          Buffer.from(privateKey, 'hex'),
          this.storage
        );

        // Create wallet using factory with private key
        this.wallet = WalletFactory.createKeyWallet(
          this.privateKey,
          this.getNetworks(),
          this.storage
        );
      } else {
        throw new Error('No keyrings available - please import a mnemonic or private key');
      }

      // Subscribe to account changes
      this.subscribeToWalletEvents();

      // Initialize wallet to load all accounts (Flow + EVM)
      await this.wallet.initialize();

      this.currentUid = targetUid;
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Subscribe to wallet account changes
   */
  private subscribeToWalletEvents(): void {
    if (!this.wallet) return;

    const accountsListener: AccountsListener = (accounts) => {
      // Notify extension about account changes
      this.onAccountsChanged(Array.from(accounts.values()));
    };

    this.wallet.addAccountsListener(accountsListener);
  }

  /**
   * Handle account changes from wallet
   */
  private onAccountsChanged(accounts: any[]): void {
    // Broadcast account changes to extension
    chrome.runtime
      .sendMessage({
        type: 'WALLET_ACCOUNTS_CHANGED',
        accounts: accounts,
      })
      .catch((error) => {
        console.error('Failed to broadcast account changes:', error);
      });
  }

  /**
   * Get current uid from keyring or user service
   */
  private async getCurrentUid(): Promise<string | null> {
    try {
      // Try to get uid from userWallet service
      return userWalletService.getCurrentPubkey() || null;
    } catch (error) {
      console.error('Failed to get current uid:', error);
      return null;
    }
  }

  /**
   * Get networks based on extension's network setting
   */
  private getNetworks(): Set<any> {
    const network = userWalletService.getNetwork();

    if (network === 'mainnet') {
      return new Set([NETWORKS.FLOW_MAINNET, NETWORKS.FLOW_EVM_MAINNET]);
    } else {
      return new Set([NETWORKS.FLOW_TESTNET, NETWORKS.FLOW_EVM_TESTNET]);
    }
  }

  /**
   * Get storage key for EOA address by public key
   */
  private getEOAAddressStorageKey(publicKey: string): string {
    return `eoaAddress_${publicKey}`;
  }

  /**
   * Save EOA address to localStorage by public key
   */
  private async saveEOAAddress(
    publicKey: string,
    address: string,
    balance?: string
  ): Promise<void> {
    try {
      const storageKey = this.getEOAAddressStorageKey(publicKey);
      await setLocalData(storageKey, { address, balance: balance || '0' });
    } catch (error) {
      consoleError('Failed to save EOA address to localStorage:', error as Error);
    }
  }

  /**
   * Get EOA address from localStorage by public key
   */
  private async getEOAAddressFromStorage(
    publicKey: string
  ): Promise<{ address: string; balance?: string } | null> {
    try {
      const storageKey = this.getEOAAddressStorageKey(publicKey);
      const cached = await getLocalData<{ address: string; balance?: string }>(storageKey);
      return cached || null;
    } catch (error) {
      consoleError('Failed to get EOA address from localStorage:', error as Error);
      return null;
    }
  }

  /**
   * Get EOA account information
   * @param publicKey - Optional public key. If not provided, uses current profile's public key
   * @returns EOA address and balance, or null if not found
   */
  async getEOAAccountInfo(
    publicKey?: string
  ): Promise<{ address: string; balance?: string } | null> {
    try {
      // Use provided public key or get current one
      const targetPublicKey = publicKey || userWalletService.getCurrentPubkey();

      // If we have a public key, check localStorage first
      if (targetPublicKey) {
        const cachedEOA = await this.getEOAAddressFromStorage(targetPublicKey);
        if (cachedEOA?.address) {
          return cachedEOA;
        }
      }

      // Ensure wallet is initialized
      if (!this.wallet) {
        await this.init();
      }

      if (!this.wallet) {
        return null;
      }

      const evmAccounts = this.wallet.getEVMAccounts();
      if (evmAccounts.length > 0) {
        const firstEVMAccount = evmAccounts[0];
        const eoaInfo = {
          address: firstEVMAccount.address,
          balance: firstEVMAccount.balance || '0',
        };

        // Save to localStorage if we have a public key
        if (targetPublicKey) {
          await this.saveEOAAddress(targetPublicKey, eoaInfo.address, eoaInfo.balance);
        }

        return eoaInfo;
      }

      return null;
    } catch (error) {
      consoleError('Failed to get EOA account info:', error as Error);
      return null;
    }
  }

  /**
   * Get all accounts (Flow + EVM) from wallet
   */
  async getAllAccounts(): Promise<{ flowAccounts: any[]; evmAccounts: any[] }> {
    try {
      // Ensure wallet is initialized
      if (!this.wallet) {
        await this.init();
      }

      if (!this.wallet) {
        return { flowAccounts: [], evmAccounts: [] };
      }

      return {
        flowAccounts: this.wallet.getFlowAccounts(),
        evmAccounts: this.wallet.getEVMAccounts(),
      };
    } catch (error) {
      console.error('Failed to get all accounts:', error);
      return { flowAccounts: [], evmAccounts: [] };
    }
  }

  /**
   * Cleanup wallet resources
   */
  private cleanup(): void {
    if (this.wallet) {
      // Remove event listeners
      // Note: Wallet class should provide removeAccountsListener method
      this.wallet = null;
    }
    this.seedPhraseKey = null;
    this.privateKey = null;
    this.currentUid = null;
  }

  /**
   * Clear cached wallet (called when keyring is locked)
   */
  clearKeys(): void {
    this.cleanup();
  }

  /**
   * Check if wallet package is available
   */
  isEOASupported(): boolean {
    try {
      return typeof Wallet !== 'undefined' && typeof SeedPhraseKey !== 'undefined';
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
const walletManager = new WalletManager();
export default walletManager;
