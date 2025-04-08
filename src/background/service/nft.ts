import {
  nftCatalogCollectionsKey,
  nftCatalogCollectionsRefreshRegex,
  nftCollectionKey,
  nftCollectionRefreshRegex,
  getCachedNftCollection,
  getCachedNftCatalogCollections,
} from '@/shared/utils/cache-data-keys';
import { registerRefreshListener, setCachedData } from 'background/utils/data-cache';

import { type NFTCollectionData, type NFTCollections } from '../../shared/types/nft-types';

import openapiService from './openapi';

class NFT {
  init = async () => {
    registerRefreshListener(nftCatalogCollectionsRefreshRegex, this.loadNftCatalogCollections);
    registerRefreshListener(nftCollectionRefreshRegex, this.loadSingleNftCollection);
  };

  loadNftCatalogCollections = async (
    network: string,
    address: string
  ): Promise<NFTCollections[]> => {
    const data = await openapiService.nftCatalogCollections(address!, network);
    if (!data || !Array.isArray(data)) {
      return [];
    }
    // Sort by count, maintaining the new collection structure
    const sortedList = [...data].sort((a, b) => b.count - a.count);

    setCachedData(nftCatalogCollectionsKey(network, address), sortedList);
    return sortedList;
  };

  loadSingleNftCollection = async (
    network: string,
    address: string,
    collectionId: string,
    offset: string
  ): Promise<NFTCollectionData> => {
    const offsetNumber = parseInt(offset) || 0;
    const data = await openapiService.nftCatalogCollectionList(
      address!,
      collectionId,
      50,
      offsetNumber,
      network
    );

    data.nfts.map((nft) => {
      nft.unique_id = nft.collectionName + '_' + nft.id;
    });
    function getUniqueListBy(arr, key) {
      return [...new Map(arr.map((item) => [item[key], item])).values()];
    }
    const unique_nfts = getUniqueListBy(data.nfts, 'unique_id');
    data.nfts = unique_nfts;

    setCachedData(nftCollectionKey(network, address, collectionId, `${offset}`), data);

    return data;
  };

  getSingleCollection = async (
    network: string,
    address: string,
    collectionId: string,
    offset: number
  ): Promise<NFTCollectionData | undefined> => {
    return getCachedNftCollection(network, address, collectionId, offset);
  };

  getCollectionList = async (
    network: string,
    address: string
  ): Promise<NFTCollections[] | undefined> => {
    const collections = await getCachedNftCatalogCollections(network, address);
    if (!collections) {
      return undefined;
    }
    return collections;
  };

  clear = async () => {
    // Just gonna ingore this for now
  };

  clearNFTCollection = () => {
    // Just gonna ingore this for now
  };
}

export default new NFT();
