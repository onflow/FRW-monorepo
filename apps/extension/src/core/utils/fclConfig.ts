import * as fcl from '@onflow/fcl';
import { createFlowClient } from '@onflow/fcl';
import { addresses } from '@onflow/frw-cadence';

import { type FlowNetwork } from '@/shared/types';
import { isValidNetwork } from '@/shared/utils';

const HOST_TESTNET = 'https://rest-testnet.onflow.org';
const HOST_MAINNET = 'http://access-003.mainnet28.nodes.onflow.org:8070';

// NOTE: These are the currently the same hosts. TODO: figure out how to run both networks simultaneously.
export const EMULATOR_HOST_TESTNET = 'http://localhost:8888';
export const EMULATOR_HOST_MAINNET = 'http://localhost:8888';

// Cache for network-specific Flow clients
type FlowClient = ReturnType<typeof createFlowClient>;
const flowClients: Map<string, FlowClient> = new Map();

// Configure FCL for Mainnet
export const fclMainnetConfig = async (emulatorMode?: boolean) => {
  const host = emulatorMode ? EMULATOR_HOST_MAINNET : HOST_MAINNET;
  fcl.config().put('accessNode.api', host).put('flow.network', 'mainnet');

  // Configure contract addresses for mainnet
  const addrMap = addresses.mainnet;
  for (const key in addrMap) {
    fcl.config().put(key, addrMap[key as keyof typeof addrMap]);
  }
};

// Configure FCL for Testnet
export const fclTestnetConfig = async (emulatorMode?: boolean) => {
  const host = emulatorMode ? EMULATOR_HOST_TESTNET : HOST_TESTNET;
  fcl.config().put('accessNode.api', host).put('flow.network', 'testnet');

  // Configure contract addresses for testnet
  const addrMap = addresses.testnet;
  for (const key in addrMap) {
    fcl.config().put(key, addrMap[key as keyof typeof addrMap]);
  }
};

export const fclConfig = async (network: FlowNetwork, emulatorMode?: boolean) => {
  if (network === 'testnet') {
    await fclTestnetConfig(emulatorMode);
  } else {
    // Default to mainnet
    await fclMainnetConfig(emulatorMode);
  }
};
export const fclEnsureNetwork = async (network: string) => {
  if (!isValidNetwork(network)) {
    throw new Error(`Invalid network: ${network}`);
  }
  const currentNetwork = await fcl.config().get('flow.network');
  if (currentNetwork !== network) {
    await fclConfig(network as FlowNetwork);
  }
};

export const fclConfirmNetwork = async (network: string) => {
  if (!isValidNetwork(network)) {
    throw new Error(`Invalid network: ${network}`);
  }
  const currentNetwork = await fcl.config().get('flow.network');
  return currentNetwork === network;
};

/**
 * Get or create a Flow client for a specific network
 * Uses createFlowClient to create isolated client instances per network
 * This prevents issues when switching between networks
 * @param network - The network to get the client for
 * @param emulatorMode - Whether to use emulator mode
 * @returns A Flow client configured for the specified network
 */
export const getFlowClient = (network: FlowNetwork, emulatorMode: boolean = false): FlowClient => {
  const cacheKey = `${network}-${emulatorMode ? 'emulator' : 'main'}`;

  // Return cached client if it exists
  if (flowClients.has(cacheKey)) {
    return flowClients.get(cacheKey)!;
  }

  // Determine the access node URL
  const accessNodeUrl = emulatorMode
    ? network === 'testnet'
      ? EMULATOR_HOST_TESTNET
      : EMULATOR_HOST_MAINNET
    : network === 'testnet'
      ? HOST_TESTNET
      : HOST_MAINNET;

  // Create client configuration
  // Note: Contract addresses are already included in the scripts from getScripts,
  // so we only need to configure the access node URL and network
  const clientConfig: Parameters<typeof createFlowClient>[0] = {
    accessNodeUrl,
    flowNetwork: network,
  };

  const client = createFlowClient(clientConfig);

  // Cache the client
  flowClients.set(cacheKey, client);

  return client;
};
