import { CadenceService } from '@onflow/frw-cadence';

import { consoleError, consoleWarn } from '@/shared/utils';

// Define the bridge interface
interface CadenceBridge {
  getNetwork(): string;
  configureCadenceService(service: CadenceService): void;
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void;
  isDebug(): boolean;
}

// Global cadence service instance
let cadenceServiceInstance: CadenceService | null = null;

// Bridge implementation that integrates with existing FCL configuration
const cadenceBridge: CadenceBridge = {
  getNetwork: () => {
    // This should be called after userWallet is initialized
    // For now, return a default - this will be updated when userWallet is available
    return 'mainnet';
  },

  configureCadenceService: (service: CadenceService) => {
    // Add extension-specific interceptors here
    service.useRequestInterceptor(async (config) => {
      // Note: FCL configuration is handled by the existing fclConfig.ts
      // The createCadenceService will call configureFCL, but we don't need to duplicate it here
      // since the extension already has its own FCL configuration system

      // Add authentication, analytics, or other request processing
      return config;
    });

    service.useResponseInterceptor(async (config, response) => {
      // Add response processing, error handling, analytics
      return { config, response };
    });
  },

  // BridgeLogger interface methods
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]) => {
    const prefix = '[CadenceService]';
    switch (level) {
      case 'debug':
        console.log(`${prefix} ${message}`, ...args);
        break;
      case 'info':
        console.log(`${prefix} ${message}`, ...args);
        break;
      case 'warn':
        consoleWarn(`${prefix} ${message}`, ...args);
        break;
      case 'error':
        consoleError(`${prefix} ${message}`, ...args);
        break;
    }
  },

  isDebug: () => {
    return process.env.NODE_ENV === 'development';
  },
};

/**
 * Get or create the cadence service instance
 * This ensures we have a single instance across the extension
 */
export function getCadenceService(): CadenceService {
  if (!cadenceServiceInstance) {
    // Create the service without the automatic FCL configuration
    // since the extension handles FCL configuration separately
    const network = cadenceBridge.getNetwork() as 'mainnet' | 'testnet';

    // Create service directly to avoid FCL configuration conflicts
    cadenceServiceInstance = new CadenceService();

    // Add the bridge interceptors manually
    cadenceBridge.configureCadenceService(cadenceServiceInstance);

    // Add basic response interceptor for logging
    cadenceServiceInstance.useResponseInterceptor(async (config, response) => {
      try {
        cadenceBridge.log('debug', 'cadenceService response', response);
      } catch {
        // Fallback if logger not available
        // Do nothing in this case - logging is optional
      }
      return { config, response };
    });
  }
  return cadenceServiceInstance;
}

/**
 * Update the bridge to use the current network from userWallet
 * This should be called after userWallet is initialized
 */
export function updateCadenceBridgeNetwork(getNetworkFn: () => string): void {
  const originalGetNetwork = cadenceBridge.getNetwork;
  cadenceBridge.getNetwork = getNetworkFn;

  // If we already have a service instance, we might want to recreate it
  // with the new network configuration
  if (cadenceServiceInstance) {
    // For now, we'll just update the bridge
    // In a more sophisticated implementation, we might recreate the service
    console.log(
      '[CadenceBridge] Network updated, existing service will use new network on next request'
    );
  }
}

/**
 * Reset the cadence service instance (useful for testing or network changes)
 */
export function resetCadenceService(): void {
  cadenceServiceInstance = null;
}

/**
 * Recreate the cadence service instance (useful when network changes)
 */
export function recreateCadenceService(): void {
  resetCadenceService();
  getCadenceService(); // This will create a new instance
}

// Export the bridge for testing or advanced usage
export { cadenceBridge };
export type { CadenceBridge };
