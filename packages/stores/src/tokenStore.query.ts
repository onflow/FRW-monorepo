import { FlowIndexService, type FlowIndexPricesData } from '@onflow/frw-api';
import { cadence, context, queryClient } from '@onflow/frw-context';
import { TokenService, tokenService, nftService } from '@onflow/frw-services';
import {
  FlatQueryDomain,
  addressType,
  formatCurrencyStringForDisplay,
  type CollectionModel,
  type FungibleTokenCatalogItem,
  type TokenModel,
  type NFTModel,
} from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';
import { getFlowTokenVault } from '@onflow/frw-workflow';
import { create } from 'zustand';

// Balance data interface
interface BalanceData {
  balance: string;
  displayBalance: string;
  nftCount: number;
  nftCountDisplay: string;
  lastUpdated: number;
}

// Inbox (unclaimed LostAndFound assets) data interface
export interface InboxData {
  fts: any[];
  nfts: any[];
  totalCount: number;
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
  nftCollection: (address: string, collection: CollectionModel, network: string = 'mainnet') =>
    [
      ...tokenQueryKeys.nfts(address, network),
      collection.id || collection.contractName || collection.name,
    ] as const,
  nftCollectionAll: (address: string, collection: CollectionModel, network: string = 'mainnet') =>
    [
      ...tokenQueryKeys.nfts(address, network),
      'all',
      collection.id || collection.contractName || collection.name,
    ] as const,
  catalog: (network: string = 'mainnet', chainType: string = 'flow') =>
    [...tokenQueryKeys.all, 'catalog', network, chainType] as const,
  inbox: (address: string, network: string = 'mainnet') =>
    [...tokenQueryKeys.address(address, network), 'inbox'] as const,
  inboxCount: (addresses: string[], network: string = 'mainnet') =>
    [...tokenQueryKeys.all, 'inbox-count', network, ...addresses] as const,
  flowIndexPrices: () => [...tokenQueryKeys.all, 'flowindex-prices'] as const,
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
    } catch (error: any) {
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
    } catch (error: any) {
      logger.error('[TokenQuery] Error fetching NFT collections:', error);
      throw error;
    }
  },

  // Fetch NFTs from a specific collection
  fetchNFTCollection: async (
    address: string,
    collection: CollectionModel,
    network: string = 'mainnet',
    offset: number = 0,
    limit: number = 50
  ): Promise<NFTModel[]> => {
    if (!address || !collection) return [];

    try {
      const walletType = addressType(address);
      const nftSvc = nftService(walletType);

      const result = await nftSvc.getNFTs(address, collection, offset.toString(), limit);

      logger.debug('[TokenQuery] Fetched NFTs from collection:', {
        address,
        collection: collection.name,
        network,
        count: result.nfts.length,
        offset,
        limit,
        nextOffset: result.offset,
      });

      return result.nfts;
    } catch (error: any) {
      logger.error('[TokenQuery] Error fetching NFTs from collection:', error);
      throw error;
    }
  },

  // Fetch ALL NFTs from a collection with address-specific batching logic
  fetchAllNFTsFromCollection: async (
    address: string,
    collection: CollectionModel,
    network: string = 'mainnet',
    totalCount?: number,
    onProgress?: (progress: number, loadedCount: number) => void,
    signal?: AbortSignal
  ): Promise<NFTModel[]> => {
    if (!address || !collection) return [];

    try {
      const BATCH_SIZE = 50;
      const MAX_CONCURRENT_FLOW = 5; // Flow addresses can use concurrent requests
      const MAX_BATCHES = 100; // Maximum 100 batches = 5000 NFTs max
      const MAX_TOTAL_NFTS = 10000; // Absolute maximum NFTs to prevent memory issues
      const walletType = addressType(address);
      const nftSvc = nftService(walletType);
      const isFlowAddress = walletType === 'flow';

      const allNFTs: NFTModel[] = [];
      const nftIds = new Set<string>(); // Track seen NFT IDs to detect duplicates
      let hasMore = true;
      let batchNumber = 1;
      const maxOffset = totalCount ? Math.ceil(totalCount / BATCH_SIZE) * BATCH_SIZE : undefined;
      if (isFlowAddress) {
        // Flow address: Use concurrent requests with calculated offsets
        let offset = 0;

        while (hasMore) {
          if (totalCount && maxOffset && offset >= maxOffset) {
            break;
          }
          // Check if request has been aborted - throw error to prevent caching incomplete data
          if (signal?.aborted) {
            const abortError = new Error('Request aborted by user');
            abortError.name = 'AbortError';
            throw abortError;
          }

          // Create concurrent request batch
          const batchPromises: Promise<{ nfts: NFTModel[]; offset?: string }>[] = [];
          const currentBatchOffsets: number[] = [];

          for (let i = 0; i < MAX_CONCURRENT_FLOW && hasMore; i++) {
            currentBatchOffsets.push(offset);
            batchPromises.push(nftSvc.getNFTs(address, collection, offset.toString(), BATCH_SIZE));
            offset += BATCH_SIZE;
          }

          // Process each promise individually to get real-time progress updates
          let batchHasData = false;

          // Create individual promise handlers that report progress immediately
          const individualPromises = batchPromises.map(async (promise, index) => {
            const requestOffset = currentBatchOffsets[index];
            try {
              const nfts = await promise;

              // Check for duplicates and filter out already seen NFTs
              const newNfts = nfts.nfts.filter((nft) => {
                const nftId = nft.id || `${nft.name}-${nft.contractAddress}`;
                if (nftIds.has(nftId)) {
                  return false;
                }
                nftIds.add(nftId);
                return true;
              });

              allNFTs.push(...newNfts);
              batchHasData = true;

              // Report progress immediately after each individual request completes
              if (onProgress && totalCount) {
                const progress = Math.min((allNFTs.length / totalCount) * 100, 100);
                onProgress(Math.round(progress), allNFTs.length);
              }

              return { nfts, offset: requestOffset, success: true };
            } catch (error) {
              hasMore = false;
              return { nfts: [], offset: requestOffset, success: false, error };
            }
          });

          // Wait for all individual promises to complete
          await Promise.allSettled(individualPromises);

          if (!batchHasData) {
            hasMore = false;
          }

          batchNumber++;
        }
      } else {
        // EVM address: Use sequential requests with cursor/offset from previous response
        let currentOffset = '';

        while (hasMore && batchNumber <= MAX_BATCHES && allNFTs.length < MAX_TOTAL_NFTS) {
          // Check if request has been aborted - throw error to prevent caching incomplete data
          if (signal?.aborted) {
            const abortError = new Error('Request aborted by user');
            abortError.name = 'AbortError';
            throw abortError;
          }

          try {
            const result = await nftSvc.getNFTs(address, collection, currentOffset, BATCH_SIZE);
            const { nfts, offset: nextOffset } = result;

            if (nfts.length === 0) {
              hasMore = false;
              break;
            }

            // Check for duplicates and filter out already seen NFTs
            const newNfts = nfts.filter((nft) => {
              const nftId = nft.id || `${nft.name}-${nft.contractAddress}`;
              if (nftIds.has(nftId)) {
                return false;
              }
              nftIds.add(nftId);
              return true;
            });

            if (newNfts.length === 0) {
              hasMore = false;
              break;
            }

            allNFTs.push(...newNfts);

            // Report progress immediately after each EVM request completes
            if (onProgress && totalCount) {
              const progress = Math.min((allNFTs.length / totalCount) * 100, 100);
              onProgress(Math.round(progress), allNFTs.length);
            }

            // Use the offset returned from the API response for next request
            if (nextOffset) {
              currentOffset = nextOffset;
            } else {
              // If no offset is returned, we've reached the end
              hasMore = false;
            }

            if (nfts.length < BATCH_SIZE) {
              hasMore = false;
              break;
            }

            // Additional safety: If we got duplicates, might be hitting repeat data
            if (newNfts.length < nfts.length) {
              const duplicateCount = nfts.length - newNfts.length;

              // If more than 50% duplicates, stop to avoid infinite loop
              if (duplicateCount > nfts.length / 2) {
                hasMore = false;
                break;
              }
            }
          } catch (error) {
            hasMore = false;
            break;
          }

          batchNumber++;
        }
      }

      return allNFTs;
    } catch (error: any) {
      logger.error('[TokenQuery] Error fetching all NFTs from collection:', error);
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
          (token) =>
            token.identifier === getFlowTokenVault(network as 'mainnet' | 'testnet') ||
            token.symbol?.toLowerCase() === 'flow'
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
    } catch (error: any) {
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

  // Fetch full token catalog (all available tokens, not just user's)
  fetchAllTokens: async (
    network: string = 'mainnet',
    chainType: string = 'flow'
  ): Promise<FungibleTokenCatalogItem[]> => {
    try {
      return await TokenService.getAllTokenCatalog(network, chainType);
    } catch (error) {
      logger.error('[TokenQuery] Error fetching token catalog:', error);
      return [];
    }
  },

  // Fetch unclaimed inbox assets (LostAndFound) for a single Flow address
  fetchInbox: async (
    address: string,
    _network: string = 'mainnet'
  ): Promise<{ fts: any[]; nfts: any[] }> => {
    if (!address) return { fts: [], nfts: [] };

    try {
      const [fts, nfts] = await Promise.all([
        cadence.queryUnclaimedFts(address),
        cadence.queryUnclaimedNfts(address),
      ]);

      return {
        fts: Array.isArray(fts) ? fts.filter(Boolean) : [],
        nfts: Array.isArray(nfts) ? nfts.filter(Boolean) : [],
      };
    } catch (error) {
      logger.error('[TokenQuery] Error fetching inbox:', error);
      return { fts: [], nfts: [] };
    }
  },

  // Batch query unclaimed inbox count for multiple Flow addresses
  fetchInboxCount: async (addresses: string[]): Promise<number> => {
    if (!addresses.length) return 0;
    try {
      const count = await cadence.batchQueryUnclaimedNumber(addresses);
      return typeof count === 'number' ? count : 0;
    } catch (error) {
      logger.error('[TokenQuery] Error fetching inbox count:', error);
      return 0;
    }
  },

  // Fetch FT prices from FlowIndex API (keyed by symbol)
  fetchFlowIndexPrices: async (days: number = 90): Promise<FlowIndexPricesData> => {
    try {
      const prices = await FlowIndexService.fetchFtPrices(days);
      logger.debug('[TokenQuery] Fetched FlowIndex prices:', {
        tokenCount: Object.keys(prices).length,
      });
      return prices;
    } catch (error) {
      logger.error('[TokenQuery] Error fetching FlowIndex prices:', error);
      return {};
    }
  },

  // Batch check if EVM addresses have any ERC20 token balance > 0
  // Only call for EVM addresses with zero FLOW balance to minimize API calls
  fetchBatchERC20HasBalance: async (
    evmAddressList: string[],
    network: string = 'mainnet'
  ): Promise<Array<[string, boolean]>> => {
    if (!evmAddressList || evmAddressList.length === 0) {
      return [];
    }

    try {
      const results = await Promise.allSettled(
        evmAddressList.map(async (address) => {
          const tokens = await tokenQueries.fetchTokens(address, network);
          const hasBalance = tokens.some((token) => {
            const balance = parseFloat(token.balance || '0');
            return balance > 0;
          });
          return [address, hasBalance] as [string, boolean];
        })
      );

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        logger.warn(
          '[TokenQuery] Failed to fetch ERC20 balance for address:',
          evmAddressList[index]
        );
        return [evmAddressList[index], false] as [string, boolean];
      });
    } catch (error) {
      logger.error('[TokenQuery] Failed to fetch batch ERC20 balances:', error);
      return evmAddressList.map((address) => [address, false] as [string, boolean]);
    }
  },

  // Batch fetch NFT counts for multiple addresses
  fetchBatchNFTCounts: async (
    addressList: string[],
    network: string = 'mainnet'
  ): Promise<Array<[string, number]>> => {
    if (!addressList || addressList.length === 0) {
      return [];
    }

    try {
      // Fetch NFT collections for all addresses in parallel
      const results = await Promise.allSettled(
        addressList.map(async (address) => {
          const collections = await tokenQueries.fetchNFTCollections(address, network);
          const totalCount = collections.reduce(
            (sum, collection) => sum + (collection.count || 0),
            0
          );
          return [address, totalCount] as [string, number];
        })
      );

      // Extract successful results and default failed ones to 0
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        logger.warn('[TokenQuery] Failed to fetch NFT count for address:', addressList[index]);
        return [addressList[index], 0] as [string, number];
      });
    } catch (error) {
      logger.error('[TokenQuery] Failed to fetch batch NFT counts:', error);
      return addressList.map((address) => [address, 0] as [string, number]);
    }
  },
};

