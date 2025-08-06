import { cadence as cadenceService, context, type PlatformSpec } from '@onflow/frw-context';
import type { WalletAccountsResponse } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

/**
 * Flow blockchain service using the existing CadenceService
 * This leverages the app's existing Cadence infrastructure for better compatibility
 */
class FlowService {
  private static instance: FlowService;
  private initialized: boolean = false;
  private bridge: PlatformSpec;

  private constructor(bridge: PlatformSpec) {
    this.bridge = bridge;
  }

  // Get singleton instance with bridge injection
  public static getInstance(bridge?: PlatformSpec): FlowService {
    if (!FlowService.instance) {
      let bridgeToUse = bridge;

      // If bridge is not provided, try to get it from ServiceContext
      if (!bridgeToUse) {
        try {
          bridgeToUse = context.bridge;
        } catch (error) {
          throw new Error('FlowService requires bridge parameter or initialized ServiceContext');
        }
      }

      FlowService.instance = new FlowService(bridgeToUse);
    }
    return FlowService.instance;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      // FCL configuration is handled by ServiceContext/CadenceService
      // We just need to ensure ServiceContext is available
      try {
        // Check if ServiceContext is initialized properly
        if (cadenceService) {
          this.initialized = true;
        }
      } catch {
        logger.error('FlowService: ServiceContext not initialized properly');
        throw new Error('FlowService requires initialized ServiceContext');
      }
    }
  }

  /**
   * Get the balance for any address (Flow or EVM)
   * Uses the existing CadenceService which handles both Flow and EVM addresses intelligently
   * @param address - The Flow or EVM address
   * @returns Promise<number> - Balance in FLOW tokens
   */
  async getCoaBalance(address: string): Promise<number> {
    try {
      await this.ensureInitialized();

      const result = await cadenceService.getFlowBalanceForAnyAccounts([address]);
      const balance = result[address];

      if (balance !== undefined && balance !== null) {
        return parseFloat(balance.toString());
      } else {
        // If no balance found, it might be an invalid address or no COA exists
        throw new Error('No balance found for address');
      }
    } catch (error) {
      logger.error('Error fetching balance via CadenceService', error);
      throw new Error(
        `Failed to fetch balance: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the EVM balance directly using EVM address
   * @param evmAddress - The EVM address (hex string with 0x prefix)
   * @returns Promise<number> - Balance in FLOW tokens
   */
  async getEvmBalance(evmAddress: string): Promise<number> {
    // The CadenceService handles both Flow and EVM addresses, so we can use the same method
    return this.getCoaBalance(evmAddress);
  }

  /**
   * Get the EVM balance directly using EVM address
   * @param evmAddress - The EVM address (hex string with 0x prefix)
   * @returns Promise<number> - Balance in FLOW tokens
   */
  async getWalletAccounts(): Promise<WalletAccountsResponse> {
    // The CadenceService handles both Flow and EVM addresses, so we can use the same method
    return this.bridge.getWalletAccounts();
  }

  /**
   * Get the EVM address for a Flow address
   * Note: This method is not implemented yet via CadenceService
   * For now, it returns null - this functionality can be added later if needed
   * @param flowAddress - The Flow address
   * @returns Promise<string | null> - The EVM address or null if no COA exists
   */
  async getEvmAddress(flowAddress: string): Promise<string | null> {
    // TODO: Implement this using CadenceService if needed
    // For now, return null since the main use case is balance fetching
    const address = await cadenceService.getAddr(flowAddress) || null
    return address;
  }
}

export default FlowService;
