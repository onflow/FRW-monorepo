import {
  type CreateAccountResponse,
  type CreateEOAAccountResponse,
  type Currency,
  type NativeScreenName,
  type Platform,
  type RecentContactsResponse,
  type SeedPhraseGenerationResponse,
  type WalletAccount,
  type WalletAccountsResponse,
  type WalletProfilesResponse,
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
  // Generate seed phrase (mnemonic) and derive account key using native wallet-core
  // Returns: SeedPhraseGenerationResponse with mnemonic, accountKey, and derivation path
  generateSeedPhrase?(strength?: number): Promise<SeedPhraseGenerationResponse>;

  // Register Secure Type Account (Secure Enclave profile - hardware-backed keys)
  // Username must be provided by caller (3-20 chars as per server requirement)
  // This creates a COA account with hardware security, distinct from seed phrase EOA accounts
  // Note: Secure Type accounts use hardware-backed keys, no mnemonic is generated
  // Returns: CreateAccountResponse with txId for native-side account verification (matches EOA flow)
  registerSecureTypeAccount?(username: string): Promise<CreateAccountResponse>;

  // Register account with backend (for Recovery Phrase flow)
  // Sends the Flow public key to backend, which creates both Flow address and COA address
  // This is called after mnemonic is saved and wallet is initialized
  // Returns: transaction ID to track the transaction status, or "COA_ALREADY_EXISTS" if COA already exists
  registerAccountWithBackend?(): Promise<string>;

  // Save mnemonic to secure storage and initialize wallet (iOS Keychain / Android KeyStore)
  // For EOA accounts: mnemonic + customToken + txId + username
  // username: Original username with proper capitalization (to preserve case when backend returns lowercase)
  // Native layer handles: secure storage, Firebase auth, Wallet-Kit init, account discovery
  // Returns: Promise<void> - resolves on success, throws error on failure
  saveMnemonic?(
    mnemonic: string,
    customToken: string,
    txId: string,
    username: string
  ): Promise<void>;

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
  // screenName: identifier for the screen to launch (use NativeScreenName enum)
  // params: optional JSON string with screen-specific parameters
  launchNativeScreen?(screenName: NativeScreenName, params?: string): void;
}
