import type { forms_DeviceInfo } from '@onflow/frw-api';
import type {
  CreateAccountResponse,
  Currency,
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
  getDeviceInfo(): forms_DeviceInfo;

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

  // Profile management
  /**
   * Get profiles stored locally but not yet logged in (for recovery flow)
   * These are different from getWalletProfiles which returns currently logged-in profiles
   * @returns Promise with recoverable profiles response
   */
  getRecoverableProfiles?(): Promise<WalletProfilesResponse>;

  /**
   * Switch to a previously signed-in profile by user ID
   * @param userId - The unique identifier of the profile to switch to
   * @returns Promise that resolves on success, rejects on failure
   */
  switchToProfile?(userId: string): Promise<void>;

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
  /**
   * Get all signatures needed for v4 API registration
   * Signs in anonymously to Firebase, gets JWT, and signs it with both Flow and EVM keys derived from mnemonic
   * @param mnemonic - The recovery phrase to derive signing keys from
   * @returns Promise with flowSignature, evmSignature, and eoaAddress
   */
  getV4RegistrationSignatures?(mnemonic: string): Promise<{
    flowSignature: string;
    evmSignature: string;
    eoaAddress: string;
  }>;
  /**
   * Register Secure Enclave account with backend and initiate on-chain account creation
   * Returns early with txId so RN can monitor transaction status
   * Does NOT wait for transaction to seal - RN will handle that
   * @param username - Username for the account
   * @returns Response with txId for RN to monitor (address may be null until tx seals)
   */
  registerSecureTypeAccount?(username: string): Promise<CreateAccountResponse>; // Secure Enclave (hardware-backed)

  /**
   * Initialize Secure Enclave wallet after account creation transaction has sealed
   * Called by RN after monitoring tx status confirms the transaction is sealed
   * @param txId - Transaction ID from account creation
   * @returns Promise that resolves when wallet is initialized
   */
  initSecureEnclaveWallet?(
    txId: string
  ): Promise<{ success: boolean; address: string | null; error: string | null }>;

  // Wallet initialization
  /**
   * Save mnemonic and initialize wallet after account creation transaction is sealed
   * @param mnemonic - The recovery phrase to save securely
   * @param customToken - Firebase custom token from registration
   * @param txId - Transaction ID from account creation (used to init native wallet SDK)
   * @param username - Username for the account
   */
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
