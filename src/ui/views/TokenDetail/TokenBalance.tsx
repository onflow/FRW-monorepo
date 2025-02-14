import React from 'react';

import { formatPrice } from '@/shared/utils/formatTokenValue';
import { numberWithCommas, getDecimalBalance } from '@/shared/utils/number';

interface TokenBalanceProps {
  value: string;
  decimals?: number;
  className?: string;
  showFull?: boolean;
  prefix?: string;
  postFix?: string;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  value,
  decimals = 18, // default to max decimals
  className = '',
  showFull = false,
  prefix = '',
  postFix = '',
}) => {
  if (!value || value === '0' || value === '') {
    return <span className={className}>{'0'}</span>;
  }

  const decimalBalance = getDecimalBalance(value, decimals);

  if (showFull) {
    return (
      <span className={className} data-testid={`token-balance-${value}`}>
        {prefix}
        <span>{numberWithCommas(value)}</span>
        {postFix && <span style={{ marginLeft: '0.25rem' }}>{postFix}</span>}
      </span>
    );
  }

  const { formattedPrice } = formatPrice(decimalBalance);
  const { leadingPart, zeroPart, endingPart } = formattedPrice;

  return (
    <span className={className} data-testid={`token-balance-${value}`}>
      {prefix}
      <span style={leadingPart === '' ? { padding: '0 0.25rem' } : undefined}>
        {numberWithCommas(leadingPart)}
      </span>
      {zeroPart !== null && (
        <sub
          style={{
            fontSize: '0.7em',
            verticalAlign: '-0.25em',
          }}
        >
          {zeroPart}
        </sub>
      )}
      {endingPart !== null && endingPart}
      {postFix && <span style={{ marginLeft: '0.25rem' }}>{postFix}</span>}
    </span>
  );
};
