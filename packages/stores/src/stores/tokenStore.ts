import {
  formatCurrencyStringForDisplay,
  type CollectionModel,
  type TokenInfo,
  addressType,
} from '@onflow/frw-types';
import { cadenceService } from '@onflow/frw-workflow';
import { create } from 'zustand';

import { NFTService, TokenService } from '../service';

// Balance data interface
interface BalanceData {
  balance: string;
  displayBalance: string;
  nftCount: number;
  nftCountDisplay: string;
  lastUpdated: number;
}

// Smart cache strategies by data type
const CACHE_STRATEGIES = {
  ttl: 0, // Always fetch fresh for financial data
} as const;

// Unified cache structure per address
interface AddressCache {
  // Token and NFT data
  tokens: TokenInfo[];
  nftCollections: CollectionModel[];

  // Balance data
  balance: string;
  displayBalance: string;
  nftCount: number;
  nftCountDisplay: string;

  // Cache metadata
  lastFetch: number;
  lastUpdated: number;
  isLoading: boolean;
  error: string | null;
}

interface TokenStoreState {
  // Unified cache: address-network -> AddressCache
  addressCache: { [key: string]: AddressCache };
  isLoading: boolean;
  error: string | null;
}

interface TokenStoreActions {
  // Core data fetching
  fetchTokens: (address: string, network?: string, forceRefresh?: boolean) => Promise<void>;
  fetchFreshBalance: (
    address: string,
    accountType?: string,
    network?: string
  ) => Promise<BalanceData>;
  refreshBalanceInBackground: (
    address: string,
    accountType?: string,
    network?: string
  ) => Promise<void>;

  // Public API for wallet integration
  getAccountBalance: (
    address: string,
    accountType?: string,
    network?: string
  ) => Promise<BalanceData>;
  getBalance: (
    address: string,
    accountType?: string,
    options?: { fresh?: boolean }
  ) => Promise<BalanceData>;

  // Address-specific cache access for wallet integration
  getTokensForAddress: (address: string, network?: string) => TokenInfo[] | null;
  getNFTCollectionsForAddress: (address: string, network?: string) => CollectionModel[] | null;
  getCachedBalanceForAddress: (address: string) => BalanceData | null;
  isCacheValidForAddress: (address: string, network?: string) => boolean;

  // Utilities
  isStale: (lastUpdated: number, ttl: number) => boolean;
  clearCache: (address?: string) => void;
  clearCacheForAddress: (address: string) => void;
  forceRefresh: (address: string, network?: string) => Promise<void>;
}

type TokenStore = TokenStoreState & TokenStoreActions;

// Generate cache key
const getCacheKey = (address: string, network: string = 'mainnet') => `${address}-${network}`;

