import { useCallback } from 'react';

import { useNetworkStore } from '@/ui/stores/networkStore';
import { useWallet, useWalletLoaded } from '@/ui/utils';

export const useNetworkHook = () => {
  const usewallet = useWallet();
  const walletLoaded = useWalletLoaded();

  // Action selectors
  const setNetwork = useNetworkStore((state) => state.setNetwork);
  const setDeveloperMode = useNetworkStore((state) => state.setDeveloperMode);
  const setEmulatorModeOn = useNetworkStore((state) => state.setEmulatorModeOn);

  // State selectors
  const currentNetwork = useNetworkStore((state) => state.currentNetwork);
  const developerMode = useNetworkStore((state) => state.developerMode);
  const emulatorModeOn = useNetworkStore((state) => state.emulatorModeOn);

  const fetchNetwork = useCallback(async () => {
    if (!usewallet || !walletLoaded) return;
    const network = await usewallet.getNetwork();
    setNetwork(network);
  }, [usewallet, setNetwork, walletLoaded]);

  return {
    fetchNetwork,
    setNetwork,
    setDeveloperMode,
    setEmulatorModeOn,
    currentNetwork,
    developerMode,
    emulatorModeOn,
  };
};
