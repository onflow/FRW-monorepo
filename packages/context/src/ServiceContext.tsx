import type { CadenceService } from '@onflow/frw-cadence';
import type { Logger } from '@onflow/frw-utils';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { PlatformSpec } from './interfaces/PlatformSpec';
import type { Storage } from './interfaces/Storage';
import { createServiceContainer } from './ServiceFactory';

/**
 * Service context value - Contains all initialized services
 */
export interface ServiceContextValue {
  platform: PlatformSpec;
  cadence: CadenceService;
  storage: Storage;
  logger: Logger;
  isDebug: boolean;
}

/**
 * React context for services
 */
const ServiceReactContext = createContext<ServiceContextValue | null>(null);

/**
 * Service Provider Props
 */
export interface ServiceProviderProps {
  platform: PlatformSpec;
  children: ReactNode;
}

/**
 * Service Provider - Provides all services via React Context
 * Platform should be pre-configured with all necessary implementations
 */
export const ServiceProvider = ({ platform, children }: ServiceProviderProps) => {
  const services = useMemo(() => createServiceContainer(platform), [platform]);

  return <ServiceReactContext.Provider value={services}>{children}</ServiceReactContext.Provider>;
};

/**
 * Hook to get the service context
 * @throws Error if used outside ServiceProvider
 */
export const useServiceContext = (): ServiceContextValue => {
  const context = useContext(ServiceReactContext);
  if (!context) {
    throw new Error('useServiceContext must be used within a ServiceProvider');
  }
  return context;
};

/**
 * Hook to get the platform service
 */
export const usePlatform = (): PlatformSpec => {
  return useServiceContext().platform;
};

/**
 * Hook to get the cadence service
 */
export const useCadence = (): CadenceService => {
  return useServiceContext().cadence;
};

/**
 * Hook to get the storage service
 */
export const useStorage = (): Storage => {
  return useServiceContext().storage;
};

/**
 * Hook to get the logger service
 */
export const useLogger = (): Logger => {
  return useServiceContext().logger;
};

/**
 * Hook to get the debug flag
 */
export const useIsDebug = (): boolean => {
  return useServiceContext().isDebug;
};