export const useTokenStore = create<TokenStore>((set, get) => ({
  // Initial state - unified cache structure
  addressCache: {},
  isLoading: false,
  error: null,

  // Check if data is stale based on TTL strategy
  isStale: (lastUpdated: number, ttl: number) => {
    if (ttl === 0) return true; // Always stale for real-time data
    return Date.now() - lastUpdated > ttl;
  },

  // Fetch fresh balance from API and update memory
  fetchFreshBalance: async (address: string, accountType?: string, network: string = 'mainnet') => {
    if (!address) {
      const defaultBalance = {
        balance: '0 FLOW',
        displayBalance: '0 FLOW',
        nftCount: 0,
        nftCountDisplay: '0 NFTs',
        lastUpdated: Date.now(),
      };
      return defaultBalance;
    }

    try {
      let balanceData;

      // Special handling for EVM accounts
      if (accountType === 'evm') {
        const coaBalance = await cadenceService.getFlowBalanceForAnyAccounts([address]);
        const balanceNumber = parseFloat(coaBalance[address] || '0');
        const formattedBalance = formatCurrencyStringForDisplay({ value: balanceNumber });
        balanceData = {
          balance: `${formattedBalance} FLOW`,
          displayBalance: `${formattedBalance} FLOW`,
          nftCount: 0,
          nftCountDisplay: '0 NFTs',
        };
      } else {
        // For regular Flow accounts, get data from tokens
        const cacheKey = getCacheKey(address, network);
        let cached = get().addressCache[cacheKey];

        // Fetch tokens if not cached or stale
        if (!cached || get().isStale(cached.lastFetch, CACHE_STRATEGIES.ttl)) {
          await get().fetchTokens(address, network, true);
          cached = get().addressCache[cacheKey];
        }

        // If cache is still loading, wait for it to complete
        if (cached?.isLoading) {
          // Wait for loading to complete by polling
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds max
          while (cached?.isLoading && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            cached = get().addressCache[cacheKey];
            attempts++;
          }
        }

        if (!cached) {
          throw new Error('Failed to fetch token data');
        }

        // Extract FLOW balance
        const flowToken = cached.tokens?.find(
          (token) => token.symbol === 'FLOW' || token.contractName?.toLowerCase().includes('flow')
        );

        let balance = '0 FLOW';
        let displayBalance = '0 FLOW';

        if (flowToken?.displayBalance) {
          displayBalance = flowToken.displayBalance.includes('FLOW')
            ? flowToken.displayBalance
            : `${flowToken.displayBalance} FLOW`;
          balance = displayBalance;
        } else if (flowToken?.balance) {
          const numericBalance = parseFloat(flowToken.balance);
          const formattedBalance = formatCurrencyStringForDisplay({ value: numericBalance });
          balance = `${formattedBalance} FLOW`;
          displayBalance = balance;
        }

        // Calculate total NFT count
        const totalNftCount =
          cached.nftCollections?.reduce((total, collection) => {
            return total + (collection.count || 0);
          }, 0) || 0;

        const nftCountDisplay = `${totalNftCount} NFT${totalNftCount !== 1 ? 's' : ''}`;

        balanceData = {
          balance,
          displayBalance,
          nftCount: totalNftCount,
          nftCountDisplay,
        };
      }

      // Update unified address cache
      const cacheKey = getCacheKey(address, network);
      const now = Date.now();

      set((state) => ({
        ...state,
        addressCache: {
          ...state.addressCache,
          [cacheKey]: {
            ...state.addressCache[cacheKey],
            // Update balance data
            balance: balanceData.balance,
            displayBalance: balanceData.displayBalance,
            nftCount: balanceData.nftCount,
            nftCountDisplay: balanceData.nftCountDisplay,
            lastUpdated: now,
            // Keep existing token/NFT data if present
            tokens: state.addressCache[cacheKey]?.tokens || [],
            nftCollections: state.addressCache[cacheKey]?.nftCollections || [],
            lastFetch: state.addressCache[cacheKey]?.lastFetch || 0,
            isLoading: false,
            error: null,
          },
        },
      }));

      return {
        ...balanceData,
        lastUpdated: now,
      };
    } catch (error) {
      // console.error('[TokenStore] Failed to fetch fresh balance:', error);
      // Return stale data if available, otherwise default
      const cacheKey = getCacheKey(address, network);
      const stale = get().addressCache[cacheKey];
      return stale
        ? {
            balance: stale.balance,
            displayBalance: stale.displayBalance,
            nftCount: stale.nftCount,
            nftCountDisplay: stale.nftCountDisplay,
            lastUpdated: stale.lastUpdated,
          }
        : {
            balance: '0 FLOW',
            displayBalance: '0 FLOW',
            nftCount: 0,
            nftCountDisplay: '0 NFTs',
            lastUpdated: Date.now(),
          };
    }
  },

  // Background refresh (fails silently for UX)
  refreshBalanceInBackground: async (
    address: string,
    accountType?: string,
    network: string = 'mainnet'
  ) => {
    try {
      await get().fetchFreshBalance(address, accountType, network);
    } catch (error) {
      // Fail silently for background updates
      // console.debug('[TokenStore] Background balance refresh failed:', error);
    }
  },

  // Get balance with stale-while-revalidate pattern
  getBalance: async (address: string, accountType?: string, options = { fresh: false }) => {
    const network = 'mainnet';

    if (options.fresh) {
      return await get().fetchFreshBalance(address, accountType, network);
    }

    // Return cached data immediately if available and not stale
    const cacheKey = getCacheKey(address, network);
    const cached = get().addressCache[cacheKey];

    if (cached && !get().isStale(cached.lastUpdated, CACHE_STRATEGIES.ttl)) {
      // Trigger background refresh for next time
      setTimeout(() => get().refreshBalanceInBackground(address, accountType, network), 0);
      return {
        balance: cached.balance,
        displayBalance: cached.displayBalance,
        nftCount: cached.nftCount,
        nftCountDisplay: cached.nftCountDisplay,
        lastUpdated: cached.lastUpdated,
      };
    }

    // No fresh cached data, fetch immediately
    return await get().fetchFreshBalance(address, accountType, network);
  },

  // Public API - get account balance (for wallet integration)
  getAccountBalance: async (address: string, accountType?: string, network: string = 'mainnet') => {
    return await get().getBalance(address, accountType, { fresh: false });
  },

  // Get cached tokens for specific address (for wallet integration)
  getTokensForAddress: (address: string, network: string = 'mainnet') => {
    if (!address) return null;
    const cacheKey = getCacheKey(address, network);
    const cached = get().addressCache[cacheKey];
    return cached?.tokens || null;
  },

  // Get cached NFT collections for specific address (for wallet integration)
  getNFTCollectionsForAddress: (address: string, network: string = 'mainnet') => {
    if (!address) return null;
    const cacheKey = getCacheKey(address, network);
    const cached = get().addressCache[cacheKey];
    const collections = cached?.nftCollections || null;

    console.log('[TokenStore] Retrieving NFT collections from cache', {
      address,
      network,
      cacheKey,
      hasCached: !!cached,
      hasCollections: !!collections,
      collectionsCount: collections?.length || 0,
      collections:
        collections?.map((c) => ({
          id: c.id,
          name: c.name,
          contractName: c.contractName,
          count: c.count,
          type: c.type,
          flowIdentifier: c.flowIdentifier,
          evmAddress: c.evmAddress,
        })) || [],
    });

    return collections;
  },

  // Get cached balance for specific address (for wallet integration)
  getCachedBalanceForAddress: (address: string, network: string = 'mainnet') => {
    if (!address) return null;
    const cacheKey = getCacheKey(address, network);
    const cached = get().addressCache[cacheKey];
    return cached
      ? {
          balance: cached.balance,
          displayBalance: cached.displayBalance,
          nftCount: cached.nftCount,
          nftCountDisplay: cached.nftCountDisplay,
          lastUpdated: cached.lastUpdated,
        }
      : null;
  },

  // Check if cache is valid for specific address (for wallet integration)
  isCacheValidForAddress: (address: string, network: string = 'mainnet') => {
    if (!address) return false;
    const cacheKey = getCacheKey(address, network);
    const cached = get().addressCache[cacheKey];
    return cached && !get().isStale(cached.lastFetch, CACHE_STRATEGIES.ttl);
  },

  // Clear cache for specific address (for wallet integration)
  clearCacheForAddress: (address: string, _network: string = 'mainnet') => {
    if (!address) return;

    const cacheKey = getCacheKey(address, _network);

    set((state) => {
      const { [cacheKey]: _removedCache, ...restAddressCache } = state.addressCache;
      return {
        ...state,
        addressCache: restAddressCache,
      };
    });

    console.log(`[TokenStore] Cleared unified cache for address: ${address}`);
  },

  // Fetch tokens with unified caching
  fetchTokens: async (
    address: string,
    network: string = 'mainnet',
    forceRefresh: boolean = false
  ) => {
    if (!address) return;

    const cacheKey = getCacheKey(address, network);
    const now = Date.now();
    const cached = get().addressCache[cacheKey];

    // Check if cache is valid using strategy
    const isStale = get().isStale(cached?.lastFetch || 0, CACHE_STRATEGIES.ttl);

    if (!forceRefresh && cached && !cached.isLoading && !isStale) {
      return;
    }

    // Avoid duplicate requests if already loading
    if (cached?.isLoading) return;

    // Set loading state
    set((state) => ({
      ...state,
      addressCache: {
        ...state.addressCache,
        [cacheKey]: {
          ...cached,
          isLoading: true,
          error: null,
          // Keep existing data
          tokens: cached?.tokens || [],
          nftCollections: cached?.nftCollections || [],
          balance: cached?.balance || '0 FLOW',
          displayBalance: cached?.displayBalance || '0 FLOW',
          nftCount: cached?.nftCount || 0,
          nftCountDisplay: cached?.nftCountDisplay || '0 NFTs',
          lastFetch: cached?.lastFetch || 0,
          lastUpdated: cached?.lastUpdated || 0,
        },
      },
    }));

    try {
      const walletType = addressType(address);
      const [tokenService, nftService] = [new TokenService(walletType), new NFTService(walletType)];

      // Fetch data in parallel
      const [tokens, nftCollections] = await Promise.all([
        tokenService.getTokenInfo(address, network),
        nftService.getNFTCollections(address),
      ]);

      console.log('[TokenStore] Storing NFT collections in cache', {
        address,
        network,
        cacheKey,
        nftCollectionsCount: nftCollections.length,
        nftCollections: nftCollections.map((c) => ({
          id: c.id,
          name: c.name,
          contractName: c.contractName,
          count: c.count,
          type: c.type,
          flowIdentifier: c.flowIdentifier,
          evmAddress: c.evmAddress,
        })),
      });
      // Update unified cache
      set((state) => ({
        ...state,
        addressCache: {
          ...state.addressCache,
          [cacheKey]: {
            ...state.addressCache[cacheKey],
            // Update token/NFT data
            tokens,
            nftCollections,
            lastFetch: now,
            isLoading: false,
            error: null,
            // Keep existing balance data
            balance: state.addressCache[cacheKey]?.balance || '0 FLOW',
            displayBalance: state.addressCache[cacheKey]?.displayBalance || '0 FLOW',
            nftCount: nftCollections.reduce(
              (total, collection) => total + (collection.count || 0),
              0
            ),
            nftCountDisplay: `${nftCollections.reduce(
              (total, collection) => total + (collection.count || 0),
              0
            )} NFT${
              nftCollections.reduce((total, collection) => total + (collection.count || 0), 0) !== 1
                ? 's'
                : ''
            }`,
            lastUpdated: state.addressCache[cacheKey]?.lastUpdated || now,
          },
        },
      }));
    } catch (error: any) {
      console.error('[TokenStore] Error fetching tokens:', error);

      set((state) => ({
        ...state,
        addressCache: {
          ...state.addressCache,
          [cacheKey]: {
            ...cached,
            isLoading: false,
            error: error?.message || 'Failed to fetch tokens',
            // Keep existing data on error
            tokens: cached?.tokens || [],
            nftCollections: cached?.nftCollections || [],
            lastFetch: cached?.lastFetch || 0,
          },
        },
      }));
    }
  },

  // Clear cache
  clearCache: (address?: string) => {
    if (address) {
      get().clearCacheForAddress(address);
    } else {
      // Clear all cache
      set((state) => ({
        ...state,
        addressCache: {},
      }));
    }
  },

  // Force refresh
  forceRefresh: async (address: string, network: string = 'mainnet') => {
    await get().fetchTokens(address, network, true);
    await get().fetchFreshBalance(address, undefined, network);
  },
}));

