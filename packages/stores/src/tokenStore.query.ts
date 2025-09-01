import { cadence, context, queryClient } from '@onflow/frw-context';
import { tokenService, nftService } from '@onflow/frw-services';
import {
  FlatQueryDomain,
  addressType,
  formatCurrencyStringForDisplay,
  type CollectionModel,
  type TokenModel,
} from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';
import { create } from 'zustand';

// Balance data interface
interface BalanceData {
  balance: string;
  displayBalance: string;
  nftCount: number;
  nftCountDisplay: string;
  lastUpdated: number;
}

// Query Keys Factory - Using optimized domain structure
export const tokenQueryKeys = {
  all: [FlatQueryDomain.TOKENS] as const, // Uses FINANCIAL domain
  addresses: () => [...tokenQueryKeys.all, 'addresses'] as const,
  address: (address: string, network: string = 'mainnet') =>
    [...tokenQueryKeys.addresses(), address, network] as const,
  tokens: (address: string, network: string = 'mainnet') =>
    [...tokenQueryKeys.address(address, network), 'tokens'] as const,
  balance: (address: string, network: string = 'mainnet') =>
    [...tokenQueryKeys.address(address, network), FlatQueryDomain.BALANCE] as const,
  nfts: (address: string, network: string = 'mainnet') =>
    [...tokenQueryKeys.address(address, network), FlatQueryDomain.NFTS] as const,
};

// Token Store State - Minimal UI state, queries handle data
interface TokenStoreState {
  // No longer need to store QueryClient - use global instance
  placeholder?: never; // Prevent empty interface warning
}

// Query Functions - Pure data fetching logic
export const tokenQueries = {
  // Fetch tokens for an address
  fetchTokens: async (address: string, network: string = 'mainnet'): Promise<TokenModel[]> => {
    if (!address) return [];

    try {
      const walletType = addressType(address);
      const tokenSvc = tokenService(walletType);
      const currency = context.bridge.getCurrency();

      const tokens = await tokenSvc.getTokenInfo(address, network, currency.name);

      logger.debug('[TokenQuery] Fetched tokens:', {
        address,
        network,
        count: tokens.length,
      });

      return tokens;
    } catch (error: unknown) {
      logger.error('[TokenQuery] Error fetching tokens:', error);
      throw error;
    }
  },

  // Fetch NFT collections for an address
  fetchNFTCollections: async (
    address: string,
    network: string = 'mainnet'
  ): Promise<CollectionModel[]> => {
    if (!address) return [];

    try {
      const walletType = addressType(address);
      const nftSvc = nftService(walletType);

      const collections = await nftSvc.getNFTCollections(address);

      logger.debug('[TokenQuery] Fetched NFT collections:', {
        address,
        network,
        count: collections.length,
      });

      return collections;
    } catch (error: unknown) {
      logger.error('[TokenQuery] Error fetching NFT collections:', error);
      throw error;
    }
  },

  // Fetch balance for an address
  fetchBalance: async (
    address: string,
    accountType?: string,
    network: string = 'mainnet'
  ): Promise<BalanceData> => {
    if (!address) {
      return {
        balance: '0 FLOW',
        displayBalance: '0 FLOW',
        nftCount: 0,
        nftCountDisplay: '0 NFTs',
        lastUpdated: Date.now(),
      };
    }

    try {
      let balanceData;

      // Special handling for EVM accounts
      if (accountType === 'evm') {
        const coaBalance = await cadence.getFlowBalanceForAnyAccounts([address]);
        const balanceNumber = parseFloat(coaBalance[address] || '0');
        const formattedBalance = formatCurrencyStringForDisplay({
          value: balanceNumber,
        });
        balanceData = {
          balance: `${formattedBalance} FLOW`,
          displayBalance: `${formattedBalance} FLOW`,
          nftCount: 0,
          nftCountDisplay: '0 NFTs',
        };
      } else {
        // For regular Flow accounts, get FLOW token from tokens query
        const tokens = await queryClient.fetchQuery({
          queryKey: tokenQueryKeys.tokens(address, network),
          queryFn: () => tokenQueries.fetchTokens(address, network),
          staleTime: 0, // Always fetch fresh for financial data
        });

        // Extract FLOW balance
        const flowToken = tokens.find(
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
          const formattedBalance = formatCurrencyStringForDisplay({
            value: numericBalance,
          });
          balance = `${formattedBalance} FLOW`;
          displayBalance = balance;
        }

        // Get NFT collections for count
        const nftCollections = await queryClient.fetchQuery({
          queryKey: tokenQueryKeys.nfts(address, network),
          queryFn: () => tokenQueries.fetchNFTCollections(address, network),
          staleTime: 5 * 60 * 1000, // NFTs can be cached for 5 minutes
        });

        const totalNftCount = nftCollections.reduce((total, collection) => {
          return total + (collection.count || 0);
        }, 0);

        const nftCountDisplay = `${totalNftCount} NFT${totalNftCount !== 1 ? 's' : ''}`;

        balanceData = {
          balance,
          displayBalance,
          nftCount: totalNftCount,
          nftCountDisplay,
        };
      }

      return {
        ...balanceData,
        lastUpdated: Date.now(),
      };
    } catch (error: unknown) {
      logger.error('[TokenQuery] Error fetching balance:', error);
      throw error;
    }
  },

  // Batch fetch Flow balances for multiple addresses
  fetchBatchFlowBalances: async (addressList: string[]): Promise<Array<[string, string]>> => {
    if (!addressList || addressList.length === 0) {
      return [];
    }

    try {
      const balanceResults = await cadence.getFlowBalanceForAnyAccounts(addressList);

      const resultArray: Array<[string, string]> = [];
      for (const address of addressList) {
        const balance = balanceResults[address] || '0';
        const balanceNumber = parseFloat(balance);
        const formattedBalance = formatCurrencyStringForDisplay({
          value: balanceNumber,
        });
        const displayBalance = `${formattedBalance} FLOW`;
        resultArray.push([address, displayBalance]);
      }

      return resultArray;
    } catch (error) {
      logger.error('[TokenQuery] Failed to fetch batch Flow balances:', error);
      return addressList.map((address) => [address, '0 FLOW'] as [string, string]);
    }
  },
};

