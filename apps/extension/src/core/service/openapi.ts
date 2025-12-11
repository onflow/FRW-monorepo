import * as fcl from '@onflow/fcl';
import type { Account as FclAccount } from '@onflow/fcl';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

import {
  cadenceScriptsKey,
  CURRENT_ID_KEY,
  type RemoteConfig,
  getValidData,
  getCachedData,
  setCachedData,
  getLocalData,
  setLocalData,
} from '@/data-model';
import {
  DEFAULT_CURRENCY,
  Period,
  type PeriodFrequency,
  PriceProvider,
} from '@/shared/constant';
import type {
  BalanceMap,
  CadenceTokenInfo,
  CustomFungibleTokenInfo,
  EvmTokenInfo,
  FungibleTokenInfo,
  FungibleTokenListResponse,
  TokenInfo,
  AccountBalanceInfo,
  AccountKeyRequest,
  CheckResponse,
  Contact,
  DeviceInfoRequest,
  KeyResponseItem,
  NewsConditionType,
  NewsItem,
  NftCollection,
  NFTModelV2,
  SignInResponse,
  StorageInfo,
  TokenPriceHistory,
  UserInfoResponse,
  NftCollectionAndIds,
  NetworkScripts,
  ActiveAccountType,
  Currency,
  FlowAddress,
  LoggedInAccount,
  LoggedInAccountWithIndex,
  PublicKeyAccount,
  CollectionNfts,
  Nft,
} from '@/shared/types';
import {
  isValidFlowAddress,
  getStringFromHashAlgo,
  getStringFromSignAlgo,
  consoleError,
  consoleLog,
  getPeriodFrequency,
  getPriceProvider,
  consoleInfo,
} from '@/shared/utils';

import { findKeyAndInfo } from '../utils';
import {
  googleSafeHostService,
  analyticsService,
  userWalletService,
  authenticationService,
  versionService,
} from './index';
import { returnCurrentProfileId } from '../utils/current-id';
import {
  verifySignature,
} from '../utils/modules/publicPrivateKey';

type CurrencyResponse = {
  data: {
    currencies: Currency[];
  };
};

type StorageResponse = {
  storageUsedInMB: string;
  storageAvailableInMB: string;
  storageCapacityInMB: string;
  lockedFLOWforStorage: string;
  availableBalanceToUse: string;
};

type CadenceTokensApiResponseV4 = {
  data: { result: CadenceTokenInfo[]; storage: StorageResponse };
};

type EvmTokensApiResponseV4 = {
  data: EvmTokenInfo[];
};
// New type definitions for API response for /v1/account/transaction

type TransactionResponseItem = {
  additional_message: string;
  status: string;
  error: boolean;
  token: string;
  title: string;
  time: string;
  receiver: string;
  sender: string;
  amount: string;
  type: number;
  transfer_type: number;
  image: string;
  txid: string;
};
export type FlowTransactionResponse = {
  total: number;
  transactions: TransactionResponseItem[];
};

type EvmTransactionResponse = {
  trxs: TransactionResponseItem[];
  next_page_params?: {
    items_count: number;
    value: '0';
  };
};

export interface OpenApiConfigValue {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'get' | 'post' | 'put' | 'delete';
  params?: string[];
}

export interface OpenApiStore {
  registrationUrl: string;
  webNextUrl: string;
  functionsUrl: string;
  isDevServer: boolean;
  scriptsPublicKey: string;
  config: Record<string, OpenApiConfigValue>;
}

type NftCollectionResponse = {
  id: string;
  contract_name: string;
  contractName: string;
  address: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  path: {
    storage_path: string;
    public_path: string;
    public_type?: string;
  };
  evmAddress: string;
  evm_address: string;
  official_website: string;
  socials: Record<string, string>;
  flowIdentifier?: string;
  nftTypeId?: string;
};

export const responseToNftCollection = (item: NftCollectionResponse): NftCollection => {
  return {
    ...item,
    contractName: item.contractName || item.contract_name,
    officialWebsite: item.official_website,
    socials: item.socials,
    flowIdentifier: item.flowIdentifier || item.nftTypeId || '',
    path: item.path
      ? {
          storagePath: item.path.storage_path,
          publicPath: item.path.public_path,
          publicType: item.path.public_type,
        }
      : undefined,
  };
};

type NftCollectionAndIdsResponse = {
  collection: NftCollectionResponse;
  ids: string[];
  count: number;
};

export const responseToNftCollectionAndIds = (
  item: NftCollectionAndIdsResponse
): NftCollectionAndIds => {
  return {
    collection: responseToNftCollection(item.collection),
    ids: item.ids,
    count: item.count,
  };
};

type CollectionNftsResponse = {
  nfts: Nft[];
  collection: NftCollectionResponse;
  nftCount: number;
  offset?: string | null;
};

export const responseToCollectionNfts = (item: CollectionNftsResponse): CollectionNfts => {
  return {
    nfts: item.nfts,
    collection: responseToNftCollection(item.collection),
    nftCount: item.nftCount,
    offset: item.offset,
  };
};

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// const remoteConfig = getRemoteConfig(app);

