import BN from 'bignumber.js';
import { useCallback, useEffect, useState, useRef } from 'react';

import storage, { type AreaName, type StorageChange } from '@/background/webapi/storage';
import { type CoinItem } from '@/shared/types/coin-types';
import { withPrefix, isValidEthereumAddress } from '@/shared/utils/address';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { useCoinStore } from '@/ui/stores/coinStore';
import { debug } from '@/ui/utils';
import { useWallet, useWalletLoaded } from '@/ui/utils/WalletContext';
const DEFAULT_MIN_AMOUNT = '0.001';

export const useCoins = () => {
  const usewallet = useWallet();
  const walletLoaded = useWalletLoaded();
  const { mainAddress, currentWallet } = useProfiles();
  const { network } = useNetwork();

  const refreshInProgressRef = useRef(false);
  const calculationInProgressRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);
  const lastTotalFlowRef = useRef('');
  const mountedRef = useRef(true);

  // Replace Zustand state with React state
  const [coins, setCoins] = useState<CoinItem[]>([]);
  const [balance, setBalance] = useState<string>('0');
  const [totalFlow, setTotalFlow] = useState<string>('0');
  const [availableFlow, setAvailableFlow] = useState<string>('0');
  const [coinsLoaded, setCoinsLoaded] = useState(false);

  const handleStorageData = useCallback(
    async (data) => {
      const storageData = data.sort((a, b) => {
        if (b.total === a.total) {
          return new BN(b.balance).minus(new BN(a.balance)).toNumber();
        } else {
          return new BN(b.total).minus(new BN(a.total)).toNumber();
        }
      });
      if (!storageData) return;

      // Create a map for faster lookups
      const uniqueTokenMap = new Map();
      let sum = new BN(0);
      let flowBalance = new BN(0);

      // Single pass through the data
      for (const coin of storageData) {
        const lowerUnit = coin.unit.toLowerCase();

        // Handle unique tokens
        if (!uniqueTokenMap.has(lowerUnit)) {
          uniqueTokenMap.set(lowerUnit, coin);
        }

        // Calculate sum and flow balance
        if (coin.total !== null) {
          sum = sum.plus(new BN(coin.total));
          if (lowerUnit === 'flow') {
            flowBalance = new BN(coin.balance);
          }
        }
      }

      // Batch updates
      await Promise.all([
        setCoins(Array.from(uniqueTokenMap.values())),
        setTotalFlow(flowBalance.toString()),
        setBalance(`$ ${sum.toFixed(2)}`),
      ]);
    },
    [setCoins, setTotalFlow, setBalance]
  );

  // Setup localStorage event listener
  useEffect(() => {
    // Function to check pending transactions
    const loadCoinList = async () => {
      try {
        const coinList = await storage.get('coinList');
        const userWallet = await storage.get('userWallets');
        // check for nettwork type
        let refreshedCoinlist;

        if (isValidEthereumAddress(userWallet.currentAddress)) {
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

  const calculateAvailableBalance = useCallback(async () => {
    // Prevent concurrent calculations and duplicate calculations
    if (calculationInProgressRef.current) {
      return;
    }

    if (lastTotalFlowRef.current === totalFlow) {
      return;
    }

    try {
      calculationInProgressRef.current = true;
      lastTotalFlowRef.current = totalFlow;

      // Make sure the wallet is unlocked
      if (!usewallet || !walletLoaded) {
        return;
      }

      if (!(await usewallet.isUnlocked())) {
        return;
      }

      if (!(await usewallet.getParentAddress())) {
        return;
      }

      if (!mainAddress) {
        return;
      }

      const address = withPrefix(mainAddress) || '';

      // TODO: need a controller for this
      const minAmount = new BN(
        (await usewallet.openapi.getAccountMinFlow(address)) || DEFAULT_MIN_AMOUNT
      );
      const total = new BN(totalFlow);
      const availableFlow = total.minus(minAmount).toString();

      setAvailableFlow(availableFlow);
    } catch (error) {
      console.error('Error calculating available balance:', error);
      setAvailableFlow('0');
    } finally {
      calculationInProgressRef.current = false;
    }
  }, [usewallet, walletLoaded, totalFlow, mainAddress, setAvailableFlow]);

  const refreshCoinData = useCallback(async () => {
    // Prevent concurrent refreshes and throttle calls
    if (refreshInProgressRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 5000) {
      // 5 second throttle
      return;
    }

    if (!usewallet || !walletLoaded) {
      return;
    }

    try {
      refreshInProgressRef.current = true;
      lastRefreshTimeRef.current = now;

      // Make sure the wallet is unlocked
      if (!(await usewallet.isUnlocked())) {
        return;
      }

      if (!(await usewallet.getParentAddress())) {
        return;
      }

      console.log('refreshedCoinlist');
    } catch (error) {
      console.error('Error refreshing coin data:', error);
    } finally {
      refreshInProgressRef.current = false;
    }
  }, [usewallet, walletLoaded]);

  // Calculate available balance when totalFlow changes
  useEffect(() => {
    let mounted = true;

    if (
      walletLoaded &&
      totalFlow &&
      !calculationInProgressRef.current &&
      lastTotalFlowRef.current !== totalFlow
    ) {
      calculateAvailableBalance();
    }

    return () => {
      mounted = false;
    };
  }, [totalFlow, calculateAvailableBalance, walletLoaded]);

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
