import { useEffect, useState } from 'react';

import {
  type ChildAccountFtStore,
  type InboxDataStore,
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
import { useWallet } from './use-wallet';

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

export const useInboxData = (
  network: string | undefined | null,
  address?: string | undefined | null
) => {
  const wallet = useWallet();
  const [data, setData] = useState<InboxDataStore | undefined>(undefined);

  useEffect(() => {
    if (!network || !address) return;

    let cancelled = false;
    wallet.getInboxData(address).then((result: { fts: any[]; nfts: any[] }) => {
      if (!cancelled) {
        setData({
          accounts: { [address]: result },
          totalCount: result.fts.length + result.nfts.length,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [network, address]);

  return data;
};
