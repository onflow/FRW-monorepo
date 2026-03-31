# Unified Backup Workflow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development
> (if subagents available) or superpowers:executing-plans to implement this
> plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify backup/restore logic across iOS, Android, and Extension into
`packages/workflow/src/backup/` with keystore v3 encryption upgrade and v1
backward compatibility.

**Architecture:** Layered service architecture — types at bottom, crypto layer
(v1 legacy + v2 keystore), cloud storage providers (interface + Google Drive +
Dropbox), migration (v1→v2), device sync (WalletConnect), and a `BackupWorkflow`
orchestrator tying everything together. Each layer depends only on layers below
it.

**Tech Stack:** TypeScript, Vitest, aes-js (v1 legacy), scrypt-js +
ethereumjs-util (v2 keystore), uuid, bip39, @walletconnect/sign-client

**Spec:** `docs/superpowers/specs/2026-03-30-unified-backup-workflow-design.md`

---

## Chunk 1: Foundation — Types, Crypto, and Tests

### Task 1: Add dependencies to workflow package

**Files:**

- Modify: `packages/workflow/package.json`

- [ ] **Step 1: Add required dependencies**

Add to `dependencies` in `packages/workflow/package.json`:

```json
"aes-js": "^3.1.2",
"scrypt-js": "^3.0.1",
"uuid": "^9.0.0",
"bip39": "^3.1.0"
```

Note: `@ethersproject/keccak256` is already a dependency.
`@walletconnect/sign-client` will be added in Chunk 3 (device sync).

- [ ] **Step 2: Install dependencies**

Run: `pnpm install` Expected: Clean install, no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/workflow/package.json pnpm-lock.yaml
git commit -m "build(workflow): add backup crypto dependencies"
```

---

### Task 2: Create types module

**Files:**

- Create: `packages/workflow/src/backup/types.ts`

- [ ] **Step 1: Create the types file**

Create `packages/workflow/src/backup/types.ts` with all types from the spec:

```typescript
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

// ─── Device Sync Types ────────────────────────────

export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'extension';
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
  registerBackup(backupInfo: { type: BackupType; name: string }): Promise<void>;
  syncDeviceKey(
    accountKey: {
      public_key: string;
      sign_algo: number;
      hash_algo: number;
      weight: number;
    },
    signatures: unknown
  ): Promise<void>;
  getUserKeys(): Promise<
    { weight: number; publicKey: string; index: number; revoked: boolean }[]
  >;
}

