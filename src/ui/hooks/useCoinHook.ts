import BN from 'bignumber.js';
import { useCallback, useEffect, useState, useRef } from 'react';

import { type ExtendedTokenInfo, type CoinItem } from '@/shared/types/coin-types';
import { DEFAULT_CURRENCY, type Currency } from '@/shared/types/wallet-types';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { debug } from '@/ui/utils';
import { useWallet } from '@/ui/utils/WalletContext';

import { useCoinList } from './use-coin-hooks';
import { useProfiles } from './useProfileHook';

export const useCoins = () => {
  const usewallet = useWallet();
  const { network } = useNetwork();
  const { currentWallet } = useProfiles();

  const initAttemptedRef = useRef(false);

  // Replace Zustand state with React state
  const [balance, setBalance] = useState<string>('0');
  const [totalFlow, setTotalFlow] = useState<string>('0');
  const [availableFlow, setAvailableFlow] = useState<string>('0');
  const [coinsLoaded, setCoinsLoaded] = useState(false);
  const [currencyCode, setCurrencyCode] = useState<string | undefined>();

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const currency: Currency = await usewallet?.getDisplayCurrency();
        setCurrencyCode(currency?.code);
      } catch (error) {
        console.error('Failed to fetch display currency, using default USD:', error);
        setCurrencyCode(DEFAULT_CURRENCY.code); // Handle error case
      }
    };
    if (usewallet) {
      fetchCurrency();
    }
  }, [usewallet]);

  const handleStorageData = useCallback(
    async (data?: ExtendedTokenInfo[] | null) => {
      debug('handleStorageData', data);
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

      // Batch updates
      await Promise.all([
        setTotalFlow(flowBalance.toString()),
        setAvailableFlow(flowBalance.toString()),
        setBalance(`$ ${sum.toFixed(2)}`),
      ]);
    },
    [setTotalFlow, setBalance]
  );

  const coins = useCoinList(network, currentWallet?.address, currencyCode);

  useEffect(() => {
    // Check if currentWallet exists and has an address
    if (currentWallet?.address) {
      // If coinList is empty or undefined, initialize it
      if ((!coins || coins.length === 0) && !initAttemptedRef.current) {
        debug('Coin list is empty, initializing for address:', currentWallet.address);

        const initAndHandle = async () => {
          try {
            initAttemptedRef.current = true;
            debug('Coin list initialization completed');
          } catch (error) {
            console.error('Error initializing coin list:', error);
          }
        };

        initAndHandle();
      } else if (coins && coins.length > 0) {
        handleStorageData(coins);
        setCoinsLoaded(true);
        debug('Coin list already loaded with', coins.length);
      }
    }
  }, [usewallet, network, currentWallet, coins, handleStorageData]);

  useEffect(() => {
    initAttemptedRef.current = false;
  }, [currentWallet?.address, network]);

  return {
    handleStorageData,
    coins: coins || [],
    balance,
    totalFlow,
    availableFlow,
    coinsLoaded,
  };
};