const dataConfig: Record<string, OpenApiConfigValue> = {
  check_username: {
    path: '/v1/user/check',
    method: 'get',
    params: ['username'],
  },
  search_user: {
    path: '/v1/user/search',
    method: 'get',
    params: ['keyword'],
  },
  register: {
    path: '/v1/register',
    method: 'post',
    params: ['username', 'account_key'],
  },
  create_flow_address: {
    path: '/v1/user/address',
    method: 'post',
    params: [],
  },
  create_flow_address_v2: {
    path: '/v2/user/address',
    method: 'post',
    params: [],
  },
  loginv3: {
    path: '/v3/login',
    method: 'post',
    params: ['signature', 'account_key', 'device_info'],
  },
  importKey: {
    path: '/v3/import',
    method: 'post',
    params: ['username', 'account_key', 'device_info', 'backup_info', 'address'],
  },
  coin_map: {
    path: '/v1/coin/map',
    method: 'get',
    params: [],
  },
  user_info: {
    path: '/v1/user/info',
    method: 'get',
    params: [],
  },
  fetch_address_book: {
    path: '/v1/addressbook/contact',
    method: 'get',
    params: [],
  },
  add_address_book: {
    path: '/v1/addressbook/contact',
    method: 'put',
    params: ['contact_name', 'username', 'address', 'domain', 'domain_type'],
  },
  edit_address_book: {
    path: '/v1/addressbook/contact',
    method: 'post',
    params: ['id', 'contact_name', 'address', 'domain', 'domain_type'],
  },
  delete_address_book: {
    path: '/v1/addressbook/contact',
    method: 'delete',
    params: ['id'],
  },
  add_external_address_book: {
    path: '/v1/addressbook/external',
    method: 'put',
    params: ['contact_name', 'address', 'domain', 'domain_type'],
  },
  account_transaction: {
    path: '/v1/account/transaction',
    method: 'get',
    params: ['address', 'limit', 'offset'],
  },
  validate_recaptcha: {
    path: '/v1/user/recaptcha',
    method: 'get',
    params: ['token'],
  },
  crypto_map: {
    path: '/v1/crypto/map',
    method: 'get',
    params: ['provider', 'pair'],
  },
  crypto_flow: {
    path: '/v1/crypto/summary',
    method: 'get',
    params: ['provider', 'pair'],
  },
  crypto_history: {
    path: '/v1/crypto/history',
    method: 'get',
    params: ['provider', 'pair', 'after', 'history'],
  },
  account_query: {
    path: '/v1/account/query',
    method: 'post',
    params: ['query', 'operation_name'],
  },
  profile_preference: {
    path: '/v1/profile/preference',
    method: 'post',
    params: ['private'],
  },
  profile_update: {
    path: '/v1/profile',
    method: 'post',
    params: ['nickname', 'avatar'],
  },
  get_transfers: {
    path: '/api/v1/account/transfers',
    method: 'get',
    params: ['address', 'after', 'limit'],
  },
  manual_address: {
    path: '/v1/user/manualaddress',
    method: 'get',
    params: [],
  },
  device_list: {
    path: '/v1/user/device',
    method: 'get',
    params: [],
  },
  key_list: {
    path: '/v1/user/keys',
    method: 'get',
    params: [],
  },
  add_device: {
    path: '/v1/user/device',
    method: 'put',
    params: ['device_info', 'wallet_id', 'wallettest_id '],
  },
  add_device_v3: {
    path: '/v3/user/device',
    method: 'put',
    params: ['device_info', 'wallet_id', 'wallettest_id '],
  },
  get_location: {
    path: '/v1/user/location',
    method: 'get',
    params: [],
  },
  sync_device: {
    path: '/v3/sync',
    method: 'post',
    params: ['account_key', 'device_info '],
  },
  check_import: {
    path: '/v3/checkimport',
    method: 'get',
    params: ['key'],
  },
  get_version: {
    path: '/version',
    method: 'get',
    params: [],
  },
  get_ft_list: {
    path: '/api/v3/fts',
    method: 'get',
    params: ['network', 'chain_type'],
  },
  get_ft_list_full: {
    path: '/api/v3/fts/full',
    method: 'get',
    params: ['network', 'chain_type'],
  },
  get_nft_list: {
    path: '/api/v3/nfts',
    method: 'get',
    params: ['network', 'chain_type'],
  },
  create_manual_address_v2: {
    path: '/v2/user/manualaddress',
    method: 'post',
    params: ['account_key'],
  },
};

const _recordFetch = async (response, responseData, ...args: Parameters<typeof fetch>) => {
  try {
    // Extract URL parameters from the first argument if it's a URL with query params
    const url = args[0].toString();
    const urlObj = new URL(url);
    const urlParams = Object.fromEntries(urlObj.searchParams.entries());

    // Send message to UI with request/response details

    const messageData = {
      method: args[1]?.method,
      url: args[0],
      params: urlParams, // URL parameters extracted from the URL
      requestInit: args[1],
      responseData, // Raw response from fetch
      timestamp: Date.now(),
      status: response.status,
      statusText: response.statusText,
      // Note: functionParams and functionResponse will be added by the calling function
    };

    consoleInfo('fetchCallRecorder - response & messageData', response, messageData);
  } catch (err) {
    consoleError('Error sending message to UI:', err);
  }
  return response;
};

export class OpenApiService {
  store: OpenApiStore = {
    registrationUrl: '',
    functionsUrl: '',
    webNextUrl: '',
    scriptsPublicKey: '',
    isDevServer: false,
    config: dataConfig,
  };

  getNetwork = () => {
    return userWalletService.getNetwork();
  };

  init = async (
    registrationUrl: string,
    webNextUrl: string,
    functionsUrl: string,
    scriptsPublicKey: string,
    isDevServer: boolean
  ) => {
    this.store.registrationUrl = registrationUrl;
    this.store.webNextUrl = webNextUrl;
    this.store.functionsUrl = functionsUrl;
    this.store.scriptsPublicKey = scriptsPublicKey;
    this.store.isDevServer = isDevServer;
    // Set up fcl
    await userWalletService.setupFcl();
  };

  checkAuthStatus = async () => {
    await authenticationService.waitForAuthInit();
    const user = authenticationService.getAuth().currentUser;
    if (user && user.isAnonymous) {
      userWalletService.loginWithKeyring();
    }
  };