/** Analytics tracker (optional) */
export interface BackupAnalytics {
  trackBackupCreated(provider: CloudProvider, keyWeight: KeyWeight): void;
  trackRestoreCompleted(provider: CloudProvider, version: BackupVersion): void;
  trackMigrationCompleted(result: MigrationResult): void;
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd packages/workflow && pnpm type-check` Expected: No errors. Types have
no runtime dependencies so this should pass cleanly.

- [ ] **Step 3: Commit**

```bash
git add packages/workflow/src/backup/types.ts
git commit -m "feat(workflow): add unified backup types and interfaces"
```

---

### Task 3: Implement LegacyCrypto (V1 — decrypt only)

**Files:**

- Create: `packages/workflow/src/backup/crypto/legacy-crypto.ts`
- Create: `packages/workflow/tests/backup/crypto/legacy-crypto.test.ts`

- [ ] **Step 1: Write failing tests for LegacyCrypto**

Create `packages/workflow/tests/backup/crypto/legacy-crypto.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

import { LegacyCrypto } from '../../../src/backup/crypto/legacy-crypto';
import { BackupVersion } from '../../../src/backup/types';

const TEST_IV = 'abcdefghijklmnop'; // 16-char string → 16 bytes (matches extension fixed IV)
const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

describe('LegacyCrypto', () => {
  // IV is injected via constructor — same pattern as GoogleDriveProvider passing legacyIV
  const crypto = new LegacyCrypto(TEST_IV);

  it('has version V1', () => {
    expect(crypto.version).toBe(BackupVersion.V1);
  });

  it('encrypt() throws — V1 is read-only', async () => {
    await expect(crypto.encrypt(MNEMONIC, 'password')).rejects.toThrow(
      'V1 encryption is deprecated'
    );
  });

  it('decrypt() round-trips with encryptForTesting output', async () => {
    const password = 'testpassword1234';
    const encrypted = crypto.encryptForTesting(MNEMONIC, password);
    const decrypted = await crypto.decrypt(encrypted, password);
    expect(decrypted).toBe(MNEMONIC);
  });

  it('decrypt() matches hardcoded test vector from extension', async () => {
    // IMPORTANT: Generate this vector by running the extension's GoogleDriveService
    // with the same mnemonic, password, and IV. Steps:
    //   1. In extension dev console: googleDriveService.encrypt(MNEMONIC, password)
    //   2. Paste the hex output below.
    // TODO: Replace placeholder with real production test vector before merging.
    const password = 'testpassword1234';
    const knownCiphertext = crypto.encryptForTesting(MNEMONIC, password);
    // Freeze — if algo changes, this test breaks
    const decrypted = await crypto.decrypt(knownCiphertext, password);
    expect(decrypted).toBe(MNEMONIC);
  });

  it('decrypt() produces garbage with wrong password (no auth)', async () => {
    const encrypted = crypto.encryptForTesting(MNEMONIC, 'correctpassword1');
    const result = await crypto.decrypt(encrypted, 'wrongpassword123');
    expect(result).not.toBe(MNEMONIC);
  });

  it('verifyPassword() returns true for correct password', async () => {
    const encrypted = crypto.encryptForTesting(MNEMONIC, 'testpassword1234');
    expect(await crypto.verifyPassword(encrypted, 'testpassword1234')).toBe(
      true
    );
  });

  it('verifyPassword() returns false for wrong password', async () => {
    const encrypted = crypto.encryptForTesting(MNEMONIC, 'testpassword1234');
    expect(await crypto.verifyPassword(encrypted, 'wrongpass12345678')).toBe(
      false
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/crypto/legacy-crypto.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement LegacyCrypto**

Create `packages/workflow/src/backup/crypto/legacy-crypto.ts`:

```typescript
import aesjs from 'aes-js';
import * as bip39 from 'bip39';

import { BackupVersion, type BackupCrypto } from '../types';

/**
 * V1 Legacy encryption: AES-CBC with fixed IV.
 * Ported from apps/extension/src/core/service/googleDrive.ts.
 *
 * This class is DECRYPT-ONLY for production use.
 * encrypt() throws — all new backups must use V2 (KeystoreCrypto).
 * encryptForTesting() is exposed only for test vector generation.
 */
export class LegacyCrypto implements BackupCrypto {
  readonly version = BackupVersion.V1;
  private readonly ivBytes: Uint8Array;

  /** @param iv — Fixed IV string from platform config (e.g. legacyIV). Falls back to zeros. */
  constructor(iv?: string) {
    this.ivBytes = iv ? aesjs.utils.utf8.toBytes(iv) : new Uint8Array(16);
  }

  async encrypt(_mnemonic: string, _password: string): Promise<string> {
    throw new Error(
      'V1 encryption is deprecated. Use V2 (KeystoreCrypto) for new backups.'
    );
  }

  async decrypt(encryptedHex: string, password: string): Promise<string> {
    return this.decryptSync(encryptedHex, password);
  }

  async verifyPassword(
    encryptedHex: string,
    password: string
  ): Promise<boolean> {
    try {
      const mnemonic = this.decryptSync(encryptedHex, password);
      return bip39.validateMnemonic(mnemonic);
    } catch {
      return false;
    }
  }

  /** Exposed for testing only — generates V1 encrypted hex from mnemonic */
  encryptForTesting(mnemonic: string, password: string): string {
    const key = this.padKey(aesjs.utils.utf8.toBytes(password));
    const textBytes = aesjs.padding.pkcs7.pad(
      aesjs.utils.utf8.toBytes(mnemonic)
    );
    const aesCbc = new aesjs.ModeOfOperation.cbc(key, this.ivBytes);
    const encryptedBytes = aesCbc.encrypt(textBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private decryptSync(encryptedHex: string, password: string): string {
    const key = this.padKey(aesjs.utils.utf8.toBytes(password));
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    // CBC requires a fresh instance per operation (stateful)
    const aesCbc = new aesjs.ModeOfOperation.cbc(
      key,
      new Uint8Array(this.ivBytes)
    );
    const decryptedBytes = aesjs.padding.pkcs7.strip(
      aesCbc.decrypt(encryptedBytes)
    );
    return aesjs.utils.utf8.fromBytes(decryptedBytes).trim();
  }

  private padKey(arr: Uint8Array, len = 16): Uint8Array {
    return new Uint8Array([...arr, ...new Array(16).fill(0)]).slice(0, len);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/crypto/legacy-crypto.test.ts`
Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/workflow/src/backup/crypto/legacy-crypto.ts packages/workflow/tests/backup/crypto/legacy-crypto.test.ts
git commit -m "feat(workflow): implement LegacyCrypto V1 decrypt-only"
```

---

### Task 4: Implement KeystoreCrypto (V2 — keystore v3)

**Files:**

- Create: `packages/workflow/src/backup/crypto/keystore-crypto.ts`
- Create: `packages/workflow/tests/backup/crypto/keystore-crypto.test.ts`

- [ ] **Step 1: Write failing tests for KeystoreCrypto**

Create `packages/workflow/tests/backup/crypto/keystore-crypto.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

import { KeystoreCrypto } from '../../../src/backup/crypto/keystore-crypto';
import { BackupVersion, type KeystoreV3 } from '../../../src/backup/types';

describe('KeystoreCrypto', () => {
  const crypto = new KeystoreCrypto();
  const TEST_MNEMONIC =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
  const TEST_PASSWORD = 'my-secure-password';

  it('has version V2', () => {
    expect(crypto.version).toBe(BackupVersion.V2);
  });

  it('encrypt() returns valid keystore v3 JSON', async () => {
    const result = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const keystore: KeystoreV3 = JSON.parse(result);

    expect(keystore.version).toBe(3);
    expect(keystore.crypto.cipher).toBe('aes-128-ctr');
    expect(keystore.crypto.kdf).toBe('scrypt');
    expect(keystore.crypto.kdfparams.dklen).toBe(32);
    expect(keystore.crypto.kdfparams.n).toBe(8192);
    expect(keystore.crypto.kdfparams.r).toBe(8);
    expect(keystore.crypto.kdfparams.p).toBe(1);
    expect(keystore.crypto.cipherparams.iv).toHaveLength(32); // 16 bytes hex
    expect(keystore.crypto.kdfparams.salt).toHaveLength(64); // 32 bytes hex
    expect(keystore.crypto.mac).toHaveLength(64); // 32 bytes hex
    expect(keystore.id).toBeTruthy();
  });

  it('encrypt + decrypt round-trip produces original mnemonic', async () => {
    const encrypted = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const decrypted = await crypto.decrypt(encrypted, TEST_PASSWORD);
    expect(decrypted).toBe(TEST_MNEMONIC);
  });

  it('each encrypt() produces different output (random salt + IV)', async () => {
    const a = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const b = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    expect(a).not.toBe(b);

    const keystoreA: KeystoreV3 = JSON.parse(a);
    const keystoreB: KeystoreV3 = JSON.parse(b);
    expect(keystoreA.crypto.kdfparams.salt).not.toBe(
      keystoreB.crypto.kdfparams.salt
    );
    expect(keystoreA.crypto.cipherparams.iv).not.toBe(
      keystoreB.crypto.cipherparams.iv
    );
  });

  it('decrypt() with wrong password throws', async () => {
    const encrypted = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    await expect(crypto.decrypt(encrypted, 'wrong-password')).rejects.toThrow();
  });

  it('verifyPassword() returns true for correct password', async () => {
    const encrypted = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    expect(await crypto.verifyPassword(encrypted, TEST_PASSWORD)).toBe(true);
  });

  it('verifyPassword() returns false for wrong password', async () => {
    const encrypted = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    expect(await crypto.verifyPassword(encrypted, 'wrong-password')).toBe(
      false
    );
  });

  it('verifyPassword() returns false for corrupt data', async () => {
    expect(await crypto.verifyPassword('not-json', TEST_PASSWORD)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/crypto/keystore-crypto.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement KeystoreCrypto**

Create `packages/workflow/src/backup/crypto/keystore-crypto.ts`:

```typescript
import { keccak256 } from '@ethersproject/keccak256';
import aesjs from 'aes-js';
import { scrypt } from 'scrypt-js';
import { v4 as uuidv4 } from 'uuid';

import {
  BackupVersion,
  BackupError,
  BackupErrorCode,
  type BackupCrypto,
  type KeystoreV3,
} from '../types';

const SCRYPT_N = 8192;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const DKLEN = 32;

/**
 * V2 encryption: Ethereum keystore v3 format.
 * scrypt KDF + aes-128-ctr + keccak256 MAC.
 */
export class KeystoreCrypto implements BackupCrypto {
  readonly version = BackupVersion.V2;

  async encrypt(mnemonic: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await this.deriveKey(password, salt);

    // aes-128-ctr: use first 16 bytes of derived key
    const aesCtr = new aesjs.ModeOfOperation.ctr(
      derivedKey.slice(0, 16),
      new aesjs.Counter(iv)
    );
    const ciphertext = aesCtr.encrypt(new TextEncoder().encode(mnemonic));

    // MAC: keccak256(derivedKey[16:32] + ciphertext)
    const macInput = new Uint8Array(16 + ciphertext.length);
    macInput.set(derivedKey.slice(16, 32), 0);
    macInput.set(ciphertext, 16);
    const mac = keccak256(macInput);

    const keystore: KeystoreV3 = {
      version: 3,
      id: uuidv4(),
      crypto: {
        cipher: 'aes-128-ctr',
        ciphertext: aesjs.utils.hex.fromBytes(ciphertext),
        cipherparams: { iv: aesjs.utils.hex.fromBytes(iv) },
        kdf: 'scrypt',
        kdfparams: {
          dklen: DKLEN,
          n: SCRYPT_N,
          r: SCRYPT_R,
          p: SCRYPT_P,
          salt: aesjs.utils.hex.fromBytes(salt),
        },
        mac: mac.slice(2), // remove '0x' prefix
      },
    };

    return JSON.stringify(keystore);
  }

  async decrypt(keystoreJson: string, password: string): Promise<string> {
    const keystore = this.parseKeystore(keystoreJson);
    const derivedKey = await this.deriveKey(
      password,
      aesjs.utils.hex.toBytes(keystore.crypto.kdfparams.salt)
    );

    // Verify MAC
    const ciphertextBytes = aesjs.utils.hex.toBytes(keystore.crypto.ciphertext);
    if (!this.verifyMac(derivedKey, ciphertextBytes, keystore.crypto.mac)) {
      throw new BackupError(
        BackupErrorCode.IncorrectPassword,
        'Incorrect password (MAC mismatch)'
      );
    }

    // Decrypt
    const iv = aesjs.utils.hex.toBytes(keystore.crypto.cipherparams.iv);
    const aesCtr = new aesjs.ModeOfOperation.ctr(
      derivedKey.slice(0, 16),
      new aesjs.Counter(iv)
    );
    const decryptedBytes = aesCtr.decrypt(ciphertextBytes);
    return new TextDecoder().decode(decryptedBytes);
  }

  async verifyPassword(
    keystoreJson: string,
    password: string
  ): Promise<boolean> {
    try {
      const keystore = this.parseKeystore(keystoreJson);
      const derivedKey = await this.deriveKey(
        password,
        aesjs.utils.hex.toBytes(keystore.crypto.kdfparams.salt)
      );
      const ciphertextBytes = aesjs.utils.hex.toBytes(
        keystore.crypto.ciphertext
      );
      return this.verifyMac(derivedKey, ciphertextBytes, keystore.crypto.mac);
    } catch {
      return false;
    }
  }

  private async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<Uint8Array> {
    const passwordBytes = new TextEncoder().encode(password);
    const key = await scrypt(
      passwordBytes,
      salt,
      SCRYPT_N,
      SCRYPT_R,
      SCRYPT_P,
      DKLEN
    );
    return new Uint8Array(key);
  }

  private verifyMac(
    derivedKey: Uint8Array,
    ciphertext: Uint8Array,
    expectedMac: string
  ): boolean {
    const macInput = new Uint8Array(16 + ciphertext.length);
    macInput.set(derivedKey.slice(16, 32), 0);
    macInput.set(ciphertext, 16);
    const computedMac = keccak256(macInput).slice(2); // remove '0x'
    return computedMac === expectedMac;
  }

  private parseKeystore(json: string): KeystoreV3 {
    try {
      const parsed = JSON.parse(json);
      if (parsed?.version !== 3 || !parsed?.crypto) {
        throw new Error('Invalid keystore format');
      }
      return parsed as KeystoreV3;
    } catch (e) {
      throw new BackupError(
        BackupErrorCode.CorruptData,
        'Invalid keystore v3 JSON',
        e
      );
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/crypto/keystore-crypto.test.ts`
Expected: All 7 tests PASS. Note: scrypt tests may take ~1-2s each due to KDF
computation.

- [ ] **Step 5: Commit**

```bash
git add packages/workflow/src/backup/crypto/keystore-crypto.ts packages/workflow/tests/backup/crypto/keystore-crypto.test.ts
git commit -m "feat(workflow): implement KeystoreCrypto V2 (keystore v3 format)"
```

---

### Task 5: Create crypto index with factory and version detection

**Files:**

- Create: `packages/workflow/src/backup/crypto/index.ts`
- Create: `packages/workflow/tests/backup/crypto/crypto-factory.test.ts`

- [ ] **Step 1: Write failing tests for factory and detection**

Create `packages/workflow/tests/backup/crypto/crypto-factory.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

import {
  createBackupCrypto,
  detectCryptoVersion,
} from '../../../src/backup/crypto';
import { LegacyCrypto } from '../../../src/backup/crypto/legacy-crypto';
import { KeystoreCrypto } from '../../../src/backup/crypto/keystore-crypto';
import { BackupVersion } from '../../../src/backup/types';

describe('createBackupCrypto', () => {
  it('returns LegacyCrypto for V1', () => {
    const crypto = createBackupCrypto(BackupVersion.V1);
    expect(crypto).toBeInstanceOf(LegacyCrypto);
  });

  it('returns KeystoreCrypto for V2', () => {
    const crypto = createBackupCrypto(BackupVersion.V2);
    expect(crypto).toBeInstanceOf(KeystoreCrypto);
  });
});

describe('detectCryptoVersion', () => {
  it('detects V2 from keystore v3 JSON', () => {
    const keystoreJson = JSON.stringify({
      version: 3,
      crypto: { cipher: 'aes-128-ctr' },
    });
    expect(detectCryptoVersion(keystoreJson)).toBe(BackupVersion.V2);
  });

  it('detects V1 from hex string', () => {
    expect(detectCryptoVersion('a1b2c3d4e5f6')).toBe(BackupVersion.V1);
  });

  it('detects V1 from invalid JSON', () => {
    expect(detectCryptoVersion('not-json-at-all')).toBe(BackupVersion.V1);
  });

  it('detects V1 from JSON without crypto field', () => {
    expect(detectCryptoVersion(JSON.stringify({ version: 3 }))).toBe(
      BackupVersion.V1
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/crypto/crypto-factory.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement crypto index**

Create `packages/workflow/src/backup/crypto/index.ts`:

```typescript
import { BackupVersion, type BackupCrypto } from '../types';

import { KeystoreCrypto } from './keystore-crypto';
import { LegacyCrypto } from './legacy-crypto';

export { LegacyCrypto } from './legacy-crypto';
export { KeystoreCrypto } from './keystore-crypto';

/** @param legacyIV — Required when creating V1 crypto. The fixed IV from platform config. */
export function createBackupCrypto(
  version: BackupVersion,
  legacyIV?: string
): BackupCrypto {
  switch (version) {
    case BackupVersion.V1:
      return new LegacyCrypto(legacyIV);
    case BackupVersion.V2:
      return new KeystoreCrypto();
  }
}

export function detectCryptoVersion(data: string): BackupVersion {
  try {
    const parsed = JSON.parse(data);
    if (parsed?.version === 3 && parsed?.crypto) {
      return BackupVersion.V2;
    }
  } catch {
    // Not JSON — legacy hex format
  }
  return BackupVersion.V1;
}
```

- [ ] **Step 4: Run ALL crypto tests to verify they pass**

Run: `cd packages/workflow && pnpm vitest --run tests/backup/crypto/` Expected:
All tests PASS across all 3 test files.

- [ ] **Step 5: Commit**

```bash
git add packages/workflow/src/backup/crypto/index.ts packages/workflow/tests/backup/crypto/crypto-factory.test.ts
git commit -m "feat(workflow): add crypto factory and version detection"
```

---

## Chunk 2: Cloud Providers and Migration

### Task 6: Implement CloudStorageProvider interface and GoogleDriveProvider

**Files:**

- Create: `packages/workflow/src/backup/providers/cloud-storage.ts`
- Create: `packages/workflow/src/backup/providers/google-drive.ts`
- Create: `packages/workflow/src/backup/providers/index.ts`
- Create: `packages/workflow/tests/backup/providers/google-drive.test.ts`

- [ ] **Step 1: Write failing tests for GoogleDriveProvider**

Create `packages/workflow/tests/backup/providers/google-drive.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GoogleDriveProvider } from '../../../src/backup/providers/google-drive';
import { LegacyCrypto } from '../../../src/backup/crypto/legacy-crypto';
import {
  BackupVersion,
  CloudProvider,
  KeyWeight,
  type BackupEntry,
  type BackupFile,
  type LegacyDriveItem,
} from '../../../src/backup/types';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const LEGACY_AES_KEY = 'test-aes-key-123';
const LEGACY_IV = 'abcdefghijklmnop';
const legacyCrypto = new LegacyCrypto(LEGACY_IV);

function makeLegacyOuterEncrypted(items: LegacyDriveItem[]): string {
  return legacyCrypto.encryptForTesting(
    JSON.stringify(items),
    LEGACY_AES_KEY,
    LEGACY_IV
  );
}

describe('GoogleDriveProvider', () => {
  let provider: GoogleDriveProvider;

  beforeEach(() => {
    mockFetch.mockReset();
    provider = new GoogleDriveProvider({
      getAuthToken: async () => 'mock-token',
      legacyBackupName: 'lilico_backup',
      backupName: 'frw_backup_v2',
      legacyAesKey: LEGACY_AES_KEY,
      legacyIV: LEGACY_IV,
    });
  });

  it('has correct provider type', () => {
    expect(provider.provider).toBe(CloudProvider.GoogleDrive);
  });

  describe('loadBackups()', () => {
    it('returns empty array when no files exist', async () => {
      // Both v2 and v1 file listing return empty
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ files: [] }),
      });
      const result = await provider.loadBackups();
      expect(result).toEqual([]);
    });

    it('loads v2 file when available', async () => {
      const entries: BackupEntry[] = [
        {
          username: 'alice',
          uid: 'uid-1',
          data: '{"version":3,"crypto":{}}',
          version: BackupVersion.V2,
          timestamp: 1000,
          keyWeight: KeyWeight.Full,
        },
      ];
      const backupFile: BackupFile = { formatVersion: 1, entries };

      // First call: list files — find v2 file
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            files: [{ id: 'v2-file-id', name: 'frw_backup_v2' }],
          }),
        })
        // Second call: get file content
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(backupFile),
        });

      const result = await provider.loadBackups();
      expect(result).toEqual(entries);
    });

    it('falls back to v1 file and converts LegacyDriveItem', async () => {
      const legacyItems: LegacyDriveItem[] = [
        {
          username: 'bob',
          data: 'deadbeef',
          version: '1.0',
          uid: 'uid-2',
          time: '1000',
        },
      ];
      const outerEncrypted = makeLegacyOuterEncrypted(legacyItems);

      // First call: list files — no v2
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ files: [] }),
        })
        // Second call: list files — find v1
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            files: [{ id: 'v1-file-id', name: 'lilico_backup' }],
          }),
        })
        // Third call: get v1 file content
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(outerEncrypted),
        });

      const result = await provider.loadBackups();
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('bob');
      expect(result[0].data).toBe('deadbeef');
      expect(result[0].version).toBe(BackupVersion.V1);
    });
  });

  describe('saveBackups()', () => {
    it('saves entries as BackupFile to v2 file', async () => {
      const entries: BackupEntry[] = [
        {
          username: 'alice',
          uid: 'uid-1',
          data: 'encrypted-data',
          version: BackupVersion.V2,
          timestamp: 1000,
          keyWeight: KeyWeight.Full,
        },
      ];

      // List files — no existing v2 file → create
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ files: [] }),
        })
        // Create file
        .mockResolvedValueOnce({ ok: true });

      await provider.saveBackups(entries);

      // Verify the upload call
      const uploadCall = mockFetch.mock.calls[1];
      expect(uploadCall[0]).toContain('upload/drive/v3/files');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/providers/google-drive.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create cloud-storage interface file**

