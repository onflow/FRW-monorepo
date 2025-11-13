import type {
  CreateAccountResponse,
  CreateEOAAccountResponse,
  Currency,
  Platform,
  RecentContactsResponse,
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

  // API endpoint methods
  getApiEndpoint(): string;
  getGoApiEndpoint(): string;
  getInstabugToken(): string;

  // Storage, cache, and navigation access
  storage(): Storage;
  cache(): Cache;
  navigation(): Navigation;

  // Cryptographic operations
  // Turbo Modules do not support Uint8Array or ArrayBuffer, so we need to convert to hex string instead
  sign(hexData: string): Promise<string>;
  getSignKeyIndex(): number;

  // EVM transaction signing for pre-encoded payloads
  ethSign(signData: Uint8Array): Promise<Uint8Array>;

  // Data access methods
  getRecentContacts(): Promise<RecentContactsResponse>;
  getWalletAccounts(): Promise<WalletAccountsResponse>;
  getWalletProfiles(): Promise<WalletProfilesResponse>;
  getSelectedAccount(): Promise<WalletAccount>;
  getCurrentUserUid?(): Promise<string | null>;

  // Transaction monitoring and post-transaction actions
  listenTransaction?(
    txId: string,
    showNotification: boolean,
    title: string,
    message: string,
    icon?: string
  ): void;

  // CadenceService configuration using interceptor pattern
  // This method allows the bridge to configure all FCL-related functionality
  configureCadenceService(cadenceService: any): void;

  // Logging methods - platform-specific logging implementation
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void;
  isDebug(): boolean;

  // Optional platform-specific logging callback for additional logging mechanisms
  // This enables backup logging solutions (e.g., local files, Instabug API) alongside the default bridge.log
  logCallback?: (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    ...args: unknown[]
  ) => void;

  // Error reporting methods - for checking Instabug availability
  isInstabugInitialized?(): boolean;
  setInstabugInitialized?(initialized: boolean): void;

  // UI interaction methods
  scanQRCode(): Promise<string>;
  shareQRCode?(address: string, qrCodeDataUrl: string): Promise<void>;
  closeRN(id?: string | null): void;

  // Toast/Notification methods
  showToast?(
    title: string,
    message?: string,
    type?: 'success' | 'error' | 'warning' | 'info',
    duration?: number
  ): void;
  hideToast?(id: string): void;
  clearAllToasts?(): void;
  setToastCallback?(callback: (toast: any) => void): void;

  // Onboarding methods - Account creation
  // EOA: Externally Owned Account (pure mnemonic-based, no server)
  createEOAAccount?(): Promise<CreateEOAAccountResponse>;

  // Register Secure Type Account (Secure Enclave profile - hardware-backed keys)
  // Username must be provided by caller (3-20 chars as per server requirement)
  // This creates a COA account with hardware security, distinct from seed phrase EOA accounts
  // Note: Secure Type accounts use hardware-backed keys, no mnemonic is generated
  // Returns: CreateAccountResponse with txId for native-side account verification (matches EOA flow)
  registerSecureTypeAccount?(username: string): Promise<CreateAccountResponse>;

  // Create linked COA account (for Recovery Phrase flow)
  // Creates a COA child account linked to the current main account via Cadence transaction
  // Returns: transaction ID to track the transaction status
  // This is different from registerSecureTypeAccount which creates a new main COA account
  createLinkedCOAAccount?(): Promise<string>;

  // Save mnemonic to secure storage and initialize wallet (iOS Keychain / Android KeyStore)
  // For EOA accounts: mnemonic + customToken + txId
  // Native layer handles: secure storage, Firebase auth, Wallet-Kit init, account discovery
  // Returns: Promise<void> - resolves on success, throws error on failure
  saveMnemonic?(mnemonic: string, customToken: string, txId: string): Promise<void>;

  // Sign out of Firebase and sign in anonymously (needed before creating new accounts)
  // Ensures clean authentication state for account creation (matches COA flow)
  // Returns: Promise<void> - resolves on success, throws error on failure
  signOutAndSignInAnonymously?(): Promise<void>;
  // Sign in with custom token (needed after registration to authenticate for API calls)
  // Returns: Promise<void> - resolves on success, throws error on failure
  signInWithCustomToken?(customToken: string): Promise<void>;

  // Notification permission methods
  requestNotificationPermission?(): Promise<boolean>;
  checkNotificationPermission?(): Promise<boolean>;

  // Screen security methods
  setScreenSecurityLevel?(level: 'normal' | 'secure'): void;

  // Native screen navigation - unified method for launching native Android/iOS screens
  // screenName: identifier for the screen to launch (e.g., 'multiBackup', 'deviceBackup', 'seedPhraseBackup', 'backupOptions')
  // params: optional JSON string with screen-specific parameters
  launchNativeScreen?(screenName: string, params?: string): void;
}
