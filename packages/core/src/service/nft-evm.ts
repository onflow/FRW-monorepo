import {
  evmNftCollectionListKey,
  evmNftCollectionListRefreshRegex,
  type EvmNftCollectionListStore,
  evmNftIdsKey,
  evmNftIdsRefreshRegex,
  type EvmNftIdsStore,
} from '@onflow/flow-wallet-data-model/cache-data-keys';
import {
  getValidData,
  registerRefreshListener,
  setCachedData,
} from '@onflow/flow-wallet-data-model/data-cache';
import { isValidEthereumAddress } from '@onflow/flow-wallet-shared/utils/address';

import { openapiService } from '.';
import { fclConfirmNetwork } from '../utils/fclConfig';

class EvmNfts {
  init = async () => {
    registerRefreshListener(evmNftCollectionListRefreshRegex, this.loadEvmCollectionList);
    registerRefreshListener(evmNftIdsRefreshRegex, this.loadEvmNftIds);
  };

  loadEvmNftIds = async (network: string, address: string) => {
    if (!(await fclConfirmNetwork(network))) {
      // Do nothing if the network is switched
      // Don't update the cache
      return [];
    }
    const result = await openapiService.EvmNFTID(network, address);

    setCachedData(evmNftIdsKey(network, address), result);
    return result;
  };

  loadEvmCollectionList = async (
    network: string,
    address: string,
    collectionIdentifier: string,
    offset: string
  ) => {
    if (!isValidEthereumAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    if (!(await fclConfirmNetwork(network))) {
      // Do nothing if the network is switched
      // Don't update the cache
      return [];
    }

    // For EVM, offset can be a JWT token string
    // Don't convert to integer if it's a JWT token
    const offsetParam = offset && !isNaN(Number(offset)) ? parseInt(offset) : offset;

    const result = await openapiService.EvmNFTcollectionList(
      address,
      collectionIdentifier,
      50,
      offsetParam as string | number
    );

    setCachedData(evmNftCollectionListKey(network, address, collectionIdentifier, offset), result);
    return result;
  };

  clearEvmNfts = async () => {};

  /**
   * Get EVM NFT IDs for a given address
   * @param network - The network to get the NFTs for
   * @param address - The address to get the NFTs for
   * @returns The list of EVM NFT IDs
   */
  getEvmNftId = async (network: string, address: string) => {
    if (!isValidEthereumAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }
    const cacheData = await getValidData<EvmNftIdsStore>(evmNftIdsKey(network, address));
    if (cacheData) {
      return cacheData;
    }
    return this.loadEvmNftIds(network, address);
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
  getEvmNftCollectionList = async (
    network: string,
    address: string,
    collectionIdentifier: string,
    limit = 50,
    offset = '0'
  ) => {
    if (!isValidEthereumAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }
    const cacheData = await getValidData<EvmNftCollectionListStore>(
      evmNftCollectionListKey(network, address, collectionIdentifier, `${offset}`)
    );
    if (cacheData) {
      return cacheData;
    }
    return this.loadEvmCollectionList(network, address, collectionIdentifier, `${offset}`);
  };
}

export default new EvmNfts();
