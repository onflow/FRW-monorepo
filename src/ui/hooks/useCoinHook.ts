import BN from 'bignumber.js';
import { useCallback, useEffect, useState, useRef } from 'react';

import storage, { type AreaName, type StorageChange } from '@/background/webapi/storage';
import { type CoinItem } from '@/shared/types/coin-types';
import { isValidEthereumAddress } from '@/shared/utils/address';
import { userWalletsKey } from '@/shared/utils/data-persist-keys';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { debug } from '@/ui/utils';
import { useWallet, useWalletLoaded } from '@/ui/utils/WalletContext';

export const useCoins = () => {
  const usewallet = useWallet();
  const walletLoaded = useWalletLoaded();
  const { network } = useNetwork();

  const refreshInProgressRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);
  const mountedRef = useRef(true);

  // Replace Zustand state with React state
  const [coins, setCoins] = useState<CoinItem[]>([]);
  const [balance, setBalance] = useState<string>('0');
  const [totalFlow, setTotalFlow] = useState<string>('0');
  const [availableFlow, setAvailableFlow] = useState<string>('0');
  const [coinsLoaded, setCoinsLoaded] = useState(false);

  const handleStorageData = useCallback(
    async (data) => {
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data format received:', data);
        return;
      }

      const storageData = data.sort((a, b) => {
        if (b.total === a.total) {
          return new BN(b.balance).minus(new BN(a.balance)).toNumber();
        } else {
          return new BN(b.total).minus(new BN(a.total)).toNumber();
        }
      });

      // Create a map for faster lookups
      const uniqueTokenMap = new Map();
      let sum = new BN(0);
      let flowBalance = new BN(0);

      // Single pass through the data
      for (const coin of storageData) {
        const coinId = coin.id.toLowerCase();

        // Handle unique tokens
        if (!uniqueTokenMap.has(coinId)) {
          uniqueTokenMap.set(coinId, coin);
        }

        // Calculate sum and flow balance
        if (coin.total !== null) {
          sum = sum.plus(new BN(coin.total));
          if (coin.unit && coin.unit.toLowerCase() === 'flow') {
            flowBalance = new BN(coin.balance);
          }
        }
      }

      // Use a single state update for better performance
      const newState = {
        coins: Array.from(uniqueTokenMap.values()),
        totalFlow: flowBalance.toString(),
        availableFlow: flowBalance.toString(),
        balance: `${sum.toFixed(2)}`,
      };

      // Update all states at once
      setCoins(newState.coins);
      setTotalFlow(newState.totalFlow);
      setAvailableFlow(newState.availableFlow);
      setBalance(newState.balance);
    },
    [setCoins, setTotalFlow, setBalance]
  );

  // Setup localStorage event listener
  useEffect(() => {
    // Function to check pending transactions
    const loadCoinList = async () => {
      try {
        const coinList = await storage.get('coinList');
        const userWallet = await storage.get(userWalletsKey);

        if (!coinList) {
          console.warn('No coinList data found in storage');
          return;
        }

        if (!userWallet?.currentAddress) {
          console.warn('No current address found in userWallet');
          return;
        }

        let refreshedCoinlist;
        const isEvm = isValidEthereumAddress(userWallet.currentAddress);

        if (isEvm) {
          refreshedCoinlist = coinList?.['evm']?.[network];
          if (!refreshedCoinlist) {
            console.warn('No EVM coin list found for network:', network);
          }
        } else {
          refreshedCoinlist = coinList?.['coinItem']?.[network];
          if (!refreshedCoinlist) {
            console.warn('No Flow coin list found for network:', network);
          }
        }

        if (Array.isArray(refreshedCoinlist) && refreshedCoinlist.length > 0) {
          handleStorageData(refreshedCoinlist);
          setCoinsLoaded(true);
        } else {
          console.warn('Invalid or empty coin list:', refreshedCoinlist);
        }
      } catch (error) {
        console.error('Error loading coin list:', error);
      }
    };

    // Listen for storage events (when localStorage changes in other tabs)
    const handleStorageChange = (
      changes: { [key: string]: StorageChange },
      namespace: AreaName
    ) => {
      if (namespace === 'local') {
        if (changes['coinList'] || changes['coinList'] === null) {
          debug('useCoinHook', 'useCoinHook storage changed, checking pending transactions');
          loadCoinList();
        }
      }
    };

    loadCoinList();

    storage.addStorageListener(handleStorageChange);

    // Cleanup
    return () => {
      mountedRef.current = false;
      storage.removeStorageListener(handleStorageChange);
    };
  }, [usewallet, network, handleStorageData]);

  const refreshCoinData = useCallback(async () => {
    // Prevent concurrent refreshes and throttle calls
    if (refreshInProgressRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 5000) {
      return;
    }

    if (!usewallet || !walletLoaded) {
      console.warn('Wallet not ready for refresh');
      return;
    }

    try {
      refreshInProgressRef.current = true;
      lastRefreshTimeRef.current = now;

      // Make sure the wallet is unlocked
      if (!(await usewallet.isUnlocked())) {
        console.warn('Wallet is locked, cannot refresh');
        return;
      }

      const address = await usewallet.getParentAddress();
      if (!address) {
        console.warn('No parent address found');
        return;
      }

      await usewallet.refreshCoinList(60000);
    } catch (error) {
      console.error('Error refreshing coin data:', error);
    } finally {
      refreshInProgressRef.current = false;
    }
  }, [usewallet, walletLoaded]);

  return {
    refreshCoinData,
    handleStorageData,
    coins,
    balance,
    totalFlow,
    availableFlow,
    coinsLoaded,
  };
};
