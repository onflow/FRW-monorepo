import type { BridgeSpec } from './interfaces/BridgeSpec';
import type { Storage } from './interfaces/Storage';
import { createCadenceService } from '@onflow/frw-workflow';
import type { CadenceService } from '@onflow/frw-cadence';
import { configureApiEndpoints } from '@onflow/frw-api';

/**
 * Service Context - Provides centralized access to all services
 * This context pattern allows packages to access services without direct dependency injection
 */
export class ServiceContext {
  private static instance: ServiceContext | null = null;
  private _bridge: BridgeSpec | null = null;
  private _cadenceService: CadenceService | null = null;
  private _storage: Storage | null = null;

  private constructor() {}

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
    const network = bridge.getNetwork() as 'mainnet' | 'testnet';
    ServiceContext.instance._cadenceService = createCadenceService(network, bridge);
    
    console.log('[ServiceContext] Initialized with bridge:', bridge.constructor.name);
    return ServiceContext.instance;
  }

  /**
   * Get the current service context instance
   * @throws Error if not initialized
   */
  public static current(): ServiceContext {
    if (!ServiceContext.instance) {
      throw new Error('ServiceContext not initialized. Call ServiceContext.initialize(bridge) first.');
    }
    if (!ServiceContext.instance._bridge) {
      throw new Error('ServiceContext bridge not set. Call ServiceContext.initialize(bridge) first.');
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
}

// Convenience functions for easy access across packages
export const getServiceContext = () => ServiceContext.current();
export const getCadenceService = () => getServiceContext().cadence;
export const getBridge = () => getServiceContext().bridge;
export const getStorage = () => getServiceContext().storage;