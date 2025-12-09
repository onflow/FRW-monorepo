/** Generate by swagger-axios-codegen */
// @ts-nocheck
/* eslint-disable */

/** Generate by swagger-axios-codegen */
/* eslint-disable */
// @ts-nocheck
import axiosStatic, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

export interface IRequestOptions extends AxiosRequestConfig {
  /**
   * show loading status
   */
  loading?: boolean;
  /**
   * display error message
   */
  showError?: boolean;
  /**
   * indicates whether Authorization credentials are required for the request
   * @default true
   */
  withAuthorization?: boolean;
}

export interface IRequestConfig {
  method?: any;
  headers?: any;
  url?: any;
  data?: any;
  params?: any;
}

// Add options interface
export interface ServiceOptions {
  axios?: AxiosInstance;
  /** only in axios interceptor config*/
  loading: boolean;
  showError: boolean;
}

// Add default options
export const serviceOptions: ServiceOptions = {};

// Instance selector
export function axios(configs: IRequestConfig, resolve: (p: any) => void, reject: (p: any) => void): Promise<any> {
  if (serviceOptions.axios) {
    return serviceOptions.axios
      .request(configs)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  } else {
    throw new Error('please inject yourself instance like axios  ');
  }
}

export function getConfigs(method: string, contentType: string, url: string, options: any): IRequestConfig {
  const configs: IRequestConfig = {
    loading: serviceOptions.loading,
    showError: serviceOptions.showError,
    ...options,
    method,
    url
  };
  configs.headers = {
    ...options.headers,
    'Content-Type': contentType
  };
  return configs;
}

export const basePath = '';

export interface IList<T> extends Array<T> {}
export interface List<T> extends Array<T> {}
export interface IDictionary<TValue> {
  [key: string]: TValue;
}
export interface Dictionary<TValue> extends IDictionary<TValue> {}

export interface IListResult<T> {
  items?: T[];
}

export class ListResultDto<T> implements IListResult<T> {
  items?: T[];
}

export interface IPagedResult<T> extends IListResult<T> {
  totalCount?: number;
  items?: T[];
}

export class PagedResultDto<T = any> implements IPagedResult<T> {
  totalCount?: number;
  items?: T[];
}

// customer definition
// empty

