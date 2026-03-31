import { describe, it, expect, vi, beforeEach } from 'vitest';

import { LegacyCrypto } from '../../../src/backup/crypto/legacy-crypto';
import {
  GoogleDriveProvider,
  type GoogleDriveConfig,
} from '../../../src/backup/providers/google-drive';
import {
  BackupVersion,
  CloudProvider,
  KeyWeight,
  type BackupEntry,
  type BackupFile,
} from '../../../src/backup/types';

const LEGACY_IV = 'abcdefghijklmnop';
const LEGACY_AES_KEY = 'testlegacykey123';
const TEST_TOKEN = 'mock-auth-token';

function makeConfig(overrides?: Partial<GoogleDriveConfig>): GoogleDriveConfig {
  return {
    getAuthToken: vi.fn().mockResolvedValue(TEST_TOKEN),
    legacyBackupName: 'frw_backup_v1.json',
    backupName: 'frw_backup_v2.json',
    legacyAesKey: LEGACY_AES_KEY,
    legacyIV: LEGACY_IV,
    ...overrides,
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: () => jsonResponse(data, status),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
  } as Response;
}

function textResponse(text: string, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: () => Promise.resolve(JSON.parse(text)),
    text: () => Promise.resolve(text),
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: () => textResponse(text, status),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
  } as Response;
}

const mockFetch = vi.fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>();

describe('GoogleDriveProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  it('has correct provider type', () => {
    const provider = new GoogleDriveProvider(makeConfig());
    expect(provider.provider).toBe(CloudProvider.GoogleDrive);
  });

  it('loadBackups() returns empty array when no files exist', async () => {
    const provider = new GoogleDriveProvider(makeConfig());

    // Both v2 and v1 file searches return empty
    mockFetch.mockResolvedValueOnce(jsonResponse({ files: [] })); // v2 search
    mockFetch.mockResolvedValueOnce(jsonResponse({ files: [] })); // v1 search

    const result = await provider.loadBackups();
    expect(result).toEqual([]);
  });

  it('loadBackups() loads v2 file when available', async () => {
    const entries: BackupEntry[] = [
      {
        username: 'testuser',
        uid: 'uid-123',
        data: 'encrypted-data',
        version: BackupVersion.V2,
        timestamp: 1700000000000,
        keyWeight: KeyWeight.Full,
      },
    ];
    const backupFile: BackupFile = { formatVersion: 1, entries };

    const provider = new GoogleDriveProvider(makeConfig());

    // v2 file found
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ files: [{ id: 'file-v2', name: 'frw_backup_v2.json' }] })
    );
    // v2 file content
    mockFetch.mockResolvedValueOnce(textResponse(JSON.stringify(backupFile)));

    const result = await provider.loadBackups();
    expect(result).toEqual(entries);
    expect(result[0].username).toBe('testuser');
    expect(result[0].version).toBe(BackupVersion.V2);
  });

  it('loadBackups() falls back to v1 file and converts LegacyDriveItem', async () => {
    const legacyItems = [
      {
        userName: 'legacyUser',
        username: '',
        data: 'some-encrypted-mnemonic-data',
        version: '1.0',
        uid: 'uid-legacy',
        time: '2024-01-15T00:00:00.000Z',
      },
    ];

    const legacyCrypto = new LegacyCrypto(LEGACY_IV);
    const outerEncrypted = legacyCrypto.encryptForTesting(
      JSON.stringify(legacyItems),
      LEGACY_AES_KEY
    );

    const provider = new GoogleDriveProvider(makeConfig());

    // v2 file not found
    mockFetch.mockResolvedValueOnce(jsonResponse({ files: [] }));
    // v1 file found
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ files: [{ id: 'file-v1', name: 'frw_backup_v1.json' }] })
    );
    // v1 file content — JSON-wrapped hex string
    mockFetch.mockResolvedValueOnce(textResponse(JSON.stringify(outerEncrypted)));

    const result = await provider.loadBackups();
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('legacyUser');
    expect(result[0].uid).toBe('uid-legacy');
    expect(result[0].data).toBe('some-encrypted-mnemonic-data');
    expect(result[0].version).toBe(BackupVersion.V1);
    expect(result[0].keyWeight).toBe(KeyWeight.Full);
    expect(result[0].timestamp).toBe(new Date('2024-01-15T00:00:00.000Z').getTime());
  });

  it('saveBackups() saves entries as BackupFile to v2 file', async () => {
    const entries: BackupEntry[] = [
      {
        username: 'alice',
        uid: 'uid-alice',
        data: 'keystore-json',
        version: BackupVersion.V2,
        timestamp: 1700000000000,
        keyWeight: KeyWeight.Full,
      },
    ];

    const provider = new GoogleDriveProvider(makeConfig());

    // No existing v2 file — create new
    mockFetch.mockResolvedValueOnce(jsonResponse({ files: [] }));
    // Create file response
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ id: 'new-file-id', name: 'frw_backup_v2.json' })
    );

    await provider.saveBackups(entries);

    // Second call should be the multipart upload
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [uploadUrl, uploadInit] = mockFetch.mock.calls[1];
    expect(uploadUrl).toContain('upload/drive/v3/files');
    expect(uploadInit?.method).toBe('POST');
    const body = uploadInit?.body as string;
    expect(body).toContain('"formatVersion":1');
    expect(body).toContain('"username":"alice"');
  });
});
