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
 * Uses custom polling since FCL's built-in polling has issues in React Native
 *
 * @param txId - Transaction ID to monitor
 * @param timeoutMs - Timeout in milliseconds (default: 60 seconds)
 * @param pollIntervalMs - Polling interval in milliseconds (default: 2 seconds)
 * @returns Promise with the transaction result including events
 */
export async function waitForTransaction(
  txId: string,
  timeoutMs = 60000,
  pollIntervalMs = 2000
): Promise<TransactionResult> {
  const startTime = Date.now();

  // eslint-disable-next-line no-console
  console.log(`[FCL] Starting transaction polling for: ${txId}`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      // Fetch transaction result directly
      const result = await fcl.tx(txId).snapshot();

      // eslint-disable-next-line no-console
      console.log(`[FCL] Transaction status: ${result.status} (4=sealed)`);

      // Status 4 = SEALED
      if (result.status === 4) {
        // eslint-disable-next-line no-console
        console.log(`[FCL] Transaction sealed successfully`);
        return result as TransactionResult;
      }

      // Status 5 = EXPIRED (failed)
      if (result.status === 5) {
        throw new Error(`Transaction expired: ${result.errorMessage || 'Unknown error'}`);
      }
    } catch (error: any) {
      // If it's a network error, continue polling
      if (!error.message?.includes('expired')) {
        // eslint-disable-next-line no-console
        console.log(`[FCL] Polling error (will retry): ${error.message}`);
      } else {
        throw error;
      }
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Transaction timeout after ${timeoutMs}ms: ${txId}`);
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
 * Uses HTTP transport which will automatically fallback to polling when WebSocket streaming fails
 */
export function configureFCL(network: 'mainnet' | 'testnet'): void {
  const accessNode =
    network === 'mainnet' ? 'https://rest-mainnet.onflow.org' : 'https://rest-testnet.onflow.org';

  fcl
    .config()
    .put('flow.network', network)
    .put('accessNode.api', accessNode)
    .put('sdk.transport', httpSend)
    .put('logger.level', 1);

  const addrMap = network === 'mainnet' ? addresses.mainnet : addresses.testnet;
  for (const key in addrMap) {
    fcl.config().put(key, addrMap[key as keyof typeof addrMap]);
  }

  // eslint-disable-next-line no-console
  console.log(`[FCL] Configured for ${network}, accessNode: ${accessNode}`);
}

/**
 * Get current FCL network configuration
 */
export async function getFCLNetwork(): Promise<string> {
  return (await fcl.config().get('flow.network')) || 'unknown';
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

/**
 * Manually poll transaction status using snapshot() until executed
 *
 * WHY: FCL's onceSealed() uses a subscribe() mechanism that fails in React Native.
 * Even though it shows "falling back to polling", the Actor-based polling doesn't work properly.
 * This function bypasses FCL's subscribe/actor system and uses snapshot() directly.
 *
 * EXECUTED vs SEALED: Executed (status 3) provides soft finality and is ~2.5x faster than
 * Sealed (status 4). For most use cases, including key rotation, Executed is sufficient.
 *
 * @param txId - Transaction ID to monitor
 * @param options - Polling configuration
 * @returns Transaction status when executed (status >= 3)
 */
export async function waitForExecuted(
  txId: string,
  options: {
    timeout?: number; // Max wait time in ms (default: 60000)
    pollInterval?: number; // Interval between polls in ms (default: 2000)
    onStatusChange?: (status: any) => void; // Callback for status updates
  } = {}
): Promise<any> {
  const { timeout = 60000, pollInterval = 2000, onStatusChange } = options;
  const startTime = Date.now();
  let lastStatus: number | null = null;

  while (Date.now() - startTime < timeout) {
    try {
      // Use snapshot() directly - bypasses FCL's broken subscribe mechanism
      const status = await fcl.tx(txId).snapshot();

      // Call callback if status changed
      if (onStatusChange && status.status !== lastStatus) {
        onStatusChange(status);
        lastStatus = status.status;
      }

      // Status codes: 0=Unknown, 1=Pending, 2=Finalized, 3=Executed, 4=Sealed, 5=Expired
      if (status.status === 3 || status.status === 4) {
        // Transaction is Executed (3) or Sealed (4) - success!
        return status;
      }

      if (status.status === 5) {
        // Transaction expired
        throw new Error(`Transaction expired: ${txId}`);
      }

      // Check for errors
      if (status.errorMessage) {
        throw new Error(`Transaction failed: ${status.errorMessage}`);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      // If it's a transaction error, rethrow
      if (error instanceof Error && error.message.includes('Transaction failed')) {
        throw error;
      }
      // For network errors, wait and continue polling
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error(`Transaction ${txId} timed out after ${timeout}ms`);
}

// Re-export types and services from generated file
export { CadenceService, addresses, type Result } from './cadence.generated';
export * as fcl from '@onflow/fcl';