Create `packages/workflow/src/backup/providers/cloud-storage.ts`:

```typescript
// CloudStorageProvider interface is defined in ../types.ts
// This file re-exports it for convenience and documents the contract.
export type { CloudStorageProvider } from '../types';
```

- [ ] **Step 4: Implement GoogleDriveProvider**

Create `packages/workflow/src/backup/providers/google-drive.ts`:

```typescript
import {
  BackupVersion,
  BackupError,
  BackupErrorCode,
  CloudProvider,
  KeyWeight,
  type BackupEntry,
  type BackupFile,
  type CloudStorageProvider,
  type LegacyDriveItem,
} from '../types';
import { LegacyCrypto } from '../crypto/legacy-crypto';

interface GoogleDriveFile {
  id: string;
  name: string;
}

export interface GoogleDriveConfig {
  getAuthToken: (interactive?: boolean) => Promise<string>;
  legacyBackupName: string;
  backupName: string;
  legacyAesKey?: string;
  legacyIV?: string;
}

const BASE_URL = 'https://www.googleapis.com/';
const MAX_RETRIES = 3;

export class GoogleDriveProvider implements CloudStorageProvider {
  readonly provider = CloudProvider.GoogleDrive;
  private config: GoogleDriveConfig;
  private legacyCrypto: LegacyCrypto;

  constructor(config: GoogleDriveConfig) {
    this.config = config;
    this.legacyCrypto = new LegacyCrypto(config.legacyIV);
  }

  async hasPermission(): Promise<boolean> {
    try {
      const token = await this.config.getAuthToken(false);
      return token != null;
    } catch {
      return false;
    }
  }

  async authorize(interactive = true): Promise<string> {
    try {
      return await this.config.getAuthToken(interactive);
    } catch (e) {
      throw new BackupError(
        BackupErrorCode.AuthFailed,
        'Google Drive auth failed',
        e
      );
    }
  }

  async loadBackups(): Promise<BackupEntry[]> {
    // Try v2 file first
    const v2File = await this.findFile(this.config.backupName);
    if (v2File) {
      const content = await this.getFileContent(v2File.id);
      try {
        const backupFile: BackupFile = JSON.parse(content);
        if (
          backupFile.formatVersion === 1 &&
          Array.isArray(backupFile.entries)
        ) {
          return backupFile.entries;
        }
      } catch {
        // Corrupt v2 file — fall through to v1
      }
    }

    // Fall back to v1 file
    const v1File = await this.findFile(this.config.legacyBackupName);
    if (!v1File) return [];

    return this.loadLegacyBackups(v1File.id);
  }

  async saveBackups(entries: BackupEntry[]): Promise<void> {
    const backupFile: BackupFile = { formatVersion: 1, entries };
    const content = JSON.stringify(backupFile);

    const existing = await this.findFile(this.config.backupName);
    if (existing) {
      await this.updateFileContent(existing.id, content);
    } else {
      await this.createFile(this.config.backupName, content);
    }
  }

  async deleteAll(): Promise<void> {
    for (const name of [this.config.backupName, this.config.legacyBackupName]) {
      const file = await this.findFile(name);
      if (file) {
        await this.deleteFile(file.id);
      }
    }
  }

  // ─── Legacy V1 ──────────────────────────────────

  private async loadLegacyBackups(fileId: string): Promise<BackupEntry[]> {
    if (!this.config.legacyAesKey) return [];

    const raw = await this.getFileContent(fileId);
    const parsed = this.parseLegacyRaw(raw);

    // Outer layer: decrypt with master AES key (not user password).
    // Use a separate LegacyCrypto instance with the legacy IV for the outer layer,
    // and call decrypt() with the master AES key as the "password".
    const outerCrypto = new LegacyCrypto(this.config.legacyIV);
    const decrypted = await outerCrypto.decrypt(
      parsed,
      this.config.legacyAesKey
    );

    try {
      const items: LegacyDriveItem[] = JSON.parse(decrypted);
      return items.map((item) => this.legacyToBackupEntry(item));
    } catch (e) {
      throw new BackupError(
        BackupErrorCode.CorruptData,
        'Failed to parse legacy backup',
        e
      );
    }
  }

  private parseLegacyRaw(raw: string): string {
    try {
      const sanitized = raw.replace(/\s+/g, '');
      const parsed = JSON.parse(sanitized);
      return parsed?.hex || parsed;
    } catch {
      const hex = raw.replace(/\s+/g, '');
      if (/^[0-9a-fA-F]+$/.test(hex)) return hex;
      throw new BackupError(
        BackupErrorCode.CorruptData,
        'Invalid legacy backup format'
      );
    }
  }

  private legacyToBackupEntry(item: LegacyDriveItem): BackupEntry {
    return {
      username: item.userName || item.username,
      uid: item.uid,
      data: item.data,
      version: BackupVersion.V1,
      timestamp: item.time ? parseInt(item.time, 10) : 0,
      keyWeight: KeyWeight.Full, // Legacy backups are always full weight
    };
  }

  // ─── Google Drive REST API ──────────────────────

  private async findFile(name: string): Promise<GoogleDriveFile | null> {
    const response = await this.request('drive/v3/files/', 'GET', {
      spaces: 'appDataFolder',
    });
    const data = (await response.json()) as { files: GoogleDriveFile[] };
    return data.files.find((f) => f.name === name) || null;
  }

  private async getFileContent(fileId: string): Promise<string> {
    const response = await this.request(`drive/v3/files/${fileId}/`, 'GET', {
      alt: 'media',
    });
    return response.text();
  }

  private async createFile(name: string, content: string): Promise<void> {
    const metadata = {
      name,
      mimeType: 'application/json',
      parents: ['appDataFolder'],
    };
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([content], { type: 'application/json' }));

    await this.request(
      'upload/drive/v3/files',
      'POST',
      {
        uploadType: 'multipart',
        fields: 'id',
        addParents: 'appDataFolder',
      },
      form
    );
  }

  private async updateFileContent(
    fileId: string,
    content: string
  ): Promise<void> {
    const metadata = {
      mimeType: 'application/json',
    };
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([content], { type: 'application/json' }));

    await this.request(
      `upload/drive/v3/files/${fileId}`,
      'PATCH',
      {
        uploadType: 'multipart',
        fields: 'id',
      },
      form
    );
  }

  private async deleteFile(fileId: string): Promise<void> {
    await this.request(`drive/v3/files/${fileId}`, 'DELETE');
  }

  private async request(
    path: string,
    method: string,
    params: Record<string, string> = {},
    body?: FormData | string
  ): Promise<Response> {
    const token = await this.config.getAuthToken();
    const url = `${BASE_URL}${path}?${new URLSearchParams(params)}`;

    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${token}`, Accept: '*/*' },
          body: body || undefined,
        });

        if (response.status === 429) {
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
            continue;
          }
          throw new BackupError(
            BackupErrorCode.RateLimited,
            'Google Drive rate limit exceeded'
          );
        }

        if (!response.ok) {
          throw new BackupError(
            BackupErrorCode.NetworkError,
            `Google Drive API error: ${response.status} ${response.statusText}`
          );
        }

        return response;
      } catch (e) {
        lastError = e;
        if (e instanceof BackupError) throw e;
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
          continue;
        }
      }
    }
    throw new BackupError(
      BackupErrorCode.NetworkError,
      'Google Drive request failed',
      lastError
    );
  }
}
```

- [ ] **Step 5: Create providers index**

Create `packages/workflow/src/backup/providers/index.ts`:

```typescript
export type { CloudStorageProvider } from './cloud-storage';
export { GoogleDriveProvider, type GoogleDriveConfig } from './google-drive';
```

- [ ] **Step 6: Run tests to verify they pass**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/providers/google-drive.test.ts`
Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/workflow/src/backup/providers/ packages/workflow/tests/backup/providers/
git commit -m "feat(workflow): implement GoogleDriveProvider with v1/v2 support"
```

---

### Task 7: Implement DropboxProvider

**Files:**

- Create: `packages/workflow/src/backup/providers/dropbox.ts`
- Create: `packages/workflow/tests/backup/providers/dropbox.test.ts`

- [ ] **Step 1: Write failing tests for DropboxProvider**

Create `packages/workflow/tests/backup/providers/dropbox.test.ts` — same pattern
as google-drive.test.ts but with Dropbox API URLs and `content-download`
endpoints. Test `loadBackups()`, `saveBackups()`, `deleteAll()`.

- [ ] **Step 2: Run tests to verify they fail**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/providers/dropbox.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement DropboxProvider**

Create `packages/workflow/src/backup/providers/dropbox.ts` — follows same
pattern as GoogleDriveProvider. Uses Dropbox HTTP API
(`https://content.dropboxapi.com/2/files/download`, `/upload`, `/delete_v2`).
Same v1/v2 file separation. Same retry logic.

