/**
 * Minimal Analytics interface for ServiceContext DI
 * This allows platforms to inject their analytics implementation
 * without the context package depending on @onflow/frw-analytics
 *
 * Note: TransactionSession type is NOT defined here to avoid conflicts
 * with @onflow/frw-analytics. Import TransactionSession from there instead.
 */

/**
 * Transaction tracker for creating transaction sessions
 * Returns unknown to avoid type conflicts - callers should cast to
 * TransactionSession from @onflow/frw-analytics
 */
export interface TransactionTracker {
  createTransactionSession(walletAddress: string, transactionType: string): unknown;
}

/**
 * Analytics service interface
 * Platforms can implement this to provide analytics functionality
 */
export interface AnalyticsService {
  /** Get or create a transaction tracker */
  getTransactionTracker(): TransactionTracker | null;

  /** Check if analytics is available/enabled */
  isEnabled(): boolean;
}
