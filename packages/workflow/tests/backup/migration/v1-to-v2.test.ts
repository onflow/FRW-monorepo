import { describe, it, expect, vi } from 'vitest';

import { KeystoreCrypto } from '../../../src/backup/crypto/keystore-crypto';
import { LegacyCrypto } from '../../../src/backup/crypto/legacy-crypto';
import { migrateV1ToV2 } from '../../../src/backup/migration/v1-to-v2';
import {
  BackupVersion,
  KeyWeight,
  CloudProvider,
  type BackupEntry,
  type CloudStorageProvider,
} from '../../../src/backup/types';

// Use no-arg LegacyCrypto (zeros IV) to match what migrateV1ToV2 uses internally
const legacyCrypto = new LegacyCrypto();
const keystoreCrypto = new KeystoreCrypto();

const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

function makeV1Entry(username: string, mnemonic: string, password: string): BackupEntry {
  return {
    username,
    uid: `uid-${username}`,
    data: legacyCrypto.encryptForTesting(mnemonic, password),
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

describe('migrateV1ToV2', () => {
  it('migrates v1 entries to v2 keystore format', async () => {
    const password = 'testpassword1234';
    const provider = makeMockProvider([makeV1Entry('alice', MNEMONIC, password)]);

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
    const provider = makeMockProvider([makeV1Entry('alice', MNEMONIC, 'correct-pass1234')]);

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
    expect(result.failed).toEqual([]);
    expect(result.skipped).toEqual([]);
  });
});