  sendRequest = async (
    method = 'GET',
    url = '',
    params: Record<string, string> = {},
    data: Record<string, unknown> = {},
    host = this.store.registrationUrl
  ): Promise<any> => {
    // Default options are marked with *
    let requestUrl = '';

    if (
      Object.keys(params).length &&
      (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE')
    ) {
      requestUrl = host + url + '?' + new URLSearchParams(params).toString();
    } else {
      requestUrl = host + url;
    }
    // If network is provided in params, use it, otherwise get the network from the userWalletService
    // TODO: TB July 2025: this creates a circular dependency. Network should be passed in as a parameter.
    // TODO: TB July 2025: APIs should be refactored to accept network as a parameter rather than a header
    const network =
      params.network ||
      (data.network && typeof data.network === 'string'
        ? data.network
        : await userWalletService.getNetwork());

    const user = authenticationService.getAuth().currentUser;
    const init: RequestInit = {
      method,
      headers: {
        Network: network,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (method.toUpperCase() !== 'GET') {
      init['body'] = JSON.stringify(data);
    }

    // Wait for firebase auth to complete
    await authenticationService.waitForAuthInit();

    if (user !== null) {
      const idToken = await user.getIdToken();
      init.headers = {
        ...init.headers,
        Authorization: 'Bearer ' + idToken,
      };
    } else {
      // If no user, then sign in as anonymous first
      await authenticationService.signInAnonymously();
      const anonymousUser = authenticationService.getAuth().currentUser;
      const idToken = await anonymousUser?.getIdToken();
      init.headers = {
        ...init.headers,
        Authorization: 'Bearer ' + idToken,
      };
    }

    const response = await fetch(requestUrl, init);
    const responseData = await response.json(); // parses JSON response into native JavaScript objects

    // Verify signature if present in headers
    try {
      const xsignature = response?.headers?.get('X-Signature');
      if (xsignature) {
        const isValid = await verifySignature(
          xsignature,
          responseData,
          this.store.scriptsPublicKey
        );
        if (!isValid) {
          throw new Error('Invalid signature in response');
        }
      }
    } catch (err) {
      consoleError('Error verifying signature:', err);

      // throw invalid signature error to prevent processing bad responses
      if (err instanceof Error && err.message === 'Invalid signature in response') {
        throw err;
      }
    }

    return responseData;
    // Record the response
  };

  fetchRemoteConfig = async (): Promise<RemoteConfig> => {
    return await this.sendRequest(
      'GET',
      this.store.isDevServer ? '/config/config.dev.json' : '/config/config.json',
      {},
      {},
      this.store.webNextUrl
    );
  };

  /**
   * Return the USDC price pair for a given provider
   * @param provider - The provider to get the USDC price pair for
   * @returns The USDC price pair for the provider
   */
  private getUSDCPricePair = (provider: PriceProvider): string | null => {
    switch (provider) {
      case PriceProvider.binance:
        return 'usdcusdt';
      case PriceProvider.kakren:
        return 'usdcusd';
      case PriceProvider.huobi:
        return 'usdcusdt';
      default:
        return null;
    }
  };

  /**
   * Return the price pair for a given token and provider
   * @param token - The token to get the price pair for
   * @param provider - The provider to get the price pair for
   * @returns The price pair for the token and provider
   */
  getUSDCPrice = async (provider = PriceProvider.binance): Promise<CheckResponse> => {
    const config = this.store.config.crypto_map;
    const data = await this.sendRequest(config.method, config.path, {
      provider,
      pair: this.getUSDCPricePair(provider) || '',
    });
    return data.data.result;
  };

  /**
   * Return the price pair for a given provider
   * @param provider - The provider to get the price pair for
   * @returns The price pair for the provider
   */
  private getFlowPricePair = (provider: PriceProvider): string => {
    switch (provider) {
      case PriceProvider.binance:
        return 'flowusdt';
      case PriceProvider.kakren:
        return 'flowusd';
      case PriceProvider.huobi:
        return 'flowusdt';
      case PriceProvider.coinbase:
        return 'flowusd';
      case PriceProvider.kucoin:
        return 'flowusdt';
      default:
        return '';
    }
  };

  /**
   * Return the price by symbol
   * @param symbol - The symbol to get the price for
   * @param data - The data to get the price from
   * @returns The price for the symbol
   */
  getPricesBySymbol = async (symbol: string, data) => {
    const key = symbol.toUpperCase();
    return data[key];
  };

  /**
   * Return the price by address
   * @param symbol - The symbol to get the price for
   * @param data - The data to get the price from
   * @returns The price for the symbol
   */
  getPricesByAddress = async (symbol: string, data) => {
    const key = symbol.toLowerCase();
    return data[key];
  };

  /**
   * @deprecated This method is not used in the codebase.
   * Use getUserTokens instead. It will have token info and price.
   */
  getPricesByKey = async (symbol: string, data) => {
    const key = symbol.toLowerCase();
    return data[key];
  };

  /**
   * @deprecated This method is not used in the codebase.
   * Use getUserTokens instead. It will have token info and price.
   */
  getPricesByEvmaddress = async (address: string, data) => {
    const key = address.toLowerCase();
    return data[key];
  };

  getTokenPair = (token: string, provider: PriceProvider): string | null => {
    switch (token) {
      case 'usdc':
        return this.getUSDCPricePair(provider);
      case 'flow':
        return this.getFlowPricePair(provider);
      default:
        return null;
    }
  };

  /**
   * Get the price of a token
   * @param token - The token to get the price for
   * @param provider - The provider to get the price from
   * @returns The price of the token
   */
  getTokenPrice = async (
    token: string,
    provider = PriceProvider.binance
  ): Promise<{
    price: {
      change: {
        percentage: number;
      };
      last: number;
    };
  }> => {
    const config = this.store.config.crypto_flow;
    const pair = this.getTokenPair(token, provider);
    if (!pair) {
      throw new Error('no price provider found');
    }
    const data = await this.sendRequest(config.method, config.path, {
      provider,
      pair: pair,
    });
    return data.data.result;
  };

  /**
   * Get the price history of a token
   * @param token - The token to get the price history for
   * @param period - The period to get the price history for
   * @param provider - The provider to get the price history from
   * @returns The price history of the token
   */
  getTokenPriceHistory = async (
    token: string,
    period = Period.oneDay,
    provider = PriceProvider.binance
  ): Promise<TokenPriceHistory[]> => {
    const rawPriceHistory = await this.getTokenPriceHistoryArray(token, period, provider);
    const frequency = getPeriodFrequency(period);
    if (!rawPriceHistory[frequency]) {
      throw new Error('No price history found for this period');
    }

    return rawPriceHistory[frequency].map((item) => ({
      closeTime: item[0],
      openPrice: item[1],
      highPrice: item[2],
      lowPrice: item[3],
      price: item[4],
      volume: item[5],
      quoteVolume: item[6],
    }));
  };

  /**
   * Get the price history of a token
   * @param token - The token to get the price history for
   * @param period - The period to get the price history for
   * @param provider - The provider to get the price history from
   * @returns The price history of the token
   */
  getTokenPriceHistoryArray = async (
    token: string,
    period = Period.oneDay,
    provider = PriceProvider.binance
  ): Promise<
    Record<PeriodFrequency, [number, number, number, number, number, number, number, number][]>
  > => {
    let after = dayjs();
    const periods = getPeriodFrequency(period);

    const providers = getPriceProvider(token);
    if (providers.length === 0) {
      throw new Error('no price provider found');
    }

    switch (period) {
      case Period.oneDay:
        after = after.subtract(1, 'days');
        break;
      case Period.oneWeek:
        after = after.subtract(7, 'days');
        break;
      case Period.oneMonth:
        after = after.subtract(1, 'months');
        break;
      case Period.threeMonth:
        after = after.subtract(3, 'months');
        break;
      case Period.oneYear:
        after = after.subtract(1, 'years');
        break;
    }

    const config = this.store.config.crypto_history;
    const data = await this.sendRequest(config.method, config.path, {
      provider,
      pair: this.getTokenPair(token, provider) || '',
      after: period === Period.all ? '' : after.unix().toString(),
      periods: periods.toString(),
    });
    return data.data.result;
  };

  /**
   * Login with a custom token
   * @param userId - The user id to login with
   * @param token - The custom token to login with
   */
  private _loginWithToken = async (userId: string, token: string) => {
    // we shouldn't need to clear storage here anymore
    await authenticationService.signInWithCustomToken(token);
    await setLocalData(CURRENT_ID_KEY, userId);
  };

  /**
   * --------------------------------------------------------------------
   * Loaders
   * --------------------------------------------------------------------
   */
  /**
   * Load the cadence scripts for the current user
   * @param userId - The user id to load the cadence scripts for
   * @returns The cadence scripts for the current user
   */
  private _cadenceScriptsPromise: Promise<NetworkScripts> | null = null;

  private _loadCadenceScripts = async (): Promise<NetworkScripts> => {
    // Try to get from cache first
    const cadenceScripts = await getValidData<NetworkScripts>(cadenceScriptsKey());
    if (cadenceScripts) {
      return cadenceScripts;
    }

    // If there's already a request in progress, return that promise instead of making a new request
    if (this._cadenceScriptsPromise) {
      return this._cadenceScriptsPromise;
    }

    // Create a new promise
    const promise = this.cadenceScriptsV2().then((result) => {
      // Store in cache on success
      setCachedData(cadenceScriptsKey(), result, 1000 * 60 * 60); // 1 hour
      return result;
    });

    this._cadenceScriptsPromise = promise;

    promise.finally(() => {
      if (this._cadenceScriptsPromise === promise) {
        this._cadenceScriptsPromise = null;
      }
    });

    return promise;
  };

  getCadenceScripts = async (): Promise<NetworkScripts> => {
    return await this._loadCadenceScripts();
  };
  checkUsername = async (username: string) => {
    const config = this.store.config.check_username;
    const data = await this.sendRequest(config.method, config.path, {
      username,
    });
    return data;
  };

  register = async (account_key: AccountKeyRequest, username: string) => {
    // Track the time until account_created is called
    analyticsService.time('account_created');

    const config = this.store.config.register;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        account_key,
        username,
      }
    );

    if (!data) {
      throw new Error('Invalid response from registration API');
    }

    // Check if the response has the expected structure
    const responseData = data.data || data;

    if (!responseData.id || !responseData.custom_token) {
      console.error('Missing required fields in registration response:', {
        id: responseData.id,
        custom_token: responseData.custom_token,
        fullResponse: data,
      });
      throw new Error('Registration response missing required fields (id or custom_token)');
    }

    await this._loginWithToken(responseData.id, responseData.custom_token);

    // Track the registration
    analyticsService.track('account_created', {
      public_key: account_key.public_key,
      sign_algo: getStringFromSignAlgo(account_key.sign_algo),
      hash_algo: getStringFromHashAlgo(account_key.hash_algo),
    });
    return data;
  };

  loginV3 = async (
    account_key: AccountKeyRequest,
    device_info: DeviceInfoRequest,
    signature: string,
    replaceUser = true
  ): Promise<SignInResponse> => {
    const config = this.store.config.loginv3;
    const result = await this.sendRequest(
      config.method,
      config.path,
      {},
      { account_key, device_info, signature }
    );
    if (!result.data) {
      const currentId = await returnCurrentProfileId();
      throw new Error(`NoUserFound currentId: ${currentId} public_key: ${account_key.public_key} `);
    }
    if (replaceUser) {
      await this._loginWithToken(result.data.id, result.data.custom_token);
    }
    return result;
  };

  proxytoken = async () => {
    // Wait for firebase auth to complete
    await authenticationService.waitForAuthInit();
    await authenticationService.signInAnonymously();
    const anonymousUser = authenticationService.getAuth().currentUser;
    const idToken = await anonymousUser?.getIdToken();
    return idToken;
  };

  importKey = async (
    account_key: AccountKeyRequest,
    device_info: DeviceInfoRequest,
    username: string,
    backup_info: any,
    address: string,
    replaceUser = true
  ): Promise<SignInResponse> => {
    const config = this.store.config.importKey;
    const result = await this.sendRequest(
      config.method,
      config.path,
      {},
      { username, address, account_key, device_info, backup_info }
    );
    if (!result.data) {
      throw new Error('NoUserFound');
    }
    if (replaceUser) {
      await this._loginWithToken(result.data.id, result.data.custom_token);
    }
    return result;
  };

  coinMap = async () => {
    const config = this.store.config.coin_map;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  userInfo = async (): Promise<UserInfoResponse> => {
    const config = this.store.config.user_info;
    const { data } = await this.sendRequest(config.method, config.path);
    return data;
  };

  createFlowAddress = async () => {
    const config = this.store.config.create_flow_address;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  createFlowAddressV2 = async () => {
    const config = this.store.config.create_flow_address_v2;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  getMoonpayURL = async (url) => {
    const baseURL = this.store.functionsUrl;
    const response = await this.sendRequest('POST', '/moonPaySignature', {}, { url: url }, baseURL);
    return response;
  };

  signAsFeePayer = async (transaction, message: string) => {
    const messages = {
      envelopeMessage: message,
    };
    // 'http://localhost:5001/lilico-dev/us-central1'
    const data = await this.sendRequest(
      'POST',
      '/api/signAsFeePayer',
      {},
      { transaction, message: messages },
      this.store.webNextUrl
    );
    // (config.method, config.path, {}, { transaction, message: messages });
    return data;
  };

  signAsBridgePayer = async (transaction, message: string) => {
    const messages = {
      payload: message,
    };
    const data = await this.sendRequest(
      'POST',
      '/api/signAsBridgePayer',
      {},
      { transaction, message: messages },
      this.store.webNextUrl
    );
    // (config.method, config.path, {}, { transaction, message: messages });
    return data;
  };

  getPayerStatus = async () => {
    const data = await this.sendRequest(
      'GET',
      '/api/v1/payer/status',
      {},
      {},
      this.store.webNextUrl
    );
    return data;
  };

  getProposer = async () => {
    const baseURL = this.store.functionsUrl;
    // 'http://localhost:5001/lilico-dev/us-central1'
    const data = await this.sendRequest('GET', '/getProposer', {}, {}, baseURL);
    // (config.method, config.path, {}, { transaction, message: messages });
    return data;
  };

  getAddressBook = async (): Promise<{ data: { contacts: Contact[] } }> => {
    const config = this.store.config.fetch_address_book;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  addAddressBook = async (
    contact_name: string,
    address: string,
    username = '',
    domain = '',
    domain_type = 0
  ) => {
    const config = this.store.config.add_address_book;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        contact_name,
        address,
        username,
        domain,
        domain_type,
      }
    );
    return data;
  };

  editAddressBook = async (
    id: number,
    contact_name: string,
    address: string,
    domain = '',
    domain_type = 0
  ) => {
    const config = this.store.config.edit_address_book;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        id,
        contact_name,
        address,
        domain,
        domain_type,
      }
    );
    return data;
  };

  deleteAddressBook = async (id: number) => {
    const config = this.store.config.delete_address_book;
    const data = await this.sendRequest(config.method, config.path, { id: id.toString() });
    return data;
  };

  addExternalAddressBook = async (
    contact_name: string,
    address: string,
    domain = '',
    domain_type = 0
  ) => {
    const config = this.store.config.add_external_address_book;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        contact_name,
        address,
        domain,
        domain_type,
      }
    );
    return data;
  };

  getFlowAccount = async (address: string) => {
    try {
      const account = await fcl.account(address);
      return account;
    } catch (error) {
      return null;
    }
  };

  /**
   * @deprecated script is not found
   */
  checkChildAccount = async (address: string) => {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'checkChildAccount'
    );
    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return result;
  };
  /**
   * @deprecated script is not found
   */
  queryAccessible = async (address: string, childAccount: string) => {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'checkChildAccount'
    );

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address), arg(childAccount, t.Address)],
    });
    return result;
  };

  queryAccessibleFt = async (network: string, address: string, childAccount: string) => {
    const script = await getScripts(network, 'hybridCustody', 'getAccessibleCoinInfo');

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address), arg(childAccount, t.Address)],
    });
    return result;
  };

  checkChildAccountMeta = async (address: string) => {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'getChildAccountMeta'
    );
    try {
      const res = await fcl.query({
        cadence: script,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return res;
    } catch (err) {
      return null;
    }
  };

  getFlownsAddress = async (domain: string, root = 'fn') => {
    const script = await getScripts(userWalletService.getNetwork(), 'basic', 'getFlownsAddress');

    const address = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(domain, t.String), arg(root, t.String)],
    });
    return address;
  };

  getAccountMinFlow = async (address: string) => {
    const script = await getScripts(userWalletService.getNetwork(), 'basic', 'getAccountMinFlow');
    if (isValidFlowAddress(address)) {
      const minFlow = await fcl.query({
        cadence: script,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return minFlow;
    }
  };

  getFindAddress = async (domain: string) => {
    const script = await getScripts(userWalletService.getNetwork(), 'basic', 'getFindAddress');

    const address = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(domain, t.String)],
    });
    return address;
  };

  getFindDomainByAddress = async (domain: string) => {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'basic',
      'getFindDomainByAddress'
    );

    const address = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(domain, t.Address)],
    });
    return address;
  };

  getTransfers = async (
    address: string,
    offset: number,
    limit: number
  ): Promise<FlowTransactionResponse> => {
    const config = this.store.config.get_transfers;
    const { data } = await this.sendRequest(
      config.method,
      config.path,
      {
        address,
        after: offset.toString(),
        limit: limit.toString(),
      },
      {},
      this.store.webNextUrl
    );

    return data;
  };

  getEVMTransfers = async (
    address: string,
    offset: number,
    limit: number
  ): Promise<EvmTransactionResponse> => {
    const data = await this.sendRequest(
      'GET',
      `/api/evm/${address}/transactions`,
      {},
      {},
      this.store.webNextUrl
    );
    return data;
  };

  getManualAddress = async () => {
    const config = this.store.config.manual_address;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  createNewAccount = async (
    network: string,
    hash_algo: number,
    sign_algo: number,
    public_key: string,
    weight: number
  ) => {
    const transformedKey = {
      hashAlgorithm: hash_algo,
      publicKey: public_key,
      signatureAlgorithm: sign_algo,
      weight: weight,
    };
    const config = this.store.config.create_manual_address_v2;
    const data = await this.sendRequest(config.method, config.path, { network }, transformedKey);

    return data;
  };

  deviceList = async () => {
    const config = this.store.config.device_list;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  keyList = async (): Promise<{
    data: {
      result: KeyResponseItem[];
    };
  }> => {
    const config = this.store.config.key_list;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  getLocation = async () => {
    const config = this.store.config.get_location;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  addDevice = async (params) => {
    const config = this.store.config.add_device_v3;
    const data = await this.sendRequest(config.method, config.path, {}, params);

    return data;
  };

  synceDevice = async (params) => {
    const config = this.store.config.sync_device;
    const data = await this.sendRequest(config.method, config.path, {}, params);

    return data;
  };

  getInstallationId = async () => {
    return authenticationService.getInstallationId();
  };

  searchUser = async (
    keyword: string
  ): Promise<{
    data: { users: { address: string; username: string; avatar: string; nickname: string }[] };
  }> => {
    const config = this.store.config.search_user;
    const data = await this.sendRequest(config.method, config.path, {
      keyword,
    });

    return data?.data?.users ? data : { data: { users: [] } };
  };

  checkImport = async (key: string) => {
    const config = this.store.config.check_import;
    const data = await this.sendRequest(config.method, config.path, {
      key,
    });

    return data;
  };

  getStorageInfo = async (address: string): Promise<StorageInfo> => {
    const script = await getScripts(userWalletService.getNetwork(), 'basic', 'getStorageInfo');

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return {
      available: result['available'],
      used: result['used'],
      capacity: result['capacity'],
    };
  };

  getFlowAccountInfo = async (network: string, address: string): Promise<AccountBalanceInfo> => {
    const script = await getScripts(network, 'basic', 'getAccountInfo');

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return {
      address: result['address'],
      balance: result['balance'],
      availableBalance: result['availableBalance'],
      storageUsed: result['storageUsed'],
      storageCapacity: result['storageCapacity'],
    };
  };
  getTokenBalanceWithModel = async (address: string, token: CustomFungibleTokenInfo) => {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'basic',
      'getTokenBalanceWithModel'
    );
    if (!token.contractName || !token.path || !token.address) {
      throw new Error('Invalid token');
    }
    const network = await userWalletService.getNetwork();
    const cadence = script
      .replaceAll('<Token>', token.contractName)
      .replaceAll('<TokenBalancePath>', token.path.balance)
      .replaceAll('<TokenAddress>', token.address);
    const balance = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return balance;
  };

  fetchFTList = async (network: string, chainType: string): Promise<TokenInfo[]> => {
    const config = this.store.config.get_ft_list;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {
        network,
        chain_type: chainType,
      },
      {},
      this.store.webNextUrl
    );
    return data.tokens;
  };

  fetchFTListFull = async (network: string, chainType: string): Promise<FungibleTokenInfo[]> => {
    const config = this.store.config.get_ft_list_full;
    const data: FungibleTokenListResponse = await this.sendRequest(
      config.method,
      config.path,
      {
        network,
        chain_type: chainType,
      },
      {},
      this.store.webNextUrl
    );

    return data.tokens;
  };

  // todo
  isTokenStorageEnabled = async (address: string, token: CustomFungibleTokenInfo) => {
    const network = await userWalletService.getNetwork();
    const script = await getScripts(
      userWalletService.getNetwork(),
      'basic',
      'isTokenStorageEnabled'
    );
    if (!token.contractName || !token.path || !token.address) {
      throw new Error('Invalid token');
    }
    const cadence = script
      .replaceAll('<Token>', token.contractName)
      .replaceAll('<TokenBalancePath>', token.path.balance)
      .replaceAll('<TokenReceiverPath>', token.path.receiver)
      .replaceAll('<TokenAddress>', token.address);

    const isEnabled = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return isEnabled;
  };

  isTokenListEnabled = async (address: string) => {
    const script = await getScripts(userWalletService.getNetwork(), 'ft', 'isTokenListEnabled');
    const isEnabledList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return isEnabledList;
  };

  isLinkedAccountTokenListEnabled = async (address: string) => {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'ft',
      'isLinkedAccountTokenListEnabled'
    );
    const isEnabledList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return isEnabledList;
  };

  getTokenListBalance = async (address: string, allTokens: TokenInfo[]): Promise<BalanceMap> => {
    const script = await getScripts(userWalletService.getNetwork(), 'ft', 'getTokenListBalance');
    const balanceList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return balanceList;
  };

  getTokenBalanceStorage = async (address: string): Promise<BalanceMap> => {
    const script = await getScripts(userWalletService.getNetwork(), 'ft', 'getTokenBalanceStorage');
    const balanceList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return balanceList;
  };

  getBlockList = async (hosts: string[] = [], forceCheck = false): Promise<string[]> => {
    return await googleSafeHostService.getBlockList(hosts, forceCheck);
  };

  getEnabledNFTList = async (): Promise<{ address: string; contractName: string }[]> => {
    const address = await userWalletService.getCurrentAddress();
    if (!address) return [];

    const getNftBalanceStorage = await this.getNftBalanceStorage(address);

    const resultArray = Object.entries(getNftBalanceStorage).map(([key]) => {
      // ignore the prefix
      const [, address, contractName] = key.split('.');
      return {
        address: `0x${address}`,
        contractName: contractName,
      };
    });

    return resultArray;
  };

  checkNFTListEnabled = async (address: string): Promise<Record<string, boolean>> => {
    // Returns a map of enabled NFTs for the address
    const script = await getScripts(userWalletService.getNetwork(), 'nft', 'checkNFTListEnabled');

    const isEnabledList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return isEnabledList;
  };

  getNftBalanceStorage = async (address: string): Promise<Record<string, number>> => {
    // Returns a map of enabled NFTs for the address
    const script = await getScripts(
      userWalletService.getNetwork(),
      'collection',
      'getNFTBalanceStorage'
    );

    const isEnabledList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return isEnabledList;
  };

  getTransactionTemplate = async (cadence: string, network: string) => {
    const base64 = Buffer.from(cadence, 'utf8').toString('base64');

    const data = {
      cadence_base64: base64,
      network: network.toLowerCase(),
    };
    const init = {
      method: 'POST',
      async: true,
      body: JSON.stringify(data),
      headers: {
        Network: network,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch('https://flix.flow.com/v1/templates/search', init);

    const template = await response.json();

    const auditorsResponse = await fetch(`https://flix.flow.com/v1/auditors?network=${network}`);
    const auditors = (await auditorsResponse.json()) as Array<{ address: string; name?: string }>;

    fcl
      .config()
      .put(
        'flow.auditors',
        auditors.map((item) => item.address)
      )
      .put('logger.level', 1);

    const audits = await (fcl.InteractionTemplateUtils.getInteractionTemplateAudits as any)({
      template: template as object,
      auditors: auditors.map((item) => item.address),
    });

    const addresses = Object.keys(audits).filter((address) => audits[address]);

    if (addresses.length <= 0) {
      return null;
    }

    const result = auditors.filter((item) => addresses.includes(item.address));
    if (result.length <= 0) {
      return null;
    }
    return {
      auditor: result[0],
      template,
    };
  };

  validateRecaptcha = async (token: string) => {
    const config = this.store.config.validate_recaptcha;
    const data = await this.sendRequest(config.method, config.path, {
      token,
    });

    return data;
  };

  pingNetwork = async (network: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://rest-${network}.onflow.org/v1/blocks?height=sealed`);
      const result = await response.json();
      return Array.isArray(result) && result[0].header !== null && result[0].header !== undefined;
    } catch (err) {
      return false;
    }
  };

  updateProfilePreference = async (privacy: number) => {
    const config = this.store.config.profile_preference;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        private: privacy,
      }
    );

    return data;
  };

  updateProfile = async (nickname: string, avatar: string) => {
    const config = this.store.config.profile_update;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        nickname: nickname,
        avatar: avatar,
      }
    );

    return data;
  };

  cadenceScriptsV2 = async (): Promise<NetworkScripts> => {
    const { data } = await this.sendRequest(
      'GET',
      '/api/v2/scripts',
      {},
      {},
      this.store.webNextUrl
    );
    return data;
  };

  /**
   * Get a list of all the NFTs for a given network and chain type.
   * Confirming if this is old.
   * @param network - The network to get the NFTs for
   * @param chainType - The chain type to get the NFTs for
   * @returns The list of NFTs
   * @deprecated use fetchFullCadenceNftCollectionList instead
   */
  getNFTList = async (network: string, chainType: 'flow' | 'evm'): Promise<NFTModelV2[]> => {
    //'/api/v3/nfts',
    const config = this.store.config.get_nft_list;
    const { tokens }: { tokens: NFTModelV2[] } = await this.sendRequest(
      config.method,
      config.path,
      {
        network,
        chain_type: chainType,
      },
      {},
      this.store.webNextUrl
    );

    return tokens;
  };

  /**
   * 1.fetchFullCadenceNftCollectionList - /api/v2/nft/collections
   * Get a list of ALL the Cadence NFT collections on the Flow network
   * This would be used to populate the NFT collection list in the UI
   * This is needed on the Flow network as Collections need to be enabled on accounts to receive NFTs
   * @param network
   * @returns a list of NFT collections
   */
  fetchFullCadenceNftCollectionList = async (network = 'mainnet'): Promise<NftCollection[]> => {
    const {
      data,
    }: {
      data: NftCollectionResponse[];
    } = await this.sendRequest(
      'GET',
      `/api/v2/nft/collections?network=${network}`,
      {},
      {},
      this.store.webNextUrl
    );
    return data.map(responseToNftCollection);
  };

  /**
   * 2. fetchCadenceNftCollectionsAndIds - /api/v2/nft/id
   * Get a list of the NFT collections and the ids of the nfts owned in each by an account on the Flow network
   * Flow Address -> NFT Collections
   * This is used to populate the NFT collection list in the UI
   * @param address
   * @param network
   * @returns a list of NFT collections and the ids of the nfts owned in each collection
   */

  fetchCadenceNftCollectionsAndIds = async (
    network: string,
    address: string
  ): Promise<NftCollectionAndIds[]> => {
    const {
      data,
    }: {
      data: NftCollectionAndIdsResponse[];
    } = await this.sendRequest(
      'GET',
      `/api/v2/nft/id?address=${address}&network=${network}`,
      {},
      {},
      this.store.webNextUrl
    );
    return data.map(responseToNftCollectionAndIds);
  };

  /**
   * 3. Get a list of NFTs from a specific collection under a FLOW address
   * Use this endpoint to get a list of NFTs that the user owns within a specific collection on the Flow network.
   * Flow Address -> NFT Collection -> NFTs
   * @param network
   * @param address
   * @param contractName
   * @param limit
   * @param offset
   * @param network
   * @returns a paginated list of NFTs
   */
  fetchCadenceCollectionNfts = async (
    network: string,
    address: string,
    contractName: string,
    limit: number,
    offset: number
  ): Promise<CollectionNfts> => {
    const { data }: { data: CollectionNftsResponse } = await this.sendRequest(
      'GET',
      `/api/v2/nft/collectionList?address=${address}&limit=${limit}&offset=${offset}&collectionIdentifier=${contractName}&network=${network}`,
      {},
      {},
      this.store.webNextUrl
    );
    return responseToCollectionNfts(data);
  };

  /**
   * 4. Get a list of Nfts owned by an account on the Flow network across all collections
   * Use this endpoint if you need to display an agregated list of NFTs owned by an account across all collections
   * Flow Address -> NFTs
   * @param address
   * @param limit
   * @param offset
   * @param network
   * @returns a paginated list of NFTs
   */
  fetchCadenceNftsAcrossCollections = async (
    network: string,
    address: string,
    limit: number,
    offset: number
  ): Promise<{
    nfts: Nft[];
    nftCount: number;
    offset?: string | null;
  }> => {
    const { data }: { data: { nfts: Nft[]; nftCount: number; offset?: string | null } } =
      await this.sendRequest(
        'GET',
        `/api/v2/nft/list?address=${address}&limit=${limit}&offset=${offset}&network=${network}`,
        {},
        {},
        this.store.webNextUrl
      );
    return data;
  };
  /**
   **************
   * EVM NFTs
   **************
   */
  /**
   * 1. Get a list of the NFT collections and the ids of the nfts owned in each by an account on the EVM network
   * EVM Address -> NFT Collections
   * This is used to populate the NFT collection list in the UI
   * @param network
   * @param address
   * @returns a list of NFT collections and the ids of the nfts owned in each collection
   */
  fetchEvmNftCollectionsAndIds = async (
    network: string,
    address: string
  ): Promise<NftCollectionAndIds[]> => {
    const { data }: { data: NftCollectionAndIdsResponse[] } = await this.sendRequest(
      'GET',
      `/api/v3/evm/nft/id?network=${network}&address=${address}`,
      {},
      {},
      this.store.webNextUrl
    );
    return data.map(responseToNftCollectionAndIds);
  };

  /**
   * 2. Get a list of NFTs from a specific collection under a EVM address
   * Use this endpoint to get a list of NFTs that the user owns within a specific collection on the EVM network.
   *       EVM Address -> NFT Collection -> NFTs
   * @param network
   * @param address
   * @param contractName
   * @param limit
   * @param offset
   * @returns a paginated list of NFTs
   */

  fetchEvmCollectionNfts = async (
    network: string,
    address: string,
    collectionIdentifier: string,
    limit: number = 24,
    offset: string = '0'
  ): Promise<CollectionNfts> => {
    const { data }: { data: CollectionNftsResponse } = await this.sendRequest(
      'GET',
      `/api/v3/evm/nft/collectionList?network=${network}&address=${address}&collectionIdentifier=${collectionIdentifier}&limit=${limit}&offset=${offset}`,
      {},
      {},
      this.store.webNextUrl
    );
    return responseToCollectionNfts(data);
  };

  /**
   * 3. Get a list of NFTs owned by an account on the EVM network across all collections
   * EVM Address -> NFTs
   * Use this endpoint if you need to display an agregated list of NFTs owned by an account across all collections
   * @param address
   * @returns a list of NFTs
   */
  fetchEvmNftsAcrossCollections = async (
    network: string,
    address: string,
    limit: number,
    offset: string = '0'
  ): Promise<CollectionNfts> => {
    const { data }: { data: CollectionNftsResponse } = await this.sendRequest(
      'GET',
      `/api/v3/evm/nft/list?network=${network}&address=${address}&limit=${limit}&offset=${offset}`,
      {},
      {},
      this.store.webNextUrl
    );
    return responseToCollectionNfts(data);
  };

  evmFTList = async () => {
    const { data } = await this.sendRequest('GET', '/api/evm/fts', {}, {}, this.store.webNextUrl);
    return data;
  };

  /** @deprecated
   * Use getUserTokens has price information. It returns evm tokens with price information.
   */
  getEvmFT = async (address: string, network: string) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/v3/evm/${address}/fts?network=${network}`,
      {},
      {},
      this.store.webNextUrl
    );
    return data;
  };

  getEvmNFT = async (address: string, network: string) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/evm/${address}/nfts?network=${network}`,
      {},
      {},
      this.store.webNextUrl
    );
    return data;
  };

  decodeEvmCall = async (data: string, address = '') => {
    const bodyData = {
      to: address, // address -- optional
      data: data, // calldata -- required
    };
    const res = await this.sendRequest(
      'POST',
      `/api/evm/decodeData`,
      {},
      bodyData,
      this.store.webNextUrl
    );
    return res;
  };

  putDeviceInfo = async (walletData: PublicKeyAccount[]) => {
    try {
      const installationId = await this.getInstallationId();

      await this.addDevice({
        wallet_id: '',
        wallettest_id: '',
        device_info: {
          device_id: installationId,
          district: '',
          name: 'FRW Chrome Extension',
          type: '2',
          user_agent: 'Chrome',
        },
      });
    } catch (error) {
      consoleError('Error while adding device:', error);
      return;
    }
  };

  getNews = async (): Promise<NewsItem[]> => {
    // Get news from firebase function
    const data = await this.sendRequest(
      'GET',
      this.store.isDevServer ? '/config/news.dev.json' : '/config/news.json',
      {},
      {},
      this.store.webNextUrl
    );

    const news = data.map(
      (dataFromApi: {
        id: string;
        priority: string;
        type: string;
        title: string;
        body?: string;
        icon?: string;
        image?: string;
        url?: string;
        expiry_time: string;
        display_type: string;
        conditions?: string[]; // Add conditions field
      }) => {
        const newsItem = {
          ...dataFromApi,
          expiryTime: new Date(dataFromApi.expiry_time),
          displayType: dataFromApi.display_type,
          conditions: dataFromApi.conditions as NewsConditionType[], // Map conditions
        };
        return newsItem;
      }
    );

    return news;
  };

  freshUserInfo = async (
    mainAddress: FlowAddress,
    keys: FclAccount,
    pubKTuple,
    wallet,
    isChild: ActiveAccountType
  ) => {
    const loggedInAccounts: LoggedInAccount[] = (await getLocalData('loggedInAccounts')) || [];

    if (!isChild) {
      await setLocalData('keyIndex', '');
      await setLocalData('hashAlgoString', '');
      await setLocalData('signAlgoString', '');
      await setLocalData('pubKey', '');

      const { P256, SECP256K1 } = pubKTuple;

      const keyInfoA = findKeyAndInfo(keys, P256.pubK);
      const keyInfoB = findKeyAndInfo(keys, SECP256K1.pubK);
      const keyInfo = keyInfoA ||
        keyInfoB || {
          index: 0,
          signAlgoString: keys.keys[0].signAlgoString,
          hashAlgoString: keys.keys[0].hashAlgoString,
          publicKey: keys.keys[0].publicKey,
        };
      await setLocalData('keyIndex', keyInfo.index);
      await setLocalData('signAlgoString', keyInfo.signAlgoString);
      await setLocalData('hashAlgoString', keyInfo.hashAlgoString);
      await setLocalData('pubKey', keyInfo.publicKey);
      // Make sure the address is a FlowAddress

      if (!isValidFlowAddress(mainAddress)) {
        throw new Error('Invalid Flow address');
      }
      const flowAddress: FlowAddress = mainAddress;
      const updatedWallet: LoggedInAccount = {
        ...wallet,
        address: flowAddress,
        pubKey: keyInfo.publicKey,
        hashAlgoString: keyInfo.hashAlgoString,
        signAlgoString: keyInfo.signAlgoString,
        weight: keys.keys[0].weight,
      };

      const accountIndex = loggedInAccounts.findIndex(
        // Check both pubKey and username. Older versions allowed the pubKey to be imported twice with different usernames
        (account) =>
          account.pubKey === updatedWallet.pubKey && account.username === updatedWallet.username
      );

      if (accountIndex === -1) {
        loggedInAccounts.push(updatedWallet);
      } else {
        loggedInAccounts[accountIndex] = updatedWallet;
      }
      await setLocalData('loggedInAccounts', loggedInAccounts);
    }

    const otherAccounts: LoggedInAccountWithIndex[] = loggedInAccounts
      .filter((account) => account.username !== wallet.username)
      .map((account) => {
        const indexInLoggedInAccounts = loggedInAccounts.findIndex(
          (loggedInAccount) => loggedInAccount.username === account.username
        );
        return { ...account, indexInLoggedInAccounts };
      })
      .slice(0, 2);

    return { otherAccounts, wallet, loggedInAccounts };
  };

  // ** Get supported currencies **
  getSupportedCurrencies = async (): Promise<Currency[]> => {
    let currencies = [DEFAULT_CURRENCY];
    try {
      const supportedCurrencies: CurrencyResponse = await this.sendRequest(
        'GET',
        `/api/v4/currencies`,
        {},
        {},
        this.store.webNextUrl
      );

      currencies = supportedCurrencies?.data?.currencies || [DEFAULT_CURRENCY];
    } catch (error) {
      consoleError('Error fetching supported currencies, using default USD:', error);
    }
    return currencies;
  };

  // ** Get Coinbase onramp URL **
  getCoinbaseOnRampURL = async (
    address: string
  ): Promise<{ data: { session: { onrampUrl: string } }; status: number }> => {
    const requestData = {
      address,
    };

    const response = await this.sendRequest(
      'POST',
      `/api/v4/onramp/coinbase`,
      {},
      requestData,
      this.store.webNextUrl
    );

    return response;
  };

  async fetchCadenceTokenInfo(
    network: string,
    address: string,
    currencyCode: string = 'USD'
  ): Promise<CadenceTokenInfo[]> {
    const response: CadenceTokensApiResponseV4 = await this.sendRequest(
      'GET',
      `/api/v4/cadence/tokens/ft/${address}`,
      { network, currency: currencyCode },
      {},
      this.store.webNextUrl
    );
    if (!response?.data?.result || !response?.data?.storage) {
      throw new Error('Could not fetch token info');
    }

    // TODO: TB remove this after the API is updated
    const storageInfo: StorageResponse = response?.data?.storage;
    const cadenceTokenInfo: CadenceTokenInfo[] = response?.data?.result.map((token) => {
      if (token.symbol.toUpperCase() === 'FLOW') {
        return {
          ...token,
          balance: storageInfo.availableBalanceToUse,
          displayBalance: storageInfo.availableBalanceToUse,
          balanceInFLOW: storageInfo.availableBalanceToUse,
          balanceInUSD: BigNumber(storageInfo.availableBalanceToUse)
            .multipliedBy(BigNumber(token.priceInUSD))
            .toString(),
          balanceInCurrency: BigNumber(storageInfo.availableBalanceToUse)
            .multipliedBy(BigNumber(token.priceInCurrency))
            .toString(),
        };
      }
      return token;
    });
    return cadenceTokenInfo;
  }

  async fetchEvmTokenInfo(
    network: string,
    address: string,
    currencyCode: string = 'USD'
  ): Promise<EvmTokenInfo[]> {
    const formattedEvmAddress = address.startsWith('0x') ? address : `0x${address}`;

    const userEvmTokenList: EvmTokensApiResponseV4 = await this.sendRequest(
      'GET',
      `/api/v4/evm/tokens/ft/${formattedEvmAddress}`,
      { network, currency: currencyCode },
      {},
      this.store.webNextUrl
    );
    if (!userEvmTokenList?.data) {
      throw new Error('No token info found');
    }
    return userEvmTokenList?.data;
  }

  async updateAccountMetadata(
    address: string,
    icon: string,
    name: string,
    background: string
  ): Promise<any> {
    return this.sendRequest(
      'POST',
      `/api/metadata/user/${address}`,
      {},
      {
        icon,
        name,
        background,
      },
      this.store.webNextUrl
    );
  }

  async getUserMetadata(): Promise<any> {
    return this.sendRequest('GET', '/api/metadata/user/metadatas', {}, {}, this.store.webNextUrl);
  }

  getCoaDomainsWhitelist = async (): Promise<string[]> => {
    const CACHE_KEY = 'coa-domains-whitelist';

    try {
      const cached = await getCachedData<string[]>(CACHE_KEY);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }

      const response = await fetch(`${this.store.webNextUrl}/coa-domains.json`);
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      const domains = Array.isArray(data) ? data : [];

      if (domains.length > 0) {
        await setCachedData(CACHE_KEY, domains, 1000 * 60 * 60); // Cache for 1 hour
      }

      return domains;
    } catch {
      return [];
    }
  };
}

