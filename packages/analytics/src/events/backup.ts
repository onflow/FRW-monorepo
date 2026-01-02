import type { Analytics } from '../analytics.js';
import type { BackupEvents } from '../types.js';

export class BackupTracker {
  constructor(private analytics: Analytics) {}

  async trackRecoveryPhraseBackupCreated(
    params: BackupEvents['recoveryPhraseBackupCreated']
  ): Promise<void> {
    await this.analytics.track('recoveryPhraseBackupCreated', params);
  }

  async trackDeviceBackupCreated(params: BackupEvents['deviceBackupCreated']): Promise<void> {
    await this.analytics.track('deviceBackupCreated', params);
  }

  async trackCloudBackupCreated(params: BackupEvents['cloudBackupCreated']): Promise<void> {
    await this.analytics.track('cloudBackupCreated', params);
  }

  // Convenience methods for specific platforms
  async trackiOSRecoveryPhraseBackup(address: string): Promise<void> {
    await this.trackRecoveryPhraseBackupCreated({
      address: address,
      platform: 'iOS',
    });
  }

  async trackAndroidRecoveryPhraseBackup(address: string): Promise<void> {
    await this.trackRecoveryPhraseBackupCreated({
      address: address,
      platform: 'Android',
    });
  }

  async trackExtensionRecoveryPhraseBackup(address: string): Promise<void> {
    await this.trackRecoveryPhraseBackupCreated({
      address: address,
      platform: 'Extension',
    });
  }

  async trackiOSDeviceBackup(address: string): Promise<void> {
    await this.trackDeviceBackupCreated({
      address: address,
      platform: 'iOS',
    });
  }

  async trackAndroidDeviceBackup(address: string): Promise<void> {
    await this.trackDeviceBackupCreated({
      address: address,
      platform: 'Android',
    });
  }

  async trackExtensionDeviceBackup(address: string): Promise<void> {
    await this.trackDeviceBackupCreated({
      address: address,
      platform: 'Extension',
    });
  }

  async trackiCloudBackup(address: string, providers?: string[]): Promise<void> {
    await this.trackCloudBackupCreated({
      address: address,
      platform: 'iOS',
      providers: providers || ['iCloud'],
    });
  }

  async trackGoogleDriveBackup(address: string, providers?: string[]): Promise<void> {
    await this.trackCloudBackupCreated({
      address: address,
      platform: 'Android',
      providers: providers || ['GoogleDrive'],
    });
  }

  async trackMultiCloudBackup(
    address: string,
    platform: BackupEvents['cloudBackupCreated']['platform'],
    providers: string[]
  ): Promise<void> {
    await this.trackCloudBackupCreated({
      address: address,
      platform: platform,
      providers: providers,
    });
  }

  createBackupSession(
    address: string,
    platform: BackupEvents['recoveryPhraseBackupCreated']['platform']
  ) {
    return new BackupSession(this.analytics, address, platform);
  }

  createMultiBackupSession(address: string) {
    return new MultiBackupSession(this.analytics, address);
  }
}

