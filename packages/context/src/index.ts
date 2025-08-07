// Core interfaces
export type { PlatformSpec } from './interfaces/PlatformSpec';
export type { Storage } from './interfaces/Storage';

// Platform types and utilities
export {
  PlatformType,
  Platform,
  type PlatformInfo,
  type PlatformDetector,
} from './interfaces/Platform';

// Service Context
export {
  bridge,
  cadence,
  context,
  getBridge,
  getCadenceService,
  getServiceContext,
  getStorage,
  logger,
  ServiceContext,
  storage,
} from './ServiceContext';
