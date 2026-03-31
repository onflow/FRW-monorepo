/**
 * Unified backup/restore types for all platforms.
 * See: docs/superpowers/specs/2026-03-30-unified-backup-workflow-design.md
 */

/** Backup encryption format version */
export enum BackupVersion {
  /** Legacy AES-CBC with fixed IV, password as key (read-only) */
  V1 = '1.0',
  /** Keystore v3: scrypt + aes-128-ctr + mac */
  V2 = '2.0',
}

/** Cloud storage provider type */
export enum CloudProvider {
  GoogleDrive = 'google_drive',
  Dropbox = 'dropbox',
  ICloud = 'icloud',
}

/** Backend backup type enum (matches forms_BackupInfo.type) */
export enum BackupType {
  Google = 0,
  ICloud = 1,
  Manual = 2,
  Passkey = 3,
  FullWeightSeedPhrase = 4,
  Dropbox = 5,
}

/** Key weight presets */
export enum KeyWeight {
  Full = 1000,
  Partial = 500,
}

/** WalletConnect device sync role */
export enum SyncRole {
  Sender = 'sender',
  Receiver = 'receiver',
}

/** Structured error codes for backup operations */
export enum BackupErrorCode {
  IncorrectPassword = 'INCORRECT_PASSWORD',
  AuthFailed = 'AUTH_FAILED',
  NetworkError = 'NETWORK_ERROR',
  RateLimited = 'RATE_LIMITED',
  CorruptData = 'CORRUPT_DATA',
  NotFound = 'NOT_FOUND',
  ProviderNotRegistered = 'PROVIDER_NOT_REGISTERED',
  ApiRegistrationFailed = 'API_REGISTRATION_FAILED',
  PairingTimeout = 'PAIRING_TIMEOUT',
  Unknown = 'UNKNOWN',
}

export class BackupError extends Error {
  constructor(
    public readonly code: BackupErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'BackupError';
  }
}

// ─── Data Structures ──────────────────────────────

export interface BackupEntry {
  username: string;
  uid: string | null;
  /** Encrypted mnemonic — v1: hex string, v2: JSON.stringify(KeystoreV3) */
  data: string;
  version: BackupVersion;
  timestamp: number;
  keyWeight: KeyWeight;
  /** Flow account address (populated by key-addition flow) */
  address?: string;
  /** Public key of the backup key */
  publicKey?: string;
  /** Key index assigned on the Flow blockchain */
  keyIndex?: number;
  /** Signature algorithm (e.g. 2 for ECDSA_secp256k1) */
  signAlgo?: number;
  /** Hash algorithm (e.g. 1 for SHA2_256) */
  hashAlgo?: number;
  /** Device that created this backup */
  deviceInfo?: BackupDeviceInfo;
}

export interface KeystoreV3 {
  version: 3;
  id: string;
  crypto: {
    cipher: 'aes-128-ctr';
    ciphertext: string;
    cipherparams: { iv: string };
    kdf: 'scrypt';
    kdfparams: {
      dklen: number;
      n: number;
      r: number;
      p: number;
      salt: string;
    };
    mac: string;
  };
}

export interface LegacyDriveItem {
  username: string;
  /** May appear as `userName` in very old backups */
  userName?: string;
  data: string;
  version: string;
  uid: string | null;
  time: string | null;
}

/** V2 backup file wrapper with format versioning */
export interface BackupFile {
  formatVersion: 1;
  entries: BackupEntry[];
}

// ─── Operation Types ──────────────────────────────

export interface BackupResult {
  success: boolean;
  provider: CloudProvider;
  backupType: BackupType;
  version: BackupVersion;
  error?: BackupErrorCode;
}

export interface RestoreResult {
  mnemonic: string;
  version: BackupVersion;
  keyWeight: KeyWeight;
  username: string;
  uid: string | null;
}

export interface CreateBackupOptions {
  mnemonic: string;
  password: string;
  username: string;
  uid: string | null;
  keyWeight: KeyWeight;
  provider: CloudProvider;
  /** Optional: account key for backend registration via /v3/signed */
  accountKey?: {
    public_key: string;
    sign_algo: number;
    hash_algo: number;
    weight: number;
  };
  /** Optional: signatures for backend registration */
  signatures?: Array<{
    public_key: string;
    sign_algo: number;
    hash_algo: number;
    signature: string;
    sign_message?: string;
    weight?: number;
  }>;
}

export interface RestoreBackupOptions {
  username: string;
  password: string;
  provider: CloudProvider;
  uid?: string;
}

