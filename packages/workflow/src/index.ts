import * as fcl from '@onflow/fcl';
import { addresses, CadenceService } from '@onflow/frw-cadence';
import { getLogger } from '@onflow/frw-context';
import { send as httpSend } from '@onflow/transport-http';

export * from './send';
export * from './send/utils';

export function configureFCL(network: 'mainnet' | 'testnet') {
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
 * Create CadenceService instance factory function
 * @param network - Network configuration
 * @param bridge - Bridge instance that will configure all interceptors
 * @returns CadenceService instance fully configured with bridge interceptors
 */
export function createCadenceService(network: 'mainnet' | 'testnet', bridge: any): CadenceService {
  configureFCL(network);
  const service = new CadenceService();

  // Basic response interceptor for logging
  service.useResponseInterceptor(async (response) => {
    try {
      const logger = getLogger();
      logger.debug('cadenceService response', response);
    } catch {
      // Fallback if logger not available (context not initialized)
      // Do nothing in this case - logging is optional
    }
    return response;
  });

  // Let bridge configure the service with all its interceptors
  bridge.configureCadenceService(service);

  return service;
}
