# Backup Key Addition Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the unified backup module (PR #1402) with Secure Profile
support — on-chain key addition, extended metadata, and backend sync.

**Architecture:** Three layers touched: (1) new `add_key.cdc` Cadence
transaction with parameterized signAlgo/hashAlgo/weight, auto-generated to TS
via codegen; (2) workflow types extended with `KeyProvider` protocol,
`BackupDeviceInfo`, on-chain metadata on `BackupEntry`, and corrected
`BackupApi` signature; (3) `BackupWorkflow.backupWithKeyAddition()` orchestrates
the 4-step Secure Profile flow. No new package dependencies.

**Tech Stack:** Cadence, TypeScript, Vitest, `@outblock/cadence-codegen`

**Spec:**
`docs/superpowers/specs/2026-03-31-backup-key-addition-and-service-layer-design.md`

**Prerequisite:** PR #1402 must be merged first. This plan modifies files
introduced in that PR.

---

## Chunk 1: Cadence — Parameterized `add_key` Transaction

### Task 1: Create `add_key.cdc`

**Files:**

- Create: `packages/cadence/src/cadence/Base/add_key.cdc`

- [ ] **Step 1: Write the Cadence transaction file**

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

- [ ] **Step 2: Run codegen to generate TypeScript**

Run: `cd packages/cadence && pnpm codegen`

Expected: `src/cadence.generated.ts` is updated with a new `addKey` method on
`CadenceService` with signature:
`addKey(publicKey: string, signatureAlgorithm: number, hashAlgorithm: number, weight: string)`

(Note: `UFix64` maps to `string` in FCL args via `t.UFix64`)

- [ ] **Step 3: Verify codegen output**

Run: `grep -A 10 'addKey' packages/cadence/src/cadence.generated.ts`

Expected: The generated method should contain `arg(publicKey, t.String)`,
`arg(signatureAlgorithm, t.UInt8)`, `arg(hashAlgorithm, t.UInt8)`,
`arg(weight, t.UFix64)` and call `fcl.mutate`.

- [ ] **Step 4: Build the cadence package**

Run: `cd packages/cadence && pnpm build`

Expected: Clean build, no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/cadence/src/cadence/Base/add_key.cdc packages/cadence/src/cadence.generated.ts
git commit -m "feat(cadence): add parameterized add_key transaction

Adds add_key.cdc with configurable signatureAlgorithm, hashAlgorithm, and weight
parameters. Unlike the existing add_and_revoke_keys.cdc which hardcodes
ECDSA_secp256k1 + SHA2_256 + weight=1000, this transaction supports any
algorithm and weight combination for backup key addition."
```

---

## Chunk 2: Workflow Types — Extend Interfaces

### Task 2: Add new types to `types.ts`

**Files:**

- Modify: `packages/workflow/src/backup/types.ts`

- [ ] **Step 1: Add `BackupDeviceInfo` interface**

Add after the `DeviceInfo` interface (which is used for WalletConnect sync —
this is a different concept for backend registration):

```typescript
/** Device metadata for backend key registration (/v3/sync) */
export interface BackupDeviceInfo {
  deviceId: string;
  name: string;
  platform: 'ios' | 'android' | 'extension';
}
```

- [ ] **Step 2: Add `GeneratedKey` interface**

Add after `BackupDeviceInfo`:

```typescript
/** Result of generating a new backup key */
export interface GeneratedKey {
  mnemonic: string;
  publicKey: string;
  signAlgo: number;
  hashAlgo: number;
}
```

- [ ] **Step 3: Add `KeyProvider` protocol**

Add after `GeneratedKey`:

```typescript
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
```

- [ ] **Step 4: Extend `BackupEntry` with on-chain metadata**

Add optional fields to the existing `BackupEntry` interface, after `keyWeight`:

```typescript
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
```

- [ ] **Step 5: Add `KeyAdditionBackupOptions` interface**

Add after `MigrationOptions`:

```typescript
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
```

- [ ] **Step 6: Update `BackupApi` interface**

Replace the existing `BackupApi` interface with the corrected signatures:

```typescript
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
  getUserKeys(): Promise<
    { weight: number; publicKey: string; index: number; revoked: boolean }[]
  >;
}
```

- [ ] **Step 7: Verify types compile**

Run: `cd packages/workflow && pnpm build`

Expected: Clean build, no type errors.

- [ ] **Step 8: Commit**

```bash
git add packages/workflow/src/backup/types.ts
git commit -m "feat(workflow): extend backup types with KeyProvider protocol and on-chain metadata

