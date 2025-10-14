// packages/types/src/errors.ts
export enum ErrorCode {
  BRIDGE_NOT_FOUND = 'bridgeNotFound',
  TRANSACTION_ERROR = 'transactionError',

  // Child account errors
  ACCESSIBLE_ASSET_FETCH_FAILED = 'accessibleAssetFetchFailed',
  ACCOUNT_INFO_FETCH_FAILED = 'accountInfoFetchFailed',

  // AddressBook errors
  ADDRESSBOOK_FETCH_FAILED = 'addressbookFetchFailed',

  // FlowService errors
  FLOW_SERVICE_NOT_INITIALIZED = 'flowServiceNotInitialized',
  FLOW_BALANCE_NOT_FOUND = 'flowBalanceNotFound',
  FLOW_BALANCE_FETCH_FAILED = 'flowBalanceFetchFailed',
  FLOW_METHOD_NOT_IMPLEMENTED = 'flowMethodNotImplemented',

  // NFTService errors
  NFT_COLLECTION_PATH_NOT_FOUND = 'nftCollectionPathNotFound',
  NFT_COLLECTIONS_FETCH_FAILED = 'nftCollectionsFetchFailed',
  NFT_FETCH_FAILED = 'nftFetchFailed',
  NFT_INVALID_PARAMETERS = 'nftInvalidParameters',

  // RecentRecipientsService errors
  RECENT_RECIPIENTS_STORAGE_NOT_FOUND = 'recentRecipientsStorageNotFound',
  RECENT_RECIPIENTS_FETCH_FAILED = 'recentRecipientsFetchFailed',
  RECENT_RECIPIENTS_LOCAL_FETCH_FAILED = 'recentRecipientsLocalFetchFailed',
  RECENT_RECIPIENTS_SERVER_FETCH_FAILED = 'recentRecipientsServerFetchFailed',
  RECENT_RECIPIENTS_ADD_FAILED = 'recentRecipientsAddFailed',
  RECENT_RECIPIENTS_CLEAR_FAILED = 'recentRecipientsClearFailed',

  // TokenService errors
  TOKEN_FLOW_FETCH_FAILED = 'tokenFlowFetchFailed',
  TOKEN_ERC20_FETCH_FAILED = 'tokenErc20FetchFailed',
  TOKEN_INFO_FETCH_FAILED = 'tokenInfoFetchFailed',

  // add more error codes here
}

export interface FRWErrorData {
  code: ErrorCode;
  message: string;
  details?: any;
}

export class FRWError extends Error implements FRWErrorData {
  public readonly code: ErrorCode;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'FRWError';
    this.code = code;
    this.details = details;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, FRWError);
    }
  }
}
