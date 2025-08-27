// Core interfaces
export type { PlatformSpec } from './interfaces/PlatformSpec';
export type { Storage } from './interfaces/storage/Storage';
export type { Navigation } from './interfaces/Navigation';
export type { StorageKeyMap, StorageData } from './interfaces/storage/StorageKeyMap';
export type {
  Migration,
  MigrationManager,
  MigrationConfig,
  MigrationRecord,
  MigrationStrategy,
  MigrationSummary,
} from './interfaces/storage/Migration';
export { StorageMigrationManager } from './interfaces/storage/MigrationManager';
export { DEFAULT_MIGRATION_STRATEGY } from './interfaces/storage/Migration';

// Service Context
export {
  bridge,
  cadence,
  context,
  getBridge,
  getCadenceService,
  getNavigation,
  getServiceContext,
  getStorage,
  logger,
  navigation,
  ServiceContext,
  storage,
} from './ServiceContext';
