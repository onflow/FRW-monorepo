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
export { createBackupCrypto, detectCryptoVersion, LegacyCrypto, KeystoreCrypto } from './crypto';

// Providers
export { GoogleDriveProvider, type GoogleDriveConfig } from './providers/google-drive';
export { DropboxProvider, type DropboxConfig } from './providers/dropbox';

// Migration
export { migrateV1ToV2 } from './migration';

// Workflow
export { BackupWorkflow, type BackupWorkflowConfig } from './backup-workflow';
