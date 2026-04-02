# Backup: Key Addition Flow & Service Layer

**Date**: 2026-03-31 **Status**: Draft **Builds on**: PR #1402
(`packages/workflow/src/backup/`)

## Problem

PR #1402 unified backup crypto, cloud providers, migration, and device sync into
`packages/workflow/src/backup/`. However it only covers the **Full Profile**
path (encrypt mnemonic → upload to cloud → register with backend).

The **Secure Profile** path is missing from the packages layer:

1. Generate a new backup key (mnemonic + derived public key)
2. Add that key to the Flow account **on-chain** (weight=500)
3. Encrypt the backup mnemonic and upload to cloud
4. Sync the new key metadata to the backend via `/v3/sync`

Additionally:

- The existing `addAndRevokeKeys` cadence transaction hardcodes
  `ECDSA_secp256k1 + SHA2_256 + weight=1000` — unusable for parameterized backup
  key addition.
- The `BackupApi` interface exists in workflow but the `registerBackup`
  signature doesn't match the real `Userv3GoService.signed()` parameters.
- `BackupEntry` lacks on-chain key metadata (address, publicKey, keyIndex) that
  iOS `MultiBackupManager.StoreItem` carries.

## Goals

1. Add a parameterized `add_key` cadence transaction (`.cdc` file → codegen)
2. Extend workflow types with on-chain key metadata and a `KeyProvider` protocol
3. Add `backupWithKeyAddition()` to `BackupWorkflow` for Secure Profile flow
4. Provide `BackupApi` interface — clients implement using `@onflow/frw-api`
   directly

## Non-Goals

- Changing existing Full Profile backup flow (it works as-is)
- Implementing `KeyProvider` in clients (Extension/Mobile) — they consume the
  protocol
- iCloud provider (remains native-only via bridge registration)
- Passkey backup support

---

## Section 1: Cadence — Parameterized `add_key.cdc`

New file: `packages/cadence/src/cadence/Base/add_key.cdc`

```cadence
import Crypto

transaction(
    publicKey: String,
    signatureAlgorithm: UInt8,
    hashAlgorithm: UInt8,
    weight: UFix64
) {
    prepare(signer: auth(Keys) &Account) {
        let signAlgo = SignatureAlgorithm(rawValue: signatureAlgorithm)
            ?? panic("Invalid signature algorithm")
        let hashAlgo = HashAlgorithm(rawValue: hashAlgorithm)
            ?? panic("Invalid hash algorithm")

        let key = PublicKey(
            publicKey: publicKey.decodeHex(),
            signatureAlgorithm: signAlgo
        )

        signer.keys.add(
            publicKey: key,
            hashAlgorithm: hashAlgo,
            weight: weight
        )
    }
}
```

After `pnpm codegen`, this generates
`CadenceService.addKey(publicKey, signatureAlgorithm, hashAlgorithm, weight)` in
`cadence.generated.ts`.

The existing `add_and_revoke_keys.cdc` stays unchanged — key rotation still uses
it.

---

## Section 2: Workflow Types — Extensions

### 2.1 BackupEntry extensions

Add optional on-chain metadata fields to `BackupEntry`:

```typescript
export interface BackupEntry {
  // existing fields (unchanged)
  username: string;
  uid: string | null;
  data: string;
  version: BackupVersion;
  timestamp: number;
  keyWeight: KeyWeight;

  // NEW: on-chain key metadata (populated by key-addition flow)
  address?: string;
  publicKey?: string;
  keyIndex?: number;
  signAlgo?: number;
  hashAlgo?: number;
  deviceInfo?: BackupDeviceInfo;
}
```

### 2.2 BackupDeviceInfo

```typescript
export interface BackupDeviceInfo {
  deviceId: string;
  name: string;
  platform: 'ios' | 'android' | 'extension';
}
```

### 2.3 KeyProvider protocol

Implemented by each client platform. Workflow depends on this interface only.

```typescript
export interface KeyProvider {
  /** Generate a new HD wallet for backup — returns mnemonic + public key */
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

export interface GeneratedKey {
  mnemonic: string;
  publicKey: string;
  signAlgo: number;
  hashAlgo: number;
}
```

**Extension implementation** (outside this spec): uses `SeedPhraseKey.create()`
from `@onflow/frw-wallet` + `cadence.addKey()` from `@onflow/frw-cadence`.

**Mobile implementation** (outside this spec): delegates to native bridge
`createSeedKey()` + native `addKeyToAccount`.

### 2.4 BackupApi extensions

Extend the existing interface to match actual backend endpoints:

```typescript
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

  /**
   * POST /v3/sync — sync device key to backend
   * Used after adding a backup key on-chain (Secure Profile flow)
   */
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

  /** GET user keys — detect key weight type */
  getUserKeys(): Promise<
    { weight: number; publicKey: string; index: number; revoked: boolean }[]
  >;
}
```

### 2.5 KeyAdditionBackupOptions

```typescript
export interface KeyAdditionBackupOptions {
  address: string;
  password: string;
  username: string;
  uid: string | null;
  keyWeight: KeyWeight;
  provider: CloudProvider;
  deviceInfo: BackupDeviceInfo;
}
```

---

## Section 3: BackupWorkflow — Key Addition Flow

Add to `BackupWorkflowConfig`:

```typescript
export interface BackupWorkflowConfig {
  providers: Map<CloudProvider, CloudStorageProvider>;
  api: BackupApi;
  analytics?: BackupAnalytics;
  walletConnectProjectId: string;
  keyProvider?: KeyProvider; // NEW — required for Secure Profile
}
```

