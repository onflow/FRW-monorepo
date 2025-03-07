import { useEffect, useState } from 'react';

export const useNetwork = () => {
  const [network, setNetwork] = useState<string>('mainnet');
  const [developerMode, setDeveloperMode] = useState<boolean>(false);
  const [emulatorModeOn, setEmulatorModeOn] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    // Set up storage change listener
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      namespace: chrome.storage.AreaName
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
      const developerModeValue = await chrome.storage.local.get('developerMode');
      const emulatorModeValue = await chrome.storage.local.get('emulatorMode');
      const userWallets = await chrome.storage.local.get('userWallets');
      if (mounted) {
        setDeveloperMode(developerModeValue.developerMode);
        setEmulatorModeOn(emulatorModeValue.emulatorMode);
        setNetwork(userWallets.network);
      }
    };

    loadInitialData();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return {
    network: network,
    developerMode,
    emulatorModeOn,
  };
};
