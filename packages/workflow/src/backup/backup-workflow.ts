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

  async createBackup(options: CreateBackupOptions): Promise<BackupResult> {
    const provider = this.getProvider(options.provider);
    const crypto = createBackupCrypto(BackupVersion.V2);

    const encryptedData = await crypto.encrypt(options.mnemonic, options.password);
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
      await this.api.registerBackup({ type: backupType, name: options.username });
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
      throw new BackupError(BackupErrorCode.NotFound, `No backup found for ${options.username}`);
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

  async deleteBackup(providerType: CloudProvider, username: string): Promise<void> {
    const provider = this.getProvider(providerType);
    const entries = await provider.loadBackups();
    const filtered = entries.filter((e) => e.username !== username);
    await provider.saveBackups(filtered);
  }

  async hasBackup(providerType: CloudProvider, username: string): Promise<boolean> {
    const entries = await this.listBackups(providerType);
    return entries.some((e) => e.username === username);
  }

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
        updatedEntries.push(entry);
      }
    }

    if (result.updated.length > 0) {
      await provider.saveBackups(updatedEntries);
    }

    return result;
  }

  async detectKeyWeightType(_address: string): Promise<KeyWeight> {
    const keys = await this.api.getUserKeys();
    const activeKeys = keys.filter((k) => !k.revoked);
    const maxWeight = Math.max(...activeKeys.map((k) => k.weight), 0);
    return maxWeight >= 1000 ? KeyWeight.Full : KeyWeight.Partial;
  }

  async migrateToV2(options: MigrationOptions): Promise<MigrationResult> {
    const result = await migrateV1ToV2(options);
    this.analytics?.trackMigrationCompleted(result);
    return result;
  }

  async startDeviceSync(options: DeviceSyncOptions): Promise<DeviceSyncSession> {
    const { createDeviceSyncSession } = await import('./device');
    return createDeviceSyncSession(options);
  }

  async getAllBackupStatuses(): Promise<
    Map<string, { providers: CloudProvider[]; version: BackupVersion; keyWeight: KeyWeight }>
  > {
    const statusMap = new Map<
      string,
      { providers: CloudProvider[]; version: BackupVersion; keyWeight: KeyWeight }
    >();

    for (const [providerType, provider] of Array.from(this.providers.entries())) {
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
        // Skip providers that fail
      }
    }

    return statusMap;
  }

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
