import type { FlowChainId } from './network-types';

/**
 * EIP-1193 RequestArguments interface
 * Standard structure for Ethereum provider requests
 */
export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

/**
 * Provider request structure
 * Wraps EIP-1193 request arguments with session information
 * Used throughout the provider controller
 */
export interface ProviderRequest {
  data: RequestArguments;
  session: {
    origin: string;
    name: string;
    icon: string;
  };
}

/**
 * Flow context structure
 * Used in the RPC flow middleware to track request state
 */
export interface FlowContext {
  request: ProviderRequest & {
    requestedApproval?: boolean;
  };
  mapMethod?: string;
  approvalRes?: unknown;
}

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
 * Permission structure for wallet_getPermissions
 * EIP-2255: Permission
 */
export interface Permission {
  // URI identifying the dapp
  invoker: string;
  // The name of the method corresponding to the permission
  parentCapability: string;
  // Optional restrictions
  caveats?: unknown[];
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
