import { NftService, FlowEvmNftService } from '@onflow/frw-api';
import { getServiceContext, type PlatformSpec } from '@onflow/frw-context';
import { WalletType, type CollectionModel, type NFTModel } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

interface NFTCollectionResult {
  nfts: NFTModel[];
  offset?: string; // Next page offset/cursor
}

interface NFTProvider {
  getCollections(address: string): Promise<CollectionModel[]>;
  getNFTs(
    address: string,
    collection: CollectionModel,
    offset: string,
    limit: number
  ): Promise<NFTCollectionResult>;
}

class FlowNFTProvider implements NFTProvider {
  async getCollections(address: string): Promise<CollectionModel[]> {
    try {
      const res = await NftService.id({ address });
      if (!res || !res.data) {
        logger.warn('[NFTService] Empty response for Flow NFT collections');
        return [];
      }
      return (
        res.data.map((collection: any) => ({
          ...collection.collection,
          type: WalletType.Flow,
          count: collection.count,
        })) ?? []
      );
    } catch (_error) {
      logger.error('Unused error parameter', _error);
      return [];
    }
  }

  async getNFTs(
    address: string,
    collection: CollectionModel,
    offset: string = '0',
    limit: number = 50
  ): Promise<NFTCollectionResult> {
    const path = collection.path?.storage_path.split('/').pop();
    if (!path) {
      throw new Error('Collection path not found');
    }
    const res = await NftService.collectionList({
      address,
      collectionIdentifier: path,
      offset: parseInt(offset, 10) || 0,
      limit,
    });
    logger.debug('NFT list response:', res.data);

    const nfts =
      res.data?.nfts?.map((nft) => ({
        ...nft,
        type: WalletType.Flow,
      })) ?? [];

    return {
      nfts,
      offset: res.data?.offset,
    };
  }
}

class EvmNFTProvider implements NFTProvider {
  async getCollections(address: string): Promise<CollectionModel[]> {
    const startTime = Date.now();
    logger.debug('[NFTService] Starting EVM NFT collections fetch', {
      address,
      timestamp: new Date().toISOString(),
      provider: 'EvmNFTProvider',
    });

    try {
      logger.debug('[NFTService] Calling FlowEvmNftService.id API', {
        address,
        method: 'FlowEvmNftService.id',
        endpoint: '/api/v3/evm/nft/id',
      });

      const res = await FlowEvmNftService.id({ address });
      const duration = Date.now() - startTime;

      logger.debug('[NFTService] FlowEvmNftService.id API response received', {
        address,
        duration: `${duration}ms`,
        hasResponse: !!res,
        hasData: !!res?.data,
        dataLength: res?.data?.length || 0,
        status: res?.status || 'unknown',
      });

      if (!res || !res.data) {
        logger.warn('[NFTService] Empty response for EVM NFT collections', {
          address,
          duration: `${duration}ms`,
          response: res,
          hasResponse: !!res,
          hasData: !!res?.data,
        });
        return [];
      }

      const collections =
        res.data.map((item: any) => ({
          ...item.collection, // Spread the nested collection properties to top level
          type: WalletType.EVM,
          count: item.count, // Add count from the parent object
        })) ?? [];

      logger.debug('[NFTService] Successfully processed EVM NFT collections', {
        address,
        duration: `${duration}ms`,
        collectionsCount: collections.length,
        collections: collections.map((c) => ({
          id: c.id,
          name: c.name,
          contractName: c.contractName,
          flowIdentifier: c.flowIdentifier,
          evmAddress: c.evmAddress,
          count: c.count,
        })),
      });

      return collections;
    } catch (_error) {
      const duration = Date.now() - startTime;
      logger.error('[NFTService] Failed to fetch EVM NFT collections', {
        address,
        duration: `${duration}ms`,
        error:
          _error instanceof Error
            ? {
                name: _error.name,
                message: _error.message,
                stack: _error.stack,
              }
            : _error,
        timestamp: new Date().toISOString(),
        provider: 'EvmNFTProvider',
        method: 'getCollections',
      });
      return [];
    }
  }

  async getNFTs(
    address: string,
    collection: CollectionModel,
    offset: string = '',
    limit: number = 50
  ): Promise<NFTCollectionResult> {
    const startTime = Date.now();
    logger.debug('[NFTService] Starting EVM NFTs fetch', {
      address,
      collectionId: collection.id,
      collectionName: collection.name,
      flowIdentifier: collection.flowIdentifier,
      offset,
      limit,
      timestamp: new Date().toISOString(),
      provider: 'EvmNFTProvider',
    });

    try {
      logger.debug('[NFTService] Calling FlowEvmNftService.collectionList API', {
        address,
        collectionIdentifier: collection.id || 'undefined',
        offset,
        limit,
        method: 'FlowEvmNftService.collectionList',
        endpoint: '/api/v3/evm/nft/collectionList',
      });

      // For EVM API, convert string offset to number, empty string becomes 0
      const numericOffset = offset ? parseInt(offset, 10) : 0;

      const res = await FlowEvmNftService.collectionList({
        address,
        collectionIdentifier: collection.id || '',
        offset: numericOffset,
        limit,
      });

      const duration = Date.now() - startTime;

      logger.debug('[NFTService] FlowEvmNftService.collectionList API response received', {
        address,
        collectionId: collection.id,
        duration: `${duration}ms`,
        hasResponse: !!res,
        hasData: !!res?.data,
        nftCount: res?.data?.nfts?.length || 0,
        totalNftCount: res?.data?.nftCount || 0,
        responseOffset: res?.data?.offset,
        status: res?.status || 'unknown',
      });

      const nfts =
        res.data?.nfts?.map((nft) => ({
          ...nft,
          type: WalletType.EVM,
        })) ?? [];

      // For EVM addresses, use the offset returned from the API response
      const nextOffset = res.data?.offset;

      logger.debug('[NFTService] Successfully processed EVM NFTs', {
        address,
        collectionId: collection.id,
        duration: `${duration}ms`,
        nftsCount: nfts.length,
        requestOffset: offset,
        responseOffset: nextOffset,
        limit,
        hasMore: !!nextOffset,
        nfts: nfts.slice(0, 3).map((nft) => ({
          id: nft.id,
          name: nft.name,
          collectionName: nft.collectionName,
          contractAddress: nft.contractAddress,
          evmAddress: nft.evmAddress,
        })),
      });

      return {
        nfts,
        offset: nextOffset,
      };
    } catch (_error) {
      const duration = Date.now() - startTime;
      logger.error('[NFTService] Failed to fetch EVM NFTs', {
        address,
        collectionId: collection.id,
        collectionName: collection.name,
        flowIdentifier: collection.flowIdentifier,
        offset,
        limit,
        duration: `${duration}ms`,
        error:
          _error instanceof Error
            ? {
                name: _error.name,
                message: _error.message,
                stack: _error.stack,
              }
            : _error,
        timestamp: new Date().toISOString(),
        provider: 'EvmNFTProvider',
        method: 'getNFTs',
      });
      return { nfts: [] };
    }
  }
}

