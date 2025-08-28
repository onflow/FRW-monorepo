import { type PlatformSpec, type Storage } from '@onflow/frw-context';
import {
  Platform,
  type RecentContactsResponse,
  type WalletAccount,
  type WalletAccountsResponse,
  type Currency,
} from '@onflow/frw-types';

import { extensionNavigation } from './ExtensionNavigation';
import { ExtensionStorage } from './ExtensionStorage';


class ExtensionPlatformImpl implements PlatformSpec {
  private debugMode: boolean = process.env.NODE_ENV === 'development';
  private storageInstance: ExtensionStorage;
  private currentAddress: string | null = null;
  private currentNetwork: string = 'mainnet';
  private walletController: any = null;

  constructor() {
    this.storageInstance = new ExtensionStorage();
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
    try {
      if (!this.walletController) {
        this.log('warn', 'Cannot get JWT - wallet controller not initialized');
        throw new Error('Wallet controller not initialized');
      }

      if (!this.walletController.getJWT) {
        this.log('warn', 'getJWT method not available on wallet controller');
        throw new Error('getJWT method not available on wallet controller');
      }

      this.log('debug', 'Extension getJWT called via wallet controller');

      const jwt = await this.walletController.getJWT();
      return jwt;
    } catch (error) {
      this.log('error', 'Failed to get JWT token:', error);
      throw new Error('Failed to get JWT token: ' + (error as Error).message);
    }
  }

  getVersion(): string {
    return chrome.runtime.getManifest().version;
  }

  getBuildNumber(): string {
    return chrome.runtime.getManifest().version_name || this.getVersion();
  }

  getCurrency(): Currency {
    return {
      name: 'USD',
      symbol: '$',
      rate: '1',
    };
  }
  getPlatform(): Platform {
    return Platform.Extension;
  }

  // API endpoint methods
  getApiEndpoint(): string {
    return process.env.API_BASE_URL || '';
  }

  getGoApiEndpoint(): string {
    return process.env.API_GO_SERVER_URL || '';
  }

  getInstabugToken(): string {
    // Return extension-specific analytics/logging token if available
    return process.env.INSTABUG_TOKEN || '';
  }

  // Storage access
  getStorage(): Storage {
    return this.storageInstance;
  }

  storage(): Storage {
    return this.storageInstance;
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
    this.log('debug', 'getWalletAccounts called, walletController:', typeof this.walletController);
    if (!this.walletController) {
      throw new Error('Wallet controller not initialized');
    }
    this.log(
      'debug',
      'walletController.getWalletAccounts type:',
      typeof this.walletController.getWalletAccounts
    );
    if (!this.walletController.getWalletAccounts) {
      throw new Error('getWalletAccounts method not available on wallet controller');
    }
    return await this.walletController.getWalletAccounts();
  }

