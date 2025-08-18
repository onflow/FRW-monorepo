import { configureApiEndpoints } from '@onflow/frw-api';
import { createCadenceService, type CadenceService } from '@onflow/frw-cadence';
import { createLogger, setGlobalLogger, type Logger } from '@onflow/frw-utils';

import type { PlatformSpec } from './interfaces/PlatformSpec';
import type { Storage } from './interfaces/Storage';

// Global singleton instance
let globalServiceContainer: ServiceContainer | null = null;

/**
 * Service container for non-React applications
 * Contains all initialized services
 */
export interface ServiceContainer {
  platform: PlatformSpec;
  cadence: CadenceService;
  storage: Storage;
  logger: Logger;
  isDebug: boolean;
}

/**
 * Get or create singleton services for non-React applications
 * Once initialized, returns the same instance on subsequent calls
 *
 * @param platform - Platform implementation (required on first call, optional afterwards)
 * @returns Service container with all initialized services
 *
 * @example
 * ```typescript
 * // Initialize singleton (first call)
 * const platform = new MyPlatformImpl();
 * const services = createServices(platform);
 *
 * // Get existing singleton (subsequent calls)
 * const sameServices = createServices(); // platform is optional
 *
 * // Both services === sameServices (same instance)
 *
 * // For testing - reset and reinitialize
 * createServices.reset();
 * const newServices = createServices(newPlatform);
 * ```
 */
export function createServices(platform?: PlatformSpec): ServiceContainer {
  if (!globalServiceContainer) {
    if (!platform) {
      throw new Error('Platform is required for the first call to createServices()');
    }
    globalServiceContainer = createServiceContainer(platform);
  }
  return globalServiceContainer;
}

/**
 * Reset global services (useful for testing)
 * Forces re-initialization on next createServices() call
 */
createServices.reset = (): void => {
  globalServiceContainer = null;
};

/**
 * Create service container for React context (non-singleton)
 * This doesn't affect global state and is suitable for React components
 *
 * @internal This function is used by ServiceProvider and should not be called directly
 * @param platform - Platform implementation
 * @returns Service container with initialized services (independent instance)
 */
export function createServiceContainer(platform: PlatformSpec): ServiceContainer {
  // Configure API endpoints from platform
  configureApiEndpoints(
    platform.getApiEndpoint(),
    platform.getGoApiEndpoint(),
    () => platform.getJWT(),
    () => platform.getNetwork()
  );

  // Create cadence service
  const cadence = createCadenceService(platform);

  // Get storage from platform
  const storage = platform.getStorage();

  // Create logger
  const logger = createLogger(platform, 'ServiceFactory');

  // Set global logger for other packages to use
  setGlobalLogger(platform);

  // Get debug flag
  const isDebug = platform.isDebug();

  logger.debug('Services initialized successfully (non-React)', platform.constructor.name);

  return {
    platform,
    cadence,
    storage,
    logger,
    isDebug,
  };
}
