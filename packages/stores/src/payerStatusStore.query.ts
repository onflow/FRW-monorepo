import { PayerService, type PayerStatusPayloadV1 } from '@onflow/frw-api';
import { queryClient } from '@onflow/frw-context';
import { logger } from '@onflow/frw-utils';
import { create } from 'zustand';

/**
 * Alias for the API response type - no need for computed fields
 */
export type PayerStatusInfo = PayerStatusPayloadV1;

interface PayerStatusStoreState {
  // Minimal state - TanStack Query handles caching
  placeholder?: never; // Prevent empty interface warning
}

interface PayerStatusStoreActions {
  // Core operations
  fetchPayerStatus: (network?: 'mainnet' | 'testnet') => Promise<PayerStatusInfo>;

  // Utilities
  getCachedPayerStatus: (network?: 'mainnet' | 'testnet') => PayerStatusInfo | null;
  clearCache: (network?: 'mainnet' | 'testnet') => void;
}

type PayerStatusStore = PayerStatusStoreState & PayerStatusStoreActions;

export const usePayerStatusStore = create<PayerStatusStore>((_set, _get) => ({
  // Fetch payer status using TanStack Query for caching
  fetchPayerStatus: async (network: 'mainnet' | 'testnet' = 'mainnet') => {
    return await queryClient.fetchQuery({
      queryKey: payerStatusQueryKeys.payerStatus(network),
      queryFn: () => payerStatusQueries.fetchPayerStatus(network),
    });
  },

  // Get cached payer status without fetching
  getCachedPayerStatus: (network: 'mainnet' | 'testnet' = 'mainnet') => {
    return queryClient.getQueryData(payerStatusQueryKeys.payerStatus(network)) || null;
  },

  // Clear cache
  clearCache: (network?: 'mainnet' | 'testnet') => {
    if (network) {
      queryClient.removeQueries({ queryKey: payerStatusQueryKeys.payerStatus(network) });
      logger.info('Cleared payer status cache', { network });
    } else {
      queryClient.removeQueries({ queryKey: payerStatusQueryKeys.all });
      logger.info('Cleared all payer status cache');
    }
  },
}));

/**
 * Query keys for payer status data
 */
export const payerStatusQueryKeys = {
  all: ['payer-status'] as const,
  payerStatus: (network: 'mainnet' | 'testnet' = 'mainnet') =>
    [...payerStatusQueryKeys.all, network] as const,
};

// Query Functions - Pure data fetching logic for payer status
export const payerStatusQueries = {
  // Fetch payer status information including surge pricing and payer availability
  fetchPayerStatus: async (
    network: 'mainnet' | 'testnet' = 'mainnet'
  ): Promise<PayerStatusInfo> => {
    try {
      logger.info('Fetching payer status', { network });

      const response = await PayerService.status({
        headers: {
          network,
        },
      });

      logger.info('Raw API response', { response, type: typeof response });

      // Handle wrapped response structure { status: 200, data: {...} }
      let payerStatusData;
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          payerStatusData = response.data;
        } else {
          payerStatusData = response;
        }
      } else {
        payerStatusData = response;
      }

      if (!payerStatusData) {
        logger.error('Invalid payer status response format', { response, payerStatusData });
        throw new Error('Invalid payer status response format');
      }

      logger.info('Extracted payer status data', { payerStatusData });

      return payerStatusData;
    } catch (error) {
      logger.error('Failed to fetch payer status', {
        error: error instanceof Error ? error.message : String(error),
        network,
      });
      throw error;
    }
  },
};

/**
 * Fetch payer status information including surge pricing and payer availability
 * @param network - The network to query (mainnet/testnet)
 * @returns Promise<PayerStatusInfo> - Raw API response
 */
export const fetchPayerStatus = async (
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<PayerStatusInfo> => {
  const result = await queryClient.fetchQuery({
    queryKey: payerStatusQueryKeys.payerStatus(network),
    queryFn: () => payerStatusQueries.fetchPayerStatus(network),
    staleTime: 0, // Always consider data stale for real-time financial data
    gcTime: 30 * 1000, // Default 30 seconds, will be updated dynamically
  });

  // Update cache time based on TTL from response
  const ttlSeconds = result.surge?.ttlSeconds || 30;
  if (ttlSeconds !== 30) {
    // Update the query's cache time to match the API TTL
    queryClient.setQueryDefaults(payerStatusQueryKeys.payerStatus(network), {
      gcTime: ttlSeconds * 1000,
    });
  }

  return result;
};
