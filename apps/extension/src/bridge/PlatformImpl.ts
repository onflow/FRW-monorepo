import { type Cache, type PlatformSpec, type Storage } from '@onflow/frw-context';
import { useSendStore, useTokenQueryStore, fetchPayerStatusWithCache } from '@onflow/frw-stores';
import {
  Platform,
  type Currency,
  type RecentContactsResponse,
  type WalletAccount,
  type WalletAccountsResponse,
  type WalletProfilesResponse,
} from '@onflow/frw-types';
import { extractUidFromJwt } from '@onflow/frw-utils';
import {
  EthSigner,
  BIP44_PATHS,
  type EthLegacyTransaction,
  EthSignedTransaction,
} from '@onflow/frw-wallet';
import Web3 from 'web3';
// Removed direct service imports - using walletController instead
import { MAINNET_CHAIN_ID, TESTNET_CHAIN_ID, EVM_ENDPOINT } from '@/shared/constant';

import { HTTP_STATUS_TOO_MANY_REQUESTS } from '@/shared/constant';

import { ExtensionCache } from './ExtensionCache';
import { extensionNavigation } from './ExtensionNavigation';
import { ExtensionStorage } from './ExtensionStorage';

class ExtensionPlatformImpl implements PlatformSpec {
  private debugMode: boolean = process.env.NODE_ENV === 'development';
  private storageInstance: ExtensionStorage;
  private cacheInstance: ExtensionCache;
  private currentAddress: string | null = null;
  private currentNetwork: string = 'mainnet';
  private walletController: any = null;

  constructor() {
    this.storageInstance = new ExtensionStorage();
    this.cacheInstance = new ExtensionCache('screens:');
  }

  storage(): Storage {
    return this.storageInstance;
  }

  cache(): Cache {
    return this.cacheInstance;
  }

  navigation() {
    return extensionNavigation;
  }

  getPlatform(): Platform {
    return Platform.Extension;
  }

  getVersion(): string {
    return chrome.runtime.getManifest().version;
  }

  getBuildNumber(): string {
    return process.env.CI_BUILD_ID || process.env.BUILD_NUMBER || 'local';
  }

  getLanguage(): string {
    try {
      // Get language from Chrome API
      const languageCode = chrome.i18n.getUILanguage().split('-')[0].toLowerCase();

      // Validate against supported languages
      const supportedLanguages = ['en', 'es', 'zh', 'ru', 'jp'];
      return supportedLanguages.includes(languageCode) ? languageCode : 'en';
    } catch (error) {
      this.log(
        'warn',
        '[PlatformImpl] Failed to get Chrome UI language, falling back to en:',
        error
      );
      return 'en';
    }
  }

  getCurrency(): Currency {
    return {
      name: 'USD',
      symbol: '$',
      rate: '1',
    };
  }

  setCurrentAddress(address: string | null) {
    this.currentAddress = address;
  }

  setCurrentNetwork(network: string) {
    this.currentNetwork = network;
  }

  setWalletController(controller: any) {
    this.walletController = controller;
  }

  getSelectedAddress(): string | null {
    return this.currentAddress;
  }

  getDebugAddress(): string | null {
    return this.walletController?.getDebugAddress?.() || null;
  }

  getNetwork(): string {
    return this.currentNetwork;
  }

  async getJWT(): Promise<string> {
    try {
      if (!this.walletController) {
        throw new Error('Wallet controller not initialized');
      }

      if (!this.walletController.getJWT) {
        throw new Error('getJWT method not available on wallet controller');
      }

      const jwt = await this.walletController.getJWT();
      return jwt;
    } catch (error) {
      throw new Error('Failed to get JWT token: ' + (error as Error).message);
    }
  }

  getApiEndpoint(): string {
    return process.env.API_BASE_URL || '';
  }

  getGoApiEndpoint(): string {
    return process.env.API_GO_SERVER_URL || '';
  }

  getInstabugToken(): string {
    return process.env.INSTABUG_TOKEN || '';
  }

  async sign(hexData: string): Promise<string> {
    return await this.walletController.signMessage(hexData);
  }

  getSignKeyIndex(): number {
    return this.walletController.getKeyIndex() || 0;
  }

