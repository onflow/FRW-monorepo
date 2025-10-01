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

export class MetadataService {
  /**
   * Get user address metadata
   */
  static user(
    params: {
      /**  */
      address: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/metadata/user/{address}';
      url = url.replace('{address}', params['address'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Create or update user metadata
   */
  static user1(
    params: {
      /**  */
      address: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/metadata/user/{address}';
      url = url.replace('{address}', params['address'] + '');

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get user metadatas
   */
  static metadatas(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/metadata/user/metadatas';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

export class PayerService {
  /**
   * Sign as bridge fee payer
   */
  static signAsBridgeFeePayer(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/signAsBridgeFeePayer';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Sign as fee payer
   */
  static signAsFeePayer(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/signAsFeePayer';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get payer status
   */
  static status(options: IRequestOptions = {}): Promise<PayerStatusPayloadV1> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v1/payer/status';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

export class AccountService {
  /**
   * Get account transfer history by token types
   */
  static tokenTransfers(
    params: {
      /** The account address to get transfers for */
      address: string;
      /** The number of transactions to return (max 100) */
      limit?: number;
      /** The offset for pagination */
      after?: number;
      /** The token identifier to filter transfers by */
      token: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v1/account/token-transfers';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        address: params['address'],
        limit: params['limit'],
        after: params['after'],
        token: params['token']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get account transfer history
   */
  static transfers(
    params: {
      /** The account address to get transfers for */
      address: string;
      /** The number of transactions to return (max 100) */
      limit?: number;
      /** The offset for pagination */
      after?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v1/account/transfers';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], limit: params['limit'], after: params['after'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Flow accounts associated with a public key
   */
  static keyIndexer(
    params: {
      /** The public key in hex format (with or without 0x prefix) */
      publicKey: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<PublicKeyAccount[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v4/key-indexer/{publicKey}';
      url = url.replace('{publicKey}', params['publicKey'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

export class NftService {
  /**
   * Get a list of NFTs from a specific collection under a FLOW address
   */
  static collectionList(
    params: {
      /** Flow address to get NFTs from */
      address: string;
      /** Collection identifier */
      collectionIdentifier: string;
      /** Number of records to skip */
      offset?: number;
      /** Maximum number of records to return */
      limit?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<NFTListResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v2/nft/collectionList';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        address: params['address'],
        collectionIdentifier: params['collectionIdentifier'],
        offset: params['offset'],
        limit: params['limit']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get a list of ALL the Cadence NFT collections on the Flow network
   */
  static collections(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v2/nft/collections';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get a list of the NFT collections and the ids of the nfts owned in each by an account on the Flow network
   */
  static id(
    params: {
      /** The wallet address to get NFT collections for */
      address: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<NFTCollectionIdsResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v2/nft/id';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get a list of Nfts owned by an account on the Flow network across all collections
   */
  static list(
    params: {
      /** Flow address to get NFTs from */
      address: string;
      /** Number of records to skip */
      offset?: number;
      /** Maximum number of records to return */
      limit?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<NFTListResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v2/nft/list';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], offset: params['offset'], limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
}

export class ScriptsService {
  /**
   * Get the cadence scripts
   */
  static scripts(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v2/scripts';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

export class UserFtTokensService {
  /**
   * V3 ERC20 tokens for  EVM address
   */
  static fts(
    params: {
      /** The EVM address to query */
      address: string;
      /** Pagination offset for fetching next set of results */
      offset?: string;
      /** Number of results to return per page */
      limit?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<ERC20TokenResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v3/evm/{address}/fts';
      url = url.replace('{address}', params['address'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { offset: params['offset'], limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * V4 Flow tokens for a Flow address (with currency)
   */
  static ft(
    params: {
      /** The Flow address (e.g., 0xabcdef1234567890) to query for tokens. */
      address: string;
      /** The Flow network to query (mainnet or testnet). */
      network?: string;
      /** Currency code for price conversion (e.g., USD, EUR). See /api/v4/currencies. */
      currency?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<CadenceFTApiResponseWithCurrencyInData> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v4/cadence/tokens/ft/{address}';
      url = url.replace('{address}', params['address'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { network: params['network'], currency: params['currency'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * V4 ERC20 tokens for an EVM address
   */
  static ft1(
    params: {
      /** The EVM address (with or without 0x prefix) to query for tokens. */
      address: string;
      /** The network to query (mainnet or testnet). */
      network?: string;
      /** The currency code (e.g., USD, EUR, JPY) to return prices in. See /api/v4/currencies for supported codes. */
      currency?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v4/evm/tokens/ft/{address}';
      url = url.replace('{address}', params['address'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { network: params['network'], currency: params['currency'] };

      axios(configs, resolve, reject);
    });
  }
}

export class FlowEvmNftService {
  /**
   * Get a list of NFTs from a specific collection under a EVM address
   */
  static collectionList(
    params: {
      /** Flow-EVM address to get NFTs from */
      address: string;
      /** Collection identifier */
      collectionIdentifier: string;
      /** Offset string of records to skip */
      offset?: string;
      /** Maximum number of records to return */
      limit?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<NFTCollectionListResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v3/evm/nft/collectionList';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        address: params['address'],
        collectionIdentifier: params['collectionIdentifier'],
        offset: params['offset'],
        limit: params['limit']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get a list of EVM NFT collections and ids of NFTs owned in each collection by an account
   */
  static id(
    params: {
      /** The wallet address to fetch collections for */
      address: string;
      /** Pagination cursor for the next set of results */
      offset?: string;
      /** Maximum number of collections to return */
      limit?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<NFTCollectionIdsResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v3/evm/nft/id';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], offset: params['offset'], limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * Get a list of NFTs owned by an account on the EVM network across all collections
   */
  static list(
    params: {
      /** The wallet address to fetch NFTs for */
      address: string;
      /** Pagination cursor for the next set of results */
      offset?: string;
      /** Maximum number of NFTs to return */
      limit?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<NFTListResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v3/evm/nft/list';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { address: params['address'], offset: params['offset'], limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
}

export class FtService {
  /**
   * V3 FT list including automated additions.
   */
  static full(
    params: {
      /** The network to query (e.g., 'mainnet', 'testnet'). Defaults to 'mainnet'. */
      network?: Network;
      /** The chain type (e.g., 'flow', 'evm'). Defaults to 'flow'. */
      chainType?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<FTList> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v3/fts/full';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { network: params['network'], chain_type: params['chainType'] };

      axios(configs, resolve, reject);
    });
  }
}

export class CurrenciesService {
  /**
   * Get a list of supported currencies
   */
  static currencies(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v4/currencies';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

export class FlowEvmTokensService {
  /**
   * Lookup EVM token data with price information
   */
  static lookup(
    params: {
      /** The currency code (e.g., USD, EUR, JPY) to return prices in. See /api/v4/currencies for supported codes. */
      currency?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v4/evm/tokens/ft/lookup';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);
      configs.params = { currency: params['currency'] };

      axios(configs, resolve, reject);
    });
  }
}

export class PricesService {
  /**
   * Get token prices
   */
  static prices(
    params: {
      /** Currency code to convert prices to (e.g., USD, EUR, JPY) */
      currency?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/v4/prices';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { currency: params['currency'] };

      axios(configs, resolve, reject);
    });
  }
}

/** Storage details for the Flow account. */
export interface CadenceStorageInfo {
  /** Storage used in MB. */
  storageUsedInMB?: string;

  /** Storage available based on unlocked FLOW balance. */
  storageAvailableInMB?: string;

  /** Total storage capacity allocated. */
  storageCapacityInMB?: string;

  /** Amount of FLOW locked for storage. */
  lockedFLOWforStorage?: string;

  /** Available FLOW balance that could be used for storage. */
  availableBalanceToUse?: string;
}

/** Represents a fungible token vault with pricing and currency conversion. */
export interface CadenceTokenDataWithCurrency {
  /** Token name from metadata (can be null). */
  name?: string;

  /** Token symbol from metadata (can be null). */
  symbol?: string;

  /** Token description from metadata (can be null). */
  description?: string;

  /** Logo media information (structure based on common return types). */
  logos?: object;

  /** A dictionary of social media links (structure based on common return types). */
  socials?: object;

  /** Token balance formatted for display (shifted by decimals). */
  displayBalance?: string;

  /** The contract address where the token is defined. */
  contractAddress?: string;

  /** The name of the contract defining the token. */
  contractName?: string;

  /** The storage path for the vault. */
  storagePath?: object;

  /** The public receiver path for the vault. */
  receiverPath?: object;

  /** The public balance path for the vault. */
  balancePath?: object;

  /** The full type identifier of the vault. */
  identifier?: string;

  /** The logo URI for the token. Prefers the verified list logo, falls back to the first logo in metadata. */
  logoURI?: string;

  /** Whether the token is part of the default Flow list. */
  isVerified?: boolean;

  /** Price of the token in USD (mainnet only, empty string if unavailable). */
  priceInUSD?: string;

  /** Value of the balance in USD (mainnet only, empty string if unavailable). */
  balanceInUSD?: string;

  /** Price of the token in FLOW (mainnet only, empty string if unavailable). */
  priceInFLOW?: string;

  /** Value of the balance in FLOW (mainnet only, empty string if unavailable). */
  balanceInFLOW?: string;

  /** The currency code used for converted price\/balance for this token. */
  currency?: string;

  /** Price in the requested currency (empty string if unavailable or conversion failed). */
  priceInCurrency?: string;

  /** Value of the balance in the requested currency (empty string if unavailable or conversion failed). */
  balanceInCurrency?: string;

  /** The EVM address associated with this token (if available) empty string if no evm address. */
  evmAddress?: string;
}

/** Structure of the successful API response. */
export interface CadenceFTApiResponseWithCurrencyInData {
  /**  */
  data?: object;
}

/** Structure of the successful API response. */
export interface CadenceFTApiResponseWithCurrency {
  /** Array of token data with currency conversion. */
  result?: CadenceTokenDataWithCurrency[];

  /**  */
  storage?: CadenceStorageInfo;

  /** Error message if request failed. */
  error?: string;
}

/** PublicKeyAccount */
export interface PublicKeyAccount {
  /** The address of the account */
  address: string;

  /** The public key associated with the account (matches the query parameter) */
  publicKey: string;

  /** The index of the key in the account */
  keyIndex: number;

  /** The weight of the key */
  weight: number;

  /** The signature algorithm code */
  signAlgo: number;

  /** The signature algorithm name */
  signAlgoString: string;

  /** The hash algorithm code */
  hashAlgo: number;

  /** The hash algorithm name */
  hashAlgoString: string;
}

/** Account */
export interface Account {
  /** The Flow account address */
  address?: string;

  /** The ID of the key on the account */
  keyId?: number;

  /** The weight of the key for multi-sig */
  weight?: number;

  /** The signature algorithm ID */
  sigAlgo?: number;

  /** The hash algorithm ID */
  hashAlgo?: number;

  /** Whether the key has been revoked */
  isRevoked?: boolean;

  /** The signing algorithm name */
  signing?: string;

  /** The hashing algorithm name */
  hashing?: string;
}

/** KeyIndexerData */
export interface KeyIndexerData {
  /** The public key in hex format */
  publicKey?: string;

  /**  */
  accounts?: Account[];
}

/** KeyIndexerResponse */
export interface KeyIndexerResponse {
  /**  */
  data?: KeyIndexerData;

  /** HTTP status code */
  status?: number;

  /** Error message if applicable */
  error?: string;
}

/** QueryRequest */
export interface QueryRequest {
  /** address of the account */
  address?: string;

  /** the number of transactions to return */
  limit?: number;

  /** the number of transactions to skip */
  offset?: number;
}

/** TransactionReturnContentV2 */
export interface TransactionReturnContentV2 {
  /** the image url of the transaction */
  image?: string;

  /** the time of the transaction */
  time?: string;

  /** the type of the transaction */
  type?: number;

  /** the title of the transaction */
  title?: string;

  /** the status of the transaction */
  status?: string;

  /** whether the transaction is successful */
  error?: boolean;

  /** the transaction id */
  txid?: string;

  /** the amount of the transaction */
  amount?: string;

  /** the type of the transaction */
  transfer_type?: number;

  /** the receiver of the transaction */
  receiver?: string;

  /** the sender of the transaction */
  sender?: string;

  /** the token of the transaction */
  token?: string;

  /** the additional message of the transaction */
  additional_message?: string;
}

/** TransactionReturnV2 */
export interface TransactionReturnV2 {
  /** the total number of transactions */
  total?: number;

  /**  */
  transactions?: TransactionReturnContentV2[];

  /** whether there is a next page */
  next?: boolean;

  /** the next page url */
  string?: string;
}

/** NFTCollection */
export interface NFTCollection {
  /** Name of the contract */
  contractName?: string;

  /** the logo url of the NFT collection */
  logoURI?: string;

  /** Unique identifier for the collection */
  id?: string;

  /** Flow address of the collection */
  address?: string;

  /** Alternative name of the contract */
  contract_name?: string;

  /** EVM address of the collection */
  evmAddress?: string;

  /** Display name of the collection */
  name?: string;

  /** URL to the collection logo */
  logo?: string;

  /** URL to the collection banner */
  banner?: string;

  /** Description of the collection */
  description?: string;

  /** Flow identifier for the collection */
  flowIdentifier?: string;

  /** External URL for the collection (optional) */
  externalURL?: string;

  /** Type of the contract ERC721 \/ ERC1155 */
  contractType?: string;

  /** Media information for the NFT */
  path?: NFTPath;
}

/** FTListItem */
export interface FTListItem {
  /** the name of the FT */
  contractName?: string;

  /** the logo url of the FT */
  logoURI?: string;
}

/** TransferListErrorResponse */
export interface TransferListErrorResponse {
  /** the status of the response */
  status: number;

  /** the message of the response */
  message?: string;
}

/** Response */
export interface Response {
  /** Response data payload */
  data: CurrencyEVMTokenData[];

  /** HTTP status code */
  status: number;

  /** Optional message, typically used for errors. */
  message?: string;
}

/** FungibleToken */
export interface FungibleToken {
  /** The chain ID of the token */
  chainId: number;

  /** The contract address of the token */
  address: string;

  /** The symbol of the token */
  symbol: string;

  /** The name of the token */
  name: string;

  /** The number of decimals for the token */
  decimals: number;

  /** The URI for the token logo */
  logoURI?: string;

  /** The Flow blockchain identifier for the token */
  flowIdentifier?: string;

  /** Tags associated with the token */
  tags?: string[];

  /**  */
  extensions?: object;
}

/** CurrencyEVMTokenData */
export interface CurrencyEVMTokenData {
  /** The chain ID where the token resides. */
  chainId: number;

  /** The contract address of the token. */
  address: string;

  /** The token symbol. */
  symbol: string;

  /** The token name. */
  name: string;

  /** The number of decimals the token uses. */
  decimals: number;

  /** URI for the token logo. */
  logoURI?: string;

  /** Corresponding Flow identifier if applicable. */
  flowIdentifier?: string;

  /** The token balance held by the address, adjusted for decimals. */
  balance: string;

  /** The price of the token in USD. */
  priceInUSD: string;

  /** The value of the balance in USD. */
  balanceInUSD: string;

  /** The price of the token in FLOW. */
  priceInFLOW: string;

  /** The value of the balance in FLOW. */
  balanceInFLOW: string;

  /** The currency code used for priceInCurrency and balanceInCurrency. */
  currency: string;

  /** The price of the token in the requested currency (if different from USD). */
  priceInCurrency: string;

  /** The value of the balance in the requested currency (if different from USD). */
  balanceInCurrency: string;
}

/** ERC20Token */
export interface ERC20Token {
  /** The chain ID of the blockchain network */
  chainId?: number;

  /** The contract address of the token */
  address?: string;

  /** The token symbol */
  symbol?: string;

  /** The token name */
  name?: string;

  /** The number of decimals for the token */
  decimals?: number;

  /** URI for the token logo */
  logoURI?: string;

  /** The token balance as a string (to handle large numbers) */
  balance?: string;
}

/** ERC20TokenResponse */
export interface ERC20TokenResponse {
  /**  */
  data?: ERC20Token[];

  /** HTTP status code */
  status?: number;
}

/** TokenPath */
export interface TokenPath {
  /** Path to the vault resource. */
  vault: string;

  /** Path to the receiver resource. */
  receiver: string;

  /** Path to the balance resource. */
  balance: string;
}

/** Additional token extension properties. */
export interface TokenExtensions {
  /**  */
  [additionalProperties: string]: string;
}

/** Token */
export interface Token {
  /** The chain ID of the token. */
  chainId: number;

  /** The contract address of the token. */
  address: string;

  /** The name of the token contract. */
  contractName?: string;

  /**  */
  path?: TokenPath;

  /** The EVM compatible address, if applicable. */
  evmAddress?: string;

  /** The Flow address, if applicable. */
  flowAddress?: string;

  /** The symbol of the token (e.g., "FLOW"). */
  symbol: string;

  /** The name of the token (e.g., "Flow Token"). */
  name: string;

  /** A brief description of the token. */
  description?: string;

  /** The number of decimal places the token uses. */
  decimals: number;

  /** The URI of the token's logo. */
  logoURI: string;

  /** A list of tags associated with the token. */
  tags: string[];

  /**  */
  extensions?: TokenExtensions;

  /** The unique Flow identifier for the token. */
  flowIdentifier?: string;

  /** The official website URL of the token. */
  website?: string;
}

/** TokenListTag */
export interface TokenListTag {
  /** The name of the tag. */
  name: string;

  /** A description of the tag. */
  description: string;
}

/** TokenListVersion */
export interface TokenListVersion {
  /**  */
  major: number;

  /**  */
  minor: number;

  /**  */
  patch: number;
}

/** FTList */
export interface FTList {
  /** The name of the token list. */
  name: string;

  /** The network the token list is associated with. */
  network?: string;

  /** The chain ID the token list is associated with. */
  chainId?: number;

  /** The list of tokens. */
  tokens: Token[];

  /** The total number of tokens in the list. */
  totalAmount: number;

  /** The type used for filtering the list. */
  filterType?: string;

  /** The timestamp when the list was generated. */
  timestamp: Date;

  /** The URI of the list's logo. */
  logoURI: string;

  /** Keywords associated with the list. */
  keywords: string[];

  /** Tags associated with the list. */
  tags: object;

  /**  */
  version?: TokenListVersion;
}

/** NFTPostMedia */
export interface NFTPostMedia {
  /** URL to the NFT image */
  image?: string;

  /** Indicates if the image is an SVG */
  isSvg?: boolean;

  /** Description of the NFT */
  description?: string;

  /** Title of the NFT */
  title?: string;
}

/** NFTPath */
export interface NFTPath {
  /** Storage path */
  storage_path?: string;

  /** Public path */
  public_path?: string;

  /** Deprecated path */
  private_path?: string;
}

/** NFT */
export interface NFT {
  /** Unique identifier for the NFT */
  id?: string;

  /** Name of the NFT */
  name?: string;

  /** Description of the NFT */
  description?: string;

  /** URL to the NFT thumbnail */
  thumbnail?: string;

  /** External URL for the NFT */
  externalURL?: string;

  /** Name of the collection */
  collectionName?: string;

  /** Contract name of the collection */
  collectionContractName?: string;

  /** Flow contract address */
  contractAddress?: string;

  /** EVM contract address */
  evmAddress?: string;

  /** Flow address */
  address?: string;

  /** Name of the contract */
  contractName?: string;

  /** Description of the collection */
  collectionDescription?: string;

  /** URL to the collection square image */
  collectionSquareImage?: string;

  /** URL to the collection banner image */
  collectionBannerImage?: string;

  /** External URL for the collection */
  collectionExternalURL?: string;

  /** Flow identifier */
  flowIdentifier?: string;

  /** Media information for the NFT */
  postMedia?: NFTPostMedia;

  /** Type of the contract ERC721 \/ ERC1155 */
  contractType?: string;

  /** Amount of the NFT */
  amount?: string;
}

/** NFTCollectionListData */
export interface NFTCollectionListData {
  /** Pagination offset for the next set of results */
  offset?: string;

  /** Array of NFTs in the collection */
  nfts?: NFT[];

  /** Total number of NFTs in the response */
  nftCount?: number;

  /** Information about the NFT collection */
  collection?: NFTCollection;
}

/** NFTCollectionListResponse */
export interface NFTCollectionListResponse {
  /** NFT collection list data */
  data?: NFTCollectionListData;

  /** HTTP status code */
  status?: number;
}

/** CollectionDisplay */
export interface CollectionDisplay {
  /** Name of the collection */
  name?: string;

  /** Description of the collection */
  description?: string;

  /**  */
  externalURL?: object;

  /**  */
  squareImage?: object;
}

/** NFTCollectionDetailData */
export interface NFTCollectionDetailData {
  /** Unique identifier for the collection */
  id?: string;

  /** Path for the collection */
  path?: string;

  /** Display information for the collection */
  collectionDisplay?: CollectionDisplay;
}

/** NFTCollectionDetailResponse */
export interface NFTCollectionDetailResponse {
  /** NFT collection detail data */
  data?: NFTCollectionDetailData;

  /** HTTP status code */
  status?: number;
}

/** NFTCollectionData */
export interface NFTCollectionData {
  /** Collection information */
  collection?: NFTCollection;

  /** Array of NFT IDs in the collection */
  ids?: string[];

  /** Total number of NFTs in the collection */
  count?: number;
}

/** NFTCollectionIdsResponse */
export interface NFTCollectionIdsResponse {
  /** Array of NFT collection data */
  data?: NFTCollectionData[];

  /** HTTP status code */
  status?: number;
}

/** NFTListData */
export interface NFTListData {
  /** Pagination offset for the next set of results */
  offset?: string;

  /** Array of NFTs */
  nfts?: NFT[];

  /** Total number of NFTs in the response */
  nftCount?: number;
}

/** NFTListResponse */
export interface NFTListResponse {
  /** NFT list data */
  data?: NFTListData;

  /** HTTP status code */
  status?: number;
}

/** ApiResponse */
export interface ApiResponse {
  /**  */
  status: number;

  /**  */
  data: object;

  /**  */
  message?: string;
}

/** PayerInfoV1 */
export interface PayerInfoV1 {
  /**  */
  available: boolean;

  /** Flow address, hex with 0x prefix */
  address?: string;

  /** signing key index */
  keyIndex?: number;
}

/** SurgeInfoV1 */
export interface SurgeInfoV1 {
  /**  */
  active: boolean;

  /**  */
  multiplier?: number;

  /** timestamp */
  expiresAt?: number;

  /**  */
  ttlSeconds?: number;

  /** timestamp */
  sampledAt?: number;

  /** max fee with surge factor */
  maxFee?: number;
}

/** PayerStatusPayloadV1 */
export interface PayerStatusPayloadV1 {
  /**  */
  statusVersion: IPayerStatusPayloadV1StatusVersion;

  /**  */
  surge: SurgeInfoV1;

  /**  */
  feePayer: PayerInfoV1;

  /**  */
  bridgePayer: PayerInfoV1;

  /** timestamp */
  updatedAt: number;

  /**  */
  reason?: string;
}

/** PayerStatusApiResponseV1 */
export interface PayerStatusApiResponseV1 {
  /** HTTP status code */
  status: IPayerStatusApiResponseV1Status;

  /**  */
  data: PayerStatusPayloadV1;

  /** Optional message for API response */
  message?: string;
}
export enum Network {
  'mainnet' = 'mainnet',
  'testnet' = 'testnet'
}
type IPayerStatusPayloadV1StatusVersion = 1;
type IPayerStatusApiResponseV1Status = 200 | 429 | 500 | 503;
