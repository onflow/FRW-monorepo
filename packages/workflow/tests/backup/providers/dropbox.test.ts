import { describe, it, expect, vi, beforeEach } from 'vitest';

import { LegacyCrypto } from '../../../src/backup/crypto/legacy-crypto';
import { DropboxProvider, type DropboxConfig } from '../../../src/backup/providers/dropbox';
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

function makeConfig(overrides?: Partial<DropboxConfig>): DropboxConfig {
  return {
    getAuthToken: vi.fn().mockResolvedValue(TEST_TOKEN),
    legacyBackupPath: '/lilico_backup.json',
    backupPath: '/frw_backup_v2.json',
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

/** Return a 409 not_found response as Dropbox does for missing files */
function notFoundResponse(): Response {
  const body = JSON.stringify({
    error_summary: 'path/not_found/.',
    error: { '.tag': 'path', path: { '.tag': 'not_found' } },
  });
  return {
    ok: false,
    status: 409,
    statusText: 'Conflict',
    json: () => Promise.resolve(JSON.parse(body)),
    text: () => Promise.resolve(body),
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: () => notFoundResponse(),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
  } as Response;
}

const mockFetch = vi.fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>();

describe('DropboxProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  it('has correct provider type', () => {
    const provider = new DropboxProvider(makeConfig());
    expect(provider.provider).toBe(CloudProvider.Dropbox);
  });

  it('loadBackups() returns empty array when no files exist', async () => {
    const provider = new DropboxProvider(makeConfig());

    // Both v2 and v1 get_metadata return 409 not_found
    mockFetch.mockResolvedValueOnce(notFoundResponse()); // v2 get_metadata
    mockFetch.mockResolvedValueOnce(notFoundResponse()); // v1 get_metadata

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

    const provider = new DropboxProvider(makeConfig());

    // v2 get_metadata returns metadata (file exists)
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        '.tag': 'file',
        name: 'frw_backup_v2.json',
        path_lower: '/frw_backup_v2.json',
      })
    );
    // v2 file download
    mockFetch.mockResolvedValueOnce(textResponse(JSON.stringify(backupFile)));

    const result = await provider.loadBackups();
    expect(result).toEqual(entries);
    expect(result[0].username).toBe('testuser');
    expect(result[0].version).toBe(BackupVersion.V2);
  });

  it('loadBackups() falls back to v1 file', async () => {
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

    const provider = new DropboxProvider(makeConfig());

    // v2 get_metadata returns not_found
    mockFetch.mockResolvedValueOnce(notFoundResponse());
    // v1 get_metadata returns metadata (file exists)
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        '.tag': 'file',
        name: 'lilico_backup.json',
        path_lower: '/lilico_backup.json',
      })
    );
    // v1 file download — JSON-wrapped hex string
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

  it('saveBackups() uploads to backupPath', async () => {
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

    const provider = new DropboxProvider(makeConfig());

    // Upload response
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        '.tag': 'file',
        name: 'frw_backup_v2.json',
        path_lower: '/frw_backup_v2.json',
      })
    );

    await provider.saveBackups(entries);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [uploadUrl, uploadInit] = mockFetch.mock.calls[0];
    expect(uploadUrl).toContain('content.dropboxapi.com/2/files/upload');
    expect(uploadInit?.method).toBe('POST');

    const dropboxApiArg = (uploadInit?.headers as Record<string, string>)['Dropbox-API-Arg'];
    expect(dropboxApiArg).toContain('/frw_backup_v2.json');
    expect(dropboxApiArg).toContain('overwrite');

    const body = uploadInit?.body as string;
    expect(body).toContain('"formatVersion":1');
    expect(body).toContain('"username":"alice"');
  });
});
