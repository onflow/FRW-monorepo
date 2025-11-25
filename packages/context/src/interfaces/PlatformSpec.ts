import type {
  CreateAccountResponse,
  Currency,
  DeviceInfo,
  NativeScreenName,
  Platform,
  RecentContactsResponse,
  SeedPhraseGenerationResponse,
  WalletAccount,
  WalletAccountsResponse,
  WalletProfilesResponse,
} from '@onflow/frw-types';

import type { Cache } from './caching/Cache';
import type { Navigation } from './Navigation';
import type { Storage } from './storage/Storage';

// Re-export CadenceService interceptor types
export type CadenceRequestInterceptor = (config: any) => any | Promise<any>;
export type CadenceResponseInterceptor = (response: any) => any | Promise<any>;

/**
 * Platform specification interface for platform abstraction
 * This interface defines all methods that platform-specific implementations must implement
 */
export interface PlatformSpec {
  // Basic platform methods
  getSelectedAddress(): string | null;
  getDebugAddress(): string | null;
  getNetwork(): string;
  getJWT(): Promise<string>;
  getVersion(): string;
  getBuildNumber(): string;
  getLanguage(): string;

  getCurrency(): Currency;
  getPlatform(): Platform;
  getDeviceInfo(): DeviceInfo;

  // API endpoint methods
  getApiEndpoint(): string;
  getGoApiEndpoint(): string;
  getInstabugToken(): string;

  // Storage, cache, and navigation access
  storage(): Storage;
  cache(): Cache;
  navigation(): Navigation;

  // Cryptographic operations (hexData due to Turbo Module limitations)
  sign(hexData: string): Promise<string>;
  getSignKeyIndex(): number;
  ethSign(signData: Uint8Array): Promise<Uint8Array>;

  // Data access methods
  getRecentContacts(): Promise<RecentContactsResponse>;
  getWalletAccounts(): Promise<WalletAccountsResponse>;
  getWalletProfiles(): Promise<WalletProfilesResponse>;
  getSelectedAccount(): Promise<WalletAccount>;
  getCurrentUserUid?(): Promise<string | null>;

  // Transaction monitoring
  listenTransaction?(
    txId: string,
    showNotification: boolean,
    title: string,
    message: string,
    icon?: string
  ): void;

  // CadenceService configuration (FCL interceptors)
  configureCadenceService(cadenceService: any): void;

  // Logging
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void;
  isDebug(): boolean;

  // Error reporting (Instabug)
  isInstabugInitialized?(): boolean;
  setInstabugInitialized?(initialized: boolean): void;

  // UI interactions
  scanQRCode(): Promise<string>;
  shareQRCode?(address: string, qrCodeDataUrl: string): Promise<void>;
  closeRN(id?: string | null): void;

  // Toast notifications
  showToast?(
    title: string,
    message?: string,
    type?: 'success' | 'error' | 'warning' | 'info',
    duration?: number
  ): void;
  hideToast?(id: string): void;
  clearAllToasts?(): void;
  setToastCallback?(callback: (toast: any) => void): void;

  // Account creation
  generateSeedPhrase?(strength?: number): Promise<SeedPhraseGenerationResponse>;
  registerSecureTypeAccount?(username: string): Promise<CreateAccountResponse>; // Secure Enclave (hardware-backed)
  registerAccountWithBackend?(): Promise<string>; // Sends Flow key to backend to create Flow + COA addresses, returns txId or "COA_ALREADY_EXISTS"

  // Wallet initialization
  saveMnemonic?(
    mnemonic: string,
    customToken: string,
    txId: string,
    username: string
  ): Promise<void>;

  // Firebase authentication
  signInWithCustomToken?(customToken: string): Promise<void>;

  // Permissions
  requestNotificationPermission?(): Promise<boolean>;
  checkNotificationPermission?(): Promise<boolean>;

  // Screen security
  setScreenSecurityLevel?(level: 'normal' | 'secure'): void;

  // Native screen navigation
  launchNativeScreen?(screenName: NativeScreenName, params?: string): void;
}