export class NFTService {
  private static instances: Map<string, NFTService> = new Map();
  private nftProvider: NFTProvider;
  private bridge?: PlatformSpec;

  constructor(type: WalletType, bridge?: PlatformSpec) {
    this.nftProvider = type === WalletType.Flow ? new FlowNFTProvider() : new EvmNFTProvider();

    // If bridge is not provided, try to get it from ServiceContext
    if (bridge) {
      this.bridge = bridge;
    } else {
      try {
        this.bridge = getServiceContext().bridge;
      } catch {
        logger.warn('[NFTService] ServiceContext not initialized, bridge will be null');
        this.bridge = undefined;
      }
    }
  }

  static getInstance(type: WalletType, bridge?: PlatformSpec): NFTService {
    const key = `${type}-${bridge ? 'with-bridge' : 'no-bridge'}`;

    if (!NFTService.instances.has(key)) {
      NFTService.instances.set(key, new NFTService(type, bridge));
    }

    return NFTService.instances.get(key)!;
  }

  async getNFTCollections(address: string): Promise<CollectionModel[]> {
    const startTime = Date.now();
    const providerType = this.nftProvider instanceof EvmNFTProvider ? 'EVM' : 'Flow';

    logger.debug('[NFTService] Starting NFT collections fetch', {
      address,
      providerType,
      timestamp: new Date().toISOString(),
      method: 'getNFTCollections',
    });

    try {
      if (!address) {
        logger.warn('[NFTService] No address provided for NFT collections', {
          providerType,
          timestamp: new Date().toISOString(),
        });
        return [];
      }

      const collections = await this.nftProvider.getCollections(address);
      const duration = Date.now() - startTime;

      logger.debug('[NFTService] NFT collections fetch completed', {
        address,
        providerType,
        duration: `${duration}ms`,
        collectionsCount: collections.length,
        timestamp: new Date().toISOString(),
      });

      return collections;
    } catch (_error) {
      const duration = Date.now() - startTime;
      logger.error('[NFTService] Error in getNFTCollections', {
        address,
        providerType,
        duration: `${duration}ms`,
        error:
          _error instanceof Error
            ? {
                name: _error.name,
                message: _error.message,
                stack: _error.stack,
              }
            : _error,
        timestamp: new Date().toISOString(),
        method: 'getNFTCollections',
      });
      return [];
    }
  }

  async getNFTs(
    address: string,
    collection: CollectionModel,
    offset: string = '',
    limit: number = 50
  ): Promise<NFTCollectionResult> {
    const startTime = Date.now();
    const providerType = this.nftProvider instanceof EvmNFTProvider ? 'EVM' : 'Flow';

    logger.debug('[NFTService] Starting NFTs fetch', {
      address,
      providerType,
      collectionId: collection?.id,
      collectionName: collection?.name,
      offset,
      limit,
      timestamp: new Date().toISOString(),
      method: 'getNFTs',
    });

    try {
      if (!address || !collection) {
        logger.warn('[NFTService] Invalid parameters for getNFTs', {
          hasAddress: !!address,
          hasCollection: !!collection,
          providerType,
          timestamp: new Date().toISOString(),
        });
        return { nfts: [] };
      }

      const result = await this.nftProvider.getNFTs(address, collection, offset, limit);
      const duration = Date.now() - startTime;

      logger.debug('[NFTService] NFTs fetch completed', {
        address,
        providerType,
        collectionId: collection.id,
        duration: `${duration}ms`,
        nftsCount: result.nfts.length,
        offset,
        responseOffset: result.offset,
        limit,
        hasMore: !!result.offset,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (_error) {
      const duration = Date.now() - startTime;
      logger.error('[NFTService] Error in getNFTs', {
        address,
        providerType,
        collectionId: collection?.id,
        collectionName: collection?.name,
        offset,
        limit,
        duration: `${duration}ms`,
        error:
          _error instanceof Error
            ? {
                name: _error.name,
                message: _error.message,
                stack: _error.stack,
              }
            : _error,
        timestamp: new Date().toISOString(),
        method: 'getNFTs',
      });
      return { nfts: [] };
    }
  }
}
