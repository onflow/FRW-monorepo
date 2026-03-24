import type {
  NewKeyInfo as SharedNewKeyInfo,
  RecentContactsResponse,
  AccountKeySignature as SharedAccountKeySignature,
  Currency as SharedCurrency,
  EnvironmentVariables as SharedEnvironmentVariables,
  WalletAccount,
  WalletAccountsResponse,
  WalletProfilesResponse,
  CreateAccountResponse as SharedCreateAccountResponse,
  SeedPhraseGenerationResponse as SharedSeedPhraseGenerationResponse,
  MigrationAssetsData as SharedMigrationAssetsData,
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
  MIXPANEL_TOKEN?: string;
  CADENCE_INBOX?: boolean;
}

interface Currency {
  name: string;
  symbol: string;
  rate: string;
}

interface AccountKey {
  publicKey: string;
  signAlgo?: number;
  hashAlgo?: number;
  weight?: number;
}

interface AccountKeySignature {
  public_key: string;
  hash_algo: number;
  sign_algo: number;
  signature: string;
  sign_message?: string;
  weight?: number;
}

interface NewKeyInfo {
  seedphrase: string;
  flowKey: AccountKey;
}

/**
 * Response from getV4RegistrationSignatures containing all signatures needed for v4 API
 */
interface V4RegistrationSignaturesResponse {
  flowSignature: string;
  evmSignature: string;
  eoaAddress: string;
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
  /** Pre-derived EVM/EOA address from BIP44 path m/44'/60'/0'/0/0 for faster display */
  evmAddress?: string;
}

interface MigrationAssetsData {
  erc20: Array<{ address: string; amount: string }>;
  erc721: Array<{ address: string; id: string }>;
  erc1155: Array<{ address: string; id: string; amount: string }>;
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
const _newKeyInfoSyncCheck: NewKeyInfo = {} as SharedNewKeyInfo;
const _newKeyInfoReverseSyncCheck: SharedNewKeyInfo = {} as NewKeyInfo;
const _accountKeySignatureSyncCheck: AccountKeySignature = {} as SharedAccountKeySignature;
const _accountKeySignatureReverseSyncCheck: SharedAccountKeySignature = {} as AccountKeySignature;
const _createAccountSyncCheck: CreateAccountResponse = {} as SharedCreateAccountResponse;
const _createAccountReverseSyncCheck: SharedCreateAccountResponse = {} as CreateAccountResponse;
const _seedPhraseSyncCheck: SeedPhraseGenerationResponse = {} as SharedSeedPhraseGenerationResponse;
const _migrationAssetsSyncCheck: MigrationAssetsData = {} as SharedMigrationAssetsData;
const _migrationAssetsReverseSyncCheck: SharedMigrationAssetsData = {} as MigrationAssetsData;

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
  ethSign(hexData: string, address: string | null): Promise<string>;
  getRecentContacts(): Promise<RecentContactsResponse>;
  // Wallet accounts method
  getWalletAccounts(): Promise<WalletAccountsResponse>;
  getSignKeyIndex(): number;
  // QR code scanning method
  scanQRCode(): Promise<string>;
  // Close react native method
  closeRN(id?: string | null): void;

  // Update dialog action click callback
  onUpdateDialogActionPress(
    actionType: 'external' | 'internal' | 'deeplink',
    actionUrl?: string | null,
    actionText?: string | null
  ): void;

  // Close react native and enable NFT collection storage
  closeRNWithNFT(id?: string | null): void;

  // Free gas settings method
  isFreeGasEnabled(): Promise<boolean>;
  // Listen to a transaction
  listenTransaction(txid: string): void;
  // Get environment variables
  getEnv(): EnvironmentVariables;
  // Get selected account
  getSelectedAccount(): Promise<WalletAccount>;
  getMigrationAssets(sourceAddress: string): Promise<MigrationAssetsData>;
  refreshCoaAfterMigration(): Promise<void>;
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

  // Key rotation methods
  createSeedKey(strength: number): Promise<NewKeyInfo>;
  saveNewKey(key: NewKeyInfo): Promise<void>;
  removeOldKey(address: string, publicKey: string): Promise<void>;
  signRotationRequest(address: string, signatureData: string): Promise<AccountKeySignature>;

  // Onboarding methods
  registerSecureTypeAccount(username: string): Promise<CreateAccountResponse>;
  initSecureEnclaveWallet(
    txId: string
  ): Promise<{ success: boolean; address: string | null; error: string | null }>;
  generateSeedPhrase(strength?: number | null): Promise<SeedPhraseGenerationResponse>;
  /**
   * Get all signatures needed for v4 API registration
   * Signs in anonymously to Firebase, gets JWT, and signs it with both Flow and EVM keys derived from mnemonic
   * @param mnemonic - The recovery phrase to derive signing keys from
   * @returns Promise with flowSignature, evmSignature, and eoaAddress
   */
  getV4RegistrationSignatures(mnemonic: string): Promise<V4RegistrationSignaturesResponse>;
  signInWithCustomToken(customToken: string): Promise<void>;
  saveMnemonic(
    mnemonic: string,
    customToken: string,
    txId: string,
    username: string,
    evmAddress?: string | null
  ): Promise<void>;
  requestNotificationPermission(): Promise<boolean>;
  checkNotificationPermission(): Promise<boolean>;
  // Keystore migration
  keystoreMigration?(): Promise<void>;

  // Screen security
  setScreenSecurityLevel(level: 'normal' | 'secure'): void;
  // Launch native screen method - uses local NativeScreenName type for Codegen compatibility
  launchNativeScreen(screenName: NativeScreenName, params?: string | null): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeFRWBridge');
