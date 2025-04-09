import React, { useEffect, useState, useCallback } from 'react';

import { DEFAULT_CURRENCY } from '@/shared/types/wallet-types';
import { useWallet } from '@/ui/utils/WalletContext';

import { TokenValue } from './TokenValue';

interface CurrencyValueProps {
  value: string;
  className?: string;
  showCurrencyCode?: boolean;
}

export const CurrencyValue: React.FC<CurrencyValueProps> = ({
  value,
  className,
  showCurrencyCode = true,
}) => {
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const wallet = useWallet(); // This accesses the background script's controller

  // Function to fetch the currency directly from the background
  const fetchCurrencyFromBackground = useCallback(async () => {
    try {
      const currency = await wallet.getDisplayCurrency();

      if (currency.code !== currencyCode || currency.symbol !== currencySymbol) {
        setCurrencyCode(currency.code);
        setCurrencySymbol(currency.symbol);
      }
    } catch (error) {
      console.warn('Error fetching currency from background:', error);
      setCurrencyCode(DEFAULT_CURRENCY.code);
      setCurrencySymbol(DEFAULT_CURRENCY.symbol);
    }
  }, [wallet, currencyCode, currencySymbol]);

  useEffect(() => {
    fetchCurrencyFromBackground();

    const intervalId = setInterval(fetchCurrencyFromBackground, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchCurrencyFromBackground]);

  return (
    <TokenValue
      value={value}
      className={className}
      prefix={currencySymbol}
      postFix={showCurrencyCode ? currencyCode : undefined}
    />
  );
};