export interface MigrationResult {
  migrated: string[];
  failed: string[];
  skipped: string[];
}

export interface MigrationOptions {
  provider: CloudStorageProvider;
  password: string;
  usernames?: string[];
}

/** Options for creating a backup with on-chain key addition (Secure Profile) */
export interface KeyAdditionBackupOptions {
  address: string;
  password: string;
  username: string;
  uid: string | null;
  keyWeight: KeyWeight;
  provider: CloudProvider;
  deviceInfo: BackupDeviceInfo;
}

// ─── Device Sync Types ────────────────────────────

export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'extension';
}

/** Device metadata for backend key registration (/v3/sync) */
export interface BackupDeviceInfo {
  deviceId: string;
  name: string;
  platform: 'ios' | 'android' | 'extension';
}

/** Result of generating a new backup key */
export interface GeneratedKey {
  mnemonic: string;
  publicKey: string;
  signAlgo: number;
  hashAlgo: number;
}

/** Protocol for on-chain key operations — implemented by each platform client */
export interface KeyProvider {
  /** Generate a new HD wallet for backup — returns mnemonic + derived public key */
  generateBackupKey(): Promise<GeneratedKey>;

  /**
   * Add a public key to a Flow account on-chain.
   * Returns the assigned key index from the blockchain.
   */
  addKeyToAccount(
    address: string,
    publicKey: string,
    weight: KeyWeight,
    signAlgo: number,
    hashAlgo: number
  ): Promise<number>;
}

export interface DeviceSyncPayload {
  data: string;
  username: string;
  uid: string | null;
  keyWeight: KeyWeight;
  deviceInfo: DeviceInfo;
}

export interface DeviceSyncEvents {
  onPaired: (peerId: string) => void;
  onPayloadReceived: (payload: DeviceSyncPayload) => void;
  onError: (error: BackupError) => void;
  onDisconnected: () => void;
}

export interface DeviceSyncOptions {
  role: SyncRole;
  events: DeviceSyncEvents;
  pairingTimeout?: number;
  /** WalletConnect project ID — must be provided by the platform via config */
  walletConnectProjectId: string;
}

export interface DeviceSyncSession {
  uri: string | null;
  pair(uri: string): Promise<void>;
  sendBackup(payload: DeviceSyncPayload): Promise<void>;
  disconnect(): Promise<void>;
}

// ─── Interfaces ───────────────────────────────────

/** Crypto strategy interface — async because scrypt (V2) is inherently async */
export interface BackupCrypto {
  readonly version: BackupVersion;
  encrypt(mnemonic: string, password: string): Promise<string>;
  decrypt(encryptedData: string, password: string): Promise<string>;
  verifyPassword(encryptedData: string, password: string): Promise<boolean>;
}

/** Cloud storage provider interface */
export interface CloudStorageProvider {
  readonly provider: CloudProvider;
  hasPermission(): Promise<boolean>;
  authorize(interactive?: boolean): Promise<string>;
  loadBackups(): Promise<BackupEntry[]>;
  saveBackups(entries: BackupEntry[]): Promise<void>;
  deleteAll(): Promise<void>;
}

/** Backend API contract for BackupWorkflow */
export interface BackupApi {
  /** POST /v3/signed — register backup key with signatures */
  registerBackup(
    accountKey: {
      public_key: string;
      sign_algo: number;
      hash_algo: number;
      weight: number;
    },
    signatures: Array<{
      public_key: string;
      sign_algo: number;
      hash_algo: number;
      signature: string;
      sign_message?: string;
      weight?: number;
    }>,
    backupInfo: { type: BackupType; name: string }
  ): Promise<void>;

  /** POST /v3/sync — sync device key to backend after on-chain key addition */
  syncDeviceKey(
    accountKey: {
      public_key: string;
      sign_algo: number;
      hash_algo: number;
      weight: number;
    },
    deviceInfo: BackupDeviceInfo,
    backupInfo: { type: BackupType; name: string }
  ): Promise<void>;

  /** GET user keys — used to detect key weight type */
  getUserKeys(): Promise<{ weight: number; publicKey: string; index: number; revoked: boolean }[]>;
}

/** Analytics tracker (optional) */
export interface BackupAnalytics {
  trackBackupCreated(provider: CloudProvider, keyWeight: KeyWeight): void;
  trackRestoreCompleted(provider: CloudProvider, version: BackupVersion): void;
  trackMigrationCompleted(result: MigrationResult): void;
}
