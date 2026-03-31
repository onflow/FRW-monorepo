import { logger } from '@onflow/frw-context';
import {
  BackupError,
  BackupErrorCode,
  BackupVersion,
  type BackupType,
  BackupWorkflow,
  CloudProvider,
  createBackupCrypto,
  GoogleDriveProvider,
  KeyWeight,
  type BackupApi,
  type BackupEntry,
} from '@onflow/frw-workflow';

import authenticationService from './authentication-service';
import openapiService from './openapi';
import userWalletService from './userWallet';

type GetAuthToken = (interactive?: boolean) => Promise<string>;

class ExtensionBackupApiAdapter implements BackupApi {
  async registerBackup(backupInfo: { type: BackupType; name: string }): Promise<void> {
    // Extension legacy flow does not have a dedicated "register backup" endpoint yet.
    // Keep this non-blocking so cloud backup still succeeds.
    logger.info('[BackupWorkflow] registerBackup adapter is currently no-op', backupInfo);
  }

  async syncDeviceKey(
    accountKey: {
      public_key: string;
      sign_algo: number;
      hash_algo: number;
      weight: number;
    },
    signatures: unknown
  ): Promise<void> {
    // TODO: map to stable backend contract once API payload is finalized.
    logger.info(
      '[BackupWorkflow] syncDeviceKey adapter is currently no-op',
      accountKey,
      signatures
    );
  }

  async getUserKeys(): Promise<
    { weight: number; publicKey: string; index: number; revoked: boolean }[]
  > {
    const response = await openapiService.keyList();
    const keys = response?.data?.result ?? [];
    return keys.map((key) => ({
      weight: Number((key as any).weight ?? 0),
      publicKey: String((key as any).publicKey ?? (key as any).public_key ?? ''),
      index: Number((key as any).index ?? 0),
      revoked: Boolean((key as any).revoked),
    }));
  }
}

class BackupWorkflowService {
  private workflow: BackupWorkflow | null = null;
  private googleProvider: GoogleDriveProvider | null = null;

  init = async ({
    getAuthToken,
    backupName,
    legacyBackupName,
    legacyAesKey,
    legacyIV,
    walletConnectProjectId,
  }: {
    getAuthToken: GetAuthToken;
    backupName: string;
    legacyBackupName: string;
    legacyAesKey: string;
    legacyIV: string;
    walletConnectProjectId?: string;
  }) => {
    this.googleProvider = new GoogleDriveProvider({
      getAuthToken,
      backupName,
      legacyBackupName,
      legacyAesKey,
      legacyIV,
    });

    this.workflow = new BackupWorkflow({
      providers: new Map([[CloudProvider.GoogleDrive, this.googleProvider]]),
      api: new ExtensionBackupApiAdapter(),
      walletConnectProjectId: walletConnectProjectId || '',
    });
  };

  private getWorkflow(): BackupWorkflow {
    if (!this.workflow) {
      throw new Error('BackupWorkflowService not initialized');
    }
    return this.workflow;
  }

  private getGoogleProvider(): GoogleDriveProvider {
    if (!this.googleProvider) {
      throw new Error('BackupWorkflowService not initialized');
    }
    return this.googleProvider;
  }

  private resolveKeyWeight = async (): Promise<KeyWeight> => {
    const workflow = this.getWorkflow();
    try {
      const address = await userWalletService.getCurrentAddress();
      if (!address) {
        return KeyWeight.Full;
      }
      return await workflow.detectKeyWeightType(address);
    } catch (error) {
      logger.warn('[BackupWorkflow] detectKeyWeightType failed, fallback to full weight', error);
      return KeyWeight.Full;
    }
  };

