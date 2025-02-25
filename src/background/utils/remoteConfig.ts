import { storage } from '@/background/webapi';
import { type NFTModelV2, type NFTModel_depreciated } from '@/shared/types/network-types';

import { userWalletService } from '../service';
import openapi from '../service/openapi';

import defaultConfig from './defaultConfig.json';
import mainnetNftList_depreciated from './defaultNftList.mainnet.json';
import testnetNftList_depreciated from './defaultNftList.testnet.json';
import mainnetNftListV2 from './defaultNftListV2.mainnet.json';
import testnetNftListV2 from './defaultNftListV2.testnet.json';
import defaultTokenList from './defaultTokenList.json';

interface CacheState {
  result: any;
  expireTime: number;
}

const BASE_FUNCTIONS_URL = process.env.FB_FUNCTIONS;

class fetchRemoteConfig {
  coinState: CacheState = { result: {}, expireTime: 0 };
  nftState = {
    mainnet: {
      result: {},
      expireTime: 0,
    },
    testnet: {
      result: {},
      expireTime: 0,
    },
  };
  configState: CacheState = { result: {}, expireTime: 0 };

  async flowCoins() {
    const expire = this.coinState.expireTime;
    const now = new Date();
    // one hour expire time
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    if (expire < now.getTime()) {
      try {
        const result = await openapi.sendRequest('GET', '/fetchFTList', {}, {}, BASE_FUNCTIONS_URL);

        this.coinState.result = result;
        this.coinState.expireTime = exp;
        return result;
      } catch (err) {
        console.error(err);
        return defaultTokenList;
      }
    } else {
      return this.coinState.result;
    }
  }

  async nftCollection(): Promise<NFTModelV2[]> {
    const network = await userWalletService.getNetwork();
    const expire = this.nftState[network].expireTime;
    const now = new Date();
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    let defaultNftList: NFTModelV2[] = testnetNftListV2.tokens;
    if (network === 'mainnet') {
      defaultNftList = mainnetNftListV2.tokens;
    }
    if (expire < now.getTime()) {
      try {
        const result = await openapi.getNFTList(network);
        // fetch(`${baseURL}/fetchNFTList`);
        // const result = await coins.json();
        this.nftState[network].result = result;
        this.nftState[network].expireTime = exp;
        return result;
      } catch (err) {
        console.error(err);
        return defaultNftList;
      }
    } else {
      return this.nftState[network].result;
    }
  }

  async nftv2Collection(): Promise<NFTModel_depreciated[]> {
    const network = await userWalletService.getNetwork();
    const address = await userWalletService.getCurrentAddress();
    const expire = this.nftState[network].expireTime;
    const now = new Date();
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    let defaultNftList = testnetNftList_depreciated;
    if (network === 'mainnet') {
      defaultNftList = mainnetNftList_depreciated;
    }
    if (expire < now.getTime()) {
      try {
        const result = await openapi.getNFTV2CollectionList(address, network);
        // fetch(`${baseURL}/fetchNFTList`);
        // const result = await coins.json();
        this.nftState[network].result = result;
        this.nftState[network].expireTime = exp;
        return result;
      } catch (err) {
        console.error(err);
        return defaultNftList;
      }
    } else {
      return this.nftState[network].result;
    }
  }

  async remoteConfig() {
    const expire = this.configState.expireTime;
    const now = new Date();
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    if (expire < now.getTime()) {
      try {
        const result = await openapi.sendRequest(
          'GET',
          process.env.API_CONFIG_PATH,
          {},
          {},
          process.env.API_BASE_URL
        );
        // fetch(`${baseURL}/config`);
        // const result = await config.json();
        const config = result.config;

        this.configState.result = config;
        this.configState.expireTime = exp;
        await storage.set('freeGas', config.features.free_gas);
        await storage.set('alchemyAPI', config.features.alchemy_api);
        // console.log('remoteConfig ->', result, result.features.free_gas)
        return config;
      } catch (err) {
        console.error(err);
        await storage.set('freeGas', defaultConfig.features.free_gas);
        return defaultConfig;
      }
    } else {
      return this.configState.result;
    }
  }
}

export default new fetchRemoteConfig();
