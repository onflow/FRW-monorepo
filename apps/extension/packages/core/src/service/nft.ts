import * as fcl from '@onflow/fcl';
import {
  childAccountAllowTypesKey,
  childAccountAllowTypesRefreshRegex,
  childAccountNftsKey,
  childAccountNFTsRefreshRegex,
  cadenceNftCollectionsAndIdsKey,
  cadenceNftCollectionsAndIdsRefreshRegex,
  cadenceCollectionNftsKey,
  fullCadenceNftCollectionListKey,
  fullCadenceNftCollectionListRefreshRegex,
  cadenceCollectionNftsRefreshRegex,
  nftListKey,
  nftListRefreshRegex,
  getValidData,
  registerRefreshListener,
  setCachedData,
  evmCollectionNftsKey,
  evmNftCollectionsAndIdsKey,
  evmNftCollectionsAndIdsRefreshRegex,
  evmCollectionNftsRefreshRegex,
} from '@onflow/frw-data-model';

import {
  type NftCollection,
  type NFTModelV2,
  type CollectionNfts,
  type NftCollectionAndIds,
  type ChildAccountNftMap,
} from '@onflow/frw-shared/types';
import { isValidEthereumAddress } from '@onflow/frw-shared/utils';

import openapiService, { getScripts } from './openapi';
import { fclConfirmNetwork } from '../utils/fclConfig';

const NFT_LIMIT = 50;

class NFT {
  init = async () => {
    registerRefreshListener(
      cadenceNftCollectionsAndIdsRefreshRegex,
      this.loadCadenceNftCollectionsAndIds
    );
    registerRefreshListener(cadenceCollectionNftsRefreshRegex, this.loadCadenceCollectionNfts);
    registerRefreshListener(childAccountAllowTypesRefreshRegex, this.loadChildAccountAllowTypes);
    registerRefreshListener(childAccountNFTsRefreshRegex, this.loadChildAccountNFTs);
    registerRefreshListener(
      fullCadenceNftCollectionListRefreshRegex,
      this.loadFullCadenceNftCollectionList
    );
    registerRefreshListener(nftListRefreshRegex, this.loadNftList);

    // EVM NFTs
    registerRefreshListener(evmCollectionNftsRefreshRegex, this.loadEvmCollectionNfts);
    registerRefreshListener(evmNftCollectionsAndIdsRefreshRegex, this.loadEvmNftCollectionsAndIds);
  };

  /**
   * NOTE: TB July 2025 Is this deprecated?
   * Load the list of NFTs for a given network
   * @param network - The network to get the NFTs for
   * @param chainType - The chain type to get the NFTs for
   * @returns The list of NFTs
   */
  loadNftList = async (network: string, chainType: string): Promise<NFTModelV2[]> => {
    if (chainType !== 'evm' && chainType !== 'flow') {
      throw new Error('Invalid chain type');
    }
    const data = await openapiService.getNFTList(network, chainType);

    if (!data || !Array.isArray(data)) {
      throw new Error('Could not load nft collection list');
    }
    setCachedData(nftListKey(network, chainType), data);
    return data;
  };

  /**
   * Get the list of NFTs for a given network
   * @param network - The network to get the NFTs for
   * @returns The list of NFTs
   */
  getNftList = async (network: string, chainType: string): Promise<NFTModelV2[]> => {
    const nftList = await getValidData<NFTModelV2[]>(nftListKey(network, chainType));
    if (!nftList) {
      return this.loadNftList(network, chainType);
    }
    return nftList;
  };

  /** --------------------------------------------------------------------
   * Cadence NFTs
   * -------------------------------------------------------------------- */

  /**
   * Load the list of all NFT collections on a network and save to cache
   * @param network - The network to get the NFT collections for
   * @returns The list of all NFT collections on the network
   */
  loadFullCadenceNftCollectionList = async (network: string): Promise<NftCollection[]> => {
    const data = await openapiService.fetchFullCadenceNftCollectionList(network);
    if (!data || !Array.isArray(data)) {
      throw new Error('Could not load nft collection list');
    }
    setCachedData(fullCadenceNftCollectionListKey(network), data);
    return data;
  };
  /**
   * Get the list of all NFT collections on a network from cache or load it
   * @param network - The network to get the NFT collections for
   * @returns The list of all NFT collections on the network
   */
  getFullCadenceNftCollectionList = async (
    network: string
  ): Promise<NftCollection[] | undefined> => {
    const collections = await getValidData<NftCollection[]>(
      fullCadenceNftCollectionListKey(network)
    );
    if (!collections) {
      return this.loadFullCadenceNftCollectionList(network);
    }
    return collections;
  };

