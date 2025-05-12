import { useCallback, useRef } from 'react';

import { useWalletLoaded } from '../utils/WalletContext';

import { useProfiles } from './useProfileHook';

export const useInitHook = () => {
  const walletLoaded = useWalletLoaded();
  const { fetchProfileData } = useProfiles();
  const isInitializing = useRef(false);

  const initializeStore = useCallback(async () => {
    if (!walletLoaded || isInitializing.current) {
      console.log('Skipping initialization - wallet not loaded or already initializing');
      return;
    }

    try {
      isInitializing.current = true;

      await fetchProfileData();
    } finally {
      isInitializing.current = false;
    }
  }, [fetchProfileData, walletLoaded]);

  return { initializeStore };
};
