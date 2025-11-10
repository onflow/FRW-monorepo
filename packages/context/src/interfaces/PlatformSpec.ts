import type {
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

  // EVM transaction callback for EOA to Flow COA withdrawal
  evmTransactionCallback?(trxData: any): Promise<any>;

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
  createEOAAccount?(): Promise<{
    success: boolean;
    address: string | null;
    username: string | null;
    mnemonic: string | null;
    phrase: string[] | null;
    accountType: 'eoa' | 'coa' | null;
    error: string | null;
  }>;

  // COA: Cadence Owned Account (hybrid with server - Secure Enclave)
  createCOAAccount?(): Promise<{
    success: boolean;
    address: string | null;
    username: string | null;
    mnemonic: string | null;
    phrase: string[] | null;
    accountType: 'eoa' | 'coa' | null;
    error: string | null;
  }>;

  // Save mnemonic to secure storage and initialize wallet (iOS Keychain / Android KeyStore)
  // For EOA accounts: mnemonic + customToken + txId
  // Native layer handles: secure storage, Firebase auth, Wallet-Kit init, account discovery
  saveMnemonic?(
    mnemonic: string,
    customToken: string,
    txId: string
  ): Promise<{
    success: boolean;
    error: string | null;
  }>;

  // Notification permission methods
  requestNotificationPermission?(): Promise<boolean>;
  checkNotificationPermission?(): Promise<boolean>;

  // Screen security methods
  setScreenSecurityLevel?(level: 'normal' | 'secure'): void;

  // Backup activity launchers
  launchMultiBackup?(): void;
  launchDeviceBackup?(): void;
  launchSeedPhraseBackup?(): void;
  launchNativeBackupOptions?(): void;
}
