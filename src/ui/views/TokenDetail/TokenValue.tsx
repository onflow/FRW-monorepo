import React from 'react';

import { formatPrice } from '@/shared/utils/formatTokenValue';
import { numberWithCommas } from '@/ui/utils';

interface TokenPriceProps {
  value: string;
  className?: string;
  showPrefix?: boolean;
  prefix?: string;
  postFix?: string;
}

export const TokenValue: React.FC<TokenPriceProps> = ({
  value,
  className = '',
  prefix = '',
  postFix = '',
}) => {
  if (!value || value === '0' || value === '') {
    return <span className={className}>&nbsp;</span>;
  }

  const { formattedPrice } = formatPrice(value);
  const { leadingPart, zeroPart, endingPart } = formattedPrice;

  return (
    <span className={className} data-testid={`token-value-${value}`}>
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
