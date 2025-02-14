// TODO: remove this function. It's called from CoinList and Wallet

export const formatLargeNumber = (num) => {
  if (typeof num === 'string' && num.startsWith('$')) {
    num = num.slice(1);
  }

  if (num >= 1e12) {
    return (num / 1e12).toFixed(3) + 'T'; // Trillions
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(3) + 'B'; // Billions
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(3) + 'M'; // Millions
  } else {
    return num.toString(); // Less than 1M, return as-is
  }
};

// TODO: remove this function. It's called from TokenInfoCard.tsx
export const addDotSeparators = (num) => {
  // replace with http://numeraljs.com/ if more requirements
  const [integerPart, decimalPart] = parseFloat(num).toFixed(8).split('.');

  // Format the integer part with comma separators
  const newIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const trimmedDecimal = decimalPart.replace(/0+$/, '');
  const formattedDecimal = trimmedDecimal.length > 0 ? trimmedDecimal : decimalPart.slice(-3);

  return `${newIntegerPart}.${formattedDecimal}`;
};

export const stripEnteredAmount = (value: string, maxDecimals: number) => {
  // Remove minus signs and non-digit/non-decimal characters
  const cleanValue = value.replace(/[^\d.]/g, '');

  // Find the first decimal point and ignore everything after a second one
  const firstDecimalIndex = cleanValue.indexOf('.');
  if (firstDecimalIndex !== -1) {
    const beforeDecimal = cleanValue.slice(0, firstDecimalIndex).replace(/^0+/, '');
    const afterDecimalParts = cleanValue.slice(firstDecimalIndex + 1).split('.');
    const afterDecimal = afterDecimalParts.length > 0 ? afterDecimalParts[0] : '';

    // Handle integer part
    const integerPart = beforeDecimal === '' ? '0' : beforeDecimal;

    // Handle decimal part
    const trimmedDecimal = afterDecimal.slice(0, maxDecimals);

    return trimmedDecimal ? `${integerPart}.${trimmedDecimal}` : `${integerPart}.`;
  }

  // No decimal point case
  return cleanValue === '' ? '' : cleanValue === '0' ? '0' : cleanValue.replace(/^0+/, '');
};

export const stripFinalAmount = (value: string, maxDecimals: number) => {
  const strippedValue = stripEnteredAmount(value, maxDecimals);

  // Return '0' for empty string
  if (strippedValue === '') {
    return '0';
  }

  // Remove trailing decimal point and zeros after decimal
  if (strippedValue.includes('.')) {
    const [integerPart, decimalPart] = strippedValue.split('.');
    if (!decimalPart) {
      return integerPart;
    }

    const trimmedDecimal = decimalPart.replace(/0+$/, '');
    return trimmedDecimal ? `${integerPart}.${trimmedDecimal}` : integerPart;
  }

  return strippedValue;
};

// Validate that a string is a valid transaction amount with the given max decimal places
// If exact is true, the amount must have exactly maxDecimals decimal places
export const validateAmount = (amount: string, maxDecimals: number, exact = false): boolean => {
  const regex =
    maxDecimals === 0
      ? `^(0|[1-9]\\d*)$`
      : exact
        ? `^(0|[1-9]\\d*)\\.\\d{${maxDecimals}}$`
        : `^(0|[1-9]\\d*)(\\.\\d{1,${maxDecimals}})?$`;
  return new RegExp(regex).test(amount);
};

export const convertToIntegerAmount = (amount: string, decimals: number): string => {
  // Check if the amount is valid
  if (!validateAmount(amount, decimals)) {
    throw new Error('Invalid amount or decimal places');
  }

  // Create an integer string based on the required token decimals
  const parts = amount.split('.');
  const hasDecimal = parts.length > 1;
  const integerPart = parts[0];
  const decimalPart = hasDecimal ? parts[1] : '';
  // Pad the decimal part with zeros
  const paddedDecimal = decimalPart.padEnd(decimals, '0');
  // Remove leading zeros
  return `${integerPart}${paddedDecimal}`.replace(/^0+/, '') || '0';
};

export const numberWithCommas = (x: string) => {
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

export const getDecimalBalance = (value: string, decimals: number): string => {
  // wrap try catch so components don't blow up if the value is invalid
  try {
    const integerValue = convertToIntegerAmount(value, decimals);
    const factor = BigInt(10 ** decimals);
    const result = BigInt(integerValue) / factor;
    return result.toString();
  } catch (error) {
    console.error('Error converting to integer amount:', error);
    return '0';
  }
};
