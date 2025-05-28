import React from 'react';

import { useCurrency } from '@/ui/hooks/preference-hooks';

import { TokenValue } from './TokenValue';

interface CurrencyValueProps {
  value: string;
  currencyCode: string;
  currencySymbol: string;
  className?: string;
  showCurrencyCode?: boolean;
}

export const CurrencyValue: React.FC<CurrencyValueProps> = ({
  value,
  currencyCode,
  currencySymbol,
  className,
  showCurrencyCode = true,
}) => {
  return (
    <TokenValue
      value={value}
      className={className}
      prefix={currencySymbol}
      postFix={showCurrencyCode ? currencyCode : undefined}
    />
  );
};
