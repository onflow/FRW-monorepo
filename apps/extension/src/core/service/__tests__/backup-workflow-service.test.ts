import { beforeEach, describe, expect, it, vi } from 'vitest';

import backupWorkflowService from '../backup-workflow';

const hoisted = vi.hoisted(() => {
  const mockWorkflow = {
    createBackup: vi.fn(),
    restoreBackup: vi.fn(),
    detectKeyWeightType: vi.fn(),
    deleteBackup: vi.fn(),
    hasBackup: vi.fn(),
    listBackups: vi.fn(),
    verifyPassword: vi.fn(),
    changePassword: vi.fn(),
  };

  const mockGoogleProvider = {
    hasPermission: vi.fn(),
    deleteAll: vi.fn(),
  };

  const BackupWorkflowMock = vi.fn().mockImplementation(() => mockWorkflow);
  const GoogleDriveProviderMock = vi.fn().mockImplementation(() => mockGoogleProvider);

  return {
    mockWorkflow,
    mockGoogleProvider,
    BackupWorkflowMock,
    GoogleDriveProviderMock,
  };
});

vi.mock('@onflow/frw-workflow', () => {
  class BackupError extends Error {
    code: string;

    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }

  return {
    BackupWorkflow: hoisted.BackupWorkflowMock,
    GoogleDriveProvider: hoisted.GoogleDriveProviderMock,
    CloudProvider: {
      GoogleDrive: 'google_drive',
    },
    KeyWeight: {
      Full: 1000,
      Partial: 500,
    },
    BackupType: {
      Google: 0,
    },
    BackupErrorCode: {
      NotFound: 'NOT_FOUND',
      ApiRegistrationFailed: 'API_REGISTRATION_FAILED',
    },
    BackupError,
  };
});

vi.mock('../authentication-service', () => ({
  default: {
    getAuth: vi.fn(() => ({
      currentUser: { uid: 'uid-123' },
    })),
  },
}));

vi.mock('../userWallet', () => ({
  default: {
    getCurrentAddress: vi.fn().mockResolvedValue('0x01'),
  },
}));

vi.mock('../openapi', () => ({
  default: {
    keyList: vi.fn().mockResolvedValue({ data: { result: [] } }),
  },
}));

describe('backupWorkflowService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    hoisted.mockWorkflow.createBackup.mockResolvedValue({ success: true });
    hoisted.mockWorkflow.restoreBackup.mockResolvedValue({ mnemonic: 'test mnemonic words' });
    hoisted.mockWorkflow.detectKeyWeightType.mockResolvedValue(500);
    hoisted.mockWorkflow.changePassword.mockResolvedValue({ updated: ['alice'], failed: [] });
    hoisted.mockWorkflow.verifyPassword.mockResolvedValue(true);
    hoisted.mockWorkflow.listBackups.mockResolvedValue([]);
    hoisted.mockGoogleProvider.hasPermission.mockResolvedValue(true);
    hoisted.mockGoogleProvider.deleteAll.mockResolvedValue(undefined);

    await backupWorkflowService.init({
      getAuthToken: vi.fn().mockResolvedValue('token'),
      backupName: 'frw_backup_v2',
      legacyBackupName: 'lilico_backup',
      legacyAesKey: 'aes-key',
      legacyIV: 'abcdefghijklmnop',
      walletConnectProjectId: 'wc-project-id',
    });
  });

  it('creates backup with resolved uid and key weight', async () => {
    await backupWorkflowService.createBackup('mnemonic words', 'alice', 'password');

    expect(hoisted.mockWorkflow.detectKeyWeightType).toHaveBeenCalledWith('0x01');
    expect(hoisted.mockWorkflow.createBackup).toHaveBeenCalledWith({
      mnemonic: 'mnemonic words',
      password: 'password',
      username: 'alice',
      uid: 'uid-123',
      keyWeight: 500,
      provider: 'google_drive',
    });
  });

  it('returns null when restore target is not found', async () => {
    const { BackupError, BackupErrorCode } = await import('@onflow/frw-workflow');
    hoisted.mockWorkflow.restoreBackup.mockRejectedValueOnce(
      new BackupError(BackupErrorCode.NotFound, 'not found')
    );

    const result = await backupWorkflowService.restoreBackup('alice', 'password');

    expect(result).toBeNull();
  });

  it('throws when selected profiles include undecryptable backups', async () => {
    hoisted.mockWorkflow.changePassword.mockResolvedValueOnce({
      updated: ['alice'],
      failed: ['bob'],
    });

    await expect(
      backupWorkflowService.setNewPassword('old-pass', 'new-pass', ['alice', 'bob'])
    ).rejects.toThrow('Failed to update password on selected profile backups');
  });

  it('maps backup entries into legacy-compatible list shape', async () => {
    hoisted.mockWorkflow.listBackups.mockResolvedValueOnce([
      {
        username: 'alice',
        uid: 'uid-1',
        version: '2.0',
        timestamp: 12345,
        data: 'encrypted',
      },
    ]);

    const result = await backupWorkflowService.loadBackupAccountLists();

    expect(result).toEqual([
      {
        username: 'alice',
        uid: 'uid-1',
        version: '2.0',
        time: '12345',
        data: 'encrypted',
      },
    ]);
  });
});
