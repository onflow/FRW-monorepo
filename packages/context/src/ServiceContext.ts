import { configureApiEndpoints } from '@onflow/frw-api';
import { createCadenceService, type CadenceService } from '@onflow/frw-cadence';
import { createLogger, type Logger } from '@onflow/frw-utils';

import type { BridgeSpec } from './interfaces/BridgeSpec';
import type { Storage } from './interfaces/Storage';

/**
 * Service Context - Provides centralized access to all services
 * This context pattern allows packages to access services without direct dependency injection
 */
export class ServiceContext {
  private static instance: ServiceContext | null = null;
  private _bridge: BridgeSpec | null = null;
  private _cadenceService: CadenceService | null = null;
  private _storage: Storage | null = null;
  private _logger: Logger | null = null;

  private constructor() {}

  private get logger(): Logger {
    if (!this._logger && this._bridge) {
      this._logger = createLogger(this._bridge, 'ServiceContext');
    }
    // Return a no-op logger if not available instead of throwing
    if (!this._logger) {
      const noOpLogger = {
        debug: (): void => {},
        info: (): void => {},
        warn: (): void => {},
        error: (): void => {},
        get isDebug(): boolean {
          return false;
        },
      };
      return noOpLogger as unknown as Logger;
    }
    return this._logger;
  }

  /**
   * Initialize the service context with bridge
   * Should be called once at application startup
   */
  public static initialize(bridge: BridgeSpec): ServiceContext {
    if (!ServiceContext.instance) {
      ServiceContext.instance = new ServiceContext();
    }
    ServiceContext.instance._bridge = bridge;

    // Store storage instance from bridge
    ServiceContext.instance._storage = bridge.getStorage();

    // Configure API endpoints dynamically from bridge
    configureApiEndpoints(
      bridge.getApiEndpoint(),
      bridge.getGoApiEndpoint(),
      () => bridge.getJWT(),
      () => bridge.getNetwork()
    );

    // Create CadenceService with bridge configuration
    ServiceContext.instance._cadenceService = createCadenceService(bridge);

    ServiceContext.instance.logger.debug('Initialized with bridge', bridge.constructor.name);
    return ServiceContext.instance;
  }

  /**
   * Get the current service context instance
   * @throws Error if not initialized
   */
  public static current(): ServiceContext {
    if (!ServiceContext.instance) {
      throw new Error(
        'ServiceContext not initialized. Call ServiceContext.initialize(bridge) first.'
      );
    }
    if (!ServiceContext.instance._bridge) {
      throw new Error(
        'ServiceContext bridge not set. Call ServiceContext.initialize(bridge) first.'
      );
    }
    return ServiceContext.instance;
  }

  /**
   * Check if context is initialized
   */
  public static isInitialized(): boolean {
    return ServiceContext.instance !== null && ServiceContext.instance._bridge !== null;
  }

  /**
   * Reset context (for testing)
   */
  public static reset(): void {
    ServiceContext.instance = null;
  }

  /**
   * Get the CadenceService instance
   */
  get cadence(): CadenceService {
    if (!this._cadenceService) {
      throw new Error('CadenceService not available in ServiceContext');
    }
    return this._cadenceService;
  }

  /**
   * Get the current bridge instance
   */
  get bridge(): BridgeSpec {
    if (!this._bridge) {
      throw new Error('Bridge not available in ServiceContext');
    }
    return this._bridge;
  }

  /**
   * Get the storage instance
   */
  get storage(): Storage {
    if (!this._storage) {
      throw new Error('Storage not available in ServiceContext');
    }
    return this._storage;
  }

  /**
   * Get the logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }

  /**
   * Get debug flag from bridge
   */
  get isDebug(): boolean {
    if (!this._bridge) {
      throw new Error('Bridge not available in ServiceContext');
    }
    return this._bridge.isDebug();
  }
}

// Create global proxy instances for easy access across packages
export const context = new Proxy({} as ServiceContext, {
  get(target, prop): unknown {
    return ServiceContext.current()[prop as keyof ServiceContext];
  },
});

export const cadence = new Proxy({} as CadenceService, {
  get(target, prop): unknown {
    return ServiceContext.current().cadence[prop as keyof CadenceService];
  },
});

export const bridge = new Proxy({} as BridgeSpec, {
  get(target, prop): unknown {
    return ServiceContext.current().bridge[prop as keyof BridgeSpec];
  },
});

export const storage = new Proxy({} as Storage, {
  get(target, prop): unknown {
    return ServiceContext.current().storage[prop as keyof Storage];
  },
});

export const logger = new Proxy({} as Logger, {
  get(target, prop): unknown {
    try {
      return ServiceContext.current().getLogger()[prop as keyof Logger];
    } catch {
      // Return no-op functions if ServiceContext not available
      return prop === 'isDebug' ? false : (): void => {};
    }
  },
});

// Keep the old get* functions for backward compatibility but mark as deprecated
/** @deprecated Use `context` instead */
export const getServiceContext = (): ServiceContext => ServiceContext.current();
/** @deprecated Use `cadence` instead */
export const getCadenceService = (): CadenceService => context.cadence;
/** @deprecated Use `bridge` instead */
export const getBridge = (): BridgeSpec => context.bridge;
/** @deprecated Use `storage` instead */
export const getStorage = (): Storage => context.storage;
/** @deprecated Use `logger` instead */
export const getLogger = (): Logger => context.getLogger();
/** @deprecated Use `bridge.isDebug()` instead */
export const getIsDebug = (): boolean => context.isDebug;