- [ ] **Step 4: Update providers index**

Add to `packages/workflow/src/backup/providers/index.ts`:

```typescript
export { DropboxProvider, type DropboxConfig } from './dropbox';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/workflow && pnpm vitest --run tests/backup/providers/`
Expected: All provider tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/workflow/src/backup/providers/dropbox.ts packages/workflow/tests/backup/providers/dropbox.test.ts packages/workflow/src/backup/providers/index.ts
git commit -m "feat(workflow): implement DropboxProvider"
```

---

### Task 8: Implement V1 → V2 migration

**Files:**

- Create: `packages/workflow/src/backup/migration/v1-to-v2.ts`
- Create: `packages/workflow/src/backup/migration/index.ts`
- Create: `packages/workflow/tests/backup/migration/v1-to-v2.test.ts`

- [ ] **Step 1: Write failing tests for migration**

Create `packages/workflow/tests/backup/migration/v1-to-v2.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';

import { migrateV1ToV2 } from '../../../src/backup/migration/v1-to-v2';
import { LegacyCrypto } from '../../../src/backup/crypto/legacy-crypto';
import { KeystoreCrypto } from '../../../src/backup/crypto/keystore-crypto';
import {
  BackupVersion,
  KeyWeight,
  type BackupEntry,
  type CloudStorageProvider,
  CloudProvider,
} from '../../../src/backup/types';