interface TokenStoreActions {
  // Core data fetching with TanStack Query
  fetchTokens: (address: string, network?: string, forceRefresh?: boolean) => Promise<TokenModel[]>;
  fetchBalance: (address: string, accountType?: string, network?: string) => Promise<BalanceData>;
  fetchNFTCollections: (address: string, network?: string) => Promise<CollectionModel[]>;
  fetchNFTCollection: (
    address: string,
    collection: CollectionModel,
    network?: string,
    offset?: number,
    limit?: number
  ) => Promise<NFTModel[]>;
  fetchAllNFTsFromCollection: (
    address: string,
    collection: CollectionModel,
    network?: string,
    signal?: AbortSignal
  ) => Promise<NFTModel[]>;
  fetchInboxData: (address: string, network?: string) => Promise<InboxData>;

  // Batch operations
  fetchBatchFlowBalances: (addressList: string[]) => Promise<Array<[string, string]>>;

  // Cache management
  invalidateTokens: (address: string, network?: string) => void;
  invalidateBalance: (address: string, network?: string) => void;
  invalidateNFTCollection: (address: string, collection: CollectionModel, network?: string) => void;
  invalidateInbox: (address: string, network?: string) => void;
  invalidateAll: (address?: string) => void;

  // Getters with query data
  getTokensForAddress: (address: string, network?: string) => TokenModel[] | undefined;
  getNFTCollectionsForAddress: (address: string, network?: string) => CollectionModel[] | undefined;
  getNFTCollectionForAddress: (
    address: string,
    collection: CollectionModel,
    network?: string
  ) => NFTModel[] | undefined;
  getBalanceForAddress: (address: string, network?: string) => BalanceData | undefined;
  getInboxData: (address: string, network?: string) => { fts: any[]; nfts: any[] } | undefined;

