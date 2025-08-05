import {
  MAINNET_NETWORK,
  MAINNET_CHAIN_ID,
  TESTNET_NETWORK,
  TESTNET_CHAIN_ID,
  PriceProvider,
} from '../constant/network-constants';
import { type FlowNetwork, type FlowChainId } from '../types/network-types';

export const isValidNetwork = (network: string): boolean => {
  return network === 'mainnet' || network === 'testnet' || network === 'crescendo';
};

export const networkToChainId = (network: string): FlowChainId => {
  switch (network) {
    case MAINNET_NETWORK:
      return MAINNET_CHAIN_ID;
    case TESTNET_NETWORK:
      return TESTNET_CHAIN_ID;
    default:
      throw new Error(`Unknown network: ${network}`);
  }
};

export const chainIdtoAddressType = (chainId: number): FlowNetwork => {
  switch (chainId) {
    case MAINNET_CHAIN_ID:
      return MAINNET_NETWORK;
    case TESTNET_CHAIN_ID:
      return TESTNET_NETWORK;
    default:
      throw new Error(`Unknown chainId: ${chainId}`);
  }
}; /**
 * Return the price providers to use for a given token
 * @param token - The token to get the price providers for
 * @returns The price providers to use for the token
 */

export const getPriceProvider = (token: string): PriceProvider[] => {
  switch (token) {
    case 'usdc':
      return [PriceProvider.binance, PriceProvider.kakren, PriceProvider.huobi];
    case 'flow':
      return [
        PriceProvider.binance,
        PriceProvider.kakren,
        PriceProvider.coinbase,
        PriceProvider.kucoin,
        PriceProvider.huobi,
      ];
    default:
      return [];
  }
};
