import BN from 'bignumber.js';
import { useCallback, useEffect, useState, useRef } from 'react';

import { withPrefix } from '@/shared/utils/address';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { useCoinStore } from '@/ui/stores/coinStore';
import { debug } from '@/ui/utils';
import { useWallet, useWalletLoaded } from '@/ui/utils/WalletContext';
const DEFAULT_MIN_AMOUNT = '0.001';

export const useCoins = () => {
  const usewallet = useWallet();
  const walletLoaded = useWalletLoaded();
  const { mainAddress } = useProfiles();

  const [coinsLoaded, setCoinsLoaded] = useState(false);
  const refreshInProgressRef = useRef(false);
  const calculationInProgressRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);
  const lastTotalFlowRef = useRef('');

  // Action selectors
  const setCoinData = useCoinStore((state) => state.setCoinData);
  const setBalance = useCoinStore((state) => state.setBalance);
  const setTotalFlow = useCoinStore((state) => state.setTotalFlow);
  const setAvailableFlow = useCoinStore((state) => state.setAvailableFlow);
  const clearCoins = useCoinStore((state) => state.clearCoins);

  // State selectors
  const coins = useCoinStore((state) => state.coins);
  const balance = useCoinStore((state) => state.balance);
  const totalFlow = useCoinStore((state) => state.totalFlow);
  const availableFlow = useCoinStore((state) => state.availableFlow);

  const handleStorageData = useCallback(
    async (storageData) => {
      if (!storageData) return;
      debug('useCoinHook', 'Processing storage data');

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

      debug('useCoinHook', 'Calculated balances', {
        sum: sum.toString(),
        flowBalance: flowBalance.toString(),
      });

      // Batch updates
      await Promise.all([
        setCoinData(Array.from(uniqueTokenMap.values())),
        setTotalFlow(flowBalance.toString()),
        setBalance(`$ ${sum.toFixed(2)}`),
      ]);
      debug('useCoinHook', 'Updated coin store');
    },
    [setCoinData, setTotalFlow, setBalance]
  );

  const calculateAvailableBalance = useCallback(async () => {
    // Prevent concurrent calculations and duplicate calculations
    if (calculationInProgressRef.current) {
      debug('useCoinHook', 'Calculation already in progress, skipping');
      return;
    }

    if (lastTotalFlowRef.current === totalFlow) {
      debug('useCoinHook', 'Total flow unchanged, skipping calculation');
      return;
    }

    try {
      calculationInProgressRef.current = true;
      lastTotalFlowRef.current = totalFlow;

      // Make sure the wallet is unlocked
      if (!usewallet || !walletLoaded) {
        debug('useCoinHook', 'Wallet not ready');
        return;
      }

      if (!(await usewallet.isUnlocked())) {
        debug('useCoinHook', 'Wallet is locked');
        return;
      }

      if (!(await usewallet.getParentAddress())) {
        debug('useCoinHook', 'No main wallet yet');
        return;
      }

      if (!mainAddress) {
        debug('useCoinHook', 'No main address available');
        return;
      }

      const address = withPrefix(mainAddress) || '';
      debug('Calculating available balance for', address);

      // TODO: need a controller for this
      const minAmount = new BN(
        (await usewallet.openapi.getAccountMinFlow(address)) || DEFAULT_MIN_AMOUNT
      );
      const total = new BN(totalFlow);
      const availableFlow = total.minus(minAmount).toString();
      debug('useCoinHook', 'Available flow calculated', {
        total: total.toString(),
        minAmount: minAmount.toString(),
        available: availableFlow,
      });

      setAvailableFlow(availableFlow);
    } catch (error) {
      console.error('Error calculating available balance:', error);
      setAvailableFlow('0');
    } finally {
      calculationInProgressRef.current = false;
    }
  }, [usewallet, walletLoaded, totalFlow, mainAddress, setAvailableFlow]);

  const sortWallet = useCallback(
    (data) => {
      debug('useCoinHook', 'Sorting wallet data');
      const sorted = data.sort((a, b) => {
        if (b.total === a.total) {
          return new BN(b.balance).minus(new BN(a.balance)).toNumber();
        } else {
          return new BN(b.total).minus(new BN(a.total)).toNumber();
        }
      });
      handleStorageData(sorted);
    },
    [handleStorageData]
  );

  const refreshCoinData = useCallback(async () => {
    // Prevent concurrent refreshes and throttle calls
    if (refreshInProgressRef.current) {
      debug('useCoinHook', 'Refresh already in progress, skipping');
      return;
    }

    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 5000) {
      // 5 second throttle
      debug('useCoinHook', 'Refresh throttled, skipping');
      return;
    }

    if (!usewallet || !walletLoaded) {
      debug('useCoinHook', 'Cannot refresh coin data - wallet not ready');
      return;
    }

    try {
      refreshInProgressRef.current = true;
      lastRefreshTimeRef.current = now;

      // Make sure the wallet is unlocked
      if (!(await usewallet.isUnlocked())) {
        debug('useCoinHook', 'Wallet is locked');
        return;
      }

      if (!(await usewallet.getParentAddress())) {
        debug('useCoinHook', 'No main wallet yet');
        return;
      }

      debug('useCoinHook', 'Refreshing coin list');
      const refreshedCoinlist = await usewallet.refreshCoinList(60000);

      if (Array.isArray(refreshedCoinlist) && refreshedCoinlist.length > 0) {
        debug('useCoinHook', 'Refreshed coin list', { count: refreshedCoinlist.length });
        sortWallet(refreshedCoinlist);
        setCoinsLoaded(true);
        debug('useCoinHook', 'Coins loaded successfully');
      }
    } catch (error) {
      console.error('Error refreshing coin data:', error);
    } finally {
      refreshInProgressRef.current = false;
    }
  }, [usewallet, sortWallet, walletLoaded]);

  // Initial load - only once when wallet is loaded
  useEffect(() => {
    let mounted = true;

    if (usewallet && walletLoaded && !coinsLoaded && !refreshInProgressRef.current) {
      debug('useCoinHook', 'Initial coin data refresh');
      refreshCoinData();
    }

    return () => {
      mounted = false;
    };
  }, [refreshCoinData, usewallet, walletLoaded, coinsLoaded]);

  // Calculate available balance when totalFlow changes
  useEffect(() => {
    let mounted = true;

    if (
      walletLoaded &&
      totalFlow &&
      !calculationInProgressRef.current &&
      lastTotalFlowRef.current !== totalFlow
    ) {
      debug('useCoinHook', 'Total flow changed, recalculating available balance', { totalFlow });
      calculateAvailableBalance();
    }

    return () => {
      mounted = false;
    };
  }, [totalFlow, calculateAvailableBalance, walletLoaded]);

  return {
    refreshCoinData,
    handleStorageData,
    clearCoins,
    coins,
    balance,
    totalFlow,
    availableFlow,
    coinsLoaded,
  };
};