const openApiService = new OpenApiService();

if (process.env.NODE_ENV === 'development') {
  // Log all functions and their signatures
  const functions = Object.entries(openApiService)
    .filter(
      ([name, value]) =>
        typeof value === 'function' &&
        name !== 'constructor' &&
        typeof name === 'string' &&
        name !== 'get'
    )
    .map(([name]) => {
      const func = openApiService[name];
      // Use a safer way to get function info
      const funcStr = func.toString();
      const isAsync = funcStr.startsWith('async');
      const basicSignature = funcStr.split('{')[0].trim();

      return {
        name,
        isAsync,
        fullBody: funcStr,
        usesSendRequest: funcStr.includes('this.sendRequest'),
        usesFetchDirectly: funcStr.includes('fetch('),
        basicSignature,
        // Simple regex to extract parameter names without accessing arguments
        params: basicSignature
          .slice(basicSignature.indexOf('(') + 1, basicSignature.lastIndexOf(')'))
          .split(',')
          .map((param) => param.trim())
          .map((param) => {
            if (param.startsWith('PriceProvider.')) {
              return param.replace('PriceProvider.', '');
            }
            return param;
          })
          .filter(Boolean),
      };
    });

  consoleLog('OpenApiService Functions:', functions);
}

export const getScripts = async (network: string, category: string, scriptName: string) => {
  try {
    // Force a proper load of the cadence scripts
    const cadenceScripts = await openApiService.getCadenceScripts();
    if (!cadenceScripts) {
      throw new Error('Cadence scripts not loaded');
    }
    const networkScripts =
      network === 'mainnet' ? cadenceScripts.scripts.mainnet : cadenceScripts.scripts.testnet;
    if (!networkScripts) {
      throw new Error('Network scripts not found');
    }
    const categoryScripts = networkScripts[category];
    if (!categoryScripts) {
      throw new Error('Category scripts not found');
    }
    const script = categoryScripts[scriptName];
    if (!script) {
      throw new Error('Script not found');
    }
    const scriptString = Buffer.from(script, 'base64').toString('utf-8');
    const version = versionService.getVersion();
    const modifiedScriptString = scriptString.replaceAll('<platform_info>', `Extension-${version}`);
    return modifiedScriptString;
  } catch (error) {
    if (error instanceof Error) {
      analyticsService.track('script_error', {
        script_id: scriptName,
        error: error.message,
      });
    }
    throw error;
  }
};

export default openApiService;