interface TokenStoreActions {
  // Core data fetching with TanStack Query
  fetchTokens: (address: string, network?: string, forceRefresh?: boolean) => Promise<TokenModel[]>;
  fetchBalance: (address: string, accountType?: string, network?: string) => Promise<BalanceData>;
  fetchNFTCollections: (address: string, network?: string) => Promise<CollectionModel[]>;

  // Batch operations
  fetchBatchFlowBalances: (addressList: string[]) => Promise<Array<[string, string]>>;

  // Cache management
  invalidateTokens: (address: string, network?: string) => void;
  invalidateBalance: (address: string, network?: string) => void;
  invalidateAll: (address?: string) => void;

  // Getters with query data
  getTokensForAddress: (address: string, network?: string) => TokenModel[] | undefined;
  getNFTCollectionsForAddress: (address: string, network?: string) => CollectionModel[] | undefined;
  getBalanceForAddress: (address: string, network?: string) => BalanceData | undefined;

  // Loading states
  isTokensLoading: (address: string, network?: string) => boolean;
  isBalanceLoading: (address: string, network?: string) => boolean;
  isNFTsLoading: (address: string, network?: string) => boolean;
}

type TokenStore = TokenStoreState & TokenStoreActions;

export const useTokenStore = create<TokenStore>((_set, _get) => ({
  // Fetch tokens with TanStack Query - Automatic cache management based on financial data category
  fetchTokens: async (
    address: string,
    network: string = 'mainnet',
    forceRefresh: boolean = false
  ): Promise<TokenModel[]> => {
    return await queryClient.fetchQuery({
      queryKey: tokenQueryKeys.tokens(address, network),
      queryFn: () => tokenQueries.fetchTokens(address, network),
      // staleTime handled automatically by intelligent caching (0 for financial data)
      ...(forceRefresh && { staleTime: 0 }), // Only override for force refresh
    });
  },

  // Fetch balance with TanStack Query - Automatic fresh data for financial category
  fetchBalance: async (
    address: string,
    accountType?: string,
    network: string = 'mainnet'
  ): Promise<BalanceData> => {
    return await queryClient.fetchQuery({
      queryKey: tokenQueryKeys.balance(address, network),
      queryFn: () => tokenQueries.fetchBalance(address, accountType, network),
      // staleTime: 0 handled automatically for 'balance' financial data
    });
  },

  // Fetch NFT collections with TanStack Query - Automatic cache management
  fetchNFTCollections: async (
    address: string,
    network: string = 'mainnet'
  ): Promise<CollectionModel[]> => {
    return await queryClient.fetchQuery({
      queryKey: tokenQueryKeys.nfts(address, network),
      queryFn: () => tokenQueries.fetchNFTCollections(address, network),
      // NFTs are categorized as financial data, but could be adjusted in getDataCategory if needed
    });
  },

  // Batch fetch Flow balances
  fetchBatchFlowBalances: async (addressList: string[]): Promise<Array<[string, string]>> => {
    return await tokenQueries.fetchBatchFlowBalances(addressList);
  },

  // Cache invalidation methods
  invalidateTokens: (address: string, network: string = 'mainnet'): void => {
    queryClient.invalidateQueries({
      queryKey: tokenQueryKeys.tokens(address, network),
    });
  },

  invalidateBalance: (address: string, network: string = 'mainnet'): void => {
    queryClient.invalidateQueries({
      queryKey: tokenQueryKeys.balance(address, network),
    });
  },

  invalidateAll: (address?: string): void => {
    if (address) {
      queryClient.invalidateQueries({
        queryKey: tokenQueryKeys.address(address),
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: tokenQueryKeys.all,
      });
    }
  },

  // Getters - Return cached data without triggering fetch
  getTokensForAddress: (address: string, network: string = 'mainnet'): TokenModel[] | undefined => {
    return queryClient.getQueryData<TokenModel[]>(tokenQueryKeys.tokens(address, network));
  },

  getNFTCollectionsForAddress: (
    address: string,
    network: string = 'mainnet'
  ): CollectionModel[] | undefined => {
    return queryClient.getQueryData<CollectionModel[]>(tokenQueryKeys.nfts(address, network));
  },

  getBalanceForAddress: (address: string, network: string = 'mainnet'): BalanceData | undefined => {
    return queryClient.getQueryData<BalanceData>(tokenQueryKeys.balance(address, network));
  },

  // Loading states
  isTokensLoading: (address: string, network: string = 'mainnet'): boolean => {
    const query = queryClient.getQueryCache().find({
      queryKey: tokenQueryKeys.tokens(address, network),
    });
    return query?.state.fetchStatus === 'fetching';
  },

  isBalanceLoading: (address: string, network: string = 'mainnet'): boolean => {
    const query = queryClient.getQueryCache().find({
      queryKey: tokenQueryKeys.balance(address, network),
    });
    return query?.state.fetchStatus === 'fetching';
  },

  isNFTsLoading: (address: string, network: string = 'mainnet'): boolean => {
    const query = queryClient.getQueryCache().find({
      queryKey: tokenQueryKeys.nfts(address, network),
    });
    return query?.state.fetchStatus === 'fetching';
  },
}));

