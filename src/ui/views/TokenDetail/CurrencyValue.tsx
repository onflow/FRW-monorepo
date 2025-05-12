import React, { useEffect, useState, useCallback } from 'react';

import { DEFAULT_CURRENCY } from '@/shared/types/wallet-types';
import { useCurrency } from '@/ui/hooks/preference-hooks';
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
  const currency = useCurrency();
  const currencyCode = currency?.code;
  const currencySymbol = currency?.symbol;
  // Function to fetch the currency directly from the background

  return (
    <TokenValue
      value={currencyCode ? value : ''}
      className={className}
      prefix={currencySymbol}
      postFix={showCurrencyCode ? currencyCode : undefined}
    />
  );
};
