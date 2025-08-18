// Core interfaces
export type { PlatformSpec } from './interfaces/PlatformSpec';
export type { Storage } from './interfaces/Storage';

// Re-export types for convenience
export type { CadenceService } from '@onflow/frw-cadence';

// Modern React Context API
export {
  ServiceProvider,
  useServiceContext,
  usePlatform,
  useCadence,
  useStorage,
  useLogger,
  useIsDebug,
  type ServiceContextValue,
  type ServiceProviderProps,
} from './ServiceContext';

// Non-React API for standalone/vanilla JS projects
export { createServices, type ServiceContainer } from './ServiceFactory';