  // Loading states
  isTokensLoading: (address: string, network?: string) => boolean;
  isBalanceLoading: (address: string, network?: string) => boolean;
  isNFTsLoading: (address: string, network?: string) => boolean;
  isNFTCollectionLoading: (
    address: string,
    collection: CollectionModel,
    network?: string
  ) => boolean;
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

  // Fetch NFT collection items with TanStack Query
  fetchNFTCollection: async (
    address: string,
    collection: CollectionModel,
    network: string = 'mainnet',
    offset: number = 0,
    limit: number = 50
  ): Promise<NFTModel[]> => {
    return await queryClient.fetchQuery({
      queryKey: tokenQueryKeys.nftCollection(address, collection, network),
      queryFn: () => tokenQueries.fetchNFTCollection(address, collection, network, offset, limit),
      staleTime: 5 * 60 * 1000, // NFT items can be cached for 5 minutes
    });
  },

  // Fetch ALL NFT collection items with concurrent batching
  fetchAllNFTsFromCollection: async (
    address: string,
    collection: CollectionModel,
    network: string = 'mainnet',
    signal?: AbortSignal
  ): Promise<NFTModel[]> => {
    return await queryClient.fetchQuery({
      queryKey: tokenQueryKeys.nftCollectionAll(address, collection, network),
      queryFn: ({ signal: querySignal }) =>
        tokenQueries.fetchAllNFTsFromCollection(
          address,
          collection,
          network,
          collection.count,
          undefined,
          signal || querySignal
        ),
      staleTime: 10 * 60 * 1000, // All NFTs can be cached longer (10 minutes)
      gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    });
  },

