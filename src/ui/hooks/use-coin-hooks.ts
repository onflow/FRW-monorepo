import { type ExtendedTokenInfo, type TokenFilter } from '@/shared/types/coin-types';
import { type Currency } from '@/shared/types/wallet-types';
import { coinListKey, tokenFilterKey } from '@/shared/utils/cache-data-keys';
import { setUserData } from '@/shared/utils/user-data-access';

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
  setUserData<TokenFilter>(tokenFilterKey(network, address), filter);
};
