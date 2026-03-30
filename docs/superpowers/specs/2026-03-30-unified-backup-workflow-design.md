# Unified Backup Workflow Design

**Date**: 2026-03-30 **Status**: Approved **Package**:
`packages/workflow/src/backup/`

## Problem

Backup and restore logic is currently duplicated across three platforms:

- **Extension**: `GoogleDriveService` (AES-CBC), `AccountManagement`,
  `KeyringService` — all in `apps/extension/src/core/service/`
- **iOS**: Native Swift with iCloud/Google Drive SDKs
- **Android**: Native Kotlin with Google Drive SDK

Each platform has its own encryption, cloud storage, and key management
implementations. The legacy encryption scheme uses AES-CBC with a **fixed IV**,
which is a security concern.

## Goals

1. Unify all backup/restore business logic into `packages/workflow/src/backup/`
2. Upgrade encryption from legacy AES-CBC (fixed IV) to Ethereum keystore v3
   (scrypt + aes-128-ctr + mac)
3. Maintain backward compatibility — old v1 backups must remain readable
4. Support both legacy (1000 weight key) and multiple-backup (500 weight key)
   flows
5. Provide a migration path from v1 to v2 encryption format
6. All three platforms share a single `BackupWorkflow` entry point

## Architecture: Layered Service Architecture

```
packages/workflow/src/backup/
├── index.ts                        # Public API re-exports
├── types.ts                        # All types, enums, interfaces
├── crypto/
│   ├── index.ts                    # re-exports + factory + detectCryptoVersion
│   ├── legacy-crypto.ts            # V1: AES-CBC fixed IV (decrypt-only)
│   ├── legacy-crypto.test.ts
│   ├── keystore-crypto.ts          # V2: scrypt + aes-128-ctr + mac
│   └── keystore-crypto.test.ts
├── providers/
│   ├── index.ts                    # re-exports
│   ├── cloud-storage.ts            # CloudStorageProvider interface
│   ├── google-drive.ts             # Google Drive REST API implementation
│   ├── google-drive.test.ts
│   ├── dropbox.ts                  # Dropbox HTTP API implementation
│   └── dropbox.test.ts
├── device/
│   ├── index.ts
│   ├── wallet-connect-sync.ts      # WalletConnect device sync
│   └── wallet-connect-sync.test.ts
├── migration/
│   ├── index.ts
│   ├── v1-to-v2.ts                 # V1 → V2 migration logic
│   └── v1-to-v2.test.ts
├── backup-workflow.ts              # Orchestrator
└── backup-workflow.test.ts
```

## Section 1: Types & Data Structures

```typescript
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
  /** Legacy single-key full authority */
  Full = 1000,
  /** Multiple-backup partial weight */
  Partial = 500,
}

/** A single backup entry stored in cloud */
export interface BackupEntry {
  username: string;
  uid: string | null;
  /** Encrypted mnemonic — v1: hex string, v2: keystore v3 JSON */
  data: string;
  version: BackupVersion;
  timestamp: number;
  keyWeight: KeyWeight;
}

/** Keystore v3 JSON structure (the `data` field in BackupEntry v2) */
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

/** Legacy v1 DriveItem (for backward compat parsing) */
export interface LegacyDriveItem {
  username: string;
  data: string;
  version: string;
  uid: string | null;
  time: string | null;
}

/** Result of a backup operation */
export interface BackupResult {
  success: boolean;
  provider: CloudProvider;
  backupType: BackupType;
  version: BackupVersion;
  error?: string;
}

/** Result of a restore operation */
export interface RestoreResult {
  mnemonic: string;
  version: BackupVersion;
  keyWeight: KeyWeight;
  username: string;
  uid: string | null;
}

/** Options for creating a backup */
export interface CreateBackupOptions {
  mnemonic: string;
  password: string;
  username: string;
  uid: string;
  keyWeight: KeyWeight;
  provider: CloudProvider;
}

/** Options for restoring a backup */
export interface RestoreBackupOptions {
  username: string;
  password: string;
  provider: CloudProvider;
  uid?: string;
}
```

### Key decisions

- `BackupEntry` is the unified storage format; v1 and v2 distinguished by
  `version` field
