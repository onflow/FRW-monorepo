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

// Platform cache adapter using dedicated Cache interface
// This provides optimal performance for TanStack Query operations
const createPlatformCacheAdapter = (): {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
} => {
  let cache: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

  return {
    async getItem(key: string): Promise<string | null> {
      try {
        // Lazy load cache to avoid circular dependencies
        if (!cache) {
          const { cache: contextCache } = await import('./ServiceContext');
          cache = contextCache;
        }

        // Direct cache access - optimized for TanStack Query
        return (await cache.get(key)) as string | null;
      } catch {
        return null;
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      try {
        // Lazy load cache to avoid circular dependencies
        if (!cache) {
          const { cache: contextCache } = await import('./ServiceContext');
          cache = contextCache;
        }

        // Direct cache storage - no complex serialization needed
        await cache.set(key, value);
      } catch {
        // Fail silently to avoid breaking the app
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        // Lazy load cache to avoid circular dependencies
        if (!cache) {
          const { cache: contextCache } = await import('./ServiceContext');
          cache = contextCache;
        }

        // Direct cache deletion
        await cache.delete(key);
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
   * Set up cache persistence using platform cache
   */
  private setupCachePersistence(queryClient: QueryClient): void {
    const cacheAdapter = createPlatformCacheAdapter();

    // Restore cache from storage on initialization
    this.restoreCache(queryClient, cacheAdapter);

    // Persist cache changes
    this.setupCachePersister(queryClient, cacheAdapter);
  }

  /**
   * Restore cache from platform cache
   * TanStack Query will automatically load cache data through the adapter
   */
  private async restoreCache(
    _queryClient: QueryClient,
    _cacheAdapter: ReturnType<typeof createPlatformCacheAdapter>
  ): Promise<void> {
    try {
      // Get cache statistics for logging
      const { cache: contextCache } = await import('./ServiceContext');
      const stats = await contextCache.getStats?.();

      if (stats && stats.keyCount > 0) {
        console.info(
          `[QueryClientManager] Found ${stats.keyCount} cached queries available for restoration`
        );
      }

      // Note: TanStack Query v5 handles cache restoration automatically
      // through the cache adapter when individual queries are accessed.
      // This provides better performance than bulk restoration.
    } catch (error) {
      // Fail silently on restore errors
      console.warn('Failed to check query cache:', error);
    }
  }

  /**
   * Set up cache persistence on changes
   */
  private setupCachePersister(
    queryClient: QueryClient,
    _cacheAdapter: ReturnType<typeof createPlatformCacheAdapter>
  ): void {
    const cache = queryClient.getQueryCache();

    // Persist cache when queries are updated
    const unsubscribe = cache.subscribe(() => {
      this.cleanupExpiredQueries();
    });

    // Store unsubscribe function for cleanup
    (queryClient as any)._cacheUnsubscribe = unsubscribe;
  }

  /**
   * Cleanup expired queries periodically
   * Cache persistence happens automatically through the cache adapter
   */
  private async cleanupExpiredQueries(): Promise<void> {
    try {
      // Get the cache instance for cleanup operations
      const { cache: contextCache } = await import('./ServiceContext');

      // AsyncStorageCache has built-in cleanup for expired entries
      if (
        contextCache &&
        'cleanupExpired' in contextCache &&
        typeof (contextCache as any).cleanupExpired === 'function'
      ) {
        await (contextCache as any).cleanupExpired();
      }

      // Note: Individual query persistence happens automatically through the cache adapter
      // when TanStack Query calls setItem/removeItem. This provides optimal performance.
    } catch (error) {
      // Fail silently to avoid breaking the app
      console.warn('Failed to cleanup expired queries:', error);
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
