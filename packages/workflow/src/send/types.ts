/**
 * Payload interface for sending tokens or NFTs across Flow and EVM networks
 */
import { type TransactionSession } from '@onflow/frw-analytics';
export interface SendPayload {
  type: 'token' | 'nft'; // Asset type: token or NFT
  assetType: 'flow' | 'evm'; // Network type: Flow blockchain or EVM chain
  proposer: string; // Flow address of the transaction proposer/signer
  receiver: string; // Recipient address (Flow or EVM format)
  flowIdentifier: string; // Flow resource identifier (e.g., vault path)
  sender: string; // Sender address (Flow or EVM format)
  childAddrs: string[]; // Child account addresses if user has child accounts
  ids: number[]; // NFT token IDs (for NFT transfers)
  amount: string; // Token amount to transfer
  decimal: number; // Token decimal places
  coaAddr: string; // User's COA (Cadence Owned Account) address
  // Required: true when sender and receiver are different VM types (Flow <-> EVM).
  isCrossVM: boolean;
  tokenContractAddr: string; // Token contract address (Flow or EVM format)
}

/**
 * Strategy interface for transfer operations
 */
export type EthSignFn = (signData: Uint8Array) => Promise<Uint8Array>;

/** Send signed RLP hex to EVM RPC (eth_sendRawTransaction). When set, EOA EVM strategies use this instead of Cadence eoaCallContract. */
export type SendRawEvmTxFn = (signedTxHex: string) => Promise<string>;

export interface TransferExecutionHelpers {
  ethSign?: EthSignFn;
  /** When provided, EOA EVM transactions are sent via RLP to EVM RPC instead of through Cadence. */
  sendRawEvmTransaction?: SendRawEvmTxFn;
  network?: 'mainnet' | 'testnet' | string;
  gasPrice?: number | string | bigint;
  session?: TransactionSession;
}

export interface TransferStrategy {
  canHandle(payload: SendPayload): boolean;
  execute(payload: SendPayload, helpers?: TransferExecutionHelpers): Promise<any>;
}