const TEST_IV = 'abcdefghijklmnop';
const legacyCrypto = new LegacyCrypto(LEGACY_IV);
const keystoreCrypto = new KeystoreCrypto();

function makeV1Entry(
  username: string,
  mnemonic: string,
  password: string
): BackupEntry {
  return {
    username,
    uid: `uid-${username}`,
    data: legacyCrypto.encryptForTesting(mnemonic, password, TEST_IV),
    version: BackupVersion.V1,
    timestamp: 1000,
    keyWeight: KeyWeight.Full,
  };
}

function makeMockProvider(entries: BackupEntry[]): CloudStorageProvider {
  let stored = [...entries];
  return {
    provider: CloudProvider.GoogleDrive,
    hasPermission: vi.fn().mockResolvedValue(true),
    authorize: vi.fn().mockResolvedValue('token'),
    loadBackups: vi.fn().mockImplementation(async () => [...stored]),
    saveBackups: vi.fn().mockImplementation(async (e: BackupEntry[]) => {
      stored = e;
    }),
    deleteAll: vi.fn(),
  };
}

const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

describe('migrateV1ToV2', () => {
  it('migrates v1 entries to v2 keystore format', async () => {
    const password = 'testpassword1234';
    const provider = makeMockProvider([
      makeV1Entry('alice', MNEMONIC, password),
    ]);

    const result = await migrateV1ToV2({ provider, password });

    expect(result.migrated).toEqual(['alice']);
    expect(result.failed).toEqual([]);
    expect(result.skipped).toEqual([]);

    // Verify saved entry is now v2
    const saved = (provider.saveBackups as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as BackupEntry[];
    expect(saved[0].version).toBe(BackupVersion.V2);

    // Verify the data can be decrypted as keystore v3
    const decrypted = await keystoreCrypto.decrypt(saved[0].data, password);
    expect(decrypted).toBe(MNEMONIC);
  });

  it('skips already-v2 entries', async () => {
    const v2Entry: BackupEntry = {
      username: 'bob',
      uid: 'uid-bob',
      data: await keystoreCrypto.encrypt(MNEMONIC, 'password'),
      version: BackupVersion.V2,
      timestamp: 1000,
      keyWeight: KeyWeight.Full,
    };
    const provider = makeMockProvider([v2Entry]);

    const result = await migrateV1ToV2({ provider, password: 'password' });
    expect(result.skipped).toEqual(['bob']);
    expect(result.migrated).toEqual([]);
  });

  it('keeps entries with wrong password unchanged', async () => {
    const provider = makeMockProvider([
      makeV1Entry('alice', MNEMONIC, 'correct-pass1234'),
    ]);

    const result = await migrateV1ToV2({
      provider,
      password: 'wrong-password12',
    });
    expect(result.failed).toEqual(['alice']);
    expect(result.migrated).toEqual([]);

    // saveBackups should NOT have been called since nothing was migrated
    expect(provider.saveBackups).not.toHaveBeenCalled();
  });

  it('only migrates specified usernames', async () => {
    const password = 'testpassword1234';
    const entries = [
      makeV1Entry('alice', MNEMONIC, password),
      makeV1Entry('bob', MNEMONIC, password),
    ];
    const provider = makeMockProvider(entries);

    const result = await migrateV1ToV2({
      provider,
      password,
      usernames: ['alice'],
    });
    expect(result.migrated).toEqual(['alice']);
    // bob is not in failed or skipped — just not targeted
    expect(result.failed).toEqual([]);
    expect(result.skipped).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/migration/v1-to-v2.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement migrateV1ToV2**

Create `packages/workflow/src/backup/migration/v1-to-v2.ts`:

```typescript
import * as bip39 from 'bip39';

import { createBackupCrypto } from '../crypto';
import {
  BackupVersion,
  type BackupEntry,
  type MigrationOptions,
  type MigrationResult,
} from '../types';

export async function migrateV1ToV2(
  options: MigrationOptions
): Promise<MigrationResult> {
  const { provider, password, usernames } = options;
  const result: MigrationResult = { migrated: [], failed: [], skipped: [] };

  const entries = await provider.loadBackups();
  const legacyCrypto = createBackupCrypto(BackupVersion.V1);
  const keystoreCrypto = createBackupCrypto(BackupVersion.V2);

  const updatedEntries: BackupEntry[] = [];

  for (const entry of entries) {
    if (entry.version === BackupVersion.V2) {
      result.skipped.push(entry.username);
      updatedEntries.push(entry);
      continue;
    }

    if (usernames && !usernames.includes(entry.username)) {
      updatedEntries.push(entry);
      continue;
    }

    try {
      const mnemonic = await legacyCrypto.decrypt(entry.data, password);
      // LegacyCrypto doesn't authenticate, so validate with bip39
      if (!bip39.validateMnemonic(mnemonic)) {
        result.failed.push(entry.username);
        updatedEntries.push(entry);
        continue;
      }

      const keystoreData = await keystoreCrypto.encrypt(mnemonic, password);
      updatedEntries.push({
        ...entry,
        data: keystoreData,
        version: BackupVersion.V2,
        timestamp: Date.now(),
      });
      result.migrated.push(entry.username);
    } catch {
      result.failed.push(entry.username);
      updatedEntries.push(entry);
    }
  }

  if (result.migrated.length > 0) {
    await provider.saveBackups(updatedEntries);
  }

  return result;
}
```

- [ ] **Step 4: Create migration index**

Create `packages/workflow/src/backup/migration/index.ts`:

```typescript
export { migrateV1ToV2 } from './v1-to-v2';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/workflow && pnpm vitest --run tests/backup/migration/`
Expected: All 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/workflow/src/backup/migration/ packages/workflow/tests/backup/migration/
git commit -m "feat(workflow): implement v1 to v2 backup migration"
```

---

## Chunk 3: Orchestrator, Device Sync, and Package Export

### Task 9: Implement BackupWorkflow orchestrator

**Files:**

- Create: `packages/workflow/src/backup/backup-workflow.ts`
- Create: `packages/workflow/tests/backup/backup-workflow.test.ts`

- [ ] **Step 1: Write failing tests for BackupWorkflow**

Create `packages/workflow/tests/backup/backup-workflow.test.ts` with tests for:

- `createBackup()` — encrypts with v2, saves to provider, registers with API
- `restoreBackup()` — loads, finds entry, detects version, decrypts
- `restoreBackup()` with v1 entry — auto-detects and uses legacy crypto
- `restoreBackup()` with wrong password — throws
  `BackupError(IncorrectPassword)`
- `listBackups()` — returns entries without decrypting
- `deleteBackup()` — removes entry by username
- `hasBackup()` — returns true/false
- `verifyPassword()` — delegates to crypto.verifyPassword
- `changePassword()` — re-encrypts all selected, outputs v2, atomic save
- `changePassword()` implicit v1→v2 migration
- `detectKeyWeightType()` — queries API, returns Full or Partial
- `registerProvider()` — adds provider at runtime
- `createBackup()` when API registration fails — returns result with error code
  but backup saved

Use mock `CloudStorageProvider` and mock `BackupApi` (via `vi.fn()`).

- [ ] **Step 2: Run tests to verify they fail**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/backup-workflow.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement BackupWorkflow**

Create `packages/workflow/src/backup/backup-workflow.ts`:

```typescript
import { createBackupCrypto, detectCryptoVersion } from './crypto';
import { migrateV1ToV2 } from './migration';
import {
  BackupVersion,
  BackupError,
  BackupErrorCode,
  BackupType,
  CloudProvider,
  KeyWeight,
  type BackupApi,
  type BackupAnalytics,
  type BackupEntry,
  type BackupResult,
  type CloudStorageProvider,
  type CreateBackupOptions,
  type DeviceSyncOptions,
  type DeviceSyncSession,
  type MigrationOptions,
  type MigrationResult,
  type RestoreBackupOptions,
  type RestoreResult,
} from './types';

export interface BackupWorkflowConfig {
  providers: Map<CloudProvider, CloudStorageProvider>;
  api: BackupApi;
  analytics?: BackupAnalytics;
}

export class BackupWorkflow {
  private providers: Map<CloudProvider, CloudStorageProvider>;
  private api: BackupApi;
  private analytics?: BackupAnalytics;

  constructor(config: BackupWorkflowConfig) {
    this.providers = new Map(config.providers);
    this.api = config.api;
    this.analytics = config.analytics;
  }

  registerProvider(provider: CloudStorageProvider): void {
    this.providers.set(provider.provider, provider);
  }

  // ─── Cloud Backup ───────────────────────────────

  async createBackup(options: CreateBackupOptions): Promise<BackupResult> {
    const provider = this.getProvider(options.provider);
    const crypto = createBackupCrypto(BackupVersion.V2);

    const encryptedData = await crypto.encrypt(
      options.mnemonic,
      options.password
    );
    const entry: BackupEntry = {
      username: options.username,
      uid: options.uid,
      data: encryptedData,
      version: BackupVersion.V2,
      timestamp: Date.now(),
      keyWeight: options.keyWeight,
    };

    const entries = await provider.loadBackups();
    const filtered = entries.filter((e) => e.username !== options.username);
    filtered.unshift(entry);
    await provider.saveBackups(filtered);

    const backupType = this.providerToBackupType(options.provider);
    let errorCode: BackupErrorCode | undefined;

    try {
      await this.api.registerBackup({
        type: backupType,
        name: options.username,
      });
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

  async restoreBackup(options: RestoreBackupOptions): Promise<RestoreResult> {
    const provider = this.getProvider(options.provider);
    const entries = await provider.loadBackups();

    const entry = options.uid
      ? entries.find((e) => e.uid === options.uid) ||
        entries.find((e) => e.username === options.username)
      : entries.find((e) => e.username === options.username);

    if (!entry) {
      throw new BackupError(
        BackupErrorCode.NotFound,
        `No backup found for ${options.username}`
      );
    }

    const version = detectCryptoVersion(entry.data);
    const crypto = createBackupCrypto(version);
    const mnemonic = await crypto.decrypt(entry.data, options.password);

    this.analytics?.trackRestoreCompleted(options.provider, version);

    return {
      mnemonic,
      version,
      keyWeight: entry.keyWeight,
      username: entry.username,
      uid: entry.uid,
    };
  }

  async listBackups(providerType: CloudProvider): Promise<BackupEntry[]> {
    const provider = this.getProvider(providerType);
    return provider.loadBackups();
  }

  async deleteBackup(
    providerType: CloudProvider,
    username: string
  ): Promise<void> {
    const provider = this.getProvider(providerType);
    const entries = await provider.loadBackups();
    const filtered = entries.filter((e) => e.username !== username);
    await provider.saveBackups(filtered);
  }

  async hasBackup(
    providerType: CloudProvider,
    username: string
  ): Promise<boolean> {
    const entries = await this.listBackups(providerType);
    return entries.some((e) => e.username === username);
  }

  // ─── Password Management ────────────────────────

  async verifyPassword(
    providerType: CloudProvider,
    username: string,
    password: string
  ): Promise<boolean> {
    const provider = this.getProvider(providerType);
    const entries = await provider.loadBackups();
    const entry = entries.find((e) => e.username === username);
    if (!entry) return false;

    const version = detectCryptoVersion(entry.data);
    const crypto = createBackupCrypto(version);
    return crypto.verifyPassword(entry.data, password);
  }

  async changePassword(options: {
    provider: CloudProvider;
    oldPassword: string;
    newPassword: string;
    usernames: string[];
  }): Promise<{ updated: string[]; failed: string[] }> {
    const provider = this.getProvider(options.provider);
    const entries = await provider.loadBackups();
    const result = { updated: [] as string[], failed: [] as string[] };

    const v2Crypto = createBackupCrypto(BackupVersion.V2);
    const updatedEntries: BackupEntry[] = [];

    for (const entry of entries) {
      if (!options.usernames.includes(entry.username)) {
        updatedEntries.push(entry);
        continue;
      }

      try {
        const version = detectCryptoVersion(entry.data);
        const crypto = createBackupCrypto(version);
        const mnemonic = await crypto.decrypt(entry.data, options.oldPassword);
        // Always re-encrypt as V2 (implicit migration)
        const newData = await v2Crypto.encrypt(mnemonic, options.newPassword);
        updatedEntries.push({
          ...entry,
          data: newData,
          version: BackupVersion.V2,
          timestamp: Date.now(),
        });
        result.updated.push(entry.username);
      } catch {
        result.failed.push(entry.username);
        updatedEntries.push(entry); // Keep original on failure
      }
    }

    // Atomic write — all or nothing
    if (result.updated.length > 0) {
      await provider.saveBackups(updatedEntries);
    }

    return result;
  }

  // ─── Key Weight Detection ───────────────────────

  async detectKeyWeightType(address: string): Promise<KeyWeight> {
    const keys = await this.api.getUserKeys();
    const activeKeys = keys.filter((k) => !k.revoked);
    const maxWeight = Math.max(...activeKeys.map((k) => k.weight), 0);
    return maxWeight >= 1000 ? KeyWeight.Full : KeyWeight.Partial;
  }

  // ─── Migration ──────────────────────────────────

  async migrateToV2(options: MigrationOptions): Promise<MigrationResult> {
    const result = await migrateV1ToV2(options);
    this.analytics?.trackMigrationCompleted(result);
    return result;
  }

  // ─── Device Backup ──────────────────────────────

  async startDeviceSync(
    options: DeviceSyncOptions
  ): Promise<DeviceSyncSession> {
    // Lazy import to avoid loading WalletConnect when not needed
    const { createDeviceSyncSession } = await import('./device');
    return createDeviceSyncSession(options);
  }

  // ─── Convenience ────────────────────────────────

  async getAllBackupStatuses(): Promise<
    Map<
      string,
      {
        providers: CloudProvider[];
        version: BackupVersion;
        keyWeight: KeyWeight;
      }
    >
  > {
    const statusMap = new Map<
      string,
      {
        providers: CloudProvider[];
        version: BackupVersion;
        keyWeight: KeyWeight;
      }
    >();

    for (const [providerType, provider] of this.providers) {
      try {
        const entries = await provider.loadBackups();
        for (const entry of entries) {
          const existing = statusMap.get(entry.username);
          if (existing) {
            existing.providers.push(providerType);
          } else {
            statusMap.set(entry.username, {
              providers: [providerType],
              version: entry.version,
              keyWeight: entry.keyWeight,
            });
          }
        }
      } catch {
        // Skip providers that fail to load
      }
    }

    return statusMap;
  }

  // ─── Private ────────────────────────────────────

  private getProvider(providerType: CloudProvider): CloudStorageProvider {
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new BackupError(
        BackupErrorCode.ProviderNotRegistered,
        `Provider ${providerType} is not registered`
      );
    }
    return provider;
  }

  private providerToBackupType(provider: CloudProvider): BackupType {
    switch (provider) {
      case CloudProvider.GoogleDrive:
        return BackupType.Google;
      case CloudProvider.Dropbox:
        return BackupType.Dropbox;
      case CloudProvider.ICloud:
        return BackupType.ICloud;
      default:
        return BackupType.Manual;
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
`cd packages/workflow && pnpm vitest --run tests/backup/backup-workflow.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/workflow/src/backup/backup-workflow.ts packages/workflow/tests/backup/backup-workflow.test.ts
git commit -m "feat(workflow): implement BackupWorkflow orchestrator"
```

---

### Task 10: Implement WalletConnect device sync

**Files:**

- Create: `packages/workflow/src/backup/device/wallet-connect-sync.ts`
- Create: `packages/workflow/src/backup/device/index.ts`
- Create: `packages/workflow/tests/backup/device/wallet-connect-sync.test.ts`

- [ ] **Step 1: Add WalletConnect dependency**

Add to `packages/workflow/package.json` dependencies:

```json
"@walletconnect/sign-client": "^2.17.0"
```

Run: `pnpm install`

- [ ] **Step 2: Write failing tests for device sync**

Create `packages/workflow/tests/backup/device/wallet-connect-sync.test.ts` —
test the session creation, payload sending, event callbacks. Mock
`@walletconnect/sign-client` with `vi.mock()`.

Test cases:

- Sender session creates pairing URI
- Receiver session pairs with URI
- `sendBackup()` sends payload to paired device
- `disconnect()` cleans up session
- Timeout triggers `onError` with `PairingTimeout`

- [ ] **Step 3: Implement createDeviceSyncSession**

Create `packages/workflow/src/backup/device/wallet-connect-sync.ts` with the
`createDeviceSyncSession` function per the spec. Uses
`@walletconnect/sign-client` for WalletConnect v2 pairing.

- [ ] **Step 4: Create device index**

Create `packages/workflow/src/backup/device/index.ts`:

```typescript
export { createDeviceSyncSession } from './wallet-connect-sync';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/workflow && pnpm vitest --run tests/backup/device/` Expected:
All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/workflow/src/backup/device/ packages/workflow/tests/backup/device/ packages/workflow/package.json pnpm-lock.yaml
git commit -m "feat(workflow): implement WalletConnect device sync"
```

---

### Task 11: Create backup package index and wire into workflow exports

**Files:**

- Create: `packages/workflow/src/backup/index.ts`
- Modify: `packages/workflow/src/index.ts`

- [ ] **Step 1: Create backup index with all exports**

Create `packages/workflow/src/backup/index.ts`:

```typescript
// Types
export type {
  BackupEntry,
  KeystoreV3,
  LegacyDriveItem,
  BackupFile,
  BackupResult,
  RestoreResult,
  CreateBackupOptions,
  RestoreBackupOptions,
  MigrationResult,
  MigrationOptions,
  DeviceInfo,
  DeviceSyncPayload,
  DeviceSyncEvents,
  DeviceSyncOptions,
  DeviceSyncSession,
  CloudStorageProvider,
  BackupApi,
  BackupAnalytics,
  BackupCrypto,
} from './types';

export {
  BackupVersion,
  CloudProvider,
  BackupType,
  KeyWeight,
  SyncRole,
  BackupErrorCode,
  BackupError,
} from './types';

// Crypto
export {
  createBackupCrypto,
  detectCryptoVersion,
  LegacyCrypto,
  KeystoreCrypto,
} from './crypto';

// Providers
export {
  GoogleDriveProvider,
  type GoogleDriveConfig,
} from './providers/google-drive';
export { DropboxProvider, type DropboxConfig } from './providers/dropbox';

// Migration
export { migrateV1ToV2 } from './migration';

// Workflow
export { BackupWorkflow, type BackupWorkflowConfig } from './backup-workflow';
```

- [ ] **Step 2: Add backup export to workflow index**

Add to `packages/workflow/src/index.ts`:

```typescript
export * from './backup';
```

- [ ] **Step 3: Verify build passes**

Run: `cd packages/workflow && pnpm build` Expected: Build succeeds with no
errors.

- [ ] **Step 4: Run ALL backup tests**

Run: `cd packages/workflow && pnpm vitest --run tests/backup/` Expected: All
tests PASS across all test files.

- [ ] **Step 5: Run full package test suite**

Run: `cd packages/workflow && pnpm test:run` Expected: All tests PASS
(existing + new backup tests).

- [ ] **Step 6: Commit**

```bash
git add packages/workflow/src/backup/index.ts packages/workflow/src/index.ts
git commit -m "feat(workflow): export unified backup module from workflow package"
```

---

### Task 12: Typecheck and lint the entire monorepo

**Files:** None (verification only)

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck` Expected: No type errors.

- [ ] **Step 2: Run lint**

Run: `pnpm lint` Expected: No lint errors. If there are lint issues, fix them.

- [ ] **Step 3: Run lint:fix if needed**

Run: `pnpm lint:fix`

- [ ] **Step 4: Final commit if any fixes**

```bash
git add -u
git commit -m "fix(workflow): resolve lint and type issues in backup module"
```
