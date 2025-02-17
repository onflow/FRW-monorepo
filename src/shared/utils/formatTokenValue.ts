interface PriceParts {
  leadingPart: string;
  zeroPart: number | null;
  endingPart: string | null;
}

interface FormattedPrice {
  price: string;
  formattedPrice: PriceParts;
}

/**
 * Converts scientific notation to decimal string
 * @param numStr - Number in scientific notation (e.g., "1e-7")
 * @returns Decimal string (e.g., "0.0000001")
 */
function scientificToDecimal(numStr: string): string {
  // Convert string to number to handle scientific notation
  const num = Number(numStr);

  // Check if the number is in scientific notation
  if (Math.abs(num) < 1e-6 || /e/i.test(numStr)) {
    // Convert to decimal string without scientific notation
    const str = num.toFixed(20);
    // Remove trailing zeros after decimal point
    return str.replace(/\.?0+$/, '');
  }

  return numStr;
}

/**
 * Condenses the price to a more readable format.
 * @param priceStr - The price string to format.
 * @param zeroCondenseThreshold - The number of zeros to condense. example: 4 would condense 0.0000123 to 0.0(3)12.
 * First zero after decimal point is maintained for readability.
 * @param decimals - The number of decimals to display.
 * @returns The formatted price.
 */
export function formatPrice(priceStr: string, zeroCondenseThreshold = 4): FormattedPrice {
  // Handle empty or invalid input
  if (!priceStr || priceStr === '0') {
    return {
      price: priceStr,
      formattedPrice: {
        leadingPart: '',
        zeroPart: null,
        endingPart: null,
      },
    };
  }

  // Convert scientific notation to decimal string
  const decimalStr = scientificToDecimal(priceStr);

  // Handle numbers >= 1
  if (!decimalStr.startsWith('0.')) {
    return {
      price: decimalStr,
      formattedPrice: {
        leadingPart: decimalStr,
        zeroPart: null,
        endingPart: null,
      },
    };
  }

  // Count zeros after decimal point
  let zeroCount = 0;
  let firstNonZeroIndex = 2; // Start after "0."

  while (decimalStr[firstNonZeroIndex] === '0' && firstNonZeroIndex < decimalStr.length) {
    zeroCount++;
    firstNonZeroIndex++;
  }

  // If we don't have enough zeros to meet threshold, return formatted number
  if (zeroCount < zeroCondenseThreshold) {
    const significantPart = decimalStr.slice(firstNonZeroIndex, firstNonZeroIndex + 2);
    const formattedNumber = `0.${'0'.repeat(zeroCount)}${significantPart}`;
    return {
      price: decimalStr,
      formattedPrice: {
        leadingPart: formattedNumber,
        zeroPart: null,
        endingPart: null,
      },
    };
  }

  // Break up the price into parts for condensed format
  const significantDigits = decimalStr.slice(firstNonZeroIndex, firstNonZeroIndex + 2);
  return {
    price: decimalStr,
    formattedPrice: {
      leadingPart: '0.0',
      zeroPart: zeroCount,
      endingPart: significantDigits,
    },
  };
}
