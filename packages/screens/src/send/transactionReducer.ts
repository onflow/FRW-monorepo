// Transaction state management for send flow
export interface TransactionState {
  // Network and addresses
  network: string;
  parentAddress: string;
  parentCoaAddress?: string;
  parentChildAddresses: string[];
  fromAddress: string;
  fromAddressType: 'Cadence' | 'Evm' | 'Child';
  toAddress: string;
  toAddressType: 'Cadence' | 'Evm';

  // Contacts
  fromContact?: unknown;
  toContact?: unknown;

  // Token information
  tokenInfo: unknown;
  tokenType: 'Flow' | 'FT' | 'NFT';

  // Amount and pricing
  amount: string;
  fiatAmount: string;
  fiatOrCoin: 'fiat' | 'coin';

  // Transaction details
  fee?: string;
  gasLimit?: number;
  gasPrice?: string;

  // UI state
  isLoading: boolean;
  error?: string;
}

export const INITIAL_TRANSACTION_STATE: TransactionState = {
  network: 'mainnet',
  parentAddress: '',
  parentChildAddresses: [],
  fromAddress: '',
  fromAddressType: 'Cadence',
  toAddress: '',
  toAddressType: 'Cadence',
  tokenInfo: null,
  tokenType: 'Flow',
  amount: '',
  fiatAmount: '',
  fiatOrCoin: 'coin',
  isLoading: false,
};

export type TransactionAction =
  | { type: 'initTransactionState'; payload: Partial<TransactionState> }
  | { type: 'setFromAddress'; payload: Partial<TransactionState> }
  | { type: 'setToAddress'; payload: { address: string; contact?: unknown } }
  | { type: 'setTokenInfo'; payload: { tokenInfo: unknown } }
  | { type: 'setAmount'; payload: string }
  | { type: 'setFiatAmount'; payload: string }
  | { type: 'setFiatOrCoin'; payload: 'fiat' | 'coin' }
  | { type: 'switchFiatOrCoin' }
  | { type: 'setAmountToMax' }
  | { type: 'setLoading'; payload: boolean }
  | { type: 'setError'; payload: string | undefined }
  | { type: 'reset' };

export function transactionReducer(
  state: TransactionState,
  action: TransactionAction
): TransactionState {
  switch (action.type) {
    case 'initTransactionState':
    case 'setFromAddress':
      return {
        ...state,
        ...action.payload,
      };

    case 'setToAddress': {
      const { address, contact } = action.payload;
      const toAddressType = address.startsWith('0x') ? 'Cadence' : 'Evm';
      return {
        ...state,
        toAddress: address,
        toAddressType,
        toContact: contact,
      };
    }

    case 'setTokenInfo': {
      const tokenType =
        (action.payload.tokenInfo as any)?.symbol?.toLowerCase() !== 'flow' ? 'FT' : 'Flow';
      return {
        ...state,
        tokenInfo: action.payload.tokenInfo,
        tokenType,
      };
    }

    case 'setAmount':
      return {
        ...state,
        amount: action.payload,
      };

    case 'setFiatAmount':
      return {
        ...state,
        fiatAmount: action.payload,
      };

    case 'setFiatOrCoin':
      return {
        ...state,
        fiatOrCoin: action.payload,
      };

    case 'switchFiatOrCoin':
      return {
        ...state,
        fiatOrCoin: state.fiatOrCoin === 'fiat' ? 'coin' : 'fiat',
      };

    case 'setAmountToMax': {
      const maxAmount =
        (state.tokenInfo as any)?.availableBalance || (state.tokenInfo as any)?.balance || '0';
      return {
        ...state,
        amount: maxAmount,
      };
    }

    case 'setLoading':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'setError':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'reset':
      return INITIAL_TRANSACTION_STATE;

    default:
      return state;
  }
}
