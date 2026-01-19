import * as fcl from '@onflow/fcl';
import { createLogger, type BridgeLogger } from '@onflow/frw-utils';
import { send as httpSend } from '@onflow/transport-http';

import { addresses, CadenceService } from './cadence.generated';

/**
 * Configure FCL for the specified network
 * Uses HTTP transport which will automatically fallback to polling when WebSocket streaming fails
 */
export function configureFCL(network: 'mainnet' | 'testnet'): typeof fcl {
  if (network === 'mainnet') {
    fcl
      .config()
      .put('flow.network', 'mainnet')
      .put('accessNode.api', 'https://rest-mainnet.onflow.org')
      .put('sdk.transport', httpSend);
    const addrMap = addresses.mainnet;
    for (const key in addrMap) {
      fcl.config().put(key, addrMap[key as keyof typeof addrMap]);
    }
  } else {
    fcl
      .config()
      .put('flow.network', 'testnet')
      .put('accessNode.api', 'https://rest-testnet.onflow.org')
      .put('sdk.transport', httpSend);
    const addrMap = addresses.testnet;
    for (const key in addrMap) {
      fcl.config().put(key, addrMap[key as keyof typeof addrMap]);
    }
  }
  return fcl;
}

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
