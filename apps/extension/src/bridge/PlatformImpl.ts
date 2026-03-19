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
  type AccountKeySignature,
} from '@onflow/frw-types';
import { extractUidFromJwt } from '@onflow/frw-utils';
import { WalletCoreProvider } from '@onflow/frw-wallet';
import { KeyRotation } from '@onflow/frw-workflow';
import * as bip39 from 'bip39';

// Removed direct service imports - using walletController instead
import { getAccountKey } from '@/core/utils/account-key';
import { getLocalData } from '@/data-model';
import {
  HTTP_STATUS_TOO_MANY_REQUESTS,
  HASH_ALGO_NUM_DEFAULT,
  SIGN_ALGO_NUM_DEFAULT,
} from '@/shared/constant';
import { isValidFlowAddress } from '@/shared/utils';

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
  onUpdateDialogActionPress?(
    actionType: 'external' | 'internal' | 'deeplink',
    actionUrl?: string | null,
    actionText?: string | null
  ): void {
    throw new Error('Method not implemented.');
  }
  closeRNWithNFT(id?: string | null): void {
    throw new Error('Method not implemented.');
  }
  refreshCoaAfterMigration?(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getSignType(): string {
    throw new Error('Method not implemented.');
  }
  getRecoverableProfiles?(): Promise<WalletProfilesResponse> {
    throw new Error('Method not implemented.');
  }
  switchToProfile?(userId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getV4RegistrationSignatures?(
    mnemonic: string
  ): Promise<{ flowSignature: string; evmSignature: string; eoaAddress: string }> {
    throw new Error('Method not implemented.');
  }
  initSecureEnclaveWallet?(
    txId: string
  ): Promise<{ success: boolean; address: string | null; error: string | null }> {
    throw new Error('Method not implemented.');
  }
  getMigrationAssets?(sourceAddress: string): Promise<{
    erc20: Array<{ address: string; amount: string }>;
    erc721: Array<{ address: string; id: string }>;
    erc1155: Array<{ address: string; id: string; amount: string }>;
  }> {
    throw new Error('Method not implemented.');
  }
  getSafeAreaInsets?(): { top: number; bottom: number; left: number; right: number } {
    throw new Error('Method not implemented.');
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
    // Screenshot protection is a native mobile feature
    // In the browser extension, we can't prevent screenshots
    // This is a no-op but we log it for debugging
    this.log('debug', `setScreenSecurityLevel called with level: ${level} (no-op in extension)`);
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

  getMixpanelToken(): string {
    return process.env.MIXPANEL_TOKEN || '';
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

    // Preferred path: sign with the selected EOA address/index via wallet-manager.
    if (typeof this.walletController.ethSignWithAddress === 'function') {
      const signedBytes = await this.walletController.ethSignWithAddress(
        signData,
        this.currentAddress || undefined
      );
      return signedBytes instanceof Uint8Array
        ? signedBytes
        : new Uint8Array(Object.values(signedBytes));
    }

    // Backward-compatible fallback for older controller versions.
    const ethereumPrivateKey = await this.walletController.getEthereumPrivateKey();
    const privateKeyBytes = await this.walletController.privateKeyToUint8Array(ethereumPrivateKey);
    const actualPrivateKeyBytes =
      privateKeyBytes instanceof Uint8Array
        ? privateKeyBytes
        : new Uint8Array(Object.values(privateKeyBytes));
    return await WalletCoreProvider.signEvmDigestWithPrivateKey(actualPrivateKeyBytes, signData);
  }

  async getWrapEOATxWithCadence(): Promise<boolean> {
    const val = await getLocalData<boolean>('wrapEOATxWithCadence');
    return val ?? true;
  }

  async getCadenceInbox(): Promise<boolean> {
    return (await this.walletController?.getFeatureFlag?.('cadence_inbox')) ?? false;
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
    icon?: string,
    sourceAddress?: string
  ): void {
    if (!this.walletController) {
      this.log('warn', 'Cannot listen transaction - wallet controller not initialized');
      return;
    }
    if (!this.walletController.listenTransaction) {
      this.log('warn', 'listenTransaction method not available on wallet controller');
      return;
    }

    this.log('info', 'Extension listenTransaction called:', {
      txId,
      showNotification,
      title,
      sourceAddress,
    });

    try {
      this.walletController.listenTransaction(
        txId,
        showNotification,
        title,
        message,
        icon,
        sourceAddress
      );
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
    const extractTxId = (value: unknown): string | null => {
      if (typeof value === 'string' && /^(?:0x)?[0-9a-fA-F]{64}$/.test(value)) {
        return value;
      }
      if (!value || typeof value !== 'object') {
        return null;
      }
      const obj = value as Record<string, unknown>;
      const candidates = [
        obj.txId,
        obj.transactionId,
        obj.transaction_id,
        obj.id,
        obj.hash,
        obj.result,
      ];
      for (const candidate of candidates) {
        if (typeof candidate === 'string' && /^(?:0x)?[0-9a-fA-F]{64}$/.test(candidate)) {
          return candidate;
        }
      }
      return null;
    };

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
      // Skip redirect for key rotation transactions
      if (config.type === 'transaction' && config.name === 'addAndRevokeKeys') {
        config.skipRedirect = true;
      }
      // Skip redirect for batch call contract transactions (used in migration and NFT sends)
      // These operations have their own progress UI and should handle navigation themselves
      if (config.type === 'transaction' && config.name === 'batchCallContract') {
        config.skipRedirect = true;
      }

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
          txId = extractTxId(response.result);

          // Return the transaction ID as the response
          if (txId) {
            response = txId;
          }
        } else {
          // Handle normal FCL transactions and object-shaped transaction responses
          txId = extractTxId(response);
        }

        if (txId) {
          try {
            // Start transaction monitoring
            if (this.walletController && this.walletController.listenTransaction) {
              const selectedAccountForTracking = await this.getSelectedAccount();
              const sendFromAddress = useSendStore.getState().fromAccount?.address;
              const trackingAddress = sendFromAddress || selectedAccountForTracking?.address;
              this.log('info', 'Response interceptor starting tx monitor:', {
                txId,
                selectedTrackingAddress: selectedAccountForTracking?.address,
                sendFromAddress,
                trackingAddress,
                configName: config?.name,
              });
              this.listenTransaction?.(txId, true, '', '', undefined, trackingAddress);
            } else {
              this.log(
                'warn',
                'Response interceptor cannot start tx monitor: listenTransaction unavailable'
              );
            }
            // Redirect after transaction (default to true)
            // Set to false in config.skipRedirect to let the page handle its own navigation
            const redirect = config.skipRedirect !== true;

            // Navigate to transaction complete (unless redirect is disabled)
            if (redirect) {
              const navigation = this.navigation();
              if (navigation && navigation.navigate) {
                navigation.navigate('TransactionComplete', {
                  txId: txId,
                });
              }
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
      // For newly generated keys, use default extension algorithms
      const flowKey = {
        publicKey: accountKeyRequest.public_key,
        signAlgo: SIGN_ALGO_NUM_DEFAULT, // Use default extension sign algorithm
        hashAlgo: HASH_ALGO_NUM_DEFAULT, // Use default extension hash algorithm
        weight: accountKeyRequest.weight,
        signAlgoString: SIGN_ALGO_NUM_DEFAULT.toString(),
        hashAlgoString: HASH_ALGO_NUM_DEFAULT.toString(),
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

  // Temporary storage for password during key rotation
  private keyRotationPassword: string | null = null;

  setKeyRotationPassword(password: string | null): void {
    this.keyRotationPassword = password;
  }

  async saveNewKey(key: NewKeyInfo): Promise<void> {
    // The new key info is already stored in component state (via handleTipContinue)
    // and will be used directly in handlePasswordSubmit to login with the new mnemonic
    // No need to store it here - just a no-op
    this.log('debug', 'saveNewKey: New key info will be used in UI component');
    return Promise.resolve();
  }

  async removeOldKey(address: string, publicKey: string): Promise<void> {
    // Remove the old key from the account
    // This is called after successful key rotation to clean up the old key
    try {
      if (this.walletController?.removeOldKey) {
        await this.walletController.removeOldKey(address, publicKey);
      } else {
        this.log('warn', 'removeOldKey not implemented in walletController');
      }
    } catch (error) {
      this.log('error', 'Failed to remove old key:', error);
      throw error;
    }
  }

  async signRotationRequest(address: string, signatureData: string): Promise<AccountKeySignature> {
    if (!this.walletController) {
      throw new Error('Wallet controller not available - cannot sign rotation request');
    }

    // Route signing to wallet controller which runs in background context
    // where keyring service is properly booted and unlocked
    // The wallet controller will get the public key internally from the keyring service
    // We pass an empty string for publicKey since the wallet controller will get it from keyring
    return await this.walletController.signRotationRequest(address, signatureData);
  }

  getKeyRotationDependencies(): KeyRotationDependencies {
    // Return references to the existing class methods to avoid duplication
    return {
      createSeedKey: this.createSeedKey.bind(this),
      saveNewKey: this.saveNewKey.bind(this),
      removeOldKey: this.removeOldKey.bind(this),
      signRotationRequest: this.signRotationRequest.bind(this),
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

      if (!isValidFlowAddress(accountAddress)) {
        return {
          isBloctoKey: false,
          needRevoke: false,
          fullAccountKeys: [],
          bloctoKeyIndexes: [],
        };
      }

      // Create KeyRotation instance
      const keyRotation = new KeyRotation();

      // Detect if Blocto keys are present
      const detection = await keyRotation.detectBloctoKey(accountAddress);

      return detection;
    } catch (error) {
      this.log('error', 'Failed to check key rotation:', error);
      // Return a safe default result on error
      return {
        isBloctoKey: false,
        needRevoke: false,
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
