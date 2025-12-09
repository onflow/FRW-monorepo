// packages/types/src/errors.ts
export enum ErrorCode {
  // Bridge errors (BRIDGE-XX)
  BRIDGE_NOT_FOUND = 'BRIDGE-01',

  // Transaction errors (TXN-XX)
  TRANSACTION_ERROR = 'TXN-01',

  // Account errors (ACCOUNT-XX)
  ACCESSIBLE_ASSET_FETCH_FAILED = 'ACCOUNT-01',
  ACCOUNT_INFO_FETCH_FAILED = 'ACCOUNT-02',
  ACCOUNT_REGISTRATION_FAILED = 'ACCOUNT-03',
  ACCOUNT_FIREBASE_AUTH_FAILED = 'ACCOUNT-04',
  ACCOUNT_MNEMONIC_SAVE_FAILED = 'ACCOUNT-05',
  ACCOUNT_CREATION_MISSING_DATA = 'ACCOUNT-06',
  ACCOUNT_FLOW_ADDRESS_CREATION_FAILED = 'ACCOUNT-07',

  // AddressBook errors (ADDR-XX)
  ADDRESSBOOK_FETCH_FAILED = 'ADDR-01',

  // Flow service errors (FLOW-XX)
  FLOW_SERVICE_NOT_INITIALIZED = 'FLOW-01',
  FLOW_BALANCE_NOT_FOUND = 'FLOW-02',
  FLOW_BALANCE_FETCH_FAILED = 'FLOW-03',
  FLOW_METHOD_NOT_IMPLEMENTED = 'FLOW-04',

  // NFT service errors (NFT-XX)
  NFT_COLLECTION_PATH_NOT_FOUND = 'NFT-01',
  NFT_COLLECTIONS_FETCH_FAILED = 'NFT-02',
  NFT_FETCH_FAILED = 'NFT-03',
  NFT_INVALID_PARAMETERS = 'NFT-04',

  // Recent recipients service errors (RECIP-XX)
  RECENT_RECIPIENTS_STORAGE_NOT_FOUND = 'RECIP-01',
  RECENT_RECIPIENTS_FETCH_FAILED = 'RECIP-02',
  RECENT_RECIPIENTS_LOCAL_FETCH_FAILED = 'RECIP-03',
  RECENT_RECIPIENTS_SERVER_FETCH_FAILED = 'RECIP-04',
  RECENT_RECIPIENTS_ADD_FAILED = 'RECIP-05',
  RECENT_RECIPIENTS_CLEAR_FAILED = 'RECIP-06',

  // Token service errors (TOKEN-XX)
  TOKEN_FLOW_FETCH_FAILED = 'TOKEN-01',
  TOKEN_ERC20_FETCH_FAILED = 'TOKEN-02',
  TOKEN_INFO_FETCH_FAILED = 'TOKEN-03',

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
