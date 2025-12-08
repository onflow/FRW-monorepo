// Bridge-related types for native module communication

import type { NFTModel } from './NFTModel';
import type { TokenModel } from './TokenModel';

export type { NFTModel } from './NFTModel';
export type { FlowPath } from './TokenModel';
export type { TokenModel } from './TokenModel';
export type { WalletType } from './Wallet';

export interface EmojiInfo {
  emoji: string;
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  username?: string;
  contactName?: string;
}

export interface AddressBookContact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  username?: string;
  contactName?: string;
}

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  emojiInfo?: EmojiInfo;
  parentEmoji?: EmojiInfo;
  parentAddress?: string;
  avatar?: string;
  isActive: boolean;
  type?: 'main' | 'child' | 'evm' | 'eoa';
  balance?: string;
  nfts?: string;
}

export interface RecentContactsResponse {
  contacts: Contact[];
}

export interface WalletAccountsResponse {
  accounts: WalletAccount[];
}

export interface WalletProfile {
  name: string;
  avatar: string;
  uid: string;
  accounts: WalletAccount[];
}

export interface WalletProfilesResponse {
  profiles: WalletProfile[];
}

export interface AddressBookResponse {
  contacts: AddressBookContact[];
}
/**
 * When transmitting data from the native side to react and sending resources
 */
export interface SendToConfig {
  selectedToken?: TokenModel;
  fromAccount?: WalletAccount;
  selectedNFTs?: NFTModel[];
  targetAddress?: string;
}

/**
 * Initial props for the app
 */
export interface InitialProps {
  screen: 'send-asset' | 'token-detail' | 'onboarding' | 'receive';
  sendToConfig?: string;
}

export interface EnvironmentVariables {
  NODE_API_URL: string;
  GO_API_URL: string;
  INSTABUG_TOKEN: string;
}

export interface Currency {
  name: string;
  symbol: string;
  rate: string;
}

export interface SaveMnemonicResponse {
  success: boolean;
  error: string;
}

export interface CreateAccountResponse {
  success: boolean;
  address: string | null;
  username: string | null;
  accountType: 'eoa' | 'coa' | null;
  txId: string | null;
  error: string | null;
}

export interface CreateEOAAccountResponse {
  success: boolean;
  address: string | null;
  username: string | null;
  mnemonic: string | null;
  phrase: string[] | null;
  accountType: 'eoa' | 'coa' | null;
  error: string | null;
}

/**
 * Account key information with cryptographic algorithm details
 * Used for Flow blockchain account creation and key management
 */
export interface AccountKey {
  publicKey: string;
  hashAlgoStr: string;
  signAlgoStr: string;
  weight: number;
  hashAlgo: number;
  signAlgo: number;
}

/**
 * Response from seed phrase generation
 * Contains mnemonic, derived account key, and BIP44 derivation path
 */
export interface SeedPhraseGenerationResponse {
  mnemonic: string;
  accountKey: AccountKey;
  drivepath: string;
}

/**
 * Alias for SeedPhraseGenerationResponse used in native code
 * @deprecated Use SeedPhraseGenerationResponse instead
 */
export interface SPResponse {
  mnemonic: string;
  accountKey: AccountKey;
  drivepath: string;
}

/**
 * Initial route configuration for onboarding flow
 * Determines which screen to show when launching the React Native app
 */
export type InitialRoute =
  | 'GetStarted'
  | 'ProfileTypeSelection'
  | 'SelectTokens'
  | 'SendTo'
  | 'SendTokens'
  | 'Home';

/**
 * Available native screen identifiers for Android/iOS
 * These correspond to the NativeScreen enum in Android: NativeScreen.kt
 */
export enum NativeScreenName {
  /** Cloud backup screen (Google Drive, Passkey, Recovery Phrase) */
  MULTI_BACKUP = 'multiBackup',
  /** QR code sync between devices */
  DEVICE_BACKUP = 'deviceBackup',
  /** View/create recovery phrase backup */
  SEED_PHRASE_BACKUP = 'seedPhraseBackup',
  /** Native backup options screen */
  BACKUP_OPTIONS = 'backupOptions',
  /** Native account restore/recovery screen with multiple options */
  WALLET_RESTORE = 'walletRestore',
  /** Restore account from 12-word recovery phrase */
  RECOVERY_PHRASE_RESTORE = 'recoveryPhraseRestore',
  /** Restore account from key store file */
  KEY_STORE_RESTORE = 'keyStoreRestore',
  /** Restore account from private key */
  PRIVATE_KEY_RESTORE = 'privateKeyRestore',
  /** Restore account from Google Drive backup */
  GOOGLE_DRIVE_RESTORE = 'googleDriveRestore',
  /** Multi-restore with cloud backup options */
  MULTI_RESTORE = 'multiRestore',
}

/**
 * React Native screen identifiers for navigation
 * Used with navigation.navigate() throughout the app
 */
export enum ScreenName {
  /** First screen - Get Started with create account and sign in options */
  GET_STARTED = 'GetStarted',
  /** Profile type selection - Choose between recovery phrase or secure enclave */
  PROFILE_TYPE_SELECTION = 'ProfileTypeSelection',
  /** Recovery phrase setup screen */
  RECOVERY_PHRASE = 'RecoveryPhrase',
  /** Secure enclave setup screen */
  SECURE_ENCLAVE = 'SecureEnclave',
  /** Import existing profile/wallet screen */
  IMPORT_PROFILE = 'ImportProfile',
  /** Import via other methods screen (recovery phrase, etc.) */
  IMPORT_OTHER_METHODS = 'ImportOtherMethods',
  /** Confirm import from previous profiles screen */
  CONFIRM_IMPORT_PROFILE = 'ConfirmImportProfile',
  /** Notification preferences screen */
  NOTIFICATION_PREFERENCES = 'NotificationPreferences',
  /** Select tokens to send screen */
  SELECT_TOKENS = 'SelectTokens',
  /** Send to address/recipient screen */
  SEND_TO = 'SendTo',
  /** Send tokens amount screen */
  SEND_TOKENS = 'SendTokens',
  /** Send transaction summary screen */
  SEND_SUMMARY = 'SendSummary',
  /** NFT collection list screen */
  NFT_LIST = 'NFTList',
  /** NFT detail screen */
  NFT_DETAIL = 'NFTDetail',
}

/**
 * Device information for backend registration
 * Provided by native platform implementations
 * Must match forms_DeviceInfo from goService.generated.ts
 */
export interface DeviceInfo {
  device_id?: string;
  name?: string;
  type?: string;
  user_agent?: string;
  ip?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  continent?: string;
  continentCode?: string;
  regionName?: string;
  district?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  isp?: string;
  org?: string;
  currency?: string;
}
