/**
 * Standardized retry configurations for TanStack Query
 * Provides consistent retry behavior across the application
 */

export interface RetryConfig {
  retry: number;
  retryDelay: (attemptIndex: number) => number;
}

/**
 * Exponential backoff with jitter to prevent thundering herd
 */
function exponentialBackoffWithJitter(
  baseDelay: number,
  maxDelay: number,
  jitterFactor: number = 0.1
) {
  return (attemptIndex: number): number => {
    const exponentialDelay = baseDelay * 2 ** attemptIndex;
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * jitterFactor * Math.random();
    return cappedDelay + jitter;
  };
}

/**
 * Retry configurations for different types of data
 */
export const retryConfigs = {
  /**
   * Critical financial data (balances, token amounts)
   * High retry count with longer delays
   */
  critical: {
    retry: 3,
    retryDelay: exponentialBackoffWithJitter(1000, 30000),
  },

  /**
   * Important data (token lists, account info)
   * Medium retry count with moderate delays
   */
  important: {
    retry: 2,
    retryDelay: exponentialBackoffWithJitter(1000, 20000),
  },

  /**
   * Standard data (NFT collections, metadata)
   * Standard retry count with shorter delays
   */
  standard: {
    retry: 1,
    retryDelay: exponentialBackoffWithJitter(500, 10000),
  },

  /**
   * Non-critical data (compatibility checks, optional features)
   * Minimal retry with fast backoff
   */
  minimal: {
    retry: 1,
    retryDelay: exponentialBackoffWithJitter(500, 5000),
  },
} as const;

/**
 * Helper function to get retry config by data criticality
 */
export function getRetryConfig(criticality: keyof typeof retryConfigs): RetryConfig {
  return retryConfigs[criticality];
}

/**
 * Custom retry function that logs retry attempts for debugging
 */
export function createRetryFunction(
  criticality: keyof typeof retryConfigs,
  context?: string
) {
  const config = getRetryConfig(criticality);
  
  return {
    ...config,
    onError: (error: Error, attemptIndex: number) => {
      if (context) {
        console.warn(`[Retry ${attemptIndex + 1}/${config.retry + 1}] ${context}:`, error.message);
      }
    },
  };
}
