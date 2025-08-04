import { NftService, FlowEvmNftService } from '@onflow/frw-api';
import { WalletType, type CollectionModel, type NFTModel } from '@onflow/frw-types';

import type { BridgeSpec } from './';

interface NFTProvider {
  getCollections(address: string): Promise<CollectionModel[]>;
  getNFTs(
    address: string,
    collection: CollectionModel,
    offset: number,
    limit: number
  ): Promise<NFTModel[]>;
}

class FlowNFTProvider implements NFTProvider {
  async getCollections(address: string): Promise<CollectionModel[]> {
    try {
      const res = await NftService.id({ address });
      if (!res || !res.data) {
        console.warn('[NFTService] Empty response for Flow NFT collections');
        return [];
      }
      return (
        res.data.map((collection: any) => ({
          ...collection.collection,
          type: WalletType.Flow,
          count: collection.count,
        })) ?? []
      );
    } catch (error) {
      console.error('[NFTService] Failed to fetch Flow NFT collections:', error);
      return [];
    }
  }

  async getNFTs(
    address: string,
    collection: CollectionModel,
    offset: number = 0,
    limit: number = 50
  ): Promise<NFTModel[]> {
    const path = collection.path?.storage_path.split('/').pop();
    if (!path) {
      throw new Error('Collection path not found');
    }
    const res = await NftService.collectionList({
      address,
      collectionIdentifier: path,
      offset,
      limit,
    });
    console.log(res.data);
    return (
      res.data?.nfts?.map((nft) => ({
        ...nft,
        type: WalletType.Flow,
      })) ?? []
    );
  }
}

class EvmNFTProvider implements NFTProvider {
  async getCollections(address: string): Promise<CollectionModel[]> {
    const startTime = Date.now();
    console.log('[NFTService] Starting EVM NFT collections fetch', {
      address,
      timestamp: new Date().toISOString(),
      provider: 'EvmNFTProvider',
    });

    try {
      console.log('[NFTService] Calling FlowEvmNftService.id API', {
        address,
        method: 'FlowEvmNftService.id',
        endpoint: '/api/v3/evm/nft/id',
      });

      const res = await FlowEvmNftService.id({ address });
      const duration = Date.now() - startTime;

      console.log('[NFTService] FlowEvmNftService.id API response received', {
        address,
        duration: `${duration}ms`,
        hasResponse: !!res,
        hasData: !!res?.data,
        dataLength: res?.data?.length || 0,
        status: res?.status || 'unknown',
      });

      if (!res || !res.data) {
        console.warn('[NFTService] Empty response for EVM NFT collections', {
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

      console.log('[NFTService] Successfully processed EVM NFT collections', {
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
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[NFTService] Failed to fetch EVM NFT collections', {
        address,
        duration: `${duration}ms`,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
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
    offset: number = 0,
    limit: number = 50
  ): Promise<NFTModel[]> {
    const startTime = Date.now();
    console.log('[NFTService] Starting EVM NFTs fetch', {
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
      console.log('[NFTService] Calling FlowEvmNftService.collectionList API', {
        address,
        collectionIdentifier: collection.flowIdentifier || 'undefined',
        offset,
        limit,
        method: 'FlowEvmNftService.collectionList',
        endpoint: '/api/v3/evm/nft/collectionList',
      });

      const res = await FlowEvmNftService.collectionList({
        address,
        collectionIdentifier: collection.flowIdentifier || '',
        offset,
        limit,
      });

      const duration = Date.now() - startTime;

      console.log('[NFTService] FlowEvmNftService.collectionList API response received', {
        address,
        collectionId: collection.id,
        duration: `${duration}ms`,
        hasResponse: !!res,
        hasData: !!res?.data,
        nftCount: res?.data?.nfts?.length || 0,
        totalNftCount: res?.data?.nftCount || 0,
        status: res?.status || 'unknown',
      });

      const nfts =
        res.data?.nfts?.map((nft) => ({
          ...nft,
          type: WalletType.EVM,
        })) ?? [];

      console.log('[NFTService] Successfully processed EVM NFTs', {
        address,
        collectionId: collection.id,
        duration: `${duration}ms`,
        nftsCount: nfts.length,
        offset,
        limit,
        nfts: nfts.slice(0, 3).map((nft) => ({
          id: nft.id,
          name: nft.name,
          collectionName: nft.collectionName,
          contractAddress: nft.contractAddress,
          evmAddress: nft.evmAddress,
        })),
      });

      return nfts;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[NFTService] Failed to fetch EVM NFTs', {
        address,
        collectionId: collection.id,
        collectionName: collection.name,
        flowIdentifier: collection.flowIdentifier,
        offset,
        limit,
        duration: `${duration}ms`,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        timestamp: new Date().toISOString(),
        provider: 'EvmNFTProvider',
        method: 'getNFTs',
      });
      return [];
    }
  }
}

export class NFTService {
  private static instances: Map<string, NFTService> = new Map();
  private nftProvider: NFTProvider;
  private bridge?: BridgeSpec;

  constructor(type: WalletType, bridge?: BridgeSpec) {
    this.nftProvider = type === WalletType.Flow ? new FlowNFTProvider() : new EvmNFTProvider();
    this.bridge = bridge;
  }

  async getNFTCollections(address: string): Promise<CollectionModel[]> {
    const startTime = Date.now();
    const providerType = this.nftProvider instanceof EvmNFTProvider ? 'EVM' : 'Flow';

    console.log('[NFTService] Starting NFT collections fetch', {
      address,
      providerType,
      timestamp: new Date().toISOString(),
      method: 'getNFTCollections',
    });

    try {
      if (!address) {
        console.warn('[NFTService] No address provided for NFT collections', {
          providerType,
          timestamp: new Date().toISOString(),
        });
        return [];
      }

      const collections = await this.nftProvider.getCollections(address);
      const duration = Date.now() - startTime;

      console.log('[NFTService] NFT collections fetch completed', {
        address,
        providerType,
        duration: `${duration}ms`,
        collectionsCount: collections.length,
        timestamp: new Date().toISOString(),
      });

      return collections;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[NFTService] Error in getNFTCollections', {
        address,
        providerType,
        duration: `${duration}ms`,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        timestamp: new Date().toISOString(),
        method: 'getNFTCollections',
      });
      return [];
    }
  }

  async getNFTs(
    address: string,
    collection: CollectionModel,
    offset: number = 0,
    limit: number = 50
  ): Promise<NFTModel[]> {
    const startTime = Date.now();
    const providerType = this.nftProvider instanceof EvmNFTProvider ? 'EVM' : 'Flow';

    console.log('[NFTService] Starting NFTs fetch', {
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
        console.warn('[NFTService] Invalid parameters for getNFTs', {
          hasAddress: !!address,
          hasCollection: !!collection,
          providerType,
          timestamp: new Date().toISOString(),
        });
        return [];
      }

      const nfts = await this.nftProvider.getNFTs(address, collection, offset, limit);
      const duration = Date.now() - startTime;

      console.log('[NFTService] NFTs fetch completed', {
        address,
        providerType,
        collectionId: collection.id,
        duration: `${duration}ms`,
        nftsCount: nfts.length,
        offset,
        limit,
        timestamp: new Date().toISOString(),
      });

      return nfts;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[NFTService] Error in getNFTs', {
        address,
        providerType,
        collectionId: collection?.id,
        collectionName: collection?.name,
        offset,
        limit,
        duration: `${duration}ms`,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        timestamp: new Date().toISOString(),
        method: 'getNFTs',
      });
      return [];
    }
  }
}
