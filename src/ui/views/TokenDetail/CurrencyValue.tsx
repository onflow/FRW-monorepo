import React from 'react';

import { useCurrency } from '@/ui/hooks/preference-hooks';

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

  return (
    <TokenValue
      value={currencyCode ? value : ''}
      className={className}
      prefix={currencySymbol}
      postFix={showCurrencyCode ? currencyCode : undefined}
    />
  );
};
