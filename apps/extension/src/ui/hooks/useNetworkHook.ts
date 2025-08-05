import { useEffect, useState } from 'react';

import {
  addStorageListener,
  type AreaName,
  getLocalData,
  getUserWalletsData,
  removeStorageListener,
  type StorageChange,
  userWalletsKey,
} from '@/data-model';

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
        if (changes[userWalletsKey] && changes[userWalletsKey].newValue) {
          const userWallets: { network?: string; emulatorMode?: boolean } =
            changes[userWalletsKey].newValue;
          if (userWallets && 'network' in userWallets) {
            setNetwork(userWallets.network as string);
          }
          if (userWallets && 'emulatorMode' in userWallets) {
            setEmulatorModeOn(userWallets.emulatorMode as boolean);
          }
        }
        // Check developer mode change
        if (changes['developerMode'] !== undefined) {
          setDeveloperMode(changes['developerMode'].newValue as boolean);
        }
      }
    };

    // Initial load from storage
    const loadInitialData = async () => {
      const developerModeValue = await getLocalData<boolean>('developerMode');
      const emulatorModeValue = await getLocalData<boolean>('emulatorMode');
      const userWalletsStorage = await getUserWalletsData();
      if (mounted) {
        if (developerModeValue !== undefined) {
          setDeveloperMode(developerModeValue);
        }
        if (emulatorModeValue !== undefined) {
          setEmulatorModeOn(emulatorModeValue);
        }
        if (userWalletsStorage && userWalletsStorage.network) {
          setNetwork(userWalletsStorage.network);
        }
      }
    };

    loadInitialData();
    addStorageListener(handleStorageChange);

    return () => {
      mounted = false;
      removeStorageListener(handleStorageChange);
    };
  }, []);

  return {
    network,
    developerMode,
    emulatorModeOn,
  };
};