export class CryptoService {
  /**
   * Get the history pricing
   */
  static exchange(
    params: {
      /** the provider */
      provider: string;
      /** the paired token name */
      pair: string;
      /** the after value */
      after: string;
      /** the period mapped */
      period: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/crypto/exchange';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        provider: params['provider'],
        pair: params['pair'],
        after: params['after'],
        period: params['period']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the history pricing
   */
  static history(
    params: {
      /** the provider */
      provider: string;
      /** the paired token name */
      pair: string;
      /** the after value */
      after: string;
      /** the period mapped */
      period: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/crypto/history';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        provider: params['provider'],
        pair: params['pair'],
        after: params['after'],
        period: params['period']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the flow pricing
   */
  static summary(
    params: {
      /** the provider */
      provider: string;
      /** the paired token name */
      pair: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/crypto/summary';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { provider: params['provider'], pair: params['pair'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the crypto mapping info
   */
  static map(
    params: {
      /** the provider */
      provider: string;
      /** the paired token name */
      pair: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/crypto/map';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { provider: params['provider'], pair: params['pair'] };

      axios(configs, resolve, reject);
    });
  }
}

export class NftService {
  /**
   * Get the nft meta info
   */
  static meta(
    params: {
      /** user  nft address */
      address: string;
      /** name of the contract */
      contractName: string;
      /** contract address */
      contractAddress: string;
      /** token id */
      tokenId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/nft/meta';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        address: params['address'],
        contractName: params['contractName'],
        contractAddress: params['contractAddress'],
        tokenId: params['tokenId']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the nft info
   */
  static list(
    params: {
      /** user  nft address */
      address: string;
      /** uoffset */
      offset: number;
      /** limit */
      limit: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/nft/list';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], offset: params['offset'], limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the collections
   */
  static collections(
    params: {
      /** user  address */
      address: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_NFTReturns[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/nft/collections';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the nft detail
   */
  static detail(
    params: {
      /** user  nft address */
      address: string;
      /** name of the contract */
      contractName: string;
      /** single nft id */
      nftId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/nft/detail';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], contractName: params['contractName'], nftID: params['nftId'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the nft list
   */
  static list1(
    params: {
      /** user  nft address */
      address: string;
      /** number of nft to be displayed in one page */
      limit: number;
      /** starting index of the page */
      offset: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/nft/detail/list';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], limit: params['limit'], offset: params['offset'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the favorite nft
   */
  static favorite(
    params: {
      /** user  nft address */
      address: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_FavoriteReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/nft/favorite';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Add new favorite nft
   */
  static favorite1(
    params: {
      /** contract id of the nft */
      contract: string;
      /** id of the nft */
      ids: string;
      /** address of the nft owner */
      address: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/nft/favorite';

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = { contract: params['contract'], ids: params['ids'], address: params['address'] };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Update the favorite list
   */
  static favorite2(
    params: {
      /** format contract-id of the nfts in order, use comma to seperate */
      ids: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/nft/favorite';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['ids'];

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the nft info
   */
  static list2(
    params: {
      /** user  nft address */
      address: string;
      /** uoffset */
      offset: number;
      /** limit */
      limit: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/nft/list';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], offset: params['offset'], limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the nft meta info
   */
  static meta1(
    params: {
      /** user  nft address */
      address: string;
      /** name of the contract */
      contractName: string;
      /** contract address */
      contractAddress: string;
      /** token id */
      tokenId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/nft/meta';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        address: params['address'],
        contractName: params['contractName'],
        contractAddress: params['contractAddress'],
        tokenId: params['tokenId']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the single collection
   */
  static single(
    params: {
      /** user  address */
      address: string;
      /** name of the contract */
      contractName: string;
      /** number of nft to be displayed in one page */
      limit: number;
      /** starting index of the page */
      offset: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_NFTCollection[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/nft/single';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        address: params['address'],
        contractName: params['contractName'],
        limit: params['limit'],
        offset: params['offset']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the favorite nft
   */
  static favorite3(
    params: {
      /** user  nft address */
      address: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_FavoriteReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/nft/favorite';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'] };

      axios(configs, resolve, reject);
    });
  }
}

export class AccountService {
  /**
   * Get the address info
   */
  static info(
    params: {
      /** address of the account being viewed */
      address: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/account/info';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the address transfer info
   */
  static query(
    params: {
      /** string format graphql query to view flowscan result */
      query: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/account/query';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);
      configs.params = { query: params['query'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the address transfer info
   */
  static signpayer(
    params: {
      /** transaction before signed envelope */
      transaction: object;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/account/signpayer';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);
      configs.params = { transaction: params['transaction'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the address token transfer info
   */
  static tokentransfer(
    params: {
      /** address of the queried account */
      address: string;
      /** id of the queried token */
      token: string;
      /** page limit */
      limit: number;
      /** the endcursor of last page, leave blank if first page */
      after: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_TransactionReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/account/tokentransfer';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        address: params['address'],
        token: params['token'],
        limit: params['limit'],
        after: params['after']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the address transaction info
   */
  static transaction(
    params: {
      /** address of the account being viewed */
      address: string;
      /** limit of the returned list */
      limit: number;
      /** starting index of the first data */
      offset: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/account/transaction';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], limit: params['limit'], offset: params['offset'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the address transfer info
   */
  static transfer(
    params: {
      /** address of the account being viewed */
      address: string;
      /** limit of the returned list */
      limit: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/account/transfer';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the address transfer info
   */
  static transfers(
    params: {
      /** address of the queried account */
      address: string;
      /** page limit */
      limit: number;
      /** the endcursor of last page, leave blank if first page */
      after: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_TransactionReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/account/transfers';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], limit: params['limit'], after: params['after'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the address transfer info
   */
  static query1(
    params: {
      /** address of the queried account */
      address: string;
      /** page limit */
      limit: number;
      /** the endcursor of last page, leave blank if first page */
      after: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_TransactionReturnV2> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/account/query';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], limit: params['limit'], after: params['after'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the address token transfer info
   */
  static tokentransfer1(
    params: {
      /** address of the queried account */
      address: string;
      /** id of the queried token */
      token: string;
      /** page limit */
      limit: number;
      /** the endcursor of last page, leave blank if first page */
      after: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_TransactionReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/account/tokentransfer';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        address: params['address'],
        token: params['token'],
        limit: params['limit'],
        after: params['after']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the address transfer info
   */
  static transfers1(
    params: {
      /** address of the queried account */
      address: string;
      /** page limit */
      limit: number;
      /** the endcursor of last page, leave blank if first page */
      after: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_TransactionReturnV2> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/account/transfers';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], limit: params['limit'], after: params['after'] };

      axios(configs, resolve, reject);
    });
  }
}

export class AddressService {
  /**
   * Filter lilico address
   */
  static filter(
    params: {
      /** array of addresses */
      addresses: any | null[];
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_AddressFilterResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/address/filter';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['addresses'];

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
}

export class AddressbookService {
  /**
   * Get all contact
   */
  static contact(options: IRequestOptions = {}): Promise<controllers_contactReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/addressbook/contact';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Add a contact
   */
  static contact1(
    params: {
      /** contact name of the new contact */
      contactName: string;
      /** username of the new contact */
      username: string;
      /** address of the new contact */
      address?: string;
      /** domain of the new contact */
      domain: string;
      /** type of domain */
      domainType: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/addressbook/contact';

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = {
        contact_name: params['contactName'],
        username: params['username'],
        address: params['address'],
        domain: params['domain'],
        domain_type: params['domainType']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Edit contact
   */
  static contact2(
    params: {
      /** contact id of the contact wish to edit */
      id: number;
      /** new contact name, keep it same if unchanged */
      contactName: string;
      /** new address, keep it same if unchanged */
      address: string;
      /** new domain, keep it same if unchanged */
      domain: string;
      /** new domain_type, keep it same if unchanged */
      domainType: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/addressbook/contact';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = {
        id: params['id'],
        contact_name: params['contactName'],
        address: params['address'],
        domain: params['domain'],
        domain_type: params['domainType']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Remove a contact
   */
  static contact3(
    params: {
      /** the contact id */
      id: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/addressbook/contact';

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);
      configs.params = { id: params['id'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Add an external contact
   */
  static external(
    params: {
      /** contact name of the new contact */
      contactName: string;
      /** address of the new contact */
      address: string;
      /** contact name of the new contact */
      domain: string;
      /** type of domain */
      domainType: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/addressbook/external';

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = {
        contact_name: params['contactName'],
        address: params['address'],
        domain: params['domain'],
        domain_type: params['domainType']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
}

export class CoinService {
  /**
   * Get the coin mapping info
   */
  static map(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/coin/map';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the coin exchange info
   */
  static rate(
    params: {
      /** coin id based on the rate */
      coinId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/coin/rate';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { coinId: params['coinId'] };

      axios(configs, resolve, reject);
    });
  }
}

export class UserService {
  /**
   * Login user
   */
  static login(
    params: {
      /** User's public Key */
      publicKey: string;
      /** the signature of the message */
      signature: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_UserReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/login';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = { public_key: params['publicKey'], signature: params['signature'] };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Register user for mobile
   */
  static register(
    params: {
      /** User Name */
      username: string;
      /** Account key */
      accountKey: forms_AccountKey;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_UserReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/mobile/register';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = { username: params['username'], account_key: params['accountKey'] };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Add an address
   */
  static address(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/mobile/user/address';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Register user
   */
  static register1(
    params: {
      /** User Name */
      username: string;
      /** Account key */
      accountKey: forms_AccountKey;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_UserReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/register';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = { username: params['username'], account_key: params['accountKey'] };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Add an address
   */
  static address1(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/address';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Add an address
   */
  static network(
    params: {
      /** account key object */
      accountKey: forms_AccountKey;
      /** the network of the address you want to create */
      network: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/address/network';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = { account_key: params['accountKey'], network: params['network'] };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Check if user name unique
   */
  static check(
    params: {
      /** username */
      username: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_CheckReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/check';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { username: params['username'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Check profile info
   */
  static info(options: IRequestOptions = {}): Promise<controllers_ProfileReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/info';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Verify the recaptcha token
   */
  static recaptcha(
    params: {
      /** the recaptcha token */
      token: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/recaptcha';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { token: params['token'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Search using address or username
   */
  static search(
    params: {
      /** search keyword */
      keyword: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_SearchResult> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/search';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { keyword: params['keyword'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Search using address
   */
  static searchaddress(
    params: {
      /** search keyword */
      keyword: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_SearchResult> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/searchaddress';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { keyword: params['keyword'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Add push token
   */
  static token(
    params: {
      /** string of push token */
      pushToken: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/token';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['pushToken'];

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the user wallet
   */
  static wallet(options: IRequestOptions = {}): Promise<controllers_WalletReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/wallet';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Login user V2
   */
  static login1(
    params: {
      /** User's public Key */
      publicKey: string;
      /** the signature of the message */
      signature: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_UserReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/login';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = { public_key: params['publicKey'], signature: params['signature'] };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Create a new Flow address
   */
  static address2(options: IRequestOptions = {}): Promise<controllers_AccountReturnv2> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/user/address';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Create a new flow address manually
   */
  static manualaddress(
    params: {
      /** Account key information including hash algorithm, sign algorithm, and public key */
      accountKey: forms_AccountKeyForm;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/user/manualaddress';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['accountKey'];

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get the user wallet
   */
  static wallet1(options: IRequestOptions = {}): Promise<controllers_WalletReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v2/user/wallet';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

export class ProfileService {
  /**
   * Update profile info
   */
  static profile(
    params: {
      /** string of new nickname */
      nickname: string;
      /** avatar url */
      avatar: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/profile';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = { nickname: params['nickname'], avatar: params['avatar'] };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Update profile preference
   */
  static preference(
    params: {
      /** toggle of private preference 1 is public 2 is private */
      private: boolean;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/profile/preference';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['private'];

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
}

export class DeviceService {
  /**
   * Check device info
   */
  static device(
    params: {
      /** installation id of the current device */
      deviceId?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<models_Device[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/device';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { device_id: params['deviceId'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Create device info
   */
  static device1(
    params: {
      /** DeviceInfo object */
      deviceInfo: forms_DeviceInfo;
      /** devices accounts mainnet wallet id */
      walletId: number;
      /** devices accounts testnet wallet id */
      wallettestId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/device';

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = {
        device_info: params['deviceInfo'],
        wallet_id: params['walletId'],
        wallettest_id: params['wallettestId']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Update an device
   */
  static device2(
    params: {
      /** installation id of the new device */
      deviceId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/device';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['deviceId'];

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get device info
   */
  static keys(options: IRequestOptions = {}): Promise<controllers_PubKeyReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/keys';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get ip location info
   */
  static location(
    params: {
      /** ip of the current device */
      ip: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<types_ApiResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v1/user/location';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { ip: params['ip'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Create device info
   */
  static device3(
    params: {
      /** DeviceInfo object */
      deviceInfo: forms_DeviceInfo;
      /** devices accounts mainnet wallet id */
      walletId: number;
      /** devices accounts testnet wallet id */
      wallettestId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/user/device';

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = {
        device_info: params['deviceInfo'],
        wallet_id: params['walletId'],
        wallettest_id: params['wallettestId']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Update an device
   */
  static device4(
    params: {
      /** installation id of the new device */
      deviceId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/user/device';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['deviceId'];

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get ip location info
   */
  static location1(
    params: {
      /** ip of the current device */
      ip: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<types_ApiResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/user/location';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { ip: params['ip'] };

      axios(configs, resolve, reject);
    });
  }
}

export class Userv3Service {
  /**
   * Save key V3
   */
  static checkimport(
    params: {
      /** Account key */
      accountKey: forms_AccountKey;
      /** AccountKeySignature object */
      signatures: forms_AccountKeySignature[];
      /** BackupInfo object */
      backupInfo: forms_BackupInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/checkimport';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      /** 适配移动开发（iOS13 等版本），只有 POST、PUT 等请求允许带body */

      console.warn('适配移动开发（iOS13 等版本），只有 POST、PUT 等请求允许带body');

      let data = {
        account_key: params['accountKey'],
        signatures: params['signatures'],
        backup_info: params['backupInfo']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Save key V3
   */
  static import(
    params: {
      /** Account key */
      accountKey: forms_AccountKey;
      /** AccountKeySignature object */
      signatures: forms_AccountKeySignature[];
      /** DeviceInfo object */
      deviceInfo: forms_DeviceInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/import';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = {
        account_key: params['accountKey'],
        signatures: params['signatures'],
        device_info: params['deviceInfo']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Login user V3
   */
  static login(
    params: {
      /** the signature of the message */
      signature: string;
      /** Account key */
      accountKey: forms_AccountKey;
      /** DeviceInfo object */
      deviceInfo: forms_DeviceInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_UserReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/login';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = {
        signature: params['signature'],
        account_key: params['accountKey'],
        device_info: params['deviceInfo']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Register user
   */
  static register(
    params: {
      /** User Name */
      username: string;
      /** Account key */
      accountKey: forms_AccountKey;
      /** DeviceInfo object */
      deviceInfo: forms_DeviceInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_UserReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/register';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = { username: params['username'], account_key: params['accountKey'], device_info: params['deviceInfo'] };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Save key V3
   */
  static signed(
    params: {
      /** Account key */
      accountKey: forms_AccountKey;
      /** AccountKeySignature object */
      signatures: forms_AccountKeySignature[];
      /** BackupInfo object */
      backupInfo: forms_BackupInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/signed';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = {
        account_key: params['accountKey'],
        signatures: params['signatures'],
        backup_info: params['backupInfo']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Sync new user device V3
   */
  static sync(
    params: {
      /** Account key */
      accountKey: forms_AccountKey;
      /** DeviceInfo object */
      deviceInfo: forms_DeviceInfo;
      /** BackupInfo object */
      backupInfo: forms_BackupInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v3/sync';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = {
        account_key: params['accountKey'],
        device_info: params['deviceInfo'],
        backup_info: params['backupInfo']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
}

export class Userv4Service {
  /**
   * Import user V4
   */
  static import(
    params: {
      /** Flow account information with account key and signature */
      flowAccountInfo: forms_FlowAccountInfo;
      /** EVM account information with EOA address and signature (optional) */
      evmAccountInfo?: forms_EvmAccountInfo;
      /** User Name (3-20 characters, alphanumeric) */
      username: string;
      /** Flow mainnet address */
      address: string;
      /** Backup information */
      backupInfo?: forms_BackupInfo;
      /** Device information (optional - server extracts IP, User-Agent, and location automatically) */
      deviceInfo?: forms_DeviceInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_UserReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v4/import';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = {
        flow_account_info: params['flowAccountInfo'],
        evm_account_info: params['evmAccountInfo'],
        username: params['username'],
        address: params['address'],
        backup_info: params['backupInfo'],
        device_info: params['deviceInfo']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Login user V4
   */
  static login(
    params: {
      /** Flow account information with account key and signature */
      flowAccountInfo: forms_FlowAccountInfo;
      /** EVM account information with EOA address and signature (optional) */
      evmAccountInfo?: forms_EvmAccountInfo;
      /** Device information (optional - server extracts IP, User-Agent, and location automatically) */
      deviceInfo?: forms_DeviceInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_UserReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v4/login';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = {
        flow_account_info: params['flowAccountInfo'],
        evm_account_info: params['evmAccountInfo'],
        device_info: params['deviceInfo']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Register user V4
   */
  static register(
    params: {
      /** Flow account information with account key and signature */
      flowAccountInfo: forms_FlowAccountInfo;
      /** EVM account information with EOA address and signature (optional) */
      evmAccountInfo?: forms_EvmAccountInfo;
      /** User Name (3-20 characters, alphanumeric) */
      username: string;
      /** Device information (optional - server extracts IP, User-Agent, and location automatically) */
      deviceInfo?: forms_DeviceInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<controllers_UserReturn> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v4/register';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = {
        flow_account_info: params['flowAccountInfo'],
        evm_account_info: params['evmAccountInfo'],
        username: params['username'],
        device_info: params['deviceInfo']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * Sync new user device V4
   */
  static sync(
    params: {
      /** Flow account information with account key and signature */
      flowAccountInfo: forms_FlowAccountInfo;
      /** EVM account information with EOA address and signature (optional) */
      evmAccountInfo?: forms_EvmAccountInfo;
      /** Backup information */
      backupInfo?: forms_BackupInfo;
      /** Device information (optional - server extracts IP, User-Agent, and location automatically) */
      deviceInfo?: forms_DeviceInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/v4/sync';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = {
        flow_account_info: params['flowAccountInfo'],
        evm_account_info: params['evmAccountInfo'],
        backup_info: params['backupInfo'],
        device_info: params['deviceInfo']
      };

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
}

/** controllers_AccountReturnv2 */
export interface controllers_AccountReturnv2 {
  /**  */
  txid?: string;
}

/** controllers_AddressFilterResponse */
export interface controllers_AddressFilterResponse {
  /**  */
  addresses?: string[];
}

/** controllers_CheckReturn */
export interface controllers_CheckReturn {
  /**  */
  unique?: boolean;

  /**  */
  username?: string;
}

/** controllers_CollectionAddress */
export interface controllers_CollectionAddress {
  /**  */
  mainnet?: string;

  /**  */
  testnet?: string;
}

/** controllers_DomainStruct */
export interface controllers_DomainStruct {
  /**  */
  domain_type?: number;

  /**  */
  value?: string;
}

/** controllers_FavoriteReturn */
export interface controllers_FavoriteReturn {
  /**  */
  chain?: string;

  /**  */
  list?: string;

  /**  */
  network?: string;

  /**  */
  nftcount?: number;

  /**  */
  nfts?: any | null[];
}

/** controllers_NFTCollection */
export interface controllers_NFTCollection {
  /**  */
  address?: controllers_CollectionAddress;

  /**  */
  banner?: string;

  /**  */
  contract_name?: string;

  /**  */
  description?: string;

  /**  */
  logo?: string;

  /**  */
  marketplace?: string;

  /**  */
  name?: string;

  /**  */
  official_website?: string;

  /**  */
  path?: controllers_Path;

  /**  */
  secure_cadence_compatible?: controllers_SCC;
}

/** controllers_NFTReturns */
export interface controllers_NFTReturns {
  /**  */
  collection?: controllers_NFTCollection;

  /**  */
  count?: number;

  /**  */
  ids?: any | null;
}

/** controllers_Path */
export interface controllers_Path {
  /**  */
  public_collection_name?: string;

  /**  */
  public_path?: string;

  /**  */
  storage_path?: string;
}

/** controllers_ProfileReturn */
export interface controllers_ProfileReturn {
  /**  */
  avatar?: string;

  /**  */
  created?: string;

  /**  */
  id?: string;

  /**  */
  nickname?: string;

  /**  */
  private?: number;

  /**  */
  username?: string;
}

/** controllers_PubKeyReturn */
export interface controllers_PubKeyReturn {
  /**  */
  result?: controllers_pubKeyReturn[];
}

/** controllers_SCC */
export interface controllers_SCC {
  /**  */
  mainnet?: boolean;

  /**  */
  testnet?: boolean;
}

/** controllers_SearchResult */
export interface controllers_SearchResult {
  /**  */
  users?: controllers_User[];
}

/** controllers_TransactionReturn */
export interface controllers_TransactionReturn {
  /**  */
  next?: boolean;

  /**  */
  string?: string;

  /**  */
  total?: number;

  /**  */
  transactions?: controllers_TransactionReturnContent[];
}

/** controllers_TransactionReturnContent */
export interface controllers_TransactionReturnContent {
  /**  */
  additional_message?: string;

  /**  */
  amount?: string;

  /**  */
  error?: boolean;

  /**  */
  image?: string;

  /**  */
  receiver?: string;

  /**  */
  sender?: string;

  /**  */
  status?: string;

  /**  */
  time?: string;

  /**  */
  title?: string;

  /**  */
  token?: string;

  /**  */
  transfer_type?: number;

  /**  */
  txid?: string;

  /**  */
  type?: number;
}

/** controllers_TransactionReturnContentV2 */
export interface controllers_TransactionReturnContentV2 {
  /**  */
  additional_message?: string;

  /**  */
  amount?: string;

  /**  */
  error?: boolean;

  /**  */
  image?: string;

  /**  */
  receiver?: string;

  /**  */
  sender?: string;

  /**  */
  status?: string;

  /**  */
  time?: string;

  /**  */
  title?: string;

  /**  */
  token?: string;

  /**  */
  transfer_type?: number;

  /**  */
  txid?: string;

  /**  */
  type?: number;
}

/** controllers_TransactionReturnV2 */
export interface controllers_TransactionReturnV2 {
  /**  */
  next?: boolean;

  /**  */
  string?: string;

  /**  */
  total?: number;

  /**  */
  transactions?: controllers_TransactionReturnContentV2[];
}

/** controllers_User */
export interface controllers_User {
  /**  */
  address?: string;

  /**  */
  avatar?: string;

  /**  */
  nickname?: string;

  /**  */
  username?: string;
}

/** controllers_UserReturn */
export interface controllers_UserReturn {
  /**  */
  custom_token?: string;

  /**  */
  id?: string;
}

/** controllers_WalletReturn */
export interface controllers_WalletReturn {
  /**  */
  id?: string;

  /**  */
  primary_wallet?: number;

  /**  */
  username?: string;

  /**  */
  wallets?: controllers_wallet[];
}

/** controllers_backupInfo */
export interface controllers_backupInfo {
  /**  */
  create_time?: string;

  /**  */
  name?: string;

  /**  */
  type?: number;
}

/** controllers_blockchain */
export interface controllers_blockchain {
  /**  */
  address?: string;

  /**  */
  chain_id?: string;

  /**  */
  coins?: string[];

  /**  */
  id?: number;

  /**  */
  name?: string;
}

/** controllers_contactReturn */
export interface controllers_contactReturn {
  /**  */
  address?: string;

  /**  */
  avatar?: string;

  /**  */
  contact_name?: string;

  /**  */
  contact_type?: number;

  /**  */
  domain?: controllers_DomainStruct;

  /**  */
  id?: number;

  /**  */
  username?: string;
}

/** controllers_pubKeyReturn */
export interface controllers_pubKeyReturn {
  /**  */
  backup_info?: controllers_backupInfo;

  /**  */
  device?: models_Device;

  /**  */
  pubkey?: controllers_pubkeyInfo;
}

/** controllers_pubkeyInfo */
export interface controllers_pubkeyInfo {
  /**  */
  hash_algo?: number;

  /**  */
  name?: string;

  /**  */
  public_key?: string;

  /**  */
  sign_algo?: number;

  /**  */
  weight?: number;
}

/** controllers_wallet */
export interface controllers_wallet {
  /**  */
  blockchain?: controllers_blockchain[];

  /**  */
  chain_id?: string;

  /**  */
  color?: string;

  /**  */
  icon?: string;

  /**  */
  id?: number;

  /**  */
  name?: string;
}

/** forms_AccountKey */
export interface forms_AccountKey {
  /**  */
  hash_algo?: number;

  /**  */
  public_key?: string;

  /**  */
  sign_algo?: number;

  /**  */
  weight?: number;
}

/** forms_AccountKeyForm */
export interface forms_AccountKeyForm {
  /**  */
  hashAlgorithm: number;

  /**  */
  publicKey: string;

  /**  */
  signatureAlgorithm: number;

  /**  */
  weight: number;
}

/** forms_AccountKeySignature */
export interface forms_AccountKeySignature {
  /**  */
  hash_algo?: number;

  /**  */
  public_key?: string;

  /**  */
  sign_algo?: number;

  /**  */
  sign_message?: string;

  /**  */
  signature?: string;

  /**  */
  weight?: number;
}

/** forms_BackupInfo */
export interface forms_BackupInfo {
  /**  */
  name?: string;

  /**  */
  type?: number;
}

/** forms_DeviceInfo */
export interface forms_DeviceInfo {
  /**  */
  city?: string;

  /**  */
  continent?: string;

  /**  */
  continentCode?: string;

  /**  */
  country?: string;

  /**  */
  countryCode?: string;

  /**  */
  currency?: string;

  /**  */
  device_id?: string;

  /**  */
  district?: string;

  /**  */
  ip?: string;

  /**  */
  isp?: string;

  /**  */
  lat?: number;

  /**  */
  lon?: number;

  /**  */
  name?: string;

  /**  */
  org?: string;

  /**  */
  regionName?: string;

  /**  */
  type?: string;

  /**  */
  user_agent?: string;

  /**  */
  zip?: string;
}

/** forms_EvmAccountInfo */
export interface forms_EvmAccountInfo {
  /**  */
  eoa_address: string;

  /**  */
  signature: string;
}

/** forms_FlowAccountInfo */
export interface forms_FlowAccountInfo {
  /**  */
  account_key: forms_AccountKey;

  /**  */
  signature: string;
}

/** models_Device */
export interface models_Device {
  /**  */
  city?: string;

  /**  */
  continent?: string;

  /**  */
  continentCode?: string;

  /**  */
  country?: string;

  /**  */
  countryCode?: string;

  /**  */
  created_at?: string;

  /**  */
  currency?: string;

  /**  */
  device_name?: string;

  /**  */
  device_type?: number;

  /**  */
  district?: string;

  /**  */
  id?: string;

  /**  */
  ip?: string;

  /**  */
  isp?: string;

  /**  */
  lat?: number;

  /**  */
  lon?: number;

  /**  */
  org?: string;

  /**  */
  regionName?: string;

  /**  */
  revoked_status?: number;

  /**  */
  updated_at?: string;

  /**  */
  user_agent?: string;

  /**  */
  user_id?: string;

  /**  */
  wallet_id?: number;

  /**  */
  walletsand_id?: number;

  /**  */
  wallettest_id?: number;

  /**  */
  zip?: string;
}

/** types_ApiResponse */
export interface types_ApiResponse {
  /**  */
  as?: string;

  /**  */
  city?: string;

  /**  */
  continent?: string;

  /**  */
  continentCode?: string;

  /**  */
  country?: string;

  /**  */
  countryCode?: string;

  /**  */
  currency?: string;

  /**  */
  district?: string;

  /**  */
  isp?: string;

  /**  */
  lat?: number;

  /**  */
  lon?: number;

  /**  */
  org?: string;

  /**  */
  query?: string;

  /**  */
  region?: string;

  /**  */
  regionName?: string;

  /**  */
  status?: string;

  /**  */
  timezone?: string;

  /**  */
  zip?: string;
}