- Add BackupDeviceInfo, GeneratedKey, KeyProvider, KeyAdditionBackupOptions
- Extend BackupEntry with optional on-chain fields (address, publicKey, keyIndex, etc.)
- Update BackupApi to match Userv3GoService.signed() and .sync() signatures"
```

---

### Task 3: Update exports in `index.ts`

**Files:**

- Modify: `packages/workflow/src/backup/index.ts`

- [ ] **Step 1: Add new type exports**

Add to the `export type { ... } from './types'` block:

```typescript
  BackupDeviceInfo,
  GeneratedKey,
  KeyProvider,
  KeyAdditionBackupOptions,
```

- [ ] **Step 2: Verify build**

Run: `cd packages/workflow && pnpm build`

Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add packages/workflow/src/backup/index.ts
git commit -m "feat(workflow): export new backup types from index"
```

---

## Chunk 3: BackupWorkflow — Key Addition Orchestration

### Task 4: Write failing tests for `backupWithKeyAddition`

**Files:**

- Modify: `packages/workflow/tests/backup/backup-workflow.test.ts`

- [ ] **Step 1: Write test for happy path**

Add to the existing test file:

```typescript
import type {
  KeyProvider,
  GeneratedKey,
  KeyAdditionBackupOptions,
  BackupDeviceInfo,
} from '../../src/backup/types';

// Update existing createMockApi to match new BackupApi interface:
// - registerBackup: now takes (accountKey, signatures, backupInfo) — update mock signature
// - syncDeviceKey: vi.fn().mockResolvedValue(undefined)  — add this new mock
// - getUserKeys: unchanged

function createMockKeyProvider(overrides?: Partial<KeyProvider>): KeyProvider {
  return {
    generateBackupKey: vi.fn().mockResolvedValue({
      mnemonic:
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      publicKey: 'abc123pubkey',
      signAlgo: 2,
      hashAlgo: 1,
    } satisfies GeneratedKey),
    addKeyToAccount: vi.fn().mockResolvedValue(3),
    ...overrides,
  };
}

const mockDeviceInfo: BackupDeviceInfo = {
  deviceId: 'device-123',
  name: 'Test Device',
  platform: 'extension',
};

describe('backupWithKeyAddition', () => {
  it('should generate key, add on-chain, encrypt, upload, and sync', async () => {
    const mockKeyProvider = createMockKeyProvider();
    const mockApi = createMockApi();
    const mockProvider = createMockCloudProvider();

    const workflow = new BackupWorkflow({
      providers: new Map([[CloudProvider.GoogleDrive, mockProvider]]),
      api: mockApi,
      walletConnectProjectId: 'test',
      keyProvider: mockKeyProvider,
    });

    const options: KeyAdditionBackupOptions = {
      address: '0x1234',
      password: 'testpass',
      username: 'testuser',
      uid: 'uid-123',
      keyWeight: KeyWeight.Partial,
      provider: CloudProvider.GoogleDrive,
      deviceInfo: mockDeviceInfo,
    };

    const result = await workflow.backupWithKeyAddition(options);

    expect(result.success).toBe(true);
    expect(result.version).toBe(BackupVersion.V2);
    expect(result.provider).toBe(CloudProvider.GoogleDrive);
    expect(mockKeyProvider.generateBackupKey).toHaveBeenCalledOnce();
    expect(mockKeyProvider.addKeyToAccount).toHaveBeenCalledWith(
      '0x1234',
      'abc123pubkey',
      KeyWeight.Partial,
      2,
      1
    );
    expect(mockProvider.saveBackups).toHaveBeenCalledOnce();
    expect(mockApi.syncDeviceKey).toHaveBeenCalledWith(
      {
        public_key: 'abc123pubkey',
        sign_algo: 2,
        hash_algo: 1,
        weight: KeyWeight.Partial,
      },
      mockDeviceInfo,
      expect.objectContaining({ type: BackupType.Google })
    );

    // Verify BackupEntry has on-chain metadata
    const savedEntries = (mockProvider.saveBackups as any).mock.calls[0][0];
    expect(savedEntries[0].address).toBe('0x1234');
    expect(savedEntries[0].publicKey).toBe('abc123pubkey');
    expect(savedEntries[0].keyIndex).toBe(3);
    expect(savedEntries[0].signAlgo).toBe(2);
    expect(savedEntries[0].hashAlgo).toBe(1);
    expect(savedEntries[0].deviceInfo).toEqual(mockDeviceInfo);
  });

  it('should throw when keyProvider is not set', async () => {
    const workflow = new BackupWorkflow({
      providers: new Map([
        [CloudProvider.GoogleDrive, createMockCloudProvider()],
      ]),
      api: createMockApi(),
      walletConnectProjectId: 'test',
      // no keyProvider
    });

    const options: KeyAdditionBackupOptions = {
      address: '0x1234',
      password: 'testpass',
      username: 'testuser',
      uid: null,
      keyWeight: KeyWeight.Partial,
      provider: CloudProvider.GoogleDrive,
      deviceInfo: mockDeviceInfo,
    };

    await expect(workflow.backupWithKeyAddition(options)).rejects.toThrow(
      BackupError
    );
  });

  it('should propagate on-chain key addition failure', async () => {
    const mockKeyProvider = createMockKeyProvider({
      addKeyToAccount: vi
        .fn()
        .mockRejectedValue(new Error('Transaction failed')),
    });

    const workflow = new BackupWorkflow({
      providers: new Map([
        [CloudProvider.GoogleDrive, createMockCloudProvider()],
      ]),
      api: createMockApi(),
      walletConnectProjectId: 'test',
      keyProvider: mockKeyProvider,
    });

    const options: KeyAdditionBackupOptions = {
      address: '0x1234',
      password: 'testpass',
      username: 'testuser',
      uid: null,
      keyWeight: KeyWeight.Partial,
      provider: CloudProvider.GoogleDrive,
      deviceInfo: mockDeviceInfo,
    };

    await expect(workflow.backupWithKeyAddition(options)).rejects.toThrow(
      'Transaction failed'
    );
  });

  it('should return success with error code when sync fails', async () => {
    const mockApi = createMockApi();
    (mockApi.syncDeviceKey as any).mockRejectedValue(new Error('Sync failed'));

    const workflow = new BackupWorkflow({
      providers: new Map([
        [CloudProvider.GoogleDrive, createMockCloudProvider()],
      ]),
      api: mockApi,
      walletConnectProjectId: 'test',
      keyProvider: createMockKeyProvider(),
    });

    const options: KeyAdditionBackupOptions = {
      address: '0x1234',
      password: 'testpass',
      username: 'testuser',
      uid: null,
      keyWeight: KeyWeight.Partial,
      provider: CloudProvider.GoogleDrive,
      deviceInfo: mockDeviceInfo,
    };

    const result = await workflow.backupWithKeyAddition(options);
    expect(result.success).toBe(true);
    expect(result.error).toBe(BackupErrorCode.ApiRegistrationFailed);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/workflow && pnpm test:run -- --grep "backupWithKeyAddition"`