New method on `BackupWorkflow`:

```typescript
/**
 * Secure Profile backup: generate key → on-chain add → encrypt → upload → sync
 *
 * Steps:
 * 1. keyProvider.generateBackupKey() — new mnemonic + public key
 * 2. keyProvider.addKeyToAccount() — on-chain transaction, returns keyIndex
 * 3. createBackup() — encrypt mnemonic, upload to cloud (existing method)
 * 4. api.syncDeviceKey() — register key metadata with backend
 */
async backupWithKeyAddition(
  options: KeyAdditionBackupOptions
): Promise<BackupResult>
```

This method:

- Throws `BackupError(ProviderNotRegistered)` if `keyProvider` is not set
- Reuses existing `createBackup()` for step 3 (encrypt + upload)
- Passes on-chain metadata into BackupEntry (address, publicKey, keyIndex,
  signAlgo, hashAlgo, deviceInfo)
- Calls `api.syncDeviceKey()` after upload succeeds
- If sync fails, still returns success=true with error=ApiRegistrationFailed
  (non-blocking, same pattern as existing `createBackup`)

---

## Section 4: BackupApi — Client-Side Implementation (No New Package Dependency)

`BackupApi` is an **interface only** in workflow. No wrapper service needed.
Clients implement it directly using `@onflow/frw-api` (which they already depend
on). This keeps workflow free of api package dependency.

Example client implementation (Extension or Mobile):

```typescript
import { Userv3GoService } from '@onflow/frw-api';
import type { BackupApi } from '@onflow/frw-workflow';

const backupApi: BackupApi = {
  registerBackup: (accountKey, signatures, backupInfo) =>
    Userv3GoService.signed({ accountKey, signatures, backupInfo }),

  syncDeviceKey: (accountKey, deviceInfo, backupInfo) =>
    Userv3GoService.sync({
      accountKey,
      deviceInfo: {
        device_id: deviceInfo.deviceId,
        name: deviceInfo.name,
        type: deviceInfo.platform === 'extension' ? '2' : '1',
      },
      backupInfo,
    }),

  getUserKeys: async () => {
    // Call existing user keys endpoint, map to expected shape
  },
};
```

This is injected into `BackupWorkflow` via config:

```typescript
const workflow = new BackupWorkflow({
  providers,
  api: backupApi,
  keyProvider,
  walletConnectProjectId: '...',
});
```

---

## Section 5: File Changes Summary

```
NEW  packages/cadence/src/cadence/Base/add_key.cdc
GEN  packages/cadence/src/cadence.generated.ts          (auto via pnpm codegen)

MOD  packages/workflow/src/backup/types.ts               (BackupEntry fields,
                                                          KeyProvider, GeneratedKey,
                                                          BackupDeviceInfo,
                                                          KeyAdditionBackupOptions,
                                                          BackupApi signature fix)
MOD  packages/workflow/src/backup/backup-workflow.ts      (keyProvider in config,
                                                          backupWithKeyAddition)
MOD  packages/workflow/src/backup/index.ts                (new exports)
```

No changes to `packages/services` or `packages/api` — clients implement
`BackupApi` inline using the existing `@onflow/frw-api` package.

---

## Section 6: Dependency Graph

```
┌──────────────────────────────────────────────────────┐
│              Client (Extension / Mobile)              │
│                                                      │
│  Implements:                                         │
│  - KeyProvider (SeedPhraseKey + cadence / native)     │
│  - BackupApi   (thin adapter over @onflow/frw-api)    │
│                                                      │
│  Uses:                                               │
│  - BackupWorkflow.createBackup()          (Full)      │
│  - BackupWorkflow.backupWithKeyAddition() (Secure)    │
└──────────┬───────────────────────────────────────────┘
           │ injects KeyProvider + BackupApi
  ┌────────▼─────────┐
  │  BackupWorkflow   │  (packages/workflow)
  │  - orchestration  │
  │  - protocols only │
  └──┬──────┬────────┘
     │      │
┌────▼──┐ ┌─▼────────────┐
│crypto/│ │ providers/    │
│V1, V2 │ │ GDrive, Dbox  │
└───────┘ └───────────────┘

┌──────────────────────────┐
│  @onflow/frw-cadence     │
│  - add_key.cdc (NEW)     │
│  - add_and_revoke_keys   │
└──────────────────────────┘

┌──────────────────────────┐
│  @onflow/frw-api         │
│  - Userv3GoService.sync  │  ← client uses directly
│  - Userv3GoService.signed│
└──────────────────────────┘
```

KeyProvider implementations (outside this spec):

- Extension: `SeedPhraseKey` + `cadence.addKey()`
- Mobile: `NativeFRWBridge.createSeedKey()` + native add key

---

## Section 7: Testing

### Cadence

- `add_key.cdc`: Verify codegen produces correct TS signature

### Workflow

- `backupWithKeyAddition`: Mock `KeyProvider` + `BackupApi` +
  `CloudStorageProvider`
  - Happy path: generate → on-chain → encrypt → upload → sync
  - KeyProvider missing: throws ProviderNotRegistered
  - On-chain fails: error propagates
  - Sync fails: returns success=true with error=ApiRegistrationFailed
  - Verify BackupEntry contains on-chain metadata

### No services tests needed

BackupApi is a protocol; testing happens at the client integration level.
