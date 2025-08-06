import * as fcl from '@onflow/fcl';
import { createLogger } from '@onflow/frw-utils';
import { send as httpSend } from '@onflow/transport-http';

import { addresses, CadenceService } from './cadence.generated';

/**
 * Configure FCL for the specified network
 */
export function configureFCL(network: 'mainnet' | 'testnet'): void {
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
}

/**
 * Bridge interface for CadenceService creation
 */
interface CadenceBridge {
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
  service.useResponseInterceptor(async (response) => {
    try {
      const logger = createLogger(bridge, 'CadenceService');
      logger.debug('cadenceService response', response);
    } catch {
      // Fallback if logger not available
      // Do nothing in this case - logging is optional
    }
    return response;
  });

  // Let bridge configure the service with all its interceptors
  bridge.configureCadenceService(service);

  return service;
}