  async ethSignTransaction(transaction: any): Promise<string> {
    if (!this.walletController) {
      throw new Error('Wallet controller not initialized');
    }

    // Get the current nonce from the network
    const nonce = await this.getTransactionCount(transaction.from);

    const ethereumPrivateKey = await this.walletController.getEthereumPrivateKey();

    const privateKeyBytes = await this.walletController.privateKeyToUint8Array(ethereumPrivateKey);

    // Convert plain object back to Uint8Array if needed (cross-context serialization issue)
    const actualPrivateKeyBytes =
      privateKeyBytes instanceof Uint8Array
        ? privateKeyBytes
        : new Uint8Array(Object.values(privateKeyBytes));

    const network = await this.walletController.getNetwork();
    const chainId = network === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID;

    if (!transaction.to || transaction.to === '') {
      throw new Error('Transaction "to" address is required');
    }

    const gasLimit = '0x1C9C380'; // 30,000,000 in hex
    const gasPrice = '0x0'; // Zero gas price
    const value = transaction.value ? `0x${BigInt(transaction.value).toString(16)}` : '0x0';

    const ethTransaction: EthLegacyTransaction = {
      chainId: chainId,
      nonce: parseInt(nonce, 16),
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      to: transaction.to,
      value: value,
      data: transaction.data || '0x',
    };

    // Debug logging
    console.log('ethSignTransaction - Final ethTransaction object:', ethTransaction);

    // Sign the transaction using EthSigner
    try {
      const signedTransaction = await EthSigner.signTransaction(
        ethTransaction,
        actualPrivateKeyBytes
      );
      return signedTransaction.rawTransaction;
    } catch (error) {
      throw error;
    }
  }

  async evmTransactionCallback(trxData: any): Promise<any> {
    console.log('EVM Callback called with:', trxData);

    if (trxData.state === 'EVM_TRX_BUILDING') {
      // Use the ethSignTransaction method
      const signedTx = await this.ethSignTransaction(trxData.trxData);
      if (!signedTx) {
        throw new Error('Failed to sign EVM transaction');
      }
      return signedTx;
    }

    return undefined;
  }