  async getSelectedAccount(): Promise<WalletAccount> {
    this.log('debug', 'getSelectedAccount called, walletController:', typeof this.walletController);
    if (!this.walletController) {
      throw new Error('Wallet controller not initialized');
    }
    this.log(
      'debug',
      'walletController.getSelectedAccount type:',
      typeof this.walletController.getSelectedAccount
    );
    if (!this.walletController.getSelectedAccount) {
      throw new Error('getSelectedAccount method not available on wallet controller');
    }
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

  // Token and account data methods (required by PlatformSpec)
  // Note: For extension, this should be overridden by PlatformContext to use useCoins() hook data
  async getCache(key: string): Promise<any[] | null> {
    this.log('warn', `Extension getCache(${key}) called - should be overridden by PlatformContext`);
    return null;
  }

  getRouterValue?(): { [key: string]: any } {
    // Get from React Router values stored in window object
    const routerValues = (window as any).__flowWalletRouterParams || {};
    return routerValues;
  }

  listenTransaction?(
    txId: string,
    showNotification: boolean,
    title: string,
    message: string,
    icon?: string
  ): void {
    if (!this.walletController) {
      this.log('warn', 'Cannot listen transaction - wallet controller not initialized');
      return;
    }
    if (!this.walletController.listenTransaction) {
      this.log('warn', 'listenTransaction method not available on wallet controller');
      return;
    }

    this.log('debug', 'Extension listenTransaction called:', { txId, showNotification, title });

    try {
      this.walletController.listenTransaction(txId, showNotification, title, message, icon);
    } catch (error) {
      this.log('error', 'Extension listenTransaction failed:', error);
    }
  }

  async setRecent?(contact: any): Promise<void> {
    if (!this.walletController) {
      this.log('warn', 'Cannot set recent contact - wallet controller not initialized');
      return;
    }
    if (!this.walletController.setRecent) {
      this.log('warn', 'setRecent method not available on wallet controller');
      return;
    }

    this.log('debug', 'Extension setRecent called:', contact);

    try {
      await this.walletController.setRecent(contact);
    } catch (error) {
      this.log('error', 'Extension setRecent failed:', error);
    }
  }

  async setDashIndex?(index: number): Promise<void> {
    if (!this.walletController) {
      this.log('warn', 'Cannot set dash index - wallet controller not initialized');
      return;
    }
    if (!this.walletController.setDashIndex) {
      this.log('warn', 'setDashIndex method not available on wallet controller');
      return;
    }

    this.log('debug', 'Extension setDashIndex called:', index);

    try {
      await this.walletController.setDashIndex(index);
    } catch (error) {
      this.log('error', 'Extension setDashIndex failed:', error);
    }
  }

  // CadenceService configuration
  configureCadenceService(cadenceService: any): void {
    const version = this.getVersion();
    const buildNumber = this.getBuildNumber();
    const network = this.getNetwork();

    // Add version and platform headers to transactions
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        const platform = 'extension';
        const versionHeader = `// Flow Wallet Monorepo - ${network} Script - ${config.name} - Extension - ${version}`;
        const platformHeader = `// Platform: ${platform} - ${version} - ${buildNumber}`;
        config.cadence = versionHeader + '\n' + platformHeader + '\n\n' + config.cadence;
      }
      return config;
    });

    // Configure gas limits and authorization functions using extension's existing functions
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        config.limit = 9999;

        // Create proposer authorization function using parent address from hooks
        config.proposer = async (account: any) => {
          const selectedAccount = await this.getSelectedAccount();
          const address = selectedAccount.parentAddress;
          const keyId = this.getSignKeyIndex();
          const ADDRESS = address?.startsWith('0x') ? address : `0x${address}`;
          const KEY_ID = Number(keyId) || 0;

          return {
            ...account,
            tempId: `${ADDRESS}-${KEY_ID}`,
            addr: ADDRESS.replace('0x', ''),
            keyId: KEY_ID,
            signingFunction: async (signable: { message: string }) => {
              return {
                addr: ADDRESS,
                keyId: KEY_ID,
                signature: await this.sign(signable.message),
              };
            },
          };
        };

        // Determine payer function based on transaction name and fee coverage logic
        const shouldCoverFee = config.name && config.name.endsWith('WithPayer');

        if (shouldCoverFee) {
          // Use bridge fee payer function
          const { address: payerAddress, keyId: payerKeyId } =
            await this.walletController.getBridgeFeePayerAddressAndKeyId();
          config.payer = async (account: any) => {
            const ADDRESS = payerAddress?.startsWith('0x') ? payerAddress : `0x${payerAddress}`;
            const KEY_ID = Number(payerKeyId) || 0;

            return {
              ...account,
              tempId: `${ADDRESS}-${KEY_ID}`,
              addr: ADDRESS.replace('0x', ''),
              keyId: KEY_ID,
              signingFunction: async (signable: any) => {
                return {
                  addr: ADDRESS,
                  keyId: KEY_ID,
                  signature: await this.walletController.signPayer(signable),
                };
              },
            };
          };

          // Set authorizations array with both proposer and payer
          config.authorizations = [config.proposer, config.payer];
        } else {
          // Check if free gas is allowed
          const allowed = await this.walletController.allowLilicoPay();

          if (allowed) {
            // Use regular payer function
            const { address: payerAddress, keyId: payerKeyId } =
              await this.walletController.getPayerAddressAndKeyId();
            config.payer = async (account: any) => {
              const ADDRESS = payerAddress?.startsWith('0x') ? payerAddress : `0x${payerAddress}`;
              const KEY_ID = Number(payerKeyId) || 0;

              return {
                ...account,
                tempId: `${ADDRESS}-${KEY_ID}`,
                addr: ADDRESS.replace('0x', ''),
                keyId: KEY_ID,
                signingFunction: async (signable: any) => {
                  return {
                    addr: ADDRESS,
                    keyId: KEY_ID,
                    signature: await this.walletController.signPayer(signable),
                  };
                },
              };
            };
          } else {
            // Use proposer as payer (user pays)
            config.payer = config.proposer;
          }

          // Set authorizations array with just proposer
          config.authorizations = [config.proposer];
        }
      }
      return config;
    });

    // Configure response interceptor for transaction monitoring
    cadenceService.useResponseInterceptor(async (config: any, response: any) => {
      let txId: string | null = null;

      if (config.type === 'transaction') {
        // Handle bypassed extension transactions
        if (response && response.__EXTENSION_SUCCESS__) {
          txId = response.result;
          this.log('debug', 'Extension bypassed transaction completed with ID:', txId);

          // Return the transaction ID as the response
          response = txId;
        } else if (response && typeof response === 'string') {
          // Handle normal FCL transactions
          txId = response;
          this.log('debug', 'FCL transaction completed with ID:', txId);
        }

        if (txId) {
          try {
            // Start transaction monitoring
            if (this.walletController && this.walletController.listenTransaction) {
              this.walletController.listenTransaction(txId);
              this.log('debug', 'Extension transaction monitoring started for:', txId);
            }

            // Navigate to transaction complete
            const navigation = this.getNavigation();
            if (navigation && navigation.navigate) {
              navigation.navigate('TransactionComplete', {
                txId: txId,
              });
              this.log('debug', 'Navigation to TransactionComplete triggered');
            }
          } catch (error) {
            this.log('error', 'Failed to execute post-transaction actions:', error);
          }
        }
      }

      return { config, response };
    });

    this.log('debug', 'CadenceService configured for extension');
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

  getNavigation() {
    // Return the extension navigation implementation
    return extensionNavigation;
  }

  navigation() {
    return extensionNavigation;
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