  /**
   * Load the list of NFT collections and the ids of the nfts owned in each by an account on the Cadence network and save to cache
   * @param network - The network to get the NFT collections for
   * @param address - The address to get the NFT collections for
   * @returns The list of NFT collections and the ids of the nfts owned in each collection
   */
  loadCadenceNftCollectionsAndIds = async (
    network: string,
    address: string
  ): Promise<NftCollectionAndIds[]> => {
    if (!(await fclConfirmNetwork(network))) {
      // Do nothing if the network is switched
      // Don't update the cache
      return [];
    }
    const data = await openapiService.fetchCadenceNftCollectionsAndIds(network, address!);
    if (!data || !Array.isArray(data)) {
      return [];
    }
    // Sort by count, maintaining the new collection structure
    const sortedList = [...data].sort((a, b) => b.count - a.count);

    setCachedData(cadenceNftCollectionsAndIdsKey(network, address), sortedList);
    return sortedList;
  };
  /**
   * Get the list of NFT collections and the ids of the nfts owned in each by an account on the Cadence network from cache or load it
   * @param network - The network to get the NFT collections for
   * @param address - The address to get the NFT collections for
   * @returns The list of NFT collections and the ids of the nfts owned in each collection
   */
  getCadenceNftCollectionsAndIds = async (
    network: string,
    address: string
  ): Promise<NftCollectionAndIds[] | undefined> => {
    const collections = await getValidData<NftCollectionAndIds[]>(
      cadenceNftCollectionsAndIdsKey(network, address)
    );
    if (!collections) {
      return this.loadCadenceNftCollectionsAndIds(network, address);
    }
    return collections;
  };

  /**
   * Load the list of NFTs from a specific collection under a Cadence address and save to cache
   * @param network - The network to get the NFTs for
   * @param address - The address to get the NFTs for
   * @param collectionId - The collection id to get the NFTs for
   * @param offset - The offset for pagination
   * @returns The list of NFTs
   */
  loadCadenceCollectionNfts = async (
    network: string,
    address: string,
    collectionId: string,
    offset: string
  ): Promise<CollectionNfts | undefined> => {
    if (!(await fclConfirmNetwork(network))) {
      // Do nothing if the network is switched
      // Don't update the cache
      return undefined;
    }
    const offsetNumber = parseInt(offset) || 0;
    const data = await openapiService.fetchCadenceCollectionNfts(
      network,
      address!,
      collectionId,
      NFT_LIMIT,
      offsetNumber
    );

    setCachedData(cadenceCollectionNftsKey(network, address, collectionId, `${offset}`), data);

    return data;
  };

  /**
   * Get the list of NFTs from a specific collection under a Cadence address from cache or load it
   * @param network - The network to get the NFTs for
   * @param address - The address to get the NFTs for
   * @param collectionId - The collection id to get the NFTs for
   * @param offset - The offset for pagination
   * @returns The list of NFTs
   */
  getCadenceCollectionNfts = async (
    network: string,
    address: string,
    collectionId: string,
    offset: number
  ): Promise<CollectionNfts | undefined> => {
    const cachedData = await getValidData<CollectionNfts>(
      cadenceCollectionNftsKey(network, address, collectionId, `${offset}`)
    );
    if (!cachedData) {
      return this.loadCadenceCollectionNfts(network, address, collectionId, `${offset}`);
    }
    return cachedData;
  };

  /** --------------------------------------------------------------------
   * EVM NFTs
   * -------------------------------------------------------------------- */

  /**
   * Load the list of NFT collections and the ids of the nfts owned in each by an account on the EVM network and save to cache
   * @param network - The network to get the NFT collections for
   * @param address - The address to get the NFT collections for
   * @returns The list of NFT collections and the ids of the nfts owned in each collection
   */
  loadEvmNftCollectionsAndIds = async (
    network: string,
    address: string
  ): Promise<NftCollectionAndIds[]> => {
    if (!(await fclConfirmNetwork(network))) {
      // Do nothing if the network is switched
      // Don't update the cache
      return [];
    }
    const result = await openapiService.fetchEvmNftCollectionsAndIds(network, address);

    setCachedData(evmNftCollectionsAndIdsKey(network, address), result);
    return result;
  };
  /**
   * Get the EVM NFT collections with the NFT IDs for a given address
   * @param network - The network to get the NFTs for
   * @param address - The address to get the NFTs for
   * @returns The list of EVM NFT collections with the NFT IDs
   */
  getEvmNftCollectionsAndIds = async (
    network: string,
    address: string
  ): Promise<NftCollectionAndIds[] | undefined> => {
    if (!isValidEthereumAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }
    const cacheData = await getValidData<NftCollectionAndIds[]>(
      evmNftCollectionsAndIdsKey(network, address)
    );
    if (cacheData) {
      return cacheData;
    }
    return this.loadEvmNftCollectionsAndIds(network, address);
  };

