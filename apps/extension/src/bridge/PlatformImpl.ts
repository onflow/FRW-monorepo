import { type PlatformSpec, type Storage } from '@onflow/frw-context';
import type {
  RecentContactsResponse,
  WalletAccount,
  WalletAccountsResponse,
} from '@onflow/frw-types';

import { chromeStorage } from '@/extension-shared/chrome-storage';

class ExtensionPlatformImpl implements PlatformSpec {
  private debugMode: boolean = process.env.NODE_ENV === 'development';
  private storage: Storage;
  private currentAddress: string | null = null;
  private currentNetwork: string = 'mainnet';
  private walletController: any = null;

  constructor() {
    this.storage = chromeStorage as Storage;
  }

  // Methods to update cached values from hooks/context
  setCurrentAddress(address: string | null) {
    this.currentAddress = address;
  }

  setCurrentNetwork(network: string) {
    this.currentNetwork = network;
  }

  setWalletController(controller: any) {
    this.walletController = controller;
  }

  // Basic platform methods
  getSelectedAddress(): string | null {
    return this.currentAddress;
  }

  getNetwork(): string {
    return this.currentNetwork;
  }

  async getJWT(): Promise<string> {
    return await this.walletController.getJWT();
  }

  getVersion(): string {
    return chrome.runtime.getManifest().version;
  }

  getBuildNumber(): string {
    return chrome.runtime.getManifest().version_name || this.getVersion();
  }

  // API endpoint methods
  getApiEndpoint(): string {
    const network = this.getNetwork();
    // Return appropriate API endpoint based on network
    return network === 'testnet'
      ? 'https://rest-testnet.onflow.org'
      : 'https://rest-mainnet.onflow.org';
  }

  getGoApiEndpoint(): string {
    const network = this.getNetwork();
    return network === 'testnet'
      ? 'https://goapi-testnet.lilico.app'
      : 'https://goapi-mainnet.lilico.app';
  }

  getInstabugToken(): string {
    // Return extension-specific analytics/logging token if available
    return process.env.INSTABUG_TOKEN || '';
  }

  // Storage access
  getStorage(): Storage {
    return this.storage;
  }

  // Cryptographic operations
  async sign(hexData: string): Promise<string> {
    return await this.walletController.signMessage(hexData);
  }

  getSignKeyIndex(): number {
    return this.walletController.getKeyIndex() || 0;
  }

  // Data access methods
  async getRecentContacts(): Promise<RecentContactsResponse> {
    return await this.walletController.getRecentContacts();
  }

  async getWalletAccounts(): Promise<WalletAccountsResponse> {
    return await this.walletController.getWalletAccounts();
  }

  async getSelectedAccount(): Promise<WalletAccount> {
    return await this.walletController.getSelectedAccount();
  }

  // Extended data access methods for SendToScreen
  async getAddressBookContacts(): Promise<any[]> {
    if (!this.walletController) return [];
    return await this.walletController.getAddressBook();
  }

  async getRecent(): Promise<any[]> {
    if (!this.walletController) return [];
    return await this.walletController.getRecent();
  }

  async searchUsername(username: string): Promise<any[]> {
    if (!this.walletController) return [];
    return await this.walletController.searchByUsername(username);
  }

  // Get account data from profiles/hooks
  getAccountsData(): any[] {
    // This will be set by the component when it has the data
    // For now, return empty array - component will override this
    return [];
  }

  // CadenceService configuration
  configureCadenceService(cadenceService: any): void {
    // Configure FCL and other Cadence-related services for extension
    // This method allows the bridge to set up authorization, proposer, payer, etc.

    // Set up authorization
    cadenceService.config({
      'accessNode.api': this.getApiEndpoint(),
      'discovery.wallet': chrome.runtime.getURL('popup.html'),
      'app.detail.title': 'Flow Reference Wallet',
      'app.detail.icon': chrome.runtime.getURL('icon.png'),
    });

    // Set up authorization function
    cadenceService.currentUser.authorization = this.getAuthorization();
  }

  // Logging methods
  log(level: 'debug' | 'info' | 'warn' | 'error' = 'debug', message: string, ...args: any[]): void {
    if (level === 'debug' && !this.debugMode) {
      return;
    }

    const prefix = `[FRW-Extension-${level.toUpperCase()}]`;
    const fullMessage = args.length > 0 ? `${message} ${args.join(' ')}` : message;

    // Console logging for development
    switch (level) {
      case 'debug':
        console.log(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }

    // Extension-specific logging (could integrate with analytics)
    try {
      // Could send to background script for centralized logging
      chrome.runtime.sendMessage({
        type: 'LOG',
        level,
        message: fullMessage,
        timestamp: Date.now(),
      });
    } catch (error) {
      // Ignore logging errors to prevent cascading failures
    }
  }

  isDebug(): boolean {
    return this.debugMode;
  }

  // UI interaction methods
  async scanQRCode(): Promise<string> {
    // Extension-specific QR code scanning implementation
    // Could open a popup window with camera access
    return new Promise((resolve, reject) => {
      // Implementation would depend on extension's QR scanning approach
      chrome.runtime.sendMessage({ type: 'SCAN_QR' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'QR scan failed'));
        }
      });
    });
  }

  closeRN(id?: string | null): void {
    // Extension equivalent - close current popup/tab
    if (window.close) {
      window.close();
    } else {
      chrome.runtime.sendMessage({ type: 'CLOSE_POPUP' });
    }
  }

  // Helper methods
  private getAuthorization() {
    return async (account: any) => {
      const address = this.getSelectedAddress();
      const keyId = this.getSignKeyIndex();

      return {
        ...account,
        addr: address,
        keyId: keyId,
        signingFunction: async (signable: any) => {
          const signature = await this.sign(signable.message);
          return {
            addr: address,
            keyId: keyId,
            signature: signature,
          };
        },
      };
    };
  }
}

// Singleton instance
let platformInstance: ExtensionPlatformImpl | null = null;

export const getPlatform = (): ExtensionPlatformImpl => {
  if (!platformInstance) {
    platformInstance = new ExtensionPlatformImpl();
  }
  return platformInstance;
};

export const initializePlatform = (): ExtensionPlatformImpl => {
  if (!platformInstance) {
    platformInstance = new ExtensionPlatformImpl();
  }
  return platformInstance;
};

export default ExtensionPlatformImpl;
