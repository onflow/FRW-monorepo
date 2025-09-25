import { PayerService, type PayerStatusPayloadV1 } from '@onflow/frw-api';
import { logger } from '@onflow/frw-utils';
import { create } from 'zustand';

/**
 * Alias for the API response type - no need for computed fields
 */
export type PayerStatusInfo = PayerStatusPayloadV1;

interface PayerStatusCacheEntry {
  data: PayerStatusInfo;
  expiresAt: number;
}

interface PayerStatusStoreState {
  cache: Map<string, PayerStatusCacheEntry>;
  isLoading: boolean;
  error: string | null;
}

interface PayerStatusStoreActions {
  // Core operations
  fetchPayerStatus: (network?: 'mainnet' | 'testnet') => Promise<PayerStatusInfo>;

  // Utilities
  getCachedPayerStatus: (network?: 'mainnet' | 'testnet') => PayerStatusInfo | null;
  clearCache: (network?: 'mainnet' | 'testnet') => void;
}

type PayerStatusStore = PayerStatusStoreState & PayerStatusStoreActions;

export const usePayerStatusStore = create<PayerStatusStore>((set, get) => ({
  // Initial state
  cache: new Map(),
  isLoading: false,
  error: null,

  // Fetch payer status with TTL-based caching
  fetchPayerStatus: async (network: 'mainnet' | 'testnet' = 'mainnet') => {
    const currentState = get();
    const cacheKey = `payer-status-${network}`;
    const now = Date.now();

    // Check if we have valid cached data
    const cached = currentState.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      logger.info('Using cached payer status', {
        network,
        cacheAge: now - (cached.expiresAt - (cached.data.surge?.ttlSeconds || 30) * 1000),
        ttlSeconds: cached.data.surge?.ttlSeconds,
      });
      return cached.data;
    }

    // Prevent multiple simultaneous loads
    if (currentState.isLoading) {
      if (cached?.data) {
        return cached.data;
      }
      // If loading and no cache, wait for the current request to complete
      return new Promise((resolve) => {
        const checkLoading = () => {
          const state = get();
          if (!state.isLoading) {
            const currentCached = state.cache.get(cacheKey);
            if (currentCached && currentCached.expiresAt > Date.now()) {
              resolve(currentCached.data);
            } else {
              // If still no valid cache, fetch fresh
              state.fetchPayerStatus(network).then(resolve);
            }
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    set({ isLoading: true, error: null });

    try {
      logger.info('Fetching fresh payer status', { network });

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

      // Calculate cache expiration based on TTL from surge data
      const ttlSeconds = payerStatusData.surge?.ttlSeconds || 30; // Default to 30 seconds if not provided
      const expiresAt = now + ttlSeconds * 1000;

      // Update cache
      const newCache = new Map(currentState.cache);
      newCache.set(cacheKey, {
        data: payerStatusData,
        expiresAt,
      });

      set({
        cache: newCache,
        isLoading: false,
        error: null,
      });

      logger.info('Cached payer status', {
        network,
        ttlSeconds,
        expiresAt: new Date(expiresAt).toISOString(),
      });

      return payerStatusData;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payer status',
      });
      throw error;
    }
  },

  // Get cached payer status without fetching
  getCachedPayerStatus: (network: 'mainnet' | 'testnet' = 'mainnet') => {
    const cacheKey = `payer-status-${network}`;
    const cached = get().cache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    return null;
  },

  // Clear cache
  clearCache: (network?: 'mainnet' | 'testnet') => {
    const currentState = get();
    const newCache = new Map(currentState.cache);

    if (network) {
      const cacheKey = `payer-status-${network}`;
      newCache.delete(cacheKey);
      logger.info('Cleared payer status cache', { network });
    } else {
      newCache.clear();
      logger.info('Cleared all payer status cache');
    }

    set({ cache: newCache });
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

/**
 * Fetch payer status information including surge pricing and payer availability
 * @param network - The network to query (mainnet/testnet)
 * @returns Promise<PayerStatusInfo> - Raw API response
 */
export const fetchPayerStatus = async (
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<PayerStatusInfo> => {
  const store = usePayerStatusStore.getState();
  return store.fetchPayerStatus(network);
};
