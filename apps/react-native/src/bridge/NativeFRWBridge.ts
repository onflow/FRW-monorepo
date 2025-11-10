import type {
  RecentContactsResponse,
  Currency as SharedCurrency,
  EnvironmentVariables as SharedEnvironmentVariables,
  WalletAccount,
  WalletAccountsResponse,
  WalletProfilesResponse,
} from '@onflow/frw-types';
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Local interfaces for Codegen - must be defined in the same file
 * @see {@link SharedEnvironmentVariables} and {@link SharedCurrency} in @onflow/frw-types
 *
 * React Native Codegen limitation: Cannot resolve imported types.
 * These must stay in sync with the source types manually.
 */
interface EnvironmentVariables {
  NODE_API_URL: string;
  GO_API_URL: string;
  INSTABUG_TOKEN: string;
}

interface Currency {
  name: string;
  symbol: string;
  rate: string;
}

// Compile-time sync validation
const _syncCheck: EnvironmentVariables = {} as SharedEnvironmentVariables;
const _reverseSyncCheck: SharedEnvironmentVariables = {} as EnvironmentVariables;
const _currencySyncCheck: Currency = {} as SharedCurrency;
const _currencyReverseSyncCheck: SharedCurrency = {} as Currency;

export interface Spec extends TurboModule {
  getSelectedAddress(): string | null;
  getDebugAddress(): string | null;
  getNetwork(): string;
  getJWT(): Promise<string>;
  getVersion(): string;
  getBuildNumber(): string;
  getLanguage(): string;
  // Turbo Modules do not support Uint8Array or ArrayBuffer, so we need to convert to hex string instead
  sign(hexData: string): Promise<string>;
  ethSign(hexData: string): Promise<string>;
  getRecentContacts(): Promise<RecentContactsResponse>;
  // Wallet accounts method
  getWalletAccounts(): Promise<WalletAccountsResponse>;
  getSignKeyIndex(): number;
  // QR code scanning method
  scanQRCode(): Promise<string>;
  // Close react native method
  closeRN(id?: string | null): void;
  // Free gas settings method
  isFreeGasEnabled(): Promise<boolean>;
  // Listen to a transaction
  listenTransaction(txid: string): void;
  // Get environment variables
  getEnv(): EnvironmentVariables;
  // Get selected account
  getSelectedAccount(): Promise<WalletAccount>;
  getCurrency(): Currency;
  getTokenRate(token: string): string;
  getWalletProfiles(): Promise<WalletProfilesResponse>;
  // Toast methods
  showToast(
    title: string,
    message?: string | null,
    type?: 'success' | 'error' | 'warning' | 'info',
    duration?: number | null
  ): void;
  hideToast(id: string): void;
  clearAllToasts(): void;
  // COA account creation (hybrid with server - Secure Enclave)
  // Username must be provided by RN layer (3-15 chars as per server requirement)
  createCOAAccount(username: string): Promise<CreateAccountResponse>;
  // Save mnemonic and initialize wallet (Keychain/KeyStore) - for EOA accounts
  // Native handles: secure storage, Firebase auth (customToken), Wallet-Kit init, account discovery (txId)
  // Returns: Promise<void> - resolves on success, rejects with error on failure
  saveMnemonic(mnemonic: string, customToken: string, txId: string): Promise<void>;
  // Notification permissions
  requestNotificationPermission(): Promise<boolean>;
  checkNotificationPermission(): Promise<boolean>;
  // Screen security
  setScreenSecurityLevel(level: 'normal' | 'secure'): void;
  // Native logging method for additional platform-specific logging
  logToNative(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    args: ReadonlyArray<string>
  ): void;
  // Native screen navigation - unified method for launching native Android/iOS screens
  launchNativeScreen(screenName: string, params?: string | null): void;
}

export interface CreateAccountResponse {
  success: boolean;
  address: string | null;
  username: string | null;
  // Note: mnemonic/phrase fields removed for COA accounts (Secure Enclave)
  // Secure Enclave uses hardware-backed keys, no mnemonic is generated
  accountType: 'eoa' | 'coa' | null;
  error: string | null;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeFRWBridge');
