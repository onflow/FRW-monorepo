/*
 * Keys and types to access data in the UI from the background storage cache
 * This is the primary way to get cached data from network calls to the frontend
 */

import {
  type CadenceTokenInfo,
  type CustomFungibleTokenInfo,
  type EvmTokenInfo,
  type ExtendedTokenInfo,
  type TokenFilter,
  type FeatureFlags,
  type AccountBalanceInfo,
  type NewsItem,
  type NftCollection,
  type NFTModelV2,
  type UserInfoResponse,
  type CollectionNfts,
  type NftCollectionAndIds,
  type NetworkScripts,
  type TransferItem,
  type Currency,
  type MainAccount,
  type PublicKeyAccount,
  type ChildAccountNftMap,
} from '@/shared/types';

import { getCachedData, triggerRefresh } from './cache-data-access';

// Utiltiy function to create the refresh key for a given key function
const refreshKey = (keyFunction: (...args: string[]) => string) =>
  ((args: string[] = ['(.+)', '(.+)', '(.+)', '(.+)']) =>
    new RegExp(`${keyFunction(...args)}-refresh`))();

/**
 * --------------------------------------------------------------------
 * Global keys
 * --------------------------------------------------------------------
 */
export const newsKey = () => `news`;
export const newsRefreshRegex = refreshKey(newsKey);
export type NewsStore = NewsItem[];

export const remoteConfigKey = () => `remote-config`;
export const remoteConfigRefreshRegex = refreshKey(remoteConfigKey);
export type RemoteConfig = {
  version: string;
  config: {
    features: FeatureFlags;
    payer: Record<
      'mainnet' | 'testnet' | 'previewnet' | 'sandboxnet' | 'crescendo',
      {
        address: string;
        keyId: number;
      }
    >;
    bridgeFeePayer?: Record<
      'mainnet' | 'testnet' | 'previewnet' | 'sandboxnet' | 'crescendo',
      {
        address: string;
        keyId: number;
      }
    >;
  };
};

export const walletLoadedKey = () => `wallet-loaded`;
export const walletLoadedRefreshRegex = refreshKey(walletLoadedKey);
export type WalletLoadedStore = boolean;
/*
 * --------------------------------------------------------------------
 * User level keys
 * --------------------------------------------------------------------
 */
export const userInfoCachekey = (userId: string) => `user-info-${userId}`;
export const userInfoRefreshRegex = refreshKey(userInfoCachekey);
export type UserInfoStore = UserInfoResponse;

// Note we could do this per user but it's not worth the complexity
export const cadenceScriptsKey = () => `cadence-scripts`;
export const cadenceScriptsRefreshRegex = refreshKey(cadenceScriptsKey);
export type CadenceScriptsStore = NetworkScripts;

export const getCachedScripts = async () => {
  return getCachedData<CadenceScriptsStore>(cadenceScriptsKey());
};

export const supportedCurrenciesKey = () => `supported-currencies`;
export const supportedCurrenciesRefreshRegex = refreshKey(supportedCurrenciesKey);
export type SupportedCurrenciesStore = Currency[];

export const getCachedSupportedCurrencies = async () => {
  return getCachedData<SupportedCurrenciesStore>(supportedCurrenciesKey());
};

export const registerStatusKey = (pubKey: string) => `register-status-${pubKey}`;

export const registerStatusRefreshRegex = refreshKey(registerStatusKey);
export type RegisterStatusStore = boolean;

export const userMetadataKey = (userId: string) => `user-metadata-${userId}`;
export const userMetadataRefreshRegex = refreshKey(userMetadataKey);
export type UserMetadataStore = Record<string, { background: string; icon: string; name: string }>;
/*
 * --------------------------------------------------------------------
 * Network level keys (keyed by network & user ID)
 * --------------------------------------------------------------------
 */
// Profile Accounts - the Main (Flow) accounts of a given user on a given network
// Keyed by network and publickey
export const mainAccountsKey = (network: string, pubkey: string) =>
  `main-accounts-${network}-${pubkey}`;

export const mainAccountsRefreshRegex = refreshKey(mainAccountsKey);

// Keyed by network and userId
export const mainAccountsKeyUid = (network: string, userId: string) =>
  `main-accounts-uid-${network}-${userId}`;

export const mainAccountsUidRefreshRegex = refreshKey(mainAccountsKeyUid);

export type MainAccountStore = MainAccount[];

