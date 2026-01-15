/**
 * Minimal Analytics interface for ServiceContext DI
 * This allows platforms to inject their analytics implementation
 * without the context package depending on @onflow/frw-analytics
 */

/**
 * Transaction session for tracking send workflows
 * Matches the TransactionSession interface from @onflow/frw-analytics
 */
export interface TransactionSession {
  /** Called when transaction payload is prepared */
  prepared(payload: unknown, metadata?: Record<string, unknown>): void;
  /** Called when transaction is signed */
  signed(cadence: string, signType: string, keyIndex: number): void;
  /** Called when transaction is submitted to chain */
  submitted(txId: string): void;
  /** Called when transaction completes (success or failure) */
  completed(success: boolean, txId: string): void;
  /** Called when transaction fails */
  failed(error: string, errorCode?: string, stage?: string): void;
}

/**
 * Transaction tracker for creating transaction sessions
 * Matches the TransactionTracker interface from @onflow/frw-analytics
 */
export interface TransactionTracker {
  createTransactionSession(walletAddress: string, transactionType: string): TransactionSession;
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
