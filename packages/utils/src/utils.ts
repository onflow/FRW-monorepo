// Extend Array prototype with Swift-like methods
declare global {
  interface Array<T> {
    compactMap<U>(transform: (item: T, index: number) => U | null | undefined): U[];
    safeMapTokens<U>(
      this: Array<{ name?: string }>,
      transform: (token: T & { name: string }, index: number) => U
    ): U[];
  }
}

// Implementation for compactMap
if (!Array.prototype.compactMap) {
  Array.prototype.compactMap = function <T, U>(
    this: T[],
    transform: (item: T, index: number) => U | null | undefined
  ): U[] {
    const result: U[] = [];
    for (let i = 0; i < this.length; i++) {
      const transformed = transform(this[i], i);
      if (transformed !== null && transformed !== undefined) {
        result.push(transformed);
      }
    }
    return result;
  };
}

// Implementation for safeMapTokens (chainable version)
if (!Array.prototype.safeMapTokens) {
  Array.prototype.safeMapTokens = function <T extends { name?: string }, U>(
    this: T[],
    transform: (token: T & { name: string }, index: number) => U
  ): U[] {
    return this.compactMap((token, index) => {
      if (!isValidToken(token)) return null;
      return transform(token as T & { name: string }, index);
    });
  };
}

/**
 * Swift-like compactMap: maps array and filters out null/undefined results
 * @deprecated Use Array.prototype.compactMap instead for better chaining
 */
export function compactMap<T, U>(
  array: readonly T[],
  transform: (item: T, index: number) => U | null | undefined
): U[] {
  return Array.from(array).compactMap(transform);
}

/**
 * Safe token validator for React components
 */
export function isValidToken<T extends { name?: string }>(token: unknown): token is T {
  return (
    token !== null &&
    typeof token === 'object' &&
    token !== null &&
    'name' in token &&
    typeof (token as { name?: string }).name === 'string' &&
    (token as { name: string }).name.length > 0
  );
}

/**
 * Safe map for tokens with automatic filtering
 */
export function safeMapTokens<T extends { name?: string }, U>(
  tokens: readonly T[],
  transform: (token: T, index: number) => U
): U[] {
  return compactMap(tokens, (token, index) => {
    if (!isValidToken(token)) return null;
    return transform(token as T, index);
  });
}

/**
 * Converts a value to a readable format with proper decimal places
 */
export function formatTokenAmount(amount: string | number, decimals = 8): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';

  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

/**
 * Debounce function utility
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone utility
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * Throttle function utility
 */
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '0';
  return numValue.toLocaleString();
}

/**
 * Checks if a value is empty (null, undefined, empty string, or empty array)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Checks if a string is a valid transaction ID
 * Supports both Flow and Ethereum transaction ID formats
 */
export function isTransactionId(str: unknown): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  const cleaned = str.trim();
  const flowPattern = /^[0-9a-fA-F]{64}$/;
  const ethPattern = /^0x[0-9a-fA-F]{64}$/;
  return flowPattern.test(cleaned) || ethPattern.test(cleaned);
}

export function stripHexPrefix(str: string): string {
  return str.startsWith('0x') ? str.slice(2) : str;
}

export const isEmoji = (char: string | undefined) => {
  if (!char) return false;
  // Regular expression to match most emojis
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;
  return emojiRegex.test(char);
};
