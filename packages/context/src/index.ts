// Core interfaces
export type { PlatformSpec } from './interfaces/PlatformSpec';
export type { Storage } from './interfaces/Storage';
export type { Navigation } from './interfaces/Navigation';

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

// Navigation Context
export {
  NavigationContext,
  NavigationProvider,
  useNavigation,
  type NavigationProviderProps,
} from './NavigationContext';
