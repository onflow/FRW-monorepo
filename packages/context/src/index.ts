// Core interfaces
export type { PlatformSpec } from './interfaces/PlatformSpec';
export type { Storage } from './interfaces/Storage';

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