export class BackupSession {
  private sessionId = `backup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  private startTime = Date.now();
  private backupSteps: Array<{
    type: 'recovery_phrase' | 'device' | 'cloud';
    timestamp: number;
    success: boolean;
    providers?: string[];
  }> = [];

  constructor(
    private analytics: Analytics,
    private address: string,
    private platform: BackupEvents['recoveryPhraseBackupCreated']['platform']
  ) {}

  async recoveryPhraseBackupCompleted(success = true): Promise<void> {
    await this.analytics.track('recoveryPhraseBackupCreated', {
      address: this.address,
      platform: this.platform,
      sessionId: this.sessionId,
      success: success,
    });

    this.backupSteps.push({
      type: 'recovery_phrase',
      timestamp: Date.now(),
      success: success,
    });
  }

  async deviceBackupCompleted(success = true): Promise<void> {
    await this.analytics.track('deviceBackupCreated', {
      address: this.address,
      platform: this.platform,
      sessionId: this.sessionId,
      success: success,
    });

    this.backupSteps.push({
      type: 'device',
      timestamp: Date.now(),
      success: success,
    });
  }

  async cloudBackupCompleted(providers: string[], success = true): Promise<void> {
    await this.analytics.track('cloudBackupCreated', {
      address: this.address,
      platform: this.platform,
      providers: providers,
      sessionId: this.sessionId,
      success: success,
    });

    this.backupSteps.push({
      type: 'cloud',
      timestamp: Date.now(),
      success: success,
      providers: providers,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getAddress(): string {
    return this.address;
  }

  getPlatform(): BackupEvents['recoveryPhraseBackupCreated']['platform'] {
    return this.platform;
  }

  getCompletedBackupTypes(): Array<'recovery_phrase' | 'device' | 'cloud'> {
    return this.backupSteps.filter((step) => step.success).map((step) => step.type);
  }

  getBackupSteps(): Array<{
    type: 'recovery_phrase' | 'device' | 'cloud';
    timestamp: number;
    success: boolean;
    providers?: string[];
  }> {
    return [...this.backupSteps];
  }

  hasCompletedAllBackups(): boolean {
    const completedTypes = this.getCompletedBackupTypes();
    return (
      completedTypes.includes('recovery_phrase') &&
      completedTypes.includes('device') &&
      completedTypes.includes('cloud')
    );
  }
}

export class MultiBackupSession {
  private sessionId = `multiBackup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  private startTime = Date.now();
  private platformBackups: Map<
    BackupEvents['recoveryPhraseBackupCreated']['platform'],
    {
      platform: BackupEvents['recoveryPhraseBackupCreated']['platform'];
      backups: Array<{
        type: 'recovery_phrase' | 'device' | 'cloud';
        timestamp: number;
        success: boolean;
        providers?: string[];
      }>;
    }
  > = new Map();

  constructor(
    private analytics: Analytics,
    private address: string
  ) {}

  async createPlatformBackup(
    platform: BackupEvents['recoveryPhraseBackupCreated']['platform'],
    backupType: 'recovery_phrase' | 'device' | 'cloud',
    providers?: string[]
  ): Promise<void> {
    const eventData = {
      address: this.address,
      platform: platform,
      sessionId: this.sessionId,
      providers: providers,
    };

    // Track the specific backup event
    switch (backupType) {
      case 'recovery_phrase':
        await this.analytics.track('recoveryPhraseBackupCreated', eventData);
        break;
      case 'device':
        await this.analytics.track('deviceBackupCreated', eventData);
        break;
      case 'cloud':
        await this.analytics.track('cloudBackupCreated', eventData);
        break;
    }

    // Update internal tracking
    if (!this.platformBackups.has(platform)) {
      this.platformBackups.set(platform, {
        platform: platform,
        backups: [],
      });
    }

    const platformData = this.platformBackups.get(platform)!;
    platformData.backups.push({
      type: backupType,
      timestamp: Date.now(),
      success: true,
      providers: providers,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getAddress(): string {
    return this.address;
  }

  getPlatformsWithBackups(): Array<BackupEvents['recoveryPhraseBackupCreated']['platform']> {
    return Array.from(this.platformBackups.keys()) as Array<
      BackupEvents['recoveryPhraseBackupCreated']['platform']
    >;
  }

  getTotalBackupsCreated(): number {
    return Array.from(this.platformBackups.values()).reduce(
      (total, platform) => total + platform.backups.length,
      0
    );
  }

  hasMultiPlatformRedundancy(): boolean {
    return this.platformBackups.size > 1;
  }

  getBackupSummary(): {
    totalPlatforms: number;
    totalBackups: number;
    recoveryPhraseBackups: number;
    deviceBackups: number;
    cloudBackups: number;
    cloudProviders: string[];
  } {
    let recoveryPhraseBackups = 0;
    let deviceBackups = 0;
    let cloudBackups = 0;
    const cloudProviders: string[] = [];

    for (const platformData of this.platformBackups.values()) {
      for (const backup of platformData.backups) {
        switch (backup.type) {
          case 'recovery_phrase':
            recoveryPhraseBackups++;
            break;
          case 'device':
            deviceBackups++;
            break;
          case 'cloud':
            cloudBackups++;
            if (backup.providers) {
              cloudProviders.push(...backup.providers);
            }
            break;
        }
      }
    }

    return {
      totalPlatforms: this.platformBackups.size,
      totalBackups: this.getTotalBackupsCreated(),
      recoveryPhraseBackups,
      deviceBackups,
      cloudBackups,
      cloudProviders: [...new Set(cloudProviders)],
    };
  }
}
