import {
  type ChildAccountFtStore,
  childAccountFtKey,
  coinListKey,
  tokenFilterKey,
  tokenListKey,
  setLocalData,
  evmCustomTokenKey,
  triggerRefresh,
} from '@/data-model';
import {
  type CustomFungibleTokenInfo,
  type EvmCustomTokenInfo,
  type ExtendedTokenInfo,
  type TokenFilter,
} from '@/shared/types';

import { useCachedData, useUserData } from './use-data';

export const useCoinList = (
  network: string | undefined | null,
  address: string | undefined | null,
  currency: string | undefined | null
) => {
  return useCachedData<ExtendedTokenInfo[]>(
    network && address && currency ? coinListKey(network, address, currency) : null
  );
};

export const useTokenFilter = (
  network: string | undefined | null,
  address: string | undefined | null
) => {
  return useUserData<TokenFilter>(network && address ? tokenFilterKey(network, address) : null);
};

export const setTokenFilter = (network: string, address: string, filter: TokenFilter) => {
  if (!network || !address) {
    throw new Error('Network and address are required');
  }
  setLocalData<TokenFilter>(tokenFilterKey(network, address), filter);
};

export const useChildAccountFt = (
  network: string | undefined | null,
  parentAddress: string | undefined | null,
  childAccount: string | undefined | null
) => {
  return useCachedData<ChildAccountFtStore>(
    network && parentAddress && childAccount
      ? childAccountFtKey(network, parentAddress, childAccount)
      : null
  );
};

export const useAllTokenInfo = (network: string, chainType: string) => {
  return useCachedData<CustomFungibleTokenInfo[]>(
    network && chainType ? tokenListKey(network, chainType) : null
  );
};

export const refreshEvmToken = (network: string) => {
  return triggerRefresh(tokenListKey(network, 'evm'));
};

export const useEvmCustomTokens = (network: string) => {
  return useUserData<EvmCustomTokenInfo[]>(evmCustomTokenKey(network));
};
