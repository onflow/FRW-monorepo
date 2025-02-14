import React from 'react';

import { formatPrice } from '@/shared/utils/formatTokenValue';

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
    return <span className={className}>{''}</span>;
  }

  const numberWithCommas = (x: string) => {
    // Split string into integer and decimal parts (if any)
    const parts = x.split('.');
    const integerPart = parts[0];

    // Only add commas if the integer part is between 4 and 6 digits
    if (integerPart.length >= 4 && integerPart.length <= 6) {
      // Add commas every 3 digits from the right
      const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      // Reconstruct number with decimal part if it exists
      return parts.length > 1 ? `${withCommas}.${parts[1]}` : withCommas;
    }

    return x;
  };

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
