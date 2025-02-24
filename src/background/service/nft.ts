import { createPersistStore } from 'background/utils';
import { storage } from 'background/webapi';

import { type NFTCollectionData, type NFTCollectionList } from '../../shared/types/nft-types';
interface NftStore {
  collectionList: {
    mainnet: {
      [collectionIdentifier: string]: {
        [offset: number]: {
          data: NFTCollectionData;
          expiry: number;
        };
      };
    };
    testnet: {
      [collectionIdentifier: string]: {
        [offset: number]: {
          data: NFTCollectionData;
          expiry: number;
        };
      };
    };
  };
  collections: {
    mainnet: {
      data: NFTCollectionList[];
      expiry: number;
    };
    testnet: {
      data: NFTCollectionList[];
      expiry: number;
    };
  };
}

const EXPIRY_TIME = 60 * 1000; // 60 seconds in milliseconds

class NFT {
  store!: NftStore;

  init = async () => {
    this.store = await createPersistStore<NftStore>({
      name: 'nftv2',
      template: {
        collections: {
          testnet: {
            data: [],
            expiry: 0,
          },
          mainnet: {
            data: [],
            expiry: 0,
          },
        },
        collectionList: {
          testnet: {},
          mainnet: {},
        },
      },
    });
  };

  getSingleCollection = (
    network: string,
    collectionIdentifier: string,
    offset: number
  ): NFTCollectionData | null => {
    const collection = this.store.collectionList[network][collectionIdentifier]?.[offset];
    if (!collection || Date.now() > collection.expiry) {
      return null;
    }
    return collection.data;
  };

  setSingleCollection = (
    data: NFTCollectionData,
    collectionIdentifier: string,
    offset: number,
    network: string
  ) => {
    const expiry = Date.now() + EXPIRY_TIME;
    if (!this.store.collectionList[network][collectionIdentifier]) {
      this.store.collectionList[network][collectionIdentifier] = {};
    }
    this.store.collectionList[network][collectionIdentifier][offset] = { data, expiry };
  };

  deleteSingleCollection = (collectionIdentifier: string, offset: number, network: string) => {
    if (this.store.collectionList[network][collectionIdentifier]) {
      delete this.store.collectionList[network][collectionIdentifier][offset];
    }
  };

  getCollectionList = (network: string): NFTCollectionList[] | null => {
    const collections = this.store.collections[network];
    if (!collections || Date.now() > collections.expiry) {
      return null;
    }
    return collections.data;
  };

  setCollectionList = (data: Array<any>, network: string) => {
    const expiry = Date.now() + EXPIRY_TIME;
    this.store.collections[network] = { data, expiry };
  };

  clear = async () => {
    if (!this.store) {
      await this.init();
    }

    this.store.collectionList = {
      testnet: {},
      mainnet: {},
    };

    this.store.collections = {
      testnet: {
        data: [],
        expiry: 0,
      },
      mainnet: {
        data: [],
        expiry: 0,
      },
    };

    storage.remove('nftv2');
    storage.remove('nft');
  };

  clearNFTCollection = () => {
    this.clear();
  };
}

export default new NFT();