// Simplified selector functions using unified addressCache
export const tokenSelectors = {
  // Get cached tokens
  getTokens:
    (address: string, network: string = 'mainnet') =>
    (state: TokenStore) => {
      if (!address) return [];
      const cacheKey = getCacheKey(address, network);
      return state.addressCache[cacheKey]?.tokens || [];
    },

  // Get cached NFT collections
  getNFTCollections:
    (address: string, network: string = 'mainnet') =>
    (state: TokenStore) => {
      if (!address) return [];
      const cacheKey = getCacheKey(address, network);
      return state.addressCache[cacheKey]?.nftCollections || [];
    },

  // Get specific token
  getToken:
    (address: string, symbol: string, network: string = 'mainnet') =>
    (state: TokenStore) => {
      if (!address) return null;
      const cacheKey = getCacheKey(address, network);
      const tokens = state.addressCache[cacheKey]?.tokens || [];
      return tokens.find((token) => token.symbol === symbol) || null;
    },

  // Get FLOW balance from unified cache
  getFlowBalance:
    (address: string, network: string = 'mainnet') =>
    (state: TokenStore) => {
      if (!address) {
        return {
          balance: '0 FLOW',
          displayBalance: '0 FLOW',
          isLoading: false,
          error: null,
        };
      }

      const cacheKey = getCacheKey(address, network);
      const cached = state.addressCache[cacheKey];
      return {
        balance: cached?.balance || '0 FLOW',
        displayBalance: cached?.displayBalance || '0 FLOW',
        isLoading: cached?.isLoading || false,
        error: cached?.error || null,
      };
    },

  // Get account data from unified cache
  getAccountData:
    (address: string, network: string = 'mainnet') =>
    (state: TokenStore) => {
      if (!address) {
        return {
          balance: '0 FLOW',
          nftCount: 0,
          nftCountDisplay: '0 NFTs',
          isLoading: false,
          error: null,
        };
      }

      const cacheKey = getCacheKey(address, network);
      const cached = state.addressCache[cacheKey];
      return {
        balance: cached?.balance || '0 FLOW',
        nftCount: cached?.nftCount || 0,
        nftCountDisplay: cached?.nftCountDisplay || '0 NFTs',
        isLoading: cached?.isLoading || false,
        error: cached?.error || null,
      };
    },

  // Get loading state
  getLoadingState:
    (address: string, network: string = 'mainnet') =>
    (state: TokenStore) => {
      if (!address) return { isLoading: false, error: null };
      const cacheKey = getCacheKey(address, network);
      const cached = state.addressCache[cacheKey];
      return {
        isLoading: cached?.isLoading || false,
        error: cached?.error || null,
      };
    },
};

// Helper functions for easier usage
export const tokenHelpers = {
  // Initialize account data with stale-while-revalidate
  initializeAccount: async (address: string, accountType?: string, network: string = 'mainnet') => {
    const store = useTokenStore.getState();

    // Get stale data immediately for fast UI
    const staleBalance = await store.getBalance(address, accountType, { fresh: false });

    // Fetch fresh data in parallel
    await Promise.all([
      store.fetchTokens(address, network),
      store.refreshBalanceInBackground(address, accountType, network),
    ]);

    return staleBalance;
  },

  // Refresh account data (force fresh)
  refreshAccount: async (address: string, accountType?: string, network: string = 'mainnet') => {
    const store = useTokenStore.getState();
    return await store.forceRefresh(address, network);
  },

  // Get balance with explicit freshness control
  getBalanceWithOptions: async (address: string, accountType?: string, fresh: boolean = false) => {
    const store = useTokenStore.getState();
    return await store.getBalance(address, accountType, { fresh });
  },
};
