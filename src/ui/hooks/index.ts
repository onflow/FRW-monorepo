import { useCallback, useRef } from 'react';

import { useWalletLoaded } from '../utils/WalletContext';

import { useCoins } from './useCoinHook';
import { useProfiles } from './useProfileHook';

export const useInitHook = () => {
  const walletLoaded = useWalletLoaded();
  const { fetchProfileData, freshUserWallet, fetchUserWallet } = useProfiles();
  const { refreshCoinData } = useCoins();
  const isInitializing = useRef(false);

  const initializeStore = useCallback(async () => {
    if (!walletLoaded || isInitializing.current) {
      console.log('Skipping initialization - wallet not loaded or already initializing');
      return;
    }

    try {
      isInitializing.current = true;
      console.log('Starting store initialization');

      await fetchProfileData();
      await freshUserWallet();
      await fetchUserWallet();
      await refreshCoinData();

      console.log('Store initialization complete');
    } finally {
      isInitializing.current = false;
    }
  }, [fetchProfileData, freshUserWallet, fetchUserWallet, refreshCoinData, walletLoaded]);

  return { initializeStore };
};
