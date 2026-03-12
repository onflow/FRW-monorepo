import { useEffect, useState } from 'react';

import { transferListKey, triggerRefresh, type TransferListStore } from '@/data-model';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useProfiles } from '@/ui/hooks/useProfileHook';

import { useCachedData } from './use-data';
import { useNetwork } from './useNetworkHook';

const PENDING_POLL_INTERVAL_MS = 5_000;

export const useTransferList = () => {
  const wallet = useWallet();
  const { network } = useNetwork();
  const { currentWallet, activeAccountType } = useProfiles();

  const currentAddress = currentWallet?.address;

  const transferListStore = useCachedData<TransferListStore>(
    network && currentAddress ? transferListKey(network, currentAddress, '0', '15') : null
  );

  // Poll for updates while there are pending transactions.
  // This guards against the case where chrome.storage.onChanged events are
  // not reliably delivered to the popup from the background service worker.
  useEffect(() => {
    if (!network || !currentAddress) return;
    if (!transferListStore?.pendingCount) return;

    const key = transferListKey(network, currentAddress, '0', '15');
    const id = setInterval(() => {
      triggerRefresh(key);
    }, PENDING_POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [network, currentAddress, transferListStore?.pendingCount]);

  const [monitor, setMonitor] = useState<string | null>(null);
  const [flowscanURL, setFlowscanURL] = useState<string | null>(null);
  const [viewSourceURL, setViewSourceURL] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      const monitor = await wallet.getMonitor();
      const url = await wallet.getFlowscanUrl();
      const viewSourceUrl = await wallet.getViewSourceUrl();
      if (mounted) {
        setMonitor(monitor);
        setFlowscanURL(url);
        setViewSourceURL(viewSourceUrl);
      }
    };
    fetchSettings();
    return () => {
      mounted = false;
    };
  }, [wallet, network, activeAccountType]);

  return {
    occupied: !!transferListStore?.pendingCount,
    transactions: transferListStore?.list || [],
    monitor,
    flowscanURL,
    viewSourceURL,
    loading: transferListStore === undefined,
    showButton: transferListStore && transferListStore.count > 15,
    count: transferListStore?.count,
  };
};
