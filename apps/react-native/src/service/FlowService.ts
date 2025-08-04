import { cadenceService, configureFCL } from '@/network/cadence';
import NativeFRWBridge from '@/bridge/NativeFRWBridge';

/**
 * Flow blockchain service using the existing CadenceService
 * This leverages the app's existing Cadence infrastructure for better compatibility
 */
class FlowService {
  private static instance: FlowService;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): FlowService {
    if (!FlowService.instance) {
      FlowService.instance = new FlowService();
    }
    return FlowService.instance;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      try {
        const network = await NativeFRWBridge.getNetwork();
        configureFCL(network as 'mainnet' | 'testnet');
        this.initialized = true;
      } catch {
        console.warn('[FlowService] Failed to get network from bridge, using mainnet');
        configureFCL('mainnet');
        this.initialized = true;
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
      console.error('Error fetching balance via CadenceService:', error);
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
   * Get the EVM address for a Flow address
   * Note: This method is not implemented yet via CadenceService
   * For now, it returns null - this functionality can be added later if needed
   * @param flowAddress - The Flow address
   * @returns Promise<string | null> - The EVM address or null if no COA exists
   */
  async getEvmAddress(_flowAddress: string): Promise<string | null> {
    // TODO: Implement this using CadenceService if needed
    // For now, return null since the main use case is balance fetching
    console.warn('[FlowService] getEvmAddress not yet implemented via CadenceService');
    return null;
  }
}

export default FlowService;
