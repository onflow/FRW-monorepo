import type {
  RecentContactsResponse,
  Currency as SharedCurrency,
  EnvironmentVariables as SharedEnvironmentVariables,
  WalletAccount,
  WalletAccountsResponse,
  WalletProfilesResponse,
  CreateAccountResponse as SharedCreateAccountResponse,
  SeedPhraseGenerationResponse as SharedSeedPhraseGenerationResponse,
} from '@onflow/frw-types';
import { type NativeScreenName as SharedNativeScreenName } from '@onflow/frw-types';
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Local interfaces for Codegen - must be defined in the same file
 * @see {@link SharedEnvironmentVariables}, {@link SharedCurrency}, {@link SharedCreateAccountResponse}, {@link SharedSeedPhraseGenerationResponse}, and {@link SharedNativeScreenName} in @onflow/frw-types
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

interface AccountKey {
  publicKey: string;
  hashAlgoStr: string;
  signAlgoStr: string;
  weight: number;
  hashAlgo: number;
  signAlgo: number;
}

interface CreateAccountResponse {
  success: boolean;
  address: string | null;
  username: string | null;
  accountType: 'full' | 'hardware' | null; // full = mnemonic-based account, hardware = secure enclave
  txId: string | null;
  error: string | null;
}

interface SeedPhraseGenerationResponse {
  mnemonic: string;
  accountKey: AccountKey;
  drivepath: string;
}

/**
 * Local type for NativeScreenName - must match enum values from @onflow/frw-types
 * @see {@link SharedNativeScreenName}
 */
type NativeScreenName =
  | 'multiBackup'
  | 'deviceBackup'
  | 'seedPhraseBackup'
  | 'backupOptions'
  | 'walletRestore'
  | 'recoveryPhraseRestore'
  | 'keyStoreRestore'
  | 'privateKeyRestore'
  | 'googleDriveRestore'
  | 'icloudRestore'
  | 'multiRestore';

// Compile-time sync validation
const _syncCheck: EnvironmentVariables = {} as SharedEnvironmentVariables;
const _reverseSyncCheck: SharedEnvironmentVariables = {} as EnvironmentVariables;
const _currencySyncCheck: Currency = {} as SharedCurrency;
const _currencyReverseSyncCheck: SharedCurrency = {} as Currency;
const _createAccountSyncCheck: CreateAccountResponse = {} as SharedCreateAccountResponse;
const _createAccountReverseSyncCheck: SharedCreateAccountResponse = {} as CreateAccountResponse;
const _seedPhraseSyncCheck: SeedPhraseGenerationResponse = {} as SharedSeedPhraseGenerationResponse;
const _seedPhraseReverseSyncCheck: SharedSeedPhraseGenerationResponse =
  {} as SeedPhraseGenerationResponse;

// NativeScreenName validation - ensures local union matches SharedNativeScreenName enum values
type SharedNativeScreenNameValues = `${SharedNativeScreenName}`;
const _nativeScreenNameSyncCheck: NativeScreenName = {} as SharedNativeScreenNameValues;
const _nativeScreenNameReverseSyncCheck: SharedNativeScreenNameValues = {} as NativeScreenName;

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
  // Profile management - recovery flow
  getRecoverableProfiles(): Promise<WalletProfilesResponse>;
  switchToProfile(userId: string): Promise<void>;
  // Device info method
  getDeviceId(): string;
  // Toast methods
  showToast(
    title: string,
    message?: string | null,
    type?: 'success' | 'error' | 'warning' | 'info',
    duration?: number | null
  ): void;
  hideToast(id: string): void;
  clearAllToasts(): void;
  // Native logging method for additional platform-specific logging
  logToNative(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    args: ReadonlyArray<string>
  ): void;
  // Onboarding methods
  registerSecureTypeAccount(username: string): Promise<CreateAccountResponse>;
  initSecureEnclaveWallet(
    txId: string
  ): Promise<{ success: boolean; address: string | null; error: string | null }>;
  generateSeedPhrase(strength?: number | null): Promise<SeedPhraseGenerationResponse>;
  /**
   * Get registration signature for v4 API
   * Signs in anonymously to Firebase, gets JWT, and signs it with the key derived from mnemonic
   * @param mnemonic - The recovery phrase to derive the signing key from
   * @returns Promise with signature (hex string)
   */
  getRegistrationSignature(mnemonic: string): Promise<string>;
  signInWithCustomToken(customToken: string): Promise<void>;
  saveMnemonic(
    mnemonic: string,
    customToken: string,
    txId: string,
    username: string
  ): Promise<void>;
  requestNotificationPermission(): Promise<boolean>;
  checkNotificationPermission(): Promise<boolean>;
  setScreenSecurityLevel(level: 'normal' | 'secure'): void;
  // Launch native screen method - uses local NativeScreenName type for Codegen compatibility
  launchNativeScreen(screenName: NativeScreenName, params?: string | null): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeFRWBridge');
