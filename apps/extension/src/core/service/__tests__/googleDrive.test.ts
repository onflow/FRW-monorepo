import { beforeEach, describe, expect, it, vi } from 'vitest';

import googleDriveService from '../googleDrive';

describe('GoogleDriveService backup flows', () => {
  const validMnemonic = 'test test test test test test test test test test test junk';

  beforeEach(() => {
    vi.restoreAllMocks();
    googleDriveService.AES_KEY = 'extension-backup-key';
    googleDriveService.fileId = 'mock-file-id';
    googleDriveService.fileList = null;
  });

  it('updates only selected profile backups when changing password', async () => {
    const updateFileSpy = vi.spyOn(googleDriveService, 'updateFile').mockResolvedValue(undefined);
    vi.spyOn(googleDriveService, 'hasGooglePermission').mockResolvedValue(true);
    vi.spyOn(googleDriveService, 'loadBackup').mockResolvedValue([
      { username: 'alice', data: 'old-alice', version: '1.0', uid: '1', time: '1' },
      { username: 'bob', data: 'old-bob', version: '1.0', uid: '2', time: '1' },
    ]);

    const decryptSpy = vi.spyOn(googleDriveService, 'decrypt').mockImplementation((encrypted) => {
      if (encrypted === 'old-alice') {
        return validMnemonic;
      }
      throw new Error('decrypt should not be called for unselected profiles');
    });

    const encryptSpy = vi.spyOn(googleDriveService, 'encrypt');
    encryptSpy
      .mockImplementationOnce(() => 'alice-reencrypted')
      .mockImplementationOnce(() => 'full-payload-encrypted');

    const result = await googleDriveService.setNewPassword('old-password', 'new-password', [
      'alice',
    ]);

    expect(result).toBe(true);
    expect(decryptSpy).toHaveBeenCalledTimes(1);
    expect(decryptSpy).toHaveBeenCalledWith('old-alice', 'old-password');
    expect(encryptSpy).toHaveBeenCalledWith(validMnemonic, 'new-password');
    expect(updateFileSpy).toHaveBeenCalledWith('mock-file-id', 'full-payload-encrypted', false);
  });

  it('fails password change when Google permission is missing', async () => {
    vi.spyOn(googleDriveService, 'hasGooglePermission').mockResolvedValue(false);
    const updateFileSpy = vi.spyOn(googleDriveService, 'updateFile').mockResolvedValue(undefined);

    await expect(
      googleDriveService.setNewPassword('old-password', 'new-password', ['alice'])
    ).rejects.toThrow('Failed to update password on selected profile backups');

    expect(updateFileSpy).not.toHaveBeenCalled();
  });

  it('maps legacy userName field when loading backup account list', async () => {
    vi.spyOn(googleDriveService, 'loadBackup').mockResolvedValue([
      {
        userName: 'legacy-user',
        data: 'encrypted',
        version: '1.0',
        uid: null,
        time: null,
      } as any,
    ]);

    const result = await googleDriveService.loadBackupAccountLists();

    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('legacy-user');
  });

  it('returns false when backup mnemonic cannot be decrypted/validated', async () => {
    vi.spyOn(googleDriveService, 'loadBackup').mockResolvedValue([
      { username: 'alice', data: 'broken-data', version: '1.0', uid: '1', time: '1' },
    ]);
    vi.spyOn(googleDriveService, 'decrypt').mockImplementation(() => {
      throw new Error('decryption failed');
    });

    const result = await googleDriveService.testProfileBackupDecryption('alice', 'wrong-password');

    expect(result).toBe(false);
  });
});
