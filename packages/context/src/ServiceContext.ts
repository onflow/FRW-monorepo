import { configureApiEndpoints } from '@onflow/frw-api';
import { createCadenceService, type CadenceService } from '@onflow/frw-cadence';
import { createLogger, setGlobalLogger, type Logger } from '@onflow/frw-utils';

import type { Cache } from './interfaces/caching/Cache';
import type { Navigation } from './interfaces/Navigation';
import type { PlatformSpec } from './interfaces/PlatformSpec';
import type { Storage } from './interfaces/storage/Storage';
import type { ToastManager } from './interfaces/ToastManager';

/**
 * Service Context - Provides centralized access to all services
 * This context pattern allows packages to access services without direct dependency injection
 */
export class ServiceContext {
  private static instance: ServiceContext | null = null;
  private _bridge: PlatformSpec | null = null;
  private _cadenceService: CadenceService | null = null;
  private _storage: Storage | null = null;
  private _cache: Cache | null = null;
  private _navigation: Navigation | null = null;
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
  public static initialize(bridge: PlatformSpec): ServiceContext {
    if (!ServiceContext.instance) {
      ServiceContext.instance = new ServiceContext();
    }
    ServiceContext.instance._bridge = bridge;

    // Store storage, cache, and navigation instances from bridge
    ServiceContext.instance._storage = bridge.storage();
    ServiceContext.instance._cache = bridge.cache();
    ServiceContext.instance._navigation = bridge.navigation();

    // Configure API endpoints dynamically from bridge
    configureApiEndpoints(
      bridge.getApiEndpoint(),
      bridge.getGoApiEndpoint(),
      () => bridge.getJWT(),
      () => bridge.getNetwork()
    );

    // Create CadenceService with bridge configuration
    ServiceContext.instance._cadenceService = createCadenceService(bridge);

    // Set global logger for other packages to use
    setGlobalLogger(bridge);

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
  get bridge(): PlatformSpec {
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
   * Get the cache instance
   */
  get cache(): Cache {
    if (!this._cache) {
      throw new Error('Cache not available in ServiceContext');
    }
    return this._cache;
  }

  /**
   * Get the navigation instance
   */
  get navigation(): Navigation {
    if (!this._navigation) {
      throw new Error('Navigation not available in ServiceContext');
    }
    return this._navigation;
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

export const bridge = new Proxy({} as PlatformSpec, {
  get(target, prop): unknown {
    return ServiceContext.current().bridge[prop as keyof PlatformSpec];
  },
});

export const storage = new Proxy({} as Storage, {
  get(target, prop): unknown {
    return ServiceContext.current().storage[prop as keyof Storage];
  },
});

export const cache = new Proxy({} as Cache, {
  get(target, prop): unknown {
    return ServiceContext.current().cache[prop as keyof Cache];
  },
});

export const navigation = new Proxy({} as Navigation, {
  get(target, prop): unknown {
    return ServiceContext.current().navigation[prop as keyof Navigation];
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

export const toast = new Proxy({} as ToastManager, {
  get(target, prop): unknown {
    console.log('[Toast Proxy] Getting property:', prop);
    try {
      const bridge = ServiceContext.current().bridge;
      console.log('[Toast Proxy] Bridge available:', !!bridge);
      console.log('[Toast Proxy] Bridge has showToast:', !!bridge.showToast);

      // Check if bridge has toast methods
      if (prop === 'showToast' && bridge.showToast) {
        console.log('[Toast Proxy] Returning showToast function');
        return (toastMessage: {
          message: string;
          type?: 'success' | 'error' | 'warning' | 'info';
          duration?: number;
        }) => {
          console.log('[Toast Proxy] showToast called with:', toastMessage);
          bridge.showToast?.(toastMessage.message, toastMessage.type, toastMessage.duration);
        };
      }
      if (prop === 'setToastCallback' && bridge.setToastCallback) {
        console.log('[Toast Proxy] Returning setToastCallback function');
        return bridge.setToastCallback.bind(bridge);
      }
      // Return no-op if not available
      console.log('[Toast Proxy] Returning no-op function for:', prop);
      return (): void => {};
    } catch (error) {
      console.error('[Toast Proxy] Error:', error);
      // Return no-op functions if ServiceContext not available
      return (): void => {};
    }
  },
});

// Keep the old get* functions for backward compatibility but mark as deprecated
/** @deprecated Use `context` instead */
export const getServiceContext = (): ServiceContext => ServiceContext.current();
/** @deprecated Use `cadence` instead */
export const getCadenceService = (): CadenceService => context.cadence;
/** @deprecated Use `bridge` instead */
export const getBridge = (): PlatformSpec => context.bridge;
/** @deprecated Use `storage` instead */
export const getStorage = (): Storage => context.storage;
/** @deprecated Use `navigation` instead */
export const getNavigation = (): Navigation => context.navigation;
/** @deprecated Use `logger` instead */
export const getLogger = (): Logger => context.getLogger();
/** @deprecated Use `bridge.isDebug()` instead */
export const getIsDebug = (): boolean => context.isDebug;
