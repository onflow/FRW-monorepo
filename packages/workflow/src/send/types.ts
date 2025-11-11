/**
 * Payload interface for sending tokens or NFTs across Flow and EVM networks
 */
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
  tokenContractAddr: string; // Token contract address (Flow or EVM format)
}

/**
 * Strategy interface for transfer operations
 */
export type EthSignFn = (signData: Uint8Array) => Promise<Uint8Array>;

export interface TransferExecutionHelpers {
  ethSign?: EthSignFn;
  network?: 'mainnet' | 'testnet' | string;
  gasPrice?: number | string | bigint;
}

export interface TransferStrategy {
  canHandle(payload: SendPayload): boolean;
  execute(payload: SendPayload, helpers?: TransferExecutionHelpers): Promise<any>;
}
