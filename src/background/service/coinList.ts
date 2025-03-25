import { type CoinItem } from '@/shared/types/coin-types';
import { createPersistStore } from 'background/utils';
import { storage } from 'background/webapi';

interface CoinListStore {
  expiry: number;
  coinItem: Record<string, any>;
  evm: Record<string, any>;
  currentCoin: string;
}

const now = new Date();

const COINLIST_TEMPLATE: CoinListStore = {
  expiry: now.getTime(),
  coinItem: {
    testnet: [],
    crescendo: [],
    mainnet: [],
  },
  evm: {
    testnet: [],
    crescendo: [],
    mainnet: [],
  },
  currentCoin: 'flow',
};
class CoinList {
  store!: CoinListStore;

  init = async () => {
    console.log('init coinList');
    this.store = await createPersistStore<CoinListStore>({
      name: 'coinList',
      template: COINLIST_TEMPLATE,
    });
  };

  clear = async () => {
    console.log('clear coinList ----------------------');
    if (!this.store) {
      await this.init();
    } else {
      Object.assign(this.store, COINLIST_TEMPLATE);
    }
  };

  getCoinByUnit = (unit: string) => {
    return this.store.coinItem[unit];
  };

  getExpiry = () => {
    return this.store.expiry;
  };

  setExpiry = (expiry: number) => {
    this.store.expiry = expiry;
  };

  addCoin = (data: CoinItem, network: string, listType = 'coinItem') => {
    if (this.store[listType][network] === undefined) {
      this.store[listType][network] = [];
    }
    this.store[listType][network][data.unit] = data;
  };

  addCoins = (coins: CoinItem[], network: string, listType = 'coinItem') => {
    const newNetworkData = [...coins];

    const updatedListType = { ...this.store[listType] };
    updatedListType[network] = newNetworkData;

    this.store[listType] = updatedListType;

    storage.set('coinList', this.store);
  };

  removeCoin = (unit: string, network: string, listType = 'coinItem') => {
    delete this.store[listType][network][unit];
  };

  updateCoin = (network: string, data: CoinItem, listType = 'coinItem') => {
    this.store[listType][network][data.unit] = data;
  };

  setCurrentCoin = (coinName: string) => {
    this.store.currentCoin = coinName;
  };
  getCurrentCoin = () => {
    return this.store.currentCoin;
  };
  listCoins = (network: string, listType = 'coinItem'): CoinItem[] => {
    if (!this.store[listType] || !this.store[listType][network]) {
      return [];
    }

    if (Array.isArray(this.store[listType][network])) {
      return this.store[listType][network];
    }

    const list = Object.values(this.store[listType][network]);
    return list.filter((item): item is CoinItem => !!item) || [];
  };
}

export default new CoinList();