Expected: All 4 tests FAIL — `backupWithKeyAddition` method does not exist yet.

- [ ] **Step 3: Commit failing tests**

```bash
git add packages/workflow/tests/backup/backup-workflow.test.ts
git commit -m "test(workflow): add failing tests for backupWithKeyAddition"
```

---

### Task 5: Implement `backupWithKeyAddition`

**Files:**

- Modify: `packages/workflow/src/backup/backup-workflow.ts`

- [ ] **Step 1: Add imports for new types**

Add to existing imports from `./types`:

```typescript
  type KeyProvider,
  type KeyAdditionBackupOptions,
  type BackupDeviceInfo,
```

- [ ] **Step 2: Add `keyProvider` to config and constructor**

Update `BackupWorkflowConfig`:

```typescript
export interface BackupWorkflowConfig {
  providers: Map<CloudProvider, CloudStorageProvider>;
  api: BackupApi;
  analytics?: BackupAnalytics;
  walletConnectProjectId: string;
  keyProvider?: KeyProvider;
}
```

Add to the class private fields:

```typescript
  private keyProvider?: KeyProvider;
```

Add to constructor body:

```typescript
this.keyProvider = config.keyProvider;
```

- [ ] **Step 3: Implement `backupWithKeyAddition` method**

Add after the existing `createBackup` method:

```typescript
  async backupWithKeyAddition(options: KeyAdditionBackupOptions): Promise<BackupResult> {
    if (!this.keyProvider) {
      throw new BackupError(
        BackupErrorCode.ProviderNotRegistered,
        'KeyProvider is required for key-addition backup'
      );
    }

    const provider = this.getProvider(options.provider);

    // Step 1: Generate new backup key
    const generated = await this.keyProvider.generateBackupKey();

    // Step 2: Add key to Flow account on-chain
    const keyIndex = await this.keyProvider.addKeyToAccount(
      options.address,
      generated.publicKey,
      options.keyWeight,
      generated.signAlgo,
      generated.hashAlgo
    );

    // Step 3: Encrypt mnemonic and upload to cloud
    const crypto = createBackupCrypto(BackupVersion.V2);
    const encryptedData = await crypto.encrypt(generated.mnemonic, options.password);
    const entry: BackupEntry = {
      username: options.username,
      uid: options.uid,
      data: encryptedData,
      version: BackupVersion.V2,
      timestamp: Date.now(),
      keyWeight: options.keyWeight,
      address: options.address,
      publicKey: generated.publicKey,
      keyIndex,
      signAlgo: generated.signAlgo,
      hashAlgo: generated.hashAlgo,
      deviceInfo: options.deviceInfo,
    };

    const entries = await provider.loadBackups();
    const filtered = entries.filter((e) => e.username !== options.username);
    filtered.unshift(entry);
    await provider.saveBackups(filtered);

    // Step 4: Sync key metadata to backend
    const backupType = this.providerToBackupType(options.provider);
    let errorCode: BackupErrorCode | undefined;

    try {
      await this.api.syncDeviceKey(
        {
          public_key: generated.publicKey,
          sign_algo: generated.signAlgo,
          hash_algo: generated.hashAlgo,
          weight: options.keyWeight,
        },
        options.deviceInfo,
        { type: backupType, name: options.username }
      );
    } catch {
      errorCode = BackupErrorCode.ApiRegistrationFailed;
    }

    this.analytics?.trackBackupCreated(options.provider, options.keyWeight);

    return {
      success: !errorCode,
      provider: options.provider,
      backupType,
      version: BackupVersion.V2,
      error: errorCode,
    };
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/workflow && pnpm test:run -- --grep "backupWithKeyAddition"`

Expected: All 4 tests PASS.

- [ ] **Step 5: Run all existing backup tests to check for regressions**

Run: `cd packages/workflow && pnpm test:run`

Expected: All tests pass (existing + new).

- [ ] **Step 6: Build the workflow package**

Run: `cd packages/workflow && pnpm build`

Expected: Clean build, no type errors.

- [ ] **Step 7: Commit**

```bash
git add packages/workflow/src/backup/backup-workflow.ts
git commit -m "feat(workflow): implement backupWithKeyAddition for Secure Profile backup

Orchestrates the 4-step Secure Profile backup flow:
1. Generate backup key via KeyProvider
2. Add key to Flow account on-chain
3. Encrypt mnemonic and upload to cloud provider
4. Sync key metadata to backend via syncDeviceKey

KeyProvider is injected by clients — workflow stays dependency-free."
```

---

## Chunk 4: Update existing `BackupApi` usage in `createBackup`

### Task 6: Update `createBackup` to use new `BackupApi.registerBackup` signature

The existing `createBackup` calls `this.api.registerBackup({ type, name })` but
the updated `BackupApi` interface now requires
`(accountKey, signatures, backupInfo)`. For Full Profile backup,
`registerBackup` may not always be needed (registration happens at
`/v4/register` time). We need to handle this gracefully.

**Files:**

- Modify: `packages/workflow/src/backup/backup-workflow.ts`

- [ ] **Step 1: Update `createBackup` to accept optional `CreateBackupOptions`
      extensions**

First, update the `CreateBackupOptions` type in `types.ts` to optionally accept
`accountKey` and `signatures` for cases where the caller wants to register:

Add to `CreateBackupOptions` in `types.ts`:

```typescript
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
```

- [ ] **Step 2: Update `createBackup` method**

Replace the `registerBackup` call block in `createBackup`:

```typescript
let errorCode: BackupErrorCode | undefined;

if (options.accountKey && options.signatures) {
  try {
    await this.api.registerBackup(options.accountKey, options.signatures, {
      type: backupType,
      name: options.username,
    });
  } catch {
    errorCode = BackupErrorCode.ApiRegistrationFailed;
  }
}
```

- [ ] **Step 3: Run all tests**

Run: `cd packages/workflow && pnpm test:run`

Expected: All tests pass. Existing `createBackup` tests still pass because they
don't provide `accountKey`/`signatures`, so `registerBackup` is simply skipped.

- [ ] **Step 4: Build**

Run: `cd packages/workflow && pnpm build`

Expected: Clean build.

- [ ] **Step 5: Commit**

```bash
git add packages/workflow/src/backup/types.ts packages/workflow/src/backup/backup-workflow.ts
git commit -m "fix(workflow): align createBackup with updated BackupApi.registerBackup signature

registerBackup now requires accountKey + signatures parameters. The call is
gated behind optional fields on CreateBackupOptions so existing callers
(which don't provide them) are unaffected."
```

---

## Chunk 5: Final Verification

### Task 7: Full build and test verification

**Files:** None (verification only)

- [ ] **Step 1: Run full workflow test suite**

Run: `cd packages/workflow && pnpm test:run`

Expected: All tests pass (existing 54 from PR #1402 + 4 new).

- [ ] **Step 2: Build all packages**

Run: `pnpm build:packages`

Expected: Clean build across all packages.

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`

Expected: No type errors.

- [ ] **Step 4: Run lint**

Run: `pnpm lint`

Expected: No lint errors in changed files.