- `data` field is hex string for v1, `JSON.stringify(KeystoreV3)` for v2
- `keyWeight` recorded per entry so restore knows which key weight to use
- `LegacyDriveItem` only used for parsing old format; internally converted to
  `BackupEntry`

## Section 2: Crypto Layer

### BackupCrypto interface

```typescript
export interface BackupCrypto {
  readonly version: BackupVersion;
  encrypt(mnemonic: string, password: string): string;
  decrypt(encryptedData: string, password: string): string;
  verifyPassword(encryptedData: string, password: string): boolean;
}

export function createBackupCrypto(version: BackupVersion): BackupCrypto;
export function detectCryptoVersion(data: string): BackupVersion;
```

### LegacyCrypto (V1) — decrypt-only

- AES-CBC with fixed IV, password padded to 16 bytes
- `encrypt()` throws — v1 is read-only, forces new backups to use v2
- `verifyPassword()` decrypts then validates via `bip39.validateMnemonic()`
- Ported from `apps/extension/src/core/service/googleDrive.ts`

### KeystoreCrypto (V2) — Ethereum keystore v3

- **KDF**: scrypt (N=8192, r=8, p=1, dklen=32) with random 32-byte salt
- **Cipher**: aes-128-ctr with random 16-byte IV
- **MAC**: keccak256(derivedKey[16:32] + ciphertext)
- `verifyPassword()` only checks MAC — no full decryption needed
- Output is standard keystore v3 JSON, compatible with Ethereum ecosystem

### Version detection

`detectCryptoVersion()` tries JSON parse; if it has `version: 3` and `crypto`
field, it's v2. Otherwise v1 hex format.

## Section 3: Cloud Storage Providers

### CloudStorageProvider interface

```typescript
export interface CloudStorageProvider {
  readonly provider: CloudProvider;
  hasPermission(): Promise<boolean>;
  authorize(interactive?: boolean): Promise<string>;
  loadBackups(): Promise<BackupEntry[]>;
  saveBackups(entries: BackupEntry[]): Promise<void>;
  deleteAll(): Promise<void>;
}
```

### GoogleDriveProvider

- Shared TypeScript implementation using Google Drive REST API
- `loadBackups()`: tries v2 file first, falls back to v1 file
  - V1 file: decrypt outer AES layer (master key) → parse `LegacyDriveItem[]` →
    convert to `BackupEntry[]`
  - V2 file: parse `BackupEntry[]` directly (no outer encryption needed)
- `saveBackups()`: always writes to v2 file only
- V2 file has no outer encryption layer — each entry's `data` is already
  keystore-encrypted
- V1 and V2 use different file names in app data folder to avoid overwriting old
  backups
- `getAuthToken` injected by platform (Chrome: `chrome.identity`, RN: Google
  Sign-In SDK)

### DropboxProvider

- Same pattern as GoogleDriveProvider, using Dropbox HTTP API
- Separate v1/v2 file paths

### iCloud (iOS only)

- iOS registers its own `CloudStorageProvider` implementation via
  `backupWorkflow.registerProvider()`
- Backed by native Swift iCloud calls through the bridge
- Not included in shared TypeScript — no REST API for iCloud from JS

## Section 4: Migration — V1 to V2

```typescript
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

export async function migrateV1ToV2(
  options: MigrationOptions
): Promise<MigrationResult>;
```

### Key behaviors

- **Non-destructive**: entries that can't be decrypted (wrong password) are kept
  as-is
- **Incremental**: can be called multiple times; already-v2 entries are skipped
- **Multi-password support**: different profiles may use different passwords;
  only migrates entries the given password can unlock
- **Implicit migration**: `changePassword()` always outputs v2 format, so
  password changes automatically migrate v1 entries
- **Mixed entries OK**: v2 file can contain both v1 and v2 entries;
  `detectCryptoVersion()` handles per-entry

## Section 5: Device Backup (WalletConnect Sync)

```typescript
export enum SyncRole {
  Sender = 'sender',
  Receiver = 'receiver',
}

export interface DeviceSyncPayload {
  data: string; // Always v2 keystore format
  username: string;
  uid: string | null;
  keyWeight: KeyWeight;
  deviceInfo: DeviceInfo;
}

export interface DeviceSyncSession {
  uri: string | null;
  pair(uri: string): Promise<void>;
  sendBackup(payload: DeviceSyncPayload): Promise<void>;
  disconnect(): Promise<void>;
}

export async function createDeviceSyncSession(
  options: DeviceSyncOptions
): Promise<DeviceSyncSession>;
```

