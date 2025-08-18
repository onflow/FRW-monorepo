import type { CadenceService, PlatformSpec } from '@onflow/frw-context';
import type { WalletAccountsResponse } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

/**
 * Modern FlowService factory that accepts dependencies via parameters
 * Recommended approach when using ServiceProvider + hooks
 */
export class FlowServiceFactory {
  private cadenceService: CadenceService;
  private platform: PlatformSpec;

  constructor(cadenceService: CadenceService, platform: PlatformSpec) {
    this.cadenceService = cadenceService;
    this.platform = platform;
  }

  /**
   * Get CoA (Cadence Owned Account) balance for a Flow address
   * This is a demo method - implement with actual cadence service calls
   */
  async getCoaBalance(flowAddress: string): Promise<string> {
    try {
      logger.debug('[FlowServiceFactory] Getting CoA balance for address:', flowAddress);

      // TODO: Use the injected cadence service to call the appropriate script
      // const balance = await this.cadenceService.someBalanceMethod(flowAddress);

      logger.debug('[FlowServiceFactory] CoA balance retrieved (mock)');
      return '0.0'; // Mock value for now
    } catch (error) {
      logger.error('[FlowServiceFactory] Failed to get CoA balance:', error);
      throw error;
    }
  }

  /**
   * Get EVM balance for an address
   * This is a demo method - implement with actual cadence service calls
   */
  async getEvmBalance(evmAddress: string): Promise<string> {
    try {
      logger.debug('[FlowServiceFactory] Getting EVM balance for address:', evmAddress);

      // TODO: Use the injected cadence service to call the appropriate script
      // const balance = await this.cadenceService.someEvmBalanceMethod(evmAddress);

      logger.debug('[FlowServiceFactory] EVM balance retrieved (mock)');
      return '0.0'; // Mock value for now
    } catch (error) {
      logger.error('[FlowServiceFactory] Failed to get EVM balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet accounts from the platform
   */
  async getWalletAccounts(): Promise<WalletAccountsResponse> {
    try {
      logger.debug('[FlowServiceFactory] Getting wallet accounts');

      const accounts = await this.platform.getWalletAccounts();

      logger.debug('[FlowServiceFactory] Wallet accounts retrieved:', accounts);
      return accounts;
    } catch (error) {
      logger.error('[FlowServiceFactory] Failed to get wallet accounts:', error);
      throw error;
    }
  }

  /**
   * Initialize the service if needed
   */
  async initialize(): Promise<void> {
    try {
      logger.debug('[FlowServiceFactory] Initializing FlowService');
      // Initialization logic if needed
      logger.debug('[FlowServiceFactory] FlowService initialized successfully');
    } catch (error) {
      logger.error('[FlowServiceFactory] Failed to initialize FlowService:', error);
      throw error;
    }
  }
}

/**
 * Create a FlowService instance with injected dependencies
 * Recommended usage pattern:
 *
 * const MyComponent = () => {
 *   const cadence = useCadence();
 *   const platform = usePlatform();
 *   const flowService = useMemo(() => new FlowServiceFactory(cadence, platform), [cadence, platform]);
 *
 *   // Use flowService...
 * };
 */
export const createFlowService = (
  cadenceService: CadenceService,
  platform: PlatformSpec
): FlowServiceFactory => {
  return new FlowServiceFactory(cadenceService, platform);
};