  createBackup = async (mnemonic: string, username: string, password: string) => {
    const workflow = this.getWorkflow();
    const uid = authenticationService.getAuth().currentUser?.uid ?? null;
    const keyWeight = await this.resolveKeyWeight();
    logger.info('[BackupWorkflow] createBackup -> save V2 backup file', {
      username,
      targetProvider: CloudProvider.GoogleDrive,
      targetVersion: BackupVersion.V2,
    });
    const result = await workflow.createBackup({
      mnemonic,
      password,
      username,
      uid,
      keyWeight,
      provider: CloudProvider.GoogleDrive,
    });

    if (result.error === BackupErrorCode.ApiRegistrationFailed) {
      logger.warn('[BackupWorkflow] Backup saved but backend registration failed');
    }
    return result;
  };

  restoreBackup = async (username: string, password: string): Promise<string | null> => {
    const workflow = this.getWorkflow();
    try {
      const restored = await workflow.restoreBackup({
        username,
        password,
        provider: CloudProvider.GoogleDrive,
      });
      return restored.mnemonic;
    } catch (error) {
      if (error instanceof BackupError && error.code === BackupErrorCode.NotFound) {
        return null;
      }
      throw error;
    }
  };

  restoreBackupV2Only = async (username: string, password: string): Promise<string | null> => {
    const v2Backups = await this.listBackupsV2Only();
    const entry = v2Backups.find((item) => item.username === username);
    if (!entry) {
      return null;
    }

    const v2Crypto = createBackupCrypto(BackupVersion.V2);
    return v2Crypto.decrypt(entry.data, password);
  };

  hasGooglePermission = async (): Promise<boolean> => {
    const provider = this.getGoogleProvider();
    return provider.hasPermission();
  };

  deleteAllBackups = async (): Promise<void> => {
    const provider = this.getGoogleProvider();
    await provider.deleteAll();
  };

  deleteUserBackup = async (username: string): Promise<void> => {
    const workflow = this.getWorkflow();
    await workflow.deleteBackup(CloudProvider.GoogleDrive, username);
  };

  hasUserBackup = async (username: string): Promise<boolean> => {
    const workflow = this.getWorkflow();
    return workflow.hasBackup(CloudProvider.GoogleDrive, username);
  };

  listBackups = async (): Promise<BackupEntry[]> => {
    const workflow = this.getWorkflow();
    return workflow.listBackups(CloudProvider.GoogleDrive);
  };

  private listBackupsV2Only = async (): Promise<BackupEntry[]> => {
    const backups = await this.listBackups();
    const v2Backups = backups.filter((entry) => entry.version === BackupVersion.V2);
    logger.info('[BackupWorkflow] listBackupsV2Only', {
      total: backups.length,
      v2Only: v2Backups.length,
    });
    return v2Backups;
  };

  loadBackupAccounts = async (): Promise<string[]> => {
    const backups = await this.listBackups();
    return backups.map((entry) => entry.username);
  };

  loadBackupAccountsV2Only = async (): Promise<string[]> => {
    const backups = await this.listBackupsV2Only();
    return backups.map((entry) => entry.username);
  };

  loadBackupAccountLists = async (): Promise<
    { username: string; uid: string | null; version: string; time: string; data: string }[]
  > => {
    const backups = await this.listBackups();
    return backups.map((entry) => ({
      username: entry.username,
      uid: entry.uid,
      version: entry.version,
      time: String(entry.timestamp),
      data: entry.data,
    }));
  };

  testProfileBackupDecryption = async (username: string, password: string): Promise<boolean> => {
    const workflow = this.getWorkflow();
    return workflow.verifyPassword(CloudProvider.GoogleDrive, username, password);
  };

  setNewPassword = async (
    oldPassword: string,
    newPassword: string,
    profileUsernames: string[]
  ): Promise<boolean> => {
    const workflow = this.getWorkflow();
    const result = await workflow.changePassword({
      provider: CloudProvider.GoogleDrive,
      oldPassword,
      newPassword,
      usernames: profileUsernames,
    });

    if (result.failed.length > 0) {
      throw new Error('Failed to update password on selected profile backups');
    }
    return true;
  };
}

export default new BackupWorkflowService();