### Key behaviors

- Device sync data always uses v2 keystore format (v1 upgraded before sending)
- WalletConnect handles transport only; encryption/decryption by crypto layer
- Event-driven (onPaired, onPayloadReceived, onError, onDisconnected)
- Short-lived sessions — pair, transfer, disconnect
- All three platforms can be sender or receiver

## Section 6: Backup Workflow Orchestrator

`BackupWorkflow` is the single entry point for all three platforms.

### Core operations

| Method                                         | Description                                           |
| ---------------------------------------------- | ----------------------------------------------------- |
| `createBackup(options)`                        | Encrypt + upload to cloud + register with backend API |
| `restoreBackup(options)`                       | Download from cloud + decrypt (auto-detects v1/v2)    |
| `listBackups(provider)`                        | List all backed-up profiles (without decrypting)      |
| `deleteBackup(provider, username)`             | Remove a profile's backup                             |
| `hasBackup(provider, username)`                | Check if a backup exists                              |
| `verifyPassword(provider, username, password)` | Test password without decrypting                      |
| `changePassword(options)`                      | Atomic re-encryption, implicitly migrates v1 → v2     |
| `detectKeyWeightType(address)`                 | Query on-chain keys to determine 1000 vs 500 weight   |
| `migrateToV2(options)`                         | Explicit v1 → v2 migration                            |
| `startDeviceSync(options)`                     | Create WalletConnect device sync session              |
| `getAllBackupStatuses()`                       | Unified status across all registered providers        |
| `registerProvider(provider)`                   | Runtime provider registration (e.g. iOS iCloud)       |

### Platform integration

```typescript
// Extension
const backupWorkflow = new BackupWorkflow({
  providers: new Map([
    [
      CloudProvider.GoogleDrive,
      new GoogleDriveProvider({
        getAuthToken: (interactive) =>
          chrome.identity.getAuthToken({ interactive }),
        legacyBackupName: 'lilico_backup',
        backupName: 'frw_backup_v2',
        legacyAesKey: process.env.BACKUP_AES_KEY,
        legacyIV: process.env.BACKUP_IV,
      }),
    ],
    [
      CloudProvider.Dropbox,
      new DropboxProvider({
        /* ... */
      }),
    ],
  ]),
  api: openapiService,
});

// React Native (iOS)
const backupWorkflow = new BackupWorkflow({
  providers: new Map([
    [
      CloudProvider.GoogleDrive,
      new GoogleDriveProvider({
        /* ... */
      }),
    ],
  ]),
  api: profileService(),
});
if (Platform.OS === 'ios') {
  backupWorkflow.registerProvider(createICloudBridgeProvider(bridge));
}
```

### Extension migration path

1. **Phase 1**: New `BackupWorkflow` coexists with old `googleDrive.ts`; new
   features use workflow
2. **Phase 2**: Migrate UI calls from old services to `BackupWorkflow`
3. **Phase 3**: Delete `apps/extension/src/core/service/googleDrive.ts` and
   backup methods from `account-management.ts`

## Dependencies

```json
{
  "aes-js": "^3.1.2",
  "ethereumjs-util": "^7.x",
  "scrypt-js": "^3.0.1",
  "uuid": "^9.x",
  "bip39": "^3.x",
  "@walletconnect/sign-client": "^2.x"
}
```

## Testing Requirements

Every module has a corresponding `.test.ts` file:

- **Crypto tests**: encrypt/decrypt round-trip, v1 backward compat with known
  test vectors from existing extension backups, v2 keystore standard compliance,
  `verifyPassword` with correct/incorrect passwords, `detectCryptoVersion` for
  both formats
- **Provider tests**: mock HTTP responses, v1/v2 file loading, save/delete
  operations, auth token injection
- **Migration tests**: full v1→v2 migration, partial migration (multi-password),
  incremental migration, non-destructive behavior on failure
- **Device sync tests**: WalletConnect session lifecycle, payload serialization,
  sender/receiver flows
- **Workflow tests**: end-to-end orchestration with mocked providers and API,
  password change with implicit migration, key weight detection
