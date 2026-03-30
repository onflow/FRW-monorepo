import { describe, it, expect, vi } from 'vitest';

import { BackupWorkflow } from '../../src/backup/backup-workflow';
import { detectCryptoVersion } from '../../src/backup/crypto';
import { KeystoreCrypto } from '../../src/backup/crypto/keystore-crypto';
import { LegacyCrypto } from '../../src/backup/crypto/legacy-crypto';
import {
  BackupVersion,
  BackupError,
  BackupErrorCode,
  BackupType,
  CloudProvider,
  KeyWeight,
  type BackupApi,
  type BackupEntry,
  type CloudStorageProvider,
} from '../../src/backup/types';

const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const TEST_PASSWORD = 'test-password-123';

function makeMockProvider(entries: BackupEntry[] = []): CloudStorageProvider {
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

function makeMockApi(): BackupApi {
  return {
    registerBackup: vi.fn().mockResolvedValue(undefined),
    syncDeviceKey: vi.fn().mockResolvedValue(undefined),
    getUserKeys: vi.fn().mockResolvedValue([]),
  };
}

function makeWorkflow(
  provider?: CloudStorageProvider,
  api?: BackupApi
): { workflow: BackupWorkflow; provider: CloudStorageProvider; api: BackupApi } {
  const p = provider ?? makeMockProvider();
  const a = api ?? makeMockApi();
  return {
    workflow: new BackupWorkflow({
      providers: new Map([[p.provider, p]]),
      api: a,
    }),
    provider: p,
    api: a,
  };
}

describe('BackupWorkflow', () => {
  // 1. createBackup
  it('createBackup() encrypts with v2, saves to provider, registers with API', async () => {
    const { workflow, provider, api } = makeWorkflow();

    const result = await workflow.createBackup({
      mnemonic: TEST_MNEMONIC,
      password: TEST_PASSWORD,
      username: 'alice',
      uid: 'uid-1',
      keyWeight: KeyWeight.Full,
      provider: CloudProvider.GoogleDrive,
    });

    expect(result.success).toBe(true);
    expect(result.version).toBe(BackupVersion.V2);
    expect(result.backupType).toBe(BackupType.Google);
    expect(result.provider).toBe(CloudProvider.GoogleDrive);
    expect(provider.saveBackups).toHaveBeenCalledTimes(1);
    expect(api.registerBackup).toHaveBeenCalledWith({
      type: BackupType.Google,
      name: 'alice',
    });

    // Verify saved entry is v2 and decryptable
    const savedEntries = (provider.saveBackups as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as BackupEntry[];
    expect(savedEntries).toHaveLength(1);
    expect(savedEntries[0].version).toBe(BackupVersion.V2);
    expect(detectCryptoVersion(savedEntries[0].data)).toBe(BackupVersion.V2);

    const crypto = new KeystoreCrypto();
    const decrypted = await crypto.decrypt(savedEntries[0].data, TEST_PASSWORD);
    expect(decrypted).toBe(TEST_MNEMONIC);
  });

  // 2. restoreBackup
  it('restoreBackup() loads, finds entry, detects version, decrypts', async () => {
    const crypto = new KeystoreCrypto();
    const encData = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const entry: BackupEntry = {
      username: 'bob',
      uid: 'uid-2',
      data: encData,
      version: BackupVersion.V2,
      timestamp: Date.now(),
      keyWeight: KeyWeight.Full,
    };

    const { workflow } = makeWorkflow(makeMockProvider([entry]));

    const result = await workflow.restoreBackup({
      username: 'bob',
      password: TEST_PASSWORD,
      provider: CloudProvider.GoogleDrive,
    });

    expect(result.mnemonic).toBe(TEST_MNEMONIC);
    expect(result.version).toBe(BackupVersion.V2);
    expect(result.keyWeight).toBe(KeyWeight.Full);
    expect(result.username).toBe('bob');
    expect(result.uid).toBe('uid-2');
  });

  // 3. restoreBackup with v1 entry
  it('restoreBackup() with v1 entry auto-detects and uses legacy crypto', async () => {
    const legacy = new LegacyCrypto();
    const encData = legacy.encryptForTesting(TEST_MNEMONIC, TEST_PASSWORD);
    const entry: BackupEntry = {
      username: 'charlie',
      uid: null,
      data: encData,
      version: BackupVersion.V1,
      timestamp: Date.now(),
      keyWeight: KeyWeight.Partial,
    };

    const { workflow } = makeWorkflow(makeMockProvider([entry]));

    const result = await workflow.restoreBackup({
      username: 'charlie',
      password: TEST_PASSWORD,
      provider: CloudProvider.GoogleDrive,
    });

    expect(result.mnemonic).toBe(TEST_MNEMONIC);
    expect(result.version).toBe(BackupVersion.V1);
    expect(result.keyWeight).toBe(KeyWeight.Partial);
  });

  // 4. restoreBackup with wrong password
  it('restoreBackup() with wrong password throws BackupError(IncorrectPassword) for v2', async () => {
    const crypto = new KeystoreCrypto();
    const encData = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const entry: BackupEntry = {
      username: 'dave',
      uid: null,
      data: encData,
      version: BackupVersion.V2,
      timestamp: Date.now(),
      keyWeight: KeyWeight.Full,
    };

    const { workflow } = makeWorkflow(makeMockProvider([entry]));

    await expect(
      workflow.restoreBackup({
        username: 'dave',
        password: 'wrong-password',
        provider: CloudProvider.GoogleDrive,
      })
    ).rejects.toThrow(BackupError);

    try {
      await workflow.restoreBackup({
        username: 'dave',
        password: 'wrong-password',
        provider: CloudProvider.GoogleDrive,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(BackupError);
      expect((e as BackupError).code).toBe(BackupErrorCode.IncorrectPassword);
    }
  });

  // 5. restoreBackup not found
  it('restoreBackup() not found throws BackupError(NotFound)', async () => {
    const { workflow } = makeWorkflow(makeMockProvider([]));

    await expect(
      workflow.restoreBackup({
        username: 'nonexistent',
        password: TEST_PASSWORD,
        provider: CloudProvider.GoogleDrive,
      })
    ).rejects.toThrow(BackupError);

    try {
      await workflow.restoreBackup({
        username: 'nonexistent',
        password: TEST_PASSWORD,
        provider: CloudProvider.GoogleDrive,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(BackupError);
      expect((e as BackupError).code).toBe(BackupErrorCode.NotFound);
    }
  });

  // 6. listBackups
  it('listBackups() returns entries without decrypting', async () => {
    const entries: BackupEntry[] = [
      {
        username: 'user1',
        uid: 'u1',
        data: 'encrypted-data-1',
        version: BackupVersion.V2,
        timestamp: 1000,
        keyWeight: KeyWeight.Full,
      },
      {
        username: 'user2',
        uid: 'u2',
        data: 'encrypted-data-2',
        version: BackupVersion.V1,
        timestamp: 2000,
        keyWeight: KeyWeight.Partial,
      },
    ];

    const { workflow } = makeWorkflow(makeMockProvider(entries));
    const result = await workflow.listBackups(CloudProvider.GoogleDrive);

    expect(result).toHaveLength(2);
    expect(result[0].username).toBe('user1');
    expect(result[1].username).toBe('user2');
  });

  // 7. deleteBackup
  it('deleteBackup() removes entry by username', async () => {
    const entries: BackupEntry[] = [
      {
        username: 'keep',
        uid: null,
        data: 'data1',
        version: BackupVersion.V2,
        timestamp: 1000,
        keyWeight: KeyWeight.Full,
      },
      {
        username: 'remove',
        uid: null,
        data: 'data2',
        version: BackupVersion.V2,
        timestamp: 2000,
        keyWeight: KeyWeight.Full,
      },
    ];

    const provider = makeMockProvider(entries);
    const { workflow } = makeWorkflow(provider);
    await workflow.deleteBackup(CloudProvider.GoogleDrive, 'remove');

    const saved = (provider.saveBackups as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as BackupEntry[];
    expect(saved).toHaveLength(1);
    expect(saved[0].username).toBe('keep');
  });

  // 8. hasBackup
  it('hasBackup() returns true/false', async () => {
    const entries: BackupEntry[] = [
      {
        username: 'exists',
        uid: null,
        data: 'data',
        version: BackupVersion.V2,
        timestamp: 1000,
        keyWeight: KeyWeight.Full,
      },
    ];

    const { workflow } = makeWorkflow(makeMockProvider(entries));

    expect(await workflow.hasBackup(CloudProvider.GoogleDrive, 'exists')).toBe(true);
    expect(await workflow.hasBackup(CloudProvider.GoogleDrive, 'nope')).toBe(false);
  });

  // 9. verifyPassword
  it('verifyPassword() delegates to crypto.verifyPassword', async () => {
    const crypto = new KeystoreCrypto();
    const encData = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const entry: BackupEntry = {
      username: 'eve',
      uid: null,
      data: encData,
      version: BackupVersion.V2,
      timestamp: Date.now(),
      keyWeight: KeyWeight.Full,
    };

    const { workflow } = makeWorkflow(makeMockProvider([entry]));

    expect(await workflow.verifyPassword(CloudProvider.GoogleDrive, 'eve', TEST_PASSWORD)).toBe(
      true
    );
    expect(await workflow.verifyPassword(CloudProvider.GoogleDrive, 'eve', 'wrong')).toBe(false);
    expect(await workflow.verifyPassword(CloudProvider.GoogleDrive, 'nobody', TEST_PASSWORD)).toBe(
      false
    );
  });

  // 10. changePassword
  it('changePassword() re-encrypts all selected, outputs v2, atomic save', async () => {
    const crypto = new KeystoreCrypto();
    const encData1 = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const encData2 = await crypto.encrypt(
      'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong',
      TEST_PASSWORD
    );

    const entries: BackupEntry[] = [
      {
        username: 'user1',
        uid: null,
        data: encData1,
        version: BackupVersion.V2,
        timestamp: 1000,
        keyWeight: KeyWeight.Full,
      },
      {
        username: 'user2',
        uid: null,
        data: encData2,
        version: BackupVersion.V2,
        timestamp: 2000,
        keyWeight: KeyWeight.Partial,
      },
    ];

    const provider = makeMockProvider(entries);
    const { workflow } = makeWorkflow(provider);

    const newPassword = 'new-password-456';
    const result = await workflow.changePassword({
      provider: CloudProvider.GoogleDrive,
      oldPassword: TEST_PASSWORD,
      newPassword,
      usernames: ['user1', 'user2'],
    });

    expect(result.updated).toEqual(['user1', 'user2']);
    expect(result.failed).toEqual([]);

    // Verify saved entries are re-encrypted with new password
    const saved = (provider.saveBackups as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as BackupEntry[];
    expect(saved).toHaveLength(2);

    const v2Crypto = new KeystoreCrypto();
    const decrypted1 = await v2Crypto.decrypt(saved[0].data, newPassword);
    expect(decrypted1).toBe(TEST_MNEMONIC);

    const decrypted2 = await v2Crypto.decrypt(saved[1].data, newPassword);
    expect(decrypted2).toBe('zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong');
  });

  // 11. changePassword implicit v1->v2 migration
  it('changePassword() implicit v1->v2 migration — v1 entry becomes v2', async () => {
    const legacy = new LegacyCrypto();
    const v1Data = legacy.encryptForTesting(TEST_MNEMONIC, TEST_PASSWORD);

    const entries: BackupEntry[] = [
      {
        username: 'legacy-user',
        uid: null,
        data: v1Data,
        version: BackupVersion.V1,
        timestamp: 1000,
        keyWeight: KeyWeight.Partial,
      },
    ];

    const provider = makeMockProvider(entries);
    const { workflow } = makeWorkflow(provider);

    const newPassword = 'new-pw';
    const result = await workflow.changePassword({
      provider: CloudProvider.GoogleDrive,
      oldPassword: TEST_PASSWORD,
      newPassword,
      usernames: ['legacy-user'],
    });

    expect(result.updated).toEqual(['legacy-user']);
    expect(result.failed).toEqual([]);

    const saved = (provider.saveBackups as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as BackupEntry[];
    expect(saved[0].version).toBe(BackupVersion.V2);
    expect(detectCryptoVersion(saved[0].data)).toBe(BackupVersion.V2);

    const v2Crypto = new KeystoreCrypto();
    const decrypted = await v2Crypto.decrypt(saved[0].data, newPassword);
    expect(decrypted).toBe(TEST_MNEMONIC);
  });

  // 12. detectKeyWeightType
  it('detectKeyWeightType() queries API, returns Full or Partial', async () => {
    const api = makeMockApi();
    (api.getUserKeys as ReturnType<typeof vi.fn>).mockResolvedValue([
      { weight: 1000, publicKey: 'pk1', index: 0, revoked: false },
      { weight: 500, publicKey: 'pk2', index: 1, revoked: false },
    ]);

    const { workflow } = makeWorkflow(makeMockProvider(), api);
    expect(await workflow.detectKeyWeightType('0xabc')).toBe(KeyWeight.Full);

    // All keys low weight
    (api.getUserKeys as ReturnType<typeof vi.fn>).mockResolvedValue([
      { weight: 500, publicKey: 'pk1', index: 0, revoked: false },
    ]);
    expect(await workflow.detectKeyWeightType('0xdef')).toBe(KeyWeight.Partial);

    // High weight key is revoked
    (api.getUserKeys as ReturnType<typeof vi.fn>).mockResolvedValue([
      { weight: 1000, publicKey: 'pk1', index: 0, revoked: true },
      { weight: 500, publicKey: 'pk2', index: 1, revoked: false },
    ]);
    expect(await workflow.detectKeyWeightType('0xghi')).toBe(KeyWeight.Partial);
  });

  // 13. registerProvider
  it('registerProvider() adds provider at runtime', async () => {
    const api = makeMockApi();
    const workflow = new BackupWorkflow({
      providers: new Map(),
      api,
    });

    // No provider registered yet
    await expect(workflow.listBackups(CloudProvider.GoogleDrive)).rejects.toThrow(BackupError);

    const provider = makeMockProvider();
    workflow.registerProvider(provider);

    const result = await workflow.listBackups(CloudProvider.GoogleDrive);
    expect(result).toEqual([]);
  });

  // 14. createBackup when API registration fails
  it('createBackup() when API registration fails returns result with error code but backup saved', async () => {
    const api = makeMockApi();
    (api.registerBackup as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'));

    const provider = makeMockProvider();
    const { workflow } = makeWorkflow(provider, api);

    const result = await workflow.createBackup({
      mnemonic: TEST_MNEMONIC,
      password: TEST_PASSWORD,
      username: 'frank',
      uid: null,
      keyWeight: KeyWeight.Full,
      provider: CloudProvider.GoogleDrive,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe(BackupErrorCode.ApiRegistrationFailed);
    // Backup was still saved to provider
    expect(provider.saveBackups).toHaveBeenCalledTimes(1);
  });
});
