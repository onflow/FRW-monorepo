import { type ExtendedTokenInfo } from './coin-types';
import { type Contact, type FlowNetwork } from './network-types';
import { type NftCollection } from './nft-types';
import { type WalletAddress } from './wallet-types';

// Define the network types
export type AddressType = 'Evm' | 'Cadence' | 'Child';

export type BaseTransactionState = {
  // Network
  network: FlowNetwork;
  // the parent account that owns the account we're sending from (proposer)
  parentAddress: WalletAddress | '';
  // parent Coa - the Coa account of the parent address - needed to check if sending between parent and child
  parentCoaAddress: WalletAddress | '';
  // parent child addresses - the child addresses of the parent address - needed to check if sending between parent and child
  parentChildAddresses: WalletAddress[];

  // the address of the account we're sending from
  fromAddress: WalletAddress | '';
  // the network type of the root address
  fromAddressType: AddressType;
  // the contact of the from address (if it exists)
  fromContact?: Contact;

  // the address of the to address
  toAddress: WalletAddress | '';
  // the network type of the to address
  toAddressType: AddressType;
  // the contact of the to address (if it exists)
  toContact?: Contact;

  // Can the receiver at the to address receive the token?
  canReceive: boolean;

  // the amount of the transaction as a decimal string
  amount: string;

  // the status of the transaction
  status?: 'pending' | 'success' | 'failed';
  // The transaction if of the transaction
  txId?: string;
};

/**
 * ------------------------------------------------------------------------------------------------
 * Fungible Token Transaction State
 * ------------------------------------------------------------------------------------------------
 */

// Define the base token types
export type TokenType = 'FT' | 'Flow';

// Define the transaction direction
export type TransactionStateString = `${TokenType}From${AddressType}To${AddressType}`;

export type TransactionState = BaseTransactionState & {
  // A unique key for the transaction state
  currentTxState: TransactionStateString | '';

  // consolidated token info for the selected token
  tokenInfo: ExtendedTokenInfo;

  // the type of token we're sending
  tokenType: TokenType;

  // the fiat amount of the transaction as a decimal string
  fiatAmount: string;
  // the currency of the fiat amount (note we only support USD for now)
  fiatCurrency: 'USD';
  // what did the user enter the value in - fiat or coin
  fiatOrCoin: 'fiat' | 'coin';
  // whether the balance was exceeded
  balanceExceeded: boolean;
};

/**
 * ------------------------------------------------------------------------------------------------
 * NFT Transaction State
 * ------------------------------------------------------------------------------------------------
 */

// Define the Nft transaction direction
export type NftTransactionStateString = `NftFrom${AddressType}To${AddressType}`;

export type NftTransactionState = BaseTransactionState & {
  // A unique key for the transaction state
  currentTxState: NftTransactionStateString | '';

  // The collection of the Nfts we're sending
  collection: NftCollection;

  // The ids of the Nfts we're sending
  ids: string[];
};

/**
 * ------------------------------------------------------------------------------------------------
 * Activity Item
 * ------------------------------------------------------------------------------------------------
 */
// The activity item type
export interface TransferItem {
  coin: string;
  status: string;
  sender: string;
  receiver: string;
  hash: string;
  time: number;
  interaction: string;
  amount: string;
  error: boolean;
  token: string;
  title: string;
  additionalMessage: string;
  type: number;
  transferType: number;
  image: string;
  // If true, the transaction is indexed
  indexed: boolean;
  // The cadence transaction id
  cadenceTxId?: string;
  // The EVM transaction ids
  evmTxIds?: string[];
}