export const getCachedMainAccounts = async (network: string, pubkey: string) => {
  return getCachedData<MainAccountStore>(mainAccountsKey(network, pubkey));
};

export const getCachedMainAccountsUid = async (network: string, userId: string) => {
  return getCachedData<MainAccountStore>(mainAccountsKeyUid(network, userId));
};

// Pending Accounts
export const placeholderAccountsKey = (network: string, userId: string): string => {
  return `placeholder-accounts-${network}-${userId}`;
};
export const placeholderAccountsRefreshRegex = refreshKey(placeholderAccountsKey);
export type PlaceholderAccountsStore = PublicKeyAccount[];

// Pending Account Creation Transactions
export const pendingAccountCreationTransactionsKey = (network: string, userId: string) =>
  `pending-account-creation-transactions-${network}-${userId}`;
export const pendingAccountCreationTransactionsRefreshRegex = refreshKey(
  pendingAccountCreationTransactionsKey
);
export type PendingAccountCreationTransactionsStore = string[];

/*
 * --------------------------------------------------------------------
 * Account level keys (keyed by network & MAIN FLOW account address)
 * --------------------------------------------------------------------
 */

export const accountBalanceKey = (network: string, address: string) =>
  `account-balance-${network}-${address}`;
export const accountBalanceRefreshRegex = refreshKey(accountBalanceKey);

export const mainAccountStorageBalanceKey = (network: string, address: string) =>
  `account-storage-balance-${network}-${address}`;
export type MainAccountStorageBalanceStore = AccountBalanceInfo;

export const mainAccountStorageBalanceRefreshRegex = refreshKey(mainAccountStorageBalanceKey);

// Transfer list
export const transferListKey = (
  network: string,
  address: string,
  offset: string = '0',
  limit: string = '15'
) => `transfer-list-${network}-${address}-${offset}-${limit}`;

export const transferListRefreshRegex = refreshKey(transferListKey);
export type TransferListStore = {
  count: number;
  pendingCount: number;
  list: TransferItem[];
};

/**
 * --------------------------------------------------------------------
 * NFTs
 * --------------------------------------------------------------------
 */
export const nftListKey = (network: string, chainType: string) =>
  `nft-list-${network}-${chainType}`;
export const nftListRefreshRegex = refreshKey(nftListKey);
export type NftListStore = NFTModelV2[];

// 1. List of all NFT collections on a network
export const fullCadenceNftCollectionListKey = (network: string) =>
  `full-cadence-nft-collection-list-${network}`;
export const fullCadenceNftCollectionListRefreshRegex = refreshKey(fullCadenceNftCollectionListKey);
export const getCachedFullCadenceNftCollectionList = async (network: string) => {
  return getCachedData<NftCollection[]>(fullCadenceNftCollectionListKey(network));
};

// 2. List of NFT collections and the ids of the nfts owned in each collection
export const cadenceNftCollectionsAndIdsKey = (network: string, address: string) =>
  `cadence-nft-collections-and-ids-${network}-${address}`;

export const cadenceNftCollectionsAndIdsRefreshRegex = refreshKey(cadenceNftCollectionsAndIdsKey);
export const getCachedCadenceNftCollectionsAndIds = async (network: string, address: string) => {
  return getCachedData<NftCollectionAndIds[]>(cadenceNftCollectionsAndIdsKey(network, address));
};
export const refreshNftCatalogCollections = async (network: string, address: string) => {
  // Should rarely be used
  triggerRefresh(cadenceNftCollectionsAndIdsKey(network, address));
};

// 3. List of NFTs from a specific collection under a Cadence address
export const cadenceCollectionNftsKey = (
  network: string,
  address: string,
  collectionId: string,
  offset: string
) => `cadence-collection-nfts-${network}-${address}-${collectionId}-${offset}`;
export const cadenceCollectionNftsRefreshRegex = refreshKey(cadenceCollectionNftsKey);
export const getCachedCadenceCollectionNfts = async (
  network: string,
  address: string,
  collectionId: string,
  offset: number
) => {
  return getCachedData<CollectionNfts>(
    cadenceCollectionNftsKey(network, address, collectionId, `${offset}`)
  );
};

/**
 * EVM NFTs
 */

// 1. List of NFT collections and the ids of the nfts owned in each collection
export const evmNftCollectionsAndIdsKey = (network: string, address: string) =>
  `evm-nft-collections-and-ids-${network}-${address}`;
