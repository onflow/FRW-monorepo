import * as fcl from '@onflow/fcl';
import { addresses, CadenceService } from '@onflow/frw-cadence';
import { send as httpSend } from '@onflow/transport-http';

import { authz } from './utils/authz';

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

const cadenceService = new CadenceService();

cadenceService.useRequestInterceptor(async (config) => {
  if (config.type === 'transaction') {
    config.payer = authz;
  }
  return config;
});

cadenceService.useRequestInterceptor(async (config) => {
  if (config.type === 'transaction') {
    config.proposer = authz;
  }
  return config;
});

cadenceService.useRequestInterceptor(async (config) => {
  if (config.type === 'transaction') {
    config.authorizations = [authz];
  }
  return config;
});

cadenceService.useResponseInterceptor(async (response) => {
  console.log('cadenceService response', response);
  return response;
});

export { cadenceService };
