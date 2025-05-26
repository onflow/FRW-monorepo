import React from 'react';

import { useCurrency } from '@/ui/hooks/preference-hooks';

import { TokenValue } from './TokenValue';

interface CurrencyValueProps {
  value: string;
  className?: string;
  showCurrencyCode?: boolean;
  currencyCode?: string;
  currencySymbol?: string;
}

export const CurrencyValue: React.FC<CurrencyValueProps> = ({
  value,
  className,
  showCurrencyCode = true,
  currencyCode,
  currencySymbol,
}) => {
  //only use its values if props aren't provided
  const currency = useCurrency();
  const renderedCurrencyCode = currencyCode || currency?.code;
  const renderedCurrencySymbol = currencySymbol || currency?.symbol;
  return (
    <TokenValue
      value={renderedCurrencyCode ? value : ''}
      className={className}
      prefix={renderedCurrencySymbol}
      postFix={showCurrencyCode ? renderedCurrencyCode : undefined}
    />
  );
};