  /**
   * Load the list of NFTs from a specific collection under a EVM address and save to cache
   * @param network - The network to get the NFTs for
   * @param address - The address to get the NFTs for
   * @param collectionIdentifier - The collection identifier to get the NFTs for
   * @param offset - The offset for pagination
   * @returns The list of NFTs
   */
  loadEvmCollectionNfts = async (
    network: string,
    address: string,
    collectionIdentifier: string,
    offset: string
  ): Promise<CollectionNfts | undefined> => {
    if (!isValidEthereumAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    if (!(await fclConfirmNetwork(network))) {
      // Do nothing if the network is switched
      // Don't update the cache
      return undefined;
    }

    // For EVM, offset can be a JWT token string

    const result = await openapiService.fetchEvmCollectionNfts(
      network,
      address,
      collectionIdentifier,
      NFT_LIMIT,
      offset
    );

    setCachedData(evmCollectionNftsKey(network, address, collectionIdentifier, offset), result);
    return result;
  };
  /**
   * Get EVM NFT collection list for a given address and collection
   * @param network - The network to get the collection for
   * @param address - The address to get the collection for
   * @param collectionIdentifier - The collection identifier
   * @param limit - The limit of items to return
   * @param offset - The offset for pagination
   * @returns The list of EVM NFT collections
   */
  getEvmCollectionNfts = async (
    network: string,
    address: string,
    collectionIdentifier: string,
    offset = '0'
  ): Promise<CollectionNfts | undefined> => {
    if (!isValidEthereumAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }
    const cacheData = await getValidData<CollectionNfts>(
      evmCollectionNftsKey(network, address, collectionIdentifier, `${offset}`)
    );
    if (cacheData) {
      return cacheData;
    }
    return this.loadEvmCollectionNfts(network, address, collectionIdentifier, `${offset}`);
  };

  /** --------------------------------------------------------------------
   * Child Account NFTs
   * -------------------------------------------------------------------- */

  /**
   * Load the list of NFTs from a child account and save to cache
   * @param network - The network to get the NFTs for
   * @param parentAddress - The address of the parent account
   * @returns The list of NFTs
   */
  loadChildAccountNFTs = async (
    network: string,
    parentAddress: string
  ): Promise<ChildAccountNftMap | undefined> => {
    if (!(await fclConfirmNetwork(network))) {
      // Do nothing if the network is switched
      // Don't update the cache
      return undefined;
    }
    const script = await getScripts(network, 'hybridCustody', 'getAccessibleChildAccountNFTs');

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(parentAddress, t.Address)],
    });

    setCachedData(childAccountNftsKey(network, parentAddress), result);

    return result;
  };

  /**
   * Get the list of NFTs from a child account from cache or load it
   * @param network - The network to get the NFTs for
   * @param parentAddress - The address of the parent account
   * @returns The list of NFTs
   */

  getChildAccountNfts = async (
    network: string,
    parentAddress: string
  ): Promise<ChildAccountNftMap | undefined> => {
    const validData = await getValidData<ChildAccountNftMap>(
      childAccountNftsKey(network, parentAddress)
    );
    if (validData) {
      return validData;
    }
    return await this.loadChildAccountNFTs(network, parentAddress);
  };

  /**
   * Load the list of allowed types (NFTs and FTs) for a child account and save to cache
   * These are the NFT collections that the child account is allowed to access
   * @param network - The network to get the allow types for
   * @param parentAddress - The address of the parent account
   * @param childAddress - The address of the child account
   * @returns The list of allowed types of NFTs and FTs
   */

  loadChildAccountAllowTypes = async (
    network: string,
    parentAddress: string,
    childAddress: string
  ): Promise<string[] | undefined> => {
    if (!(await fclConfirmNetwork(network))) {
      // Do nothing if the network is switched
      // Don't update the cache
      return undefined;
    }
    const script = await getScripts(network, 'hybridCustody', 'getChildAccountAllowTypes');
    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(parentAddress, t.Address), arg(childAddress, t.Address)],
    });
    setCachedData(childAccountAllowTypesKey(network, parentAddress, childAddress), result);
    return result;
  };

  /**
   * Get the list of allowed types (NFTs and FTs) for a child account from cache or load it
   * @param network - The network to get the allow types for
   * @param parentAddress - The address of the parent account
   * @param childAddress - The address of the child account
   * @returns The list of allowed types of NFTs and FTs
   */
  getChildAccountAllowTypes = async (
    network: string,
    parentAddress: string,
    childAddress: string
  ): Promise<string[] | undefined> => {
    const validData = await getValidData<string[]>(
      childAccountAllowTypesKey(network, parentAddress, childAddress)
    );
    if (validData) {
      return validData;
    }
    return await this.loadChildAccountAllowTypes(network, parentAddress, childAddress);
  };

  clear = async () => {
    // Just gonna ingore this for now
  };

  clearNFTCollection = () => {
    // Just gonna ingore this for now
  };
}

export default new NFT();
