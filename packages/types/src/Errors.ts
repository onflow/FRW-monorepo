// packages/types/src/errors.ts
export enum ErrorCode {
  BRIDGE_NOT_FOUND = 'bridge-not-found',

  // AddressBook errors
  ADDRESSBOOK_FETCH_FAILED = 'addressbook-fetch-failed',

  // FlowService errors
  FLOW_SERVICE_NOT_INITIALIZED = 'flow-service-not-initialized',
  FLOW_BALANCE_NOT_FOUND = 'flow-balance-not-found',
  FLOW_BALANCE_FETCH_FAILED = 'flow-balance-fetch-failed',
  FLOW_METHOD_NOT_IMPLEMENTED = 'flow-method-not-implemented',

  // NFTService errors
  NFT_COLLECTION_PATH_NOT_FOUND = 'nft-collection-path-not-found',
  NFT_COLLECTIONS_FETCH_FAILED = 'nft-collections-fetch-failed',
  NFT_FETCH_FAILED = 'nft-fetch-failed',
  NFT_INVALID_PARAMETERS = 'nft-invalid-parameters',

  // RecentRecipientsService errors
  RECENT_RECIPIENTS_STORAGE_NOT_FOUND = 'recent-recipients-storage-not-found',
  RECENT_RECIPIENTS_FETCH_FAILED = 'recent-recipients-fetch-failed',
  RECENT_RECIPIENTS_LOCAL_FETCH_FAILED = 'recent-recipients-local-fetch-failed',
  RECENT_RECIPIENTS_SERVER_FETCH_FAILED = 'recent-recipients-server-fetch-failed',
  RECENT_RECIPIENTS_ADD_FAILED = 'recent-recipients-add-failed',
  RECENT_RECIPIENTS_CLEAR_FAILED = 'recent-recipients-clear-failed',

  // TokenService errors
  TOKEN_FLOW_FETCH_FAILED = 'token-flow-fetch-failed',
  TOKEN_ERC20_FETCH_FAILED = 'token-erc20-fetch-failed',
  TOKEN_INFO_FETCH_FAILED = 'token-info-fetch-failed',

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
