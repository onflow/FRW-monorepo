import type { FlowChainId } from './network-types';

/**
 * Ethereum provider transaction parameters
 * Used for eth_sendTransaction and related RPC methods
 */
export interface TransactionParams {
  from?: string;
  to?: string;
  gas?: string;
  value?: string;
  data?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

/**
 * Web3 wallet permission structure
 * Used for wallet_requestPermissions and wallet_revokePermissions
 */
export interface Web3WalletPermission {
  // The name of the method corresponding to the permission
  parentCapability: string;

  // The date the permission was granted, in UNIX epoch time
  date?: number;
}

/**
 * COA (Contract-Owned Account) ownership proof structure
 * Used for encoding ownership proofs in COA transactions
 */
export interface COAOwnershipProof {
  keyIndices: bigint[];
  address: Uint8Array;
  capabilityPath: string;
  signatures: Uint8Array[];
}

/**
 * EIP-712 type definition
 * Used for structured data signing
 */
export interface EIP712TypeDefinition {
  name: string;
  type: string;
}

/**
 * EIP-712 typed data structure
 * Used for eth_signTypedData and related methods
 */
export interface EIP712TypedData {
  types: Record<string, EIP712TypeDefinition[]>;
  primaryType?: string;
  domain: Record<string, unknown>;
  message: Record<string, unknown>;
}

/**
 * Ethereum connection approval result
 * Returned from the EthConnect approval component
 */
export interface EthConnectApprovalResult {
  defaultChain?: FlowChainId | string;
  signPermission?: boolean;
  evmAddress?: string;
}
