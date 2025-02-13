import { useMemo } from 'react';
import Web3 from 'web3';

import { EVM_ENDPOINT } from '@/constant';

import { useNetworkHook } from './useNetworkHook';

export const useWeb3 = () => {
  const { currentNetwork } = useNetworkHook();
  const network = currentNetwork || 'mainnet';
  const web3instance = useMemo(() => {
    const provider = new Web3.providers.HttpProvider(EVM_ENDPOINT[network]);
    return new Web3(provider);
  }, [network]);

  return web3instance;
};
