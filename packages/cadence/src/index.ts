import * as fcl from '@onflow/fcl';
import { createLogger, type BridgeLogger } from '@onflow/frw-utils';
import { send as httpSend } from '@onflow/transport-http';

import { addresses, CadenceService } from './cadence.generated';

/**
 * Transaction result from FCL
 */
export interface TransactionResult {
  status: number;
  statusCode: number;
  errorMessage: string;
  events: Array<{
    type: string;
    transactionId: string;
    transactionIndex: number;
    eventIndex: number;
    data: Record<string, unknown>;
  }>;
}

/**
 * Wait for a transaction to be sealed on-chain
 * This wraps FCL's transaction monitoring functionality
 *
 * @param txId - Transaction ID to monitor
 * @returns Promise with the transaction result including events
 */
export async function waitForTransaction(txId: string): Promise<TransactionResult> {
  return fcl.tx(txId).onceSealed();
}

/**
 * Subscribe to transaction status updates
 * Useful for showing progress during account creation
 *
 * @param txId - Transaction ID to monitor
 * @param callback - Called with each status update
 * @returns Unsubscribe function
 */
export function subscribeToTransaction(
  txId: string,
  callback: (status: { status: number; statusCode: number; errorMessage: string }) => void
): () => void {
  return fcl.tx(txId).subscribe(callback);
}

/**
 * Configure FCL for the specified network
 */
export function configureFCL(network: 'mainnet' | 'testnet'): void {
  if (network === 'mainnet') {
    fcl
      .config()
      .put('flow.network', 'mainnet')
      .put('accessNode.api', 'https://rest-mainnet.onflow.org')
      .put('sdk.transport', httpSend)
      .put('logger.level', 1);
    const addrMap = addresses.mainnet;
    for (const key in addrMap) {
      fcl.config().put(key, addrMap[key as keyof typeof addrMap]);
    }
  } else {
    fcl
      .config()
      .put('flow.network', 'testnet')
      .put('accessNode.api', 'https://rest-testnet.onflow.org')
      .put('sdk.transport', httpSend)
      .put('logger.level', 1);
    const addrMap = addresses.testnet;
    for (const key in addrMap) {
      fcl.config().put(key, addrMap[key as keyof typeof addrMap]);
    }
  }
}

/**
 * Configure EVM for the specified network
 */
// export function configEVMProvider(network: string) {
//   const provider = new ethers.providers.JsonRpcProvider(
//     network === 'mainnet'
//       ? 'https://mainnet.evm.nodes.onflow.org'
//       : 'https://testnet.evm.nodes.onflow.org'
//   );
//   return provider;
// }

/**
 * Bridge interface for CadenceService creation
 */
interface CadenceBridge extends BridgeLogger {
  getNetwork(): string;
  configureCadenceService(service: CadenceService): void;
}

/**
 * Create CadenceService instance factory function
 * @param bridge - Bridge instance that will configure all interceptors and provide network info
 * @returns CadenceService instance fully configured with bridge interceptors
 */
export function createCadenceService(bridge: CadenceBridge): CadenceService {
  // Get network configuration from bridge
  const network = bridge.getNetwork() as 'mainnet' | 'testnet';
  configureFCL(network);
  const service = new CadenceService();

  // Basic response interceptor for logging
  service.useResponseInterceptor(async (config, response) => {
    try {
      const logger = createLogger(bridge, 'CadenceService');
      logger.debug('cadenceService response', response);
    } catch {
      // Fallback if logger not available
      // Do nothing in this case - logging is optional
    }
    return { config, response };
  });

  // Let bridge configure the service with all its interceptors
  bridge.configureCadenceService(service);

  return service;
}

// Re-export types and services from generated file
export { CadenceService, addresses, type Result } from './cadence.generated';
