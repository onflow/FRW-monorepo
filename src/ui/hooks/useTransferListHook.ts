import { useCallback } from 'react';

import { useProfiles } from '@/ui/hooks/useProfileHook';
import { useTransferListStore } from '@/ui/stores/transferListStore';
import { useWallet } from '@/ui/utils';

export const useTransferList = () => {
  const usewallet = useWallet();

  const setTransactions = useTransferListStore((state) => state.setTransactions);
  const setMonitor = useTransferListStore((state) => state.setMonitor);
  const setFlowscanURL = useTransferListStore((state) => state.setFlowscanURL);
  const setViewSourceURL = useTransferListStore((state) => state.setViewSourceURL);
  const setLoading = useTransferListStore((state) => state.setLoading);
  const setShowButton = useTransferListStore((state) => state.setShowButton);
  const setCount = useTransferListStore((state) => state.setCount);

  const transactions = useTransferListStore((state) => state.transactions);
  const monitor = useTransferListStore((state) => state.monitor);
  const flowscanURL = useTransferListStore((state) => state.flowscanURL);
  const viewSourceURL = useTransferListStore((state) => state.viewSourceURL);
  const loading = useTransferListStore((state) => state.loading);
  const showButton = useTransferListStore((state) => state.showButton);
  const count = useTransferListStore((state) => state.count);

  const { currentWallet } = useProfiles();

  const fetchTransactions = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      const monitor = await usewallet.getMonitor();
      setMonitor(monitor);
      try {
        const url = await usewallet.getFlowscanUrl();
        const viewSourceUrl = await usewallet.getViewSourceUrl();
        setFlowscanURL(url);
        setViewSourceURL(viewSourceUrl);
        const data = await usewallet.getTransactions(
          currentWallet.address!,
          15,
          0,
          60000,
          forceRefresh
        );

        setLoading(false);
        if (data.count > 0) {
          setCount(data.count.toString());
          setShowButton(data.count > 15);
        }
        setTransactions(data.list);
      } catch {
        setLoading(false);
      }
    },
    [
      usewallet,
      setMonitor,
      setFlowscanURL,
      setViewSourceURL,
      setTransactions,
      setCount,
      setShowButton,
      setLoading,
      currentWallet,
    ]
  );

  return {
    fetchTransactions,
    transactions,
    monitor,
    flowscanURL,
    viewSourceURL,
    loading,
    showButton,
    count,
  };
};
