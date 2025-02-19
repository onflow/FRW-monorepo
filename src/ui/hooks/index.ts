import { useCallback } from 'react';

import { useCoins } from './useCoinHook';
import { useNetworks } from './useNetworkHook';
import { useProfiles } from './useProfileHook';

export const useInitHook = () => {
  const { fetchProfileData, freshUserWallet, fetchUserWallet } = useProfiles();
  const { fetchNetwork } = useNetworks();
  const { refreshCoinData } = useCoins();

  const initializeStore = useCallback(async () => {
    await fetchNetwork();
    await fetchProfileData();
    await freshUserWallet();
    await fetchUserWallet();
    await refreshCoinData();
  }, [fetchNetwork, fetchProfileData, freshUserWallet, fetchUserWallet, refreshCoinData]);

  return { initializeStore };
};
