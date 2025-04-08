import BN from 'bignumber.js';
import { useCallback, useEffect, useState, useRef } from 'react';

import { type ExtendedTokenInfo, type CoinItem } from '@/shared/types/coin-types';
import { isValidEthereumAddress } from '@/shared/utils/address';
import storage, { type AreaName, type StorageChange } from '@/shared/utils/storage';
import { getActiveAccountsByUserWallet } from '@/shared/utils/user-data-keys';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { debug } from '@/ui/utils';
import { useWallet, useWalletLoaded } from '@/ui/utils/WalletContext';

import { useCoinList } from './use-coin-hooks';
import { useProfiles } from './useProfileHook';
export const useCoins = () => {
  const usewallet = useWallet();
  const walletLoaded = useWalletLoaded();
  const { network } = useNetwork();
  const { currentWallet } = useProfiles();

  const refreshInProgressRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);
  const mountedRef = useRef(true);

  // Replace Zustand state with React state
  const [balance, setBalance] = useState<string>('0');
  const [totalFlow, setTotalFlow] = useState<string>('0');
  const [availableFlow, setAvailableFlow] = useState<string>('0');
  const [coinsLoaded, setCoinsLoaded] = useState(false);

  const handleStorageData = useCallback(
    async (data?: ExtendedTokenInfo[] | null) => {
      console.log('handleStorageData', data);
      if (!data) return;

      // Create a map for faster lookups
      let sum = new BN(0);
      let flowBalance = new BN(0);

      // Single pass through the data
      for (const coin of data) {
        // Calculate sum and flow balance
        if (coin.total !== null) {
          sum = sum.plus(new BN(coin.total));
          if (coin.unit && coin.unit.toLowerCase() === 'flow') {
            flowBalance = new BN(coin.balance);
          }
        }
      }
      console.log('flowBalance', flowBalance);

      // Batch updates
      await Promise.all([
        setTotalFlow(flowBalance.toString()),
        setAvailableFlow(flowBalance.toString()),
        setBalance(`$ ${sum.toFixed(2)}`),
      ]);
    },
    [setTotalFlow, setBalance]
  );

  // Setup localStorage event listener
  useEffect(() => {
    // Function to check pending transactions
    const loadCoinList = async () => {
      try {
        const coinList = await storage.get('coinList');
        // check for nettwork type
        let refreshedCoinlist: ExtendedTokenInfo[];
        const activeAccounts = await getActiveAccountsByUserWallet();
        if (isValidEthereumAddress(activeAccounts?.currentAddress)) {
          refreshedCoinlist = coinList['evm'][network];
        } else {
          refreshedCoinlist = coinList['coinItem'][network];
        }
        if (Array.isArray(refreshedCoinlist) && refreshedCoinlist.length > 0) {
          handleStorageData(refreshedCoinlist);
          setCoinsLoaded(true);
        }
      } catch (error) {
        console.error('Error checking pending transactions:', error);
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

  const coins = useCoinList(network, currentWallet?.address);

  useEffect(() => {
    // Check if currentWallet exists and has an address
    if (currentWallet?.address) {
      // If coinList is empty or undefined, initialize it
      if (!coins || coins.length === 0) {
        console.log('Coin list is empty, initializing for address:', currentWallet.address);

        const initAndHandle = async () => {
          try {
            await usewallet?.initCoinListSession(currentWallet.address);
            console.log('Coin list initialization completed');
          } catch (error) {
            console.error('Error initializing coin list:', error);
          }
        };

        initAndHandle();
      } else {
        console.log('Coin list already loaded with', coins, 'coins');
        handleStorageData(coins);
        setCoinsLoaded(true);
        console.log('Coin list already loaded with', coins.length, 'coins');
      }
    }
  }, [usewallet, network, currentWallet, coins, handleStorageData]);

  return {
    handleStorageData,
    coins: coins || [],
    balance,
    totalFlow,
    availableFlow,
    coinsLoaded,
  };
};
