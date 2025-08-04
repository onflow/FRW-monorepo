// Convert number to subscript characters
function digitalSubscript(num: number | string): string {
  const subscriptMap: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  return String(num)
    .split('')
    .map(c => subscriptMap[c] ?? c)
    .join('');
}

// Special formatting for very small values
function formattedWithSubscript(value: number, requiredDigits: number = 4): string {
  if (value === 0) return '0';

  const threshold = 0.0001;
  const absValue = Math.abs(value);

  if (absValue >= threshold) {
    // Normal formatting, up to 8 decimal places
    return absValue.toFixed(8).replace(/\.?0+$/, '');
  }

  // Take 20 decimal places, count leading zeros
  const decimalStr = absValue.toFixed(20).split('.')[1];
  let leadingZeros = 0;
  for (const char of decimalStr) {
    if (char === '0') leadingZeros++;
    else break;
  }

  let significantDigits = decimalStr.slice(leadingZeros);
  while (significantDigits.length < requiredDigits) {
    significantDigits += '0';
  }

  // Round to requiredDigits digits
  let roundedNumber = parseInt(significantDigits.slice(0, requiredDigits)) || 0;
  roundedNumber = Math.round(roundedNumber / 10);

  let roundedString = String(roundedNumber);
  // Remove trailing zeros
  while (roundedString.endsWith('0') && roundedString.length > 1) {
    roundedString = roundedString.slice(0, -1);
  }

  const subscriptZeros = digitalSubscript(leadingZeros);

  return `0.0${subscriptZeros}${roundedString}`;
}

// Main formatting function
type RoundingMode = 'down' | 'halfUp';

export interface FormatCurrencyOptions {
  value: number;
  digits?: number;
  roundingMode?: RoundingMode;
  considerCustomCurrency?: boolean;
  currentCurrencyRate?: number;
}

export function formatCurrencyStringForDisplay({
  value,
  digits = 2,
  roundingMode = 'halfUp',
  considerCustomCurrency = false,
  currentCurrencyRate = 1,
}: FormatCurrencyOptions): string {
  const displayValue = considerCustomCurrency ? value * currentCurrencyRate : value;

  if (Math.abs(displayValue) < 0.0001 && displayValue !== 0) {
    return formattedWithSubscript(displayValue, digits);
  } else {
    // Round/Truncate to digits decimal places
    const factor = Math.pow(10, digits);
    let rounded: number;
    if (roundingMode === 'down') {
      rounded = Math.floor(displayValue * factor) / factor;
    } else {
      // halfUp
      rounded = Math.round(displayValue * factor) / factor;
    }
    // Keep up to digits decimal places, remove extra zeros
    return rounded.toFixed(digits).replace(/\.?0+$/, '');
  }
}

/**
 * Truncate balance display text to fit in limited space
 * @param balance - Full balance string (e.g., "0.59902605 FLOW")
 * @param maxLength - Maximum character length (default: 15)
 * @returns Truncated balance string
 */
export function truncateBalance(balance: string, maxLength: number = 15): string {
  if (!balance || balance.length <= maxLength) {
    return balance;
  }

  // Try to preserve the currency symbol (FLOW, etc.)
  const parts = balance.split(' ');
  if (parts.length === 2) {
    const [amount, symbol] = parts;
    const symbolLength = symbol.length + 1; // +1 for space
    const availableForAmount = maxLength - symbolLength;

    if (availableForAmount > 3) {
      // Minimum viable amount
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount)) {
        // Use formatCurrencyStringForDisplay to get a nicely formatted shorter version
        const maxDigits = Math.max(
          0,
          availableForAmount - Math.floor(numericAmount).toString().length - 1
        );
        const formattedAmount = formatCurrencyStringForDisplay({
          value: numericAmount,
          digits: Math.min(maxDigits, 3),
        });
        return `${formattedAmount} ${symbol}`;
      }
    }
  }

  // Fallback: simple truncation with ellipsis
  return balance.substring(0, maxLength - 3) + '...';
}
