/**
 * Account Manager for Wallet Package Integration
 * Handles creation of Flow and EVM accounts using wallet package
 */

import {
  SeedPhraseKey,
  EVMAccount,
  BIP44_PATHS,
  NETWORKS,
} from '@onflow/frw-wallet';

import { ExtensionStorage } from './extension-storage';
import keyringService from './keyring';

export class AccountManager {
  private evmKey: SeedPhraseKey | null = null;
  private storage: ExtensionStorage;
  private cachedEOAInfo: { address: string; network: string } | null = null;

  constructor() {
    this.storage = new ExtensionStorage();
  }

  /**
   * Get or create EVM SeedPhraseKey instance
   */
  private async getEVMKey(password: string): Promise<SeedPhraseKey> {
    if (!this.evmKey) {
      if (keyringService.isLocked()) {
        throw new Error('Keyring is locked - please unlock first');
      }

      // Get mnemonic from extension's keyring
      const mnemonic = await keyringService.getMnemonic(password);

      // Create SeedPhraseKey using wallet package with EVM path
      this.evmKey = await SeedPhraseKey.import(
        this.storage,
        mnemonic,
        BIP44_PATHS.EVM, // m/44'/60'/0'/0/0
        '' // no passphrase
      );
    }

    return this.evmKey;
  }

  /**
   * Get the appropriate EVM network based on extension's network setting
   */
  private getEVMNetwork(): typeof NETWORKS.FLOW_EVM_MAINNET | typeof NETWORKS.FLOW_EVM_TESTNET {
    // Import userWalletService to get network
    const userWalletService = require('./userWallet').default;
    const network = userWalletService.getNetwork();

    return network === 'mainnet' ? NETWORKS.FLOW_EVM_MAINNET : NETWORKS.FLOW_EVM_TESTNET;
  }

  /**
   * Create EOA account instance
   */
  async getEOAAccount(password: string): Promise<EVMAccount | null> {
    try {
      const evmKey = await this.getEVMKey(password);
      const network = this.getEVMNetwork();

      // Create EOA account (direct EVM account, not COA)
      return await EVMAccount.create(evmKey, network);
    } catch (error) {
      console.error('Failed to create EOA account:', error);
      return null;
    }
  }

  /**
   * Get EOA account information without requiring password
   * Uses cached info if available, returns basic info for UI display
   */
  async getEOAAccountInfo(): Promise<{ address: string; balance?: string } | null> {
    try {
      const userWalletService = require('./userWallet').default;
      const currentNetwork = userWalletService.getNetwork();

      // Check if we have cached info for current network
      if (this.cachedEOAInfo && this.cachedEOAInfo.network === currentNetwork) {
        return {
          address: this.cachedEOAInfo.address,
          balance: '0', // Placeholder - real balance fetch would require more implementation
        };
      }

      // If not cached and wallet is unlocked, we could try to get it
      // For now, return null to avoid blocking the UI
      return null;
    } catch (error) {
      console.error('Failed to get EOA account info:', error);
      return null;
    }
  }

  /**
   * Cache EOA address when we successfully create an account
   */
  private cacheEOAInfo(address: string, network: string): void {
    this.cachedEOAInfo = { address, network };
  }

  /**
   * Clear cached keys (called when keyring is locked)
   */
  clearKeys(): void {
    this.evmKey = null;
    this.cachedEOAInfo = null;
  }

  /**
   * Check if EOA is supported (basic validation)
   */
  isEOASupported(): boolean {
    try {
      // Check if we have the required wallet package
      return typeof SeedPhraseKey !== 'undefined' && typeof EVMAccount !== 'undefined';
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
const accountManager = new AccountManager();
export default accountManager;