export const evmNftCollectionsAndIdsRefreshRegex = refreshKey(evmNftCollectionsAndIdsKey);
export const getCachedEvmNftCollectionsAndIds = async (network: string, address: string) => {
  return getCachedData<NftCollectionAndIds[]>(evmNftCollectionsAndIdsKey(network, address));
};

// 2. List of NFTs from a specific collection under a EVM address
export const evmCollectionNftsKey = (
  network: string,
  address: string,
  collectionIdentifier: string,
  offset: string
) => `evm-collection-nfts-${network}-${address}-${collectionIdentifier}-${offset}`;

export const evmCollectionNftsRefreshRegex = refreshKey(evmCollectionNftsKey);
export const getCachedEvmCollectionNfts = async (
  network: string,
  address: string,
  collectionIdentifier: string,
  offset: string
) => {
  return getCachedData<CollectionNfts>(
    evmCollectionNftsKey(network, address, collectionIdentifier, offset)
  );
};

// Child Account NFTs
export const childAccountAllowTypesKey = (network: string, parent: string, child: string) =>
  `child-account-allow-types-${network}-${parent}-${child}`;

export const childAccountAllowTypesRefreshRegex = refreshKey(childAccountAllowTypesKey);

export const getCachedChildAccountAllowTypes = async (
  network: string,
  parent: string,
  child: string
) => {
  return getCachedData<string[]>(childAccountAllowTypesKey(network, parent, child));
};

export const childAccountNftsKey = (network: string, parentAddress: string) =>
  `child-account-nfts-${network}-${parentAddress}`;

export const childAccountNFTsRefreshRegex = refreshKey(childAccountNftsKey);

export const getCachedChildAccountNfts = async (network: string, parentAddress: string) => {
  return getCachedData<ChildAccountNftMap>(childAccountNftsKey(network, parentAddress));
};

/**
 * *************
 * Fungible Token information
 * *************
 */

export const tokenListKey = (network: string, chainType: string) =>
  `token-list-${network}-${chainType}`;
export const tokenListRefreshRegex = refreshKey(tokenListKey);
export type TokenListStore = CustomFungibleTokenInfo[];

// Coinlist can be used for both EVM and Cadence tokens - this is the primary way to get token information
export const coinListKey = (network: string, address: string, currency: string = 'usd') =>
  `coin-list-${network}-${address}-${currency}`;

export const coinListRefreshRegex = refreshKey(coinListKey);
export type CoinListStore = ExtendedTokenInfo[];

export const getCachedCoinList = async (network: string, address: string, currency = 'usd') => {
  return getCachedData<ExtendedTokenInfo[]>(coinListKey(network, address, currency));
};

export const tokenFilterKey = (network: string, address: string) =>
  `token-filter-${network}-${address}`;

export type TokenFilterStore = TokenFilter[];

export const getCachedTokenFilter = async (network: string, address: string) => {
  return getCachedData<TokenFilterStore>(tokenFilterKey(network, address));
};

// This is used internally to cache EVM token information
// Potentially could be used in the future to replace ExtendedTokenInfo
export const evmTokenInfoKey = (network: string, address: string, currency: string = 'usd') =>
  `evm-token-info-${network}-${address}-${currency}`;

export const evmTokenInfoRefreshRegex = refreshKey(evmTokenInfoKey);
export type EvmTokenInfoStore = EvmTokenInfo[];

// This is used internally to cache Cadence token information
// Potentially could be used in the future to replace ExtendedTokenInfo
export const cadenceTokenInfoKey = (network: string, address: string, currency: string = 'usd') =>
  `cadence-token-info-${network}-${address}-${currency}`;

export const cadenceTokenInfoRefreshRegex = refreshKey(cadenceTokenInfoKey);
export type CadenceTokenInfoStore = CadenceTokenInfo[];

export const childAccountFtKey = (network: string, parentAddress: string, childAccount: string) =>
  `child-account-ft-${network}-${parentAddress}-${childAccount}`;

export const childAccountFtRefreshRegex = refreshKey(childAccountFtKey);
export type ChildAccountFtStore = { id: string; balance: string }[];

export const getCachedChildAccountFt = async (
  network: string,
  parentAddress: string,
  childAccount: string
) => {
  return getCachedData<ChildAccountFtStore>(
    childAccountFtKey(network, parentAddress, childAccount)
  );
};

export const childAccountDescKey = (address: string) => `childaccount-desc-${address}`;
