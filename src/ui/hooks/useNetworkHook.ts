import { useEffect, useState } from 'react';

import storage, { type StorageChange, type AreaName } from '@/background/webapi/storage';

export const useNetwork = () => {
  const [network, setNetwork] = useState<string>('mainnet');
  const [developerMode, setDeveloperMode] = useState<boolean>(false);
  const [emulatorModeOn, setEmulatorModeOn] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    // Set up storage change listener
    const handleStorageChange = (
      changes: { [key: string]: StorageChange },
      namespace: AreaName
    ) => {
      if (namespace === 'local') {
        // Changes is to local storage
        // Check network change
        if (changes['userWallets']) {
          const userWallets = changes['userWallets'].newValue;
          setNetwork(userWallets.network);
          setEmulatorModeOn(userWallets.emulatorMode);
        }
        // Check developer mode change
        if (changes['developerMode']) {
          setDeveloperMode(changes['developerMode'].newValue);
        }
      }
    };

    // Initial load from storage
    const loadInitialData = async () => {
      const developerModeValue = await storage.get('developerMode');
      const emulatorModeValue = await storage.get('emulatorMode');
      const userWalletsStorage = await storage.get('userWallets');
      if (mounted) {
        setDeveloperMode(developerModeValue);
        setEmulatorModeOn(emulatorModeValue);
        setNetwork(userWalletsStorage.network);
      }
    };

    loadInitialData();
    storage.addStorageListener(handleStorageChange);

    return () => {
      mounted = false;
      storage.removeStorageListener(handleStorageChange);
    };
  }, []);

  return {
    network,
    developerMode,
    emulatorModeOn,
  };
};