  // Fetch inbox (unclaimed LostAndFound) data
  fetchInboxData: async (address: string, network: string = 'mainnet') => {
    return await queryClient.fetchQuery({
      queryKey: tokenQueryKeys.inbox(address, network),
      queryFn: () => tokenQueries.fetchInbox(address, network),
      staleTime: 60 * 1000,
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

  invalidateNFTCollection: (
    address: string,
    collection: CollectionModel,
    network: string = 'mainnet'
  ): void => {
    queryClient.invalidateQueries({
      queryKey: tokenQueryKeys.nftCollection(address, collection, network),
    });
  },

  invalidateInbox: (address: string, network: string = 'mainnet'): void => {
    queryClient.invalidateQueries({
      queryKey: tokenQueryKeys.inbox(address, network),
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

  getNFTCollectionForAddress: (
    address: string,
    collection: CollectionModel,
    network: string = 'mainnet'
  ): NFTModel[] | undefined => {
    return queryClient.getQueryData<NFTModel[]>(
      tokenQueryKeys.nftCollection(address, collection, network)
    );
  },

  getBalanceForAddress: (address: string, network: string = 'mainnet'): BalanceData | undefined => {
    return queryClient.getQueryData<BalanceData>(tokenQueryKeys.balance(address, network));
  },

  getInboxData: (address: string, network: string = 'mainnet') => {
    return queryClient.getQueryData<{ fts: any[]; nfts: any[] }>(
      tokenQueryKeys.inbox(address, network)
    );
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

  isNFTCollectionLoading: (
    address: string,
    collection: CollectionModel,
    network: string = 'mainnet'
  ): boolean => {
    const query = queryClient.getQueryCache().find({
      queryKey: tokenQueryKeys.nftCollection(address, collection, network),
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

/**
 * Enables a token vault in the user's Flow account via Cadence transaction.
 * @param flowIdentifier - The Flow contract identifier (e.g. A.1654653399040a61.FlowToken).
 *   Automatically appends ".Vault" if not already a 4-part identifier.
 * @returns Transaction ID string
 */
export async function enableToken(flowIdentifier: string): Promise<string> {
  const parts = flowIdentifier.split('.');
  const vaultIdentifier = parts.length === 3 ? `${flowIdentifier}.Vault` : flowIdentifier;
  logger.debug('[enableToken] Enabling token vault:', vaultIdentifier);
  return cadence.enableTokenStorageV2(vaultIdentifier);
}

/**
 * Claims unclaimed fungible tokens from LostAndFound.
 * @param identifier - The Cadence type identifier (e.g. "A.1654653399040a61.FlowToken.Vault")
 * @returns Transaction ID string
 */
export async function claimFt(identifier: string): Promise<string> {
  logger.debug('[claimFt] Claiming FT:', identifier);
  return cadence.claimFt(identifier);
}

/**
 * Claims unclaimed NFTs from LostAndFound.
 * @param identifier - The Cadence type identifier (e.g. "A.xxx.TopShot.NFT")
 * @returns Transaction ID string
 */
export async function claimNft(identifier: string): Promise<string> {
  logger.debug('[claimNft] Claiming NFT:', identifier);
  return cadence.claimNft(identifier);
}

// Query keys and queries are already exported above
