import { DataCategory, getDomainCategory, CACHE_TIMES, GC_TIMES } from '@onflow/frw-types';
import { QueryClient } from '@tanstack/query-core';

// Utility function to determine data category from query key
export const getDataCategory = (queryKey: unknown[]): DataCategory => {
  const [domain] = queryKey;

  if (typeof domain === 'string') {
    return getDomainCategory(domain);
  }

  // Default to financial (most restrictive) for unknown data
  return DataCategory.FINANCIAL;
};

// Platform storage adapter using existing strongly-typed storage
const createPlatformStorageAdapter = (): {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
} => {
  let storage: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

  return {
    async getItem(key: string): Promise<string | null> {
      try {
        // Lazy load storage to avoid circular dependencies
        if (!storage) {
          const { storage: contextStorage } = await import('./ServiceContext');
          storage = contextStorage;
        }

        const cacheData = await storage.get('tanstack-query-cache');
        if (!cacheData || !cacheData[key]) {
          return null;
        }

        return JSON.stringify(cacheData[key]);
      } catch {
        return null;
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      try {
        // Lazy load storage to avoid circular dependencies
        if (!storage) {
          const { storage: contextStorage } = await import('./ServiceContext');
          storage = contextStorage;
        }

        const cacheData = (await storage.get('tanstack-query-cache')) || {};
        cacheData[key] = JSON.parse(value);

        await storage.set('tanstack-query-cache', cacheData);
      } catch {
        // Fail silently
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        // Lazy load storage to avoid circular dependencies
        if (!storage) {
          const { storage: contextStorage } = await import('./ServiceContext');
          storage = contextStorage;
        }

        const cacheData = (await storage.get('tanstack-query-cache')) || {};
        delete cacheData[key];

        await storage.set('tanstack-query-cache', cacheData);
      } catch {
        // Fail silently
      }
    },
  };
};

/**
 * QueryClient Manager for Flow Reference Wallet
 *
 * Provides a singleton QueryClient instance that can be shared across
 * all packages (stores, screens, apps) to ensure consistent caching
 * and query behavior throughout the application.
 *
 * Features:
 * - Intelligent caching based on data categories
 * - Cross-platform storage persistence
 * - Optimized for financial data freshness
 */
class QueryClientManager {
  private static instance: QueryClientManager | null = null;
  private queryClient: QueryClient | null = null;

  private constructor() {}

  public static getInstance(): QueryClientManager {
    if (!QueryClientManager.instance) {
      QueryClientManager.instance = new QueryClientManager();
    }
    return QueryClientManager.instance;
  }

  /**
   * Create QueryClient with intelligent caching and integrated platform storage
   */
  private createFRWQueryClient(): QueryClient {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // Default to financial data behavior (always fresh)
          staleTime: 0,
          gcTime: 2 * 60 * 1000, // 2 minutes

          // Smart retry strategy
          retry: (failureCount: number, error: unknown) => {
            // Don't retry auth errors or 404s
            if (error && typeof error === 'object' && 'status' in error) {
              const status = (error as any).status;
              if (status === 401 || status === 403 || status === 404) {
                return false;
              }
            }
            return failureCount < 3;
          },

          retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
          networkMode: 'offlineFirst',
        },

        mutations: {
          retry: false, // Don't retry mutations for financial operations
          networkMode: 'offlineFirst',
        },
      },
    });

    // Set up cache persistence using integrated platform storage
    this.setupCachePersistence(queryClient);

    return queryClient;
  }

  /**
   * Set up cache persistence using platform storage
   */
  private setupCachePersistence(queryClient: QueryClient): void {
    const storage = createPlatformStorageAdapter();

    // Restore cache from storage on initialization
    this.restoreCache(queryClient, storage);

    // Persist cache changes
    this.setupCachePersister(queryClient, storage);
  }

  /**
   * Restore cache from platform storage
   */
  private async restoreCache(
    queryClient: QueryClient,
    storage: ReturnType<typeof createPlatformStorageAdapter>
  ): Promise<void> {
    try {
      const cacheData = await storage.getItem('queryCache');
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        queryClient.getQueryCache().build(queryClient, parsed);
      }
    } catch (error) {
      // Fail silently on restore errors
      console.warn('Failed to restore query cache:', error);
    }
  }

  /**
   * Set up cache persistence on changes
   */
  private setupCachePersister(
    queryClient: QueryClient,
    storage: ReturnType<typeof createPlatformStorageAdapter>
  ): void {
    const cache = queryClient.getQueryCache();

    // Persist cache when queries are updated
    const unsubscribe = cache.subscribe(() => {
      this.persistCache(queryClient, storage);
    });

    // Store unsubscribe function for cleanup
    (queryClient as any)._cacheUnsubscribe = unsubscribe;
  }

  /**
   * Persist current cache state to storage
   */
  private async persistCache(
    queryClient: QueryClient,
    storage: ReturnType<typeof createPlatformStorageAdapter>
  ): Promise<void> {
    try {
      const queries = queryClient.getQueryCache().getAll();

      // Filter queries that should be persisted
      const persistableQueries = queries
        .filter((query) => {
          const category = getDataCategory(query.queryKey);
          // Don't persist SESSION or FINANCIAL data
          return category !== DataCategory.SESSION && category !== DataCategory.FINANCIAL;
        })
        .map((query) => ({
          queryKey: query.queryKey,
          queryHash: query.queryHash,
          state: query.state,
          meta: query.meta,
        }));

      await storage.setItem(
        'queryCache',
        JSON.stringify({
          queries: persistableQueries,
          timestamp: Date.now(),
          version: '1.0',
        })
      );
    } catch (error) {
      // Fail silently on persist errors
      console.warn('Failed to persist query cache:', error);
    }
  }

  /**
   * Get the shared QueryClient instance
   */
  public getQueryClient(): QueryClient {
    if (!this.queryClient) {
      this.queryClient = this.createFRWQueryClient();
    }
    return this.queryClient;
  }

  /**
   * Set a custom QueryClient (useful for testing)
   */
  public setQueryClient(client: QueryClient): void {
    this.queryClient = client;
  }

  /**
   * Reset the QueryClient (useful for testing cleanup)
   */
  public reset(): void {
    this.queryClient = null;
  }
}

