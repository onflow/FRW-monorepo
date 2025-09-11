/**
 * Network configuration types and constants
 */

import { Chain } from './chain';

/**
 * Network configuration interface
 */
export interface NetworkConfig {
  name: string;
  chain: Chain;
  chainId?: number; // For EVM chains
  rpcUrl: string;
  explorerUrl?: string;
  isTestnet: boolean;
}

/**
 * Flow network configurations
 */
export const FlowNetworks = {
  Mainnet: {
    name: 'flow-mainnet',
    chain: Chain.Flow,
    rpcUrl: 'https://rest-mainnet.onflow.org',
    explorerUrl: 'https://flowscan.org',
    isTestnet: false,
  } as NetworkConfig,

  Testnet: {
    name: 'flow-testnet',
    chain: Chain.Flow,
    rpcUrl: 'https://rest-testnet.onflow.org',
    explorerUrl: 'https://testnet.flowscan.org',
    isTestnet: true,
  } as NetworkConfig,
} as const;

/**
 * EVM network configurations
 */
export const EVMNetworks = {
  Ethereum: {
    name: 'ethereum',
    chain: Chain.EVM,
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com', // Using a reliable public RPC
    explorerUrl: 'https://etherscan.io',
    isTestnet: false,
  } as NetworkConfig,

  FlowEVM: {
    name: 'flow-evm',
    chain: Chain.EVM,
    chainId: 747, // Flow EVM Mainnet
    rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
    explorerUrl: 'https://evm.flowscan.org',
    isTestnet: false,
  } as NetworkConfig,

  FlowEVMTestnet: {
    name: 'flow-evm-testnet',
    chain: Chain.EVM,
    chainId: 545, // Flow EVM Testnet
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    explorerUrl: 'https://evm-testnet.flowscan.org',
    isTestnet: true,
  } as NetworkConfig,
} as const;

/**
 * All supported networks
 */
export const SupportedNetworks = {
  ...FlowNetworks,
  ...EVMNetworks,
} as const;

/**
 * Network utility functions
 */
export const NetworkUtils = {
  /**
   * Get all supported networks for a chain
   */
  getNetworksByChain(chain: Chain): NetworkConfig[] {
    return Object.values(SupportedNetworks).filter((network) => network.chain === chain);
  },

  /**
   * Get network config by name
   */
  getNetworkByName(name: string): NetworkConfig | undefined {
    return Object.values(SupportedNetworks).find((network) => network.name === name);
  },

  /**
   * Get network config by chain ID (for EVM chains)
   */
  getNetworkByChainId(chainId: number): NetworkConfig | undefined {
    return Object.values(SupportedNetworks).find((network) => network.chainId === chainId);
  },

  /**
   * Check if network is supported
   */
  isNetworkSupported(name: string): boolean {
    return this.getNetworkByName(name) !== undefined;
  },

  /**
   * Get supported network names for a chain
   */
  getSupportedNetworkNames(chain: Chain): string[] {
    return this.getNetworksByChain(chain).map((network) => network.name);
  },

  /**
   * Get mainnet network for a chain
   */
  getMainnetNetwork(chain: Chain): NetworkConfig | undefined {
    return this.getNetworksByChain(chain).find((network) => !network.isTestnet);
  },

  /**
   * Get testnet networks for a chain
   */
  getTestnetNetworks(chain: Chain): NetworkConfig[] {
    return this.getNetworksByChain(chain).filter((network) => network.isTestnet);
  },
} as const;

/**
 * Default networks for each chain
 */
export const DefaultNetworks = {
  [Chain.Flow]: FlowNetworks.Mainnet,
  [Chain.EVM]: EVMNetworks.FlowEVM, // Use Flow EVM as default
} as const;