  /**
   * Get the current transaction count (nonce) for an address
   */
  private async getTransactionCount(address: string): Promise<string> {
    const network = await this.walletController.getNetwork();
    const provider = new Web3.providers.HttpProvider(EVM_ENDPOINT[network]);
    const web3Instance = new Web3(provider);

    return new Promise((resolve, reject) => {
      if (!web3Instance.currentProvider) {
        reject(new Error('Provider is undefined'));
        return;
      }

      web3Instance.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'eth_getTransactionCount',
          params: [address, 'latest'],
          id: Date.now(),
        },
        (error, response) => {
          if (error) {
            reject(error);
          } else if (response && 'error' in response && response.error) {
            reject(new Error(response.error.message || 'Failed to get transaction count'));
          } else if (response && 'result' in response) {
            resolve(response.result as string);
          } else {
            reject(new Error('Invalid response from provider'));
          }
        }
      );
    });
  }

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

  async getWalletProfiles(): Promise<WalletProfilesResponse> {
    if (!this.walletController) {
      throw new Error('Wallet controller not initialized');
    }
    if (!this.walletController.getWalletProfiles) {
      throw new Error('getWalletProfiles method not available on wallet controller');
    }
    return await this.walletController.getWalletProfiles();
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

  async getCurrentUserUid(): Promise<string | null> {
    try {
      if (this.walletController?.getCurrentUserUid) {
        return (await this.walletController.getCurrentUserUid()) ?? null;
      }

      const token = await this.getJWT();
      return extractUidFromJwt(token) ?? null;
    } catch (error) {
      this.log('warn', '[PlatformImpl] Failed to resolve current user uid', error);
      return null;
    }
  }

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

  getAccountsData(): any[] {
    return [];
  }

  async getCache(key: string): Promise<any[] | null> {
    this.log('warn', `Extension getCache(${key}) called - should be overridden by PlatformContext`);
    return null;
  }

  getRouterValue?(): { [key: string]: any } {
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
        config.proposer = this.createProposerFunction();
        const payerStatus = await fetchPayerStatusWithCache(network as 'mainnet' | 'testnet');
        const isSurge = payerStatus?.surge?.active;
        const withPayer = config.name && config.name.endsWith('WithPayer');
        config.authorizations = [config.proposer];
        if (withPayer) {
          // Use bridge fee payer function - get address from payer status
          config.authorizations.push(this.createBridgeAuthorizationFunction());
        }

        if (isSurge) {
          const userApproved = await this.walletController.showSurgeModalAndWait(payerStatus);
          if (userApproved) {
            config.payer = config.proposer;
          } else {
            // User rejected - stop the transaction
            throw new Error('Transaction cancelled by user due to surge pricing');
          }
        } else {
          // Check if free gas is allowed
          const allowed = await this.walletController.allowLilicoPay();
          if (allowed) {
            try {
              config.payer = this.createPayerAuthorizationFunction();
            } catch (error) {
              const isSurgeError =
                error instanceof Error &&
                (error.message.includes(HTTP_STATUS_TOO_MANY_REQUESTS.toString()) ||
                  error.message.includes('Too Many Requests') ||
                  error.message.includes('Many Requests for surge') ||
                  error.message.includes(
                    'communicates temporary pressure and supports standard client backoff via Retry-After'
                  ));
              if (isSurgeError) {
                // Show surge modal and wait for user approval
                const userApproved = await this.walletController.showSurgeModalAndWait(payerStatus);

                if (userApproved) {
                  config.payer = config.proposer;
                } else {
                  // User rejected - stop the transaction
                  throw new Error('Transaction cancelled by user due to surge pricing');
                }
              }
            }
          } else {
            config.payer = config.proposer;
          }
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

          // Return the transaction ID as the response
          response = txId;
        } else if (response && typeof response === 'string') {
          // Handle normal FCL transactions
          txId = response;
        }

        if (txId) {
          try {
            // Start transaction monitoring
            if (this.walletController && this.walletController.listenTransaction) {
              this.walletController.listenTransaction(txId);
            }
            // Navigate to transaction complete
            const navigation = this.navigation();
            if (navigation && navigation.navigate) {
              navigation.navigate('TransactionComplete', {
                txId: txId,
              });
            }
            const tokenStore = useTokenQueryStore.getState();
            const selectedAccount = await this.getSelectedAccount();
            const selectedCollection = useSendStore.getState().selectedCollection;
            if (selectedCollection && selectedAccount) {
              tokenStore.invalidateNFTCollection(
                selectedAccount.address,
                selectedCollection,
                network
              );
            }
          } catch (error) {
            this.log('error', 'Failed to execute post-transaction actions:', error);
          }
        }
      }

      return { config, response };
    });
  }

  // Factory method to create proposer authorization function
  createProposerFunction() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return async (account: any) => {
      const selectedAccount = await self.getSelectedAccount();
      // Use parentAddress if available (for child accounts), otherwise use address (for main accounts)
      const address = selectedAccount.parentAddress || selectedAccount.address;
      const keyId = await self.getSignKeyIndex();
      const ADDRESS = address?.startsWith('0x') ? address : `0x${address}`;

      const KEY_ID = Number(keyId) || 0;

      // Debug: Log the address being used for authorization
      console.log('Proposer function - selected account:', {
        accountType: selectedAccount.type,
        address: selectedAccount.address,
        parentAddress: selectedAccount.parentAddress,
        finalAddress: ADDRESS,
        keyId: KEY_ID,
      });

      return {
        ...account,
        tempId: `${ADDRESS}-${KEY_ID}`,
        addr: ADDRESS.replace('0x', ''),
        keyId: KEY_ID,
        signingFunction: async (signable: { message: string }) => {
          return {
            addr: ADDRESS,
            keyId: KEY_ID,
            signature: await self.sign(signable.message),
          };
        },
      };
    };
  }

  // Factory method to create bridge authorization function
  createBridgeAuthorizationFunction() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return async (account: any) => {
      const network = self.getNetwork();
      const payerStatus = await fetchPayerStatusWithCache(network as 'mainnet' | 'testnet');
      const bridgePayer = payerStatus?.bridgePayer?.address;
      const bridgePayerKey = payerStatus?.bridgePayer?.keyIndex || 0;
      const ADDRESS = bridgePayer?.startsWith('0x') ? bridgePayer : `0x${bridgePayer}`;
      const KEY_ID = Number(bridgePayerKey) || 0;

      return {
        ...account,
        tempId: `${ADDRESS}-${KEY_ID}`,
        addr: ADDRESS.replace('0x', ''),
        keyId: KEY_ID,
        signingFunction: async (signable: any) => {
          const signature = await self.walletController.signAsBridgePayer(signable);
          return {
            addr: ADDRESS,
            keyId: KEY_ID,
            signature: signature,
          };
        },
      };
    };
  }
  // Factory method to create payer authorization function
  createPayerAuthorizationFunction() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return async (account: any) => {
      const network = self.getNetwork();
      const payerStatus = await fetchPayerStatusWithCache(network as 'mainnet' | 'testnet');
      const payerAddress = payerStatus?.feePayer?.address;
      const payerKeyId = payerStatus?.feePayer?.keyIndex || 0;
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
            signature: await self.walletController.signAsFeePayer(signable),
          };
        },
      };
    };
  }

  // Export function to get surge data from UI
  async getSurgeData(network: string): Promise<any> {
    const payerStatus = await fetchPayerStatusWithCache(network as 'mainnet' | 'testnet');
    return payerStatus?.surge;
  }

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
    if (window.close) {
      window.close();
    } else {
      chrome.runtime.sendMessage({ type: 'CLOSE_POPUP' });
    }
  }

  // Toast/Notification methods
  showToast(
    title: string,
    message?: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 4000
  ): void {
    // Call the registered callback if available
    if ((this as any).toastCallback) {
      (this as any).toastCallback({ title, message, type, duration });
    }
  }

  setToastCallback(
    callback: (toast: {
      title: string;
      message: string;
      type?: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
    }) => void
  ): void {
    // Store the callback for the platform to use
    (this as any).toastCallback = callback;
  }
}

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
    // Make platform available globally for ToastContext
    (globalThis as any).__FLOW_WALLET_BRIDGE__ = platformInstance;
  }
  return platformInstance;
};

// Export function to get surge data from UI
export const getSurgeData = async (network: string): Promise<any> => {
  const platform = getPlatform();
  return await platform.getSurgeData(network);
};

export default ExtensionPlatformImpl;