// Export the singleton instance and convenience functions
export const queryClientManager = QueryClientManager.getInstance();

// 🔥 NEW: Direct access to global QueryClient instance - no function call needed!
export const queryClient = queryClientManager.getQueryClient();

// Legacy functions (kept for compatibility, but prefer direct `queryClient` usage)
export const getGlobalQueryClient = (): QueryClient => {
  return queryClientManager.getQueryClient();
};

export const setGlobalQueryClient = (client: QueryClient): void => {
  queryClientManager.setQueryClient(client);
};

export const resetGlobalQueryClient = (): void => {
  queryClientManager.reset();
};

// Utility functions for creating queries with appropriate cache times
export const createQuery = <TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  category?: DataCategory
): {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  staleTime: number | typeof Infinity;
  gcTime: number | typeof Infinity;
  meta: { category: DataCategory };
} => {
  const detectedCategory = category || getDataCategory(queryKey);

  return {
    queryKey,
    queryFn,
    staleTime: CACHE_TIMES[detectedCategory],
    gcTime: GC_TIMES[detectedCategory],
    meta: {
      category: detectedCategory,
    },
  };
};

// Convenience functions for different data types
export const createFinancialQuery = <TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>
): ReturnType<typeof createQuery> => createQuery(queryKey, queryFn, DataCategory.FINANCIAL);

export const createUserSettingsQuery = <TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>
): ReturnType<typeof createQuery> => createQuery(queryKey, queryFn, DataCategory.USER_SETTINGS);

export const createStaticQuery = <TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>
): ReturnType<typeof createQuery> => createQuery(queryKey, queryFn, DataCategory.STATIC);

export const createSessionQuery = <TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>
): ReturnType<typeof createQuery> => createQuery(queryKey, queryFn, DataCategory.SESSION);

export const createPersistentQuery = <TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>
): ReturnType<typeof createQuery> => createQuery(queryKey, queryFn, DataCategory.PERSISTENT);