// Helper functions with TanStack Query patterns
export const tokenHelpers = {
  // Initialize account data with optimistic loading
  initializeAccount: async (
    address: string,
    accountType?: string,
    network: string = 'mainnet'
  ): Promise<{
    tokens: TokenModel[];
    balance: BalanceData | null;
    nftCollections: CollectionModel[];
  }> => {
    const store = useTokenStore.getState();

    // Fetch data in parallel for better performance
    const [tokens, balance, nftCollections] = await Promise.allSettled([
      store.fetchTokens(address, network),
      store.fetchBalance(address, accountType, network),
      store.fetchNFTCollections(address, network),
    ]);

    return {
      tokens: tokens.status === 'fulfilled' ? tokens.value : [],
      balance: balance.status === 'fulfilled' ? balance.value : null,
      nftCollections: nftCollections.status === 'fulfilled' ? nftCollections.value : [],
    };
  },

  // Refresh account data (force fresh)
  refreshAccount: async (
    address: string,
    accountType?: string,
    network: string = 'mainnet'
  ): Promise<{
    tokens: TokenModel[];
    balance: BalanceData | null;
    nftCollections: CollectionModel[];
  }> => {
    const store = useTokenStore.getState();

    // Invalidate all cache for the address first
    store.invalidateAll(address);

    // Then fetch fresh data
    return await tokenHelpers.initializeAccount(address, accountType, network);
  },
};

// Query keys and queries are already exported above
