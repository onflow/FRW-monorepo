import { type forms_DeviceInfo } from '@onflow/frw-api';
import { type Cache, type PlatformSpec, type Storage } from '@onflow/frw-context';
import { useSendStore, useTokenQueryStore, fetchPayerStatusWithCache } from '@onflow/frw-stores';
import {
  Platform,
  type KeyRotationDependencies,
  type NewKeyInfo,
  type Currency,
  type RecentContactsResponse,
  type WalletAccount,
  type WalletAccountsResponse,
  type WalletProfilesResponse,
  type CreateAccountResponse,
  type NativeScreenName,
  type SeedPhraseGenerationResponse,
  type BloctoDetectionResult,
} from '@onflow/frw-types';
import { extractUidFromJwt } from '@onflow/frw-utils';
import { WalletCoreProvider } from '@onflow/frw-wallet';
import { KeyRotation } from '@onflow/frw-workflow';
import * as bip39 from 'bip39';

// Removed direct service imports - using walletController instead
import { keyringService, accountManagementService } from '@/core/service';
import { getAccountKey } from '@/core/utils/account-key';
import { returnCurrentProfileId } from '@/core/utils/current-id';
import { HTTP_STATUS_TOO_MANY_REQUESTS, FLOW_BIP44_PATH } from '@/shared/constant';

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
  isInstabugInitialized?(): boolean {
    throw new Error('Method not implemented.');
  }
  setInstabugInitialized?(initialized: boolean): void {
    throw new Error('Method not implemented.');
  }
  shareQRCode?(address: string, qrCodeDataUrl: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  hideToast?(id: string): void {
    throw new Error('Method not implemented.');
  }
  clearAllToasts?(): void {
    throw new Error('Method not implemented.');
  }
  generateSeedPhrase?(strength?: number): Promise<SeedPhraseGenerationResponse> {
    throw new Error('Method not implemented.');
  }
  registerSecureTypeAccount?(username: string): Promise<CreateAccountResponse> {
    throw new Error('Method not implemented.');
  }
  registerAccountWithBackend?(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  saveMnemonic?(
    mnemonic: string,
    customToken: string,
    txId: string,
    username: string
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  signInWithCustomToken?(customToken: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  requestNotificationPermission?(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  checkNotificationPermission?(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  setScreenSecurityLevel?(level: 'normal' | 'secure'): void {
    throw new Error('Method not implemented.');
  }
  launchNativeScreen?(screenName: NativeScreenName, params?: string): void {
    throw new Error('Method not implemented.');
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

  getDeviceInfo(): forms_DeviceInfo {
    // Return minimal device info for extension platform
    // Note: Full device info with location requires async API calls,
    // but PlatformSpec requires synchronous method
    return {
      name: 'FRW Chrome Extension',
      type: '2',
      user_agent: 'Chrome',
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

  async ethSign(signData: Uint8Array): Promise<Uint8Array> {
    if (!this.walletController) {
      throw new Error('Wallet controller not initialized');
    }

    if (!(signData instanceof Uint8Array)) {
      throw new Error('signData must be a Uint8Array');
    }

    const ethereumPrivateKey = await this.walletController.getEthereumPrivateKey();
    const privateKeyBytes = await this.walletController.privateKeyToUint8Array(ethereumPrivateKey);

    // Convert plain object back to Uint8Array if needed (cross-context serialization issue)
    const actualPrivateKeyBytes =
      privateKeyBytes instanceof Uint8Array
        ? privateKeyBytes
        : new Uint8Array(Object.values(privateKeyBytes));

    return await WalletCoreProvider.signEvmDigestWithPrivateKey(actualPrivateKeyBytes, signData);
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
          config.payer = config.proposer;
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
                const userApproved = await this.walletController.showSurgeModalAndWait();

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
    const prefix = `[FW-${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        if (this.debugMode) {
          console.debug(prefix, message, ...args);
        }
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

  async createSeedKey(strength: number): Promise<NewKeyInfo> {
    try {
      // Generate mnemonic with specified strength (128 = 12 words, 256 = 24 words)
      const mnemonic = bip39.generateMnemonic(strength);

      // Derive Flow account key from mnemonic
      const accountKeyRequest = await getAccountKey(mnemonic);

      // Convert AccountKeyRequest to AccountKey format expected by NewKeyInfo
      // NewKeyInfo.flowKey uses AccountKey from KeyRotation.ts which has signAlgoString/hashAlgoString
      const flowKey = {
        publicKey: accountKeyRequest.public_key,
        signAlgo: accountKeyRequest.sign_algo,
        hashAlgo: accountKeyRequest.hash_algo,
        weight: accountKeyRequest.weight,
        signAlgoString: accountKeyRequest.sign_algo.toString(),
        hashAlgoString: accountKeyRequest.hash_algo.toString(),
      };

      return {
        seedphrase: mnemonic,
        flowKey,
      };
    } catch (error) {
      this.log('error', 'Failed to create seed key:', error);
      throw new Error(
        `Failed to create seed key: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async saveNewKey(key: NewKeyInfo): Promise<void> {
    try {
      if (!key.seedphrase || !key.flowKey) {
        throw new Error('Invalid key info: seedphrase and flowKey are required');
      }

      // Verify the wallet is unlocked
      if (!(await keyringService.isUnlocked())) {
        throw new Error('Wallet must be unlocked to save a new key');
      }

      // For key rotation, we need to add the new keyring to the keyring service
      // This follows the same pattern as importProfileUsingMnemonic but for rotation keys
      // We need to get the password - since the wallet is unlocked, we'll need to prompt for it
      // or get it from the walletController if available

      // Get the password from walletController if it has a method to retrieve it
      // Otherwise, we'll need to use accountManagementService which handles password verification
      let password: string | undefined;

      if (this.walletController?.getPassword) {
        password = await this.walletController.getPassword();
      }

      if (!password) {
        // If we can't get the password automatically, we need to throw an error
        // The caller should handle password prompting before calling this method
        throw new Error(
          'Password is required to save the new key. Please provide the wallet password.'
        );
      }

      // Verify password is correct
      await accountManagementService.verifyPasswordIfBooted(password);

      // Save the current keyring state so we can switch back after adding the new one
      const currentPublicKey = await keyringService.getCurrentPublicKey();
      const currentKeyringId = await returnCurrentProfileId();

      // Add the new keyring using the keyring service
      // This will encrypt and store the mnemonic in the keyring vault
      // Note: addNewKeyring will make this the current keyring
      await keyringService.addNewKeyring(
        key.flowKey.publicKey,
        key.flowKey.signAlgo || 2, // Default to ECDSA_secp256k1 if not specified
        password,
        'HD Key Tree',
        {
          mnemonic: key.seedphrase,
          activeIndexes: [0],
          derivationPath: FLOW_BIP44_PATH,
          passphrase: '',
        }
      );

      // Switch back to the original keyring if it existed
      // This ensures the user's current session isn't disrupted
      if (currentKeyringId) {
        try {
          await keyringService.switchKeyring(currentKeyringId);
        } catch (switchError) {
          // Log but don't fail - the new keyring is saved even if we can't switch back
          this.log('warn', 'Failed to switch back to original keyring:', switchError);
        }
      }

      this.log('debug', 'Saved new rotation key to keyring for public key:', key.flowKey.publicKey);
    } catch (error) {
      this.log('error', 'Failed to save new key:', error);
      throw new Error(
        `Failed to save new key: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getKeyRotationDependencies(): KeyRotationDependencies {
    // Return references to the existing class methods to avoid duplication
    return {
      createSeedKey: this.createSeedKey.bind(this),
      saveNewKey: this.saveNewKey.bind(this),
    };
  }

  /**
   * Check if the current account requires key rotation
   * @param address - Optional address to check. If not provided, uses the currently selected account address
   * @returns Promise<BloctoDetectionResult> - Detection result indicating if rotation is needed
   */
  async checkKeyRotationNeeded(address?: string): Promise<BloctoDetectionResult> {
    try {
      // Get the address to check - use provided address or current account
      let accountAddress = address;
      if (!accountAddress) {
        const selectedAccount = await this.getSelectedAccount();
        accountAddress = selectedAccount.address;
      }

      if (!accountAddress) {
        throw new Error('No address available to check for key rotation');
      }

      // Create KeyRotation instance with dependencies
      const keyRotation = new KeyRotation(this.getKeyRotationDependencies());

      // Detect if Blocto keys are present
      const detection = await keyRotation.detectBloctoKey(accountAddress);

      return detection;
    } catch (error) {
      this.log('error', 'Failed to check key rotation:', error);
      // Return a safe default result on error
      return {
        isBloctoKey: false,
        fullAccountKeys: [],
        bloctoKeyIndexes: [],
      };
    }
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
