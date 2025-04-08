import React, { useEffect, useState } from 'react';

import { userWalletService } from '@/background/service';

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

  useEffect(() => {
    const loadCurrencyInfo = async () => {
      try {
        const code = userWalletService.getDisplayCurrency();
        const symbol = await userWalletService.getCurrencySymbol();
        setCurrencyCode(code);
        setCurrencySymbol(symbol);
      } catch (error) {
        console.warn('Error loading currency info:', error);
        // Fallback to USD if there's an error
        setCurrencyCode('USD');
        setCurrencySymbol('$');
      }
    };

    loadCurrencyInfo();
  }, []);

  return (
    <TokenValue
      value={value}
      className={className}
      prefix={currencySymbol}
      postFix={showCurrencyCode ? currencyCode : undefined}
    />
  );
};
