import { LRUCache } from 'lru-cache';

import { INTERNAL_REQUEST_ORIGIN } from '@onflow/flow-wallet-shared/constant/domain-constants';
import { MAINNET_CHAIN_ID } from '@onflow/flow-wallet-shared/types/network-types';

import createPersistStore from '../utils/persistStore';

export interface ConnectedSite {
  origin: string;
  icon: string;
  name: string;
  chain?: number;
  e?: number;
  isSigned: boolean;
  isTop: boolean;
  isConnected?: boolean;
  order?: number;
}

export type PermissionStore = {
  dumpCache: [string, LRUCache.Entry<ConnectedSite>][];
};

class PermissionService {
  store: PermissionStore = {
    dumpCache: [],
  };
  lruCache: LRUCache<string, ConnectedSite> | undefined;

  init = async () => {
    this.store = await createPersistStore<PermissionStore>({
      name: 'permission',
      template: {
        dumpCache: [],
      },
    });

    // Creating LRU cache with a reasonable size limit
    this.lruCache = new LRUCache<string, ConnectedSite>({
      max: 1000, // Maximum number of items to store
      ttl: 1000 * 60 * 60 * 24 * 30, // 30 days TTL
    });
    if (this.store.dumpCache && this.store.dumpCache.length > 0) {
      this.lruCache.load(this.store.dumpCache);
    }
  };

  sync = () => {
    if (!this.lruCache) return;
    this.store.dumpCache = this.lruCache.dump();
  };

  getWithoutUpdate = (key: string) => {
    if (!this.lruCache) return;

    return this.lruCache.peek(key);
  };

  addConnectedSite = (
    origin: string,
    name: string,
    icon: string,
    defaultChain = MAINNET_CHAIN_ID,
    isSigned = false
  ) => {
    if (!this.lruCache) return;
    this.lruCache.set(origin, {
      origin,
      name,
      icon,
      chain: defaultChain,
      isSigned,
      isTop: false,
    });
    this.sync();
  };

  touchConnectedSite = (origin: string) => {
    if (!this.lruCache) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return;
    this.lruCache.get(origin);
    this.sync();
  };

  updateConnectSite = (origin: string, value: Partial<ConnectedSite>, partialUpdate?: boolean) => {
    if (!this.lruCache || !this.lruCache.has(origin)) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return;

    if (partialUpdate) {
      const _value = this.lruCache.get(origin);
      this.lruCache.set(origin, { ..._value, ...value } as ConnectedSite);
    } else {
      this.lruCache.set(origin, value as ConnectedSite);
    }

    this.sync();
  };

  hasPermission = (origin: string) => {
    if (!this.lruCache) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return true;

    return this.lruCache.has(origin);
  };

  setRecentConnectedSites = (sites: ConnectedSite[]) => {
    if (!this.lruCache) return;
    const entries: [string, LRUCache.Entry<ConnectedSite>][] = sites.map((item) => [
      item.origin,
      {
        value: item,
        ttl: 1000 * 60 * 60 * 24 * 30, // 30 days
        size: 1,
      },
    ]);
    this.lruCache.load(entries);
    this.sync();
  };

  getRecentConnectedSites = () => {
    const sites = this.lruCache ? Array.from(this.lruCache.values()) : [];
    const pinnedSites = sites
      .filter((item) => item?.isTop)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const recentSites = sites.filter((item) => !item.isTop);
    return [...pinnedSites, ...recentSites];
  };

  getConnectedSites = () => {
    return this.lruCache ? Array.from(this.lruCache.values()) : [];
  };

  getConnectedSite = (key: string) => {
    return this.lruCache?.get(key);
  };

  topConnectedSite = (origin: string, order?: number) => {
    const site = this.getConnectedSite(origin);
    if (!site || !this.lruCache) return;
    const orders = this.getRecentConnectedSites()
      .map((item) => item.order)
      .filter((o): o is number => o !== undefined);
    const maxOrder = orders.length > 0 ? Math.max(...orders) : 0;
    order = order ?? maxOrder + 1;
    this.updateConnectSite(origin, {
      ...site,
      order,
      isTop: true,
    });
  };

  unpinConnectedSite = (origin: string) => {
    const site = this.getConnectedSite(origin);
    if (!site || !this.lruCache) return;
    this.updateConnectSite(origin, {
      ...site,
      isTop: false,
    });
  };

  removeConnectedSite = (origin: string) => {
    if (!this.lruCache) return;

    this.lruCache.delete(origin);
    this.sync();
  };

  // getSitesByDefaultChain = (chain: CHAINS_ENUM) => {
  //   if (!this.lruCache) return [];
  //   return this.lruCache.values().filter((item) => item.chain === chain);
  // };

  isInternalOrigin = (origin: string) => {
    return origin === INTERNAL_REQUEST_ORIGIN;
  };
}

export default new PermissionService();
