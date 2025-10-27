/**
 * Key management types based on Flow Wallet Kit iOS KeyProtocol
 */

import { Chain } from './chain';

// Re-export from separate files for convenience
export {
  type KeyProtocol,
  type EthereumKeyProtocol,
  type KeyData,
  type SecurityCheckDelegate,
} from './key-protocol';
export { type StorageProtocol } from './storage';

/**
 * Supported key types - exact match to iOS Flow Wallet Kit KeyType.swift
 */
export enum KeyType {
  SeedPhrase = 'seedPhrase',
  PrivateKey = 'privateKey',
  SecureEnclave = 'secureEnclave',
}

/**
 * Cryptographic curve types
 */
export enum CurveType {
  P256 = 'P256',
  SECP256K1 = 'secp256k1',
}

/**
 * Signature algorithm types for Flow
 */
export enum SignatureAlgorithm {
  ECDSA_P256 = 'ECDSA_P256',
  ECDSA_secp256k1 = 'ECDSA_secp256k1',
}

/**
 * Hash algorithm types for Flow
 */
export enum HashAlgorithm {
  SHA2_256 = 'SHA2_256',
  SHA3_256 = 'SHA3_256',
}

/**
 * BIP44 derivation paths
 */
export const BIP44_PATHS = {
  FLOW: "m/44'/539'/0'/0/0",
  EVM: "m/44'/60'/0'/0/0",
} as const;

/**
 * Key derivation parameters
 */
export interface KeyDerivationParams {
  path: string;
  curve: CurveType;
  password?: string;
}

/**
 * Signature parameters for Flow
 */
export interface FlowSignatureParams {
  keyId: number;
  signAlgo: SignatureAlgorithm;
  hashAlgo: HashAlgorithm;
}

/**
 * Account key information from Flow blockchain
 */
export interface AccountKey {
  index: number;
  publicKey: string;
  signAlgo: SignatureAlgorithm;
  hashAlgo: HashAlgorithm;
  weight: number;
  revoked: boolean;
}

/**
 * Key material interface
 */
export interface KeyMaterial {
  publicKey: string;
  privateKey?: string; // undefined for watch-only accounts
  curve: CurveType;
  derivationPath: string;
}

/**
 * Encrypted key data stored in SecureStorage
 */
export interface EncryptedKeyData {
  id: string;
  type: KeyType;
  encryptedMnemonic?: string; // for mnemonic-based wallets
  encryptedPrivateKey?: string; // for private key wallets
  metadata: {
    curve: CurveType;
    createdAt: number;
    name?: string;
  };
}

/**
 * Key validation result
 */
export interface KeyValidationResult {
  valid: boolean;
  error?: string;
  suggestions?: string[];
}

/**
 * Flow chain ID enumeration
 */
export enum FlowChainID {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

/**
 * EVM network types (Flow EVM and other chains)
 */
export enum EVMNetwork {
  FlowMainnet = 'flow-mainnet',
  FlowTestnet = 'flow-testnet',
  Ethereum = 'ethereum',
}

/**
 * Base network interface
 */
export interface BaseNetwork {
  readonly chain: Chain;
  readonly name: string;
  readonly chainId: string | number;
  readonly isTestnet: boolean;
  readonly rpcEndpoint: string;
}

/**
 * Flow network configuration
 */
export interface FlowNetwork extends BaseNetwork {
  readonly chain: Chain.Flow;
  readonly flowChainId: FlowChainID;
  readonly keyIndexerUrl?: string;
}

/**
 * EVM network configuration
 */
export interface EVMNetworkConfig extends BaseNetwork {
  readonly chain: Chain.EVM;
  readonly evmNetwork: EVMNetwork;
  readonly explorerUrl?: string;
}

/**
 * Union type for all supported networks
 */
export type Network = FlowNetwork | EVMNetworkConfig;

/**
 * Pre-configured network instances
 */
export const NETWORKS = {
  FLOW_MAINNET: {
    chain: Chain.Flow,
    name: 'Flow Mainnet',
    chainId: 'flow-mainnet',
    isTestnet: false,
    rpcEndpoint: 'https://rest-mainnet.onflow.org',
    flowChainId: FlowChainID.Mainnet,
    keyIndexerUrl: 'https://production.key-indexer.flow.com',
  } as FlowNetwork,

  FLOW_TESTNET: {
    chain: Chain.Flow,
    name: 'Flow Testnet',
    chainId: 'flow-testnet',
    isTestnet: true,
    rpcEndpoint: 'https://rest-testnet.onflow.org',
    flowChainId: FlowChainID.Testnet,
    keyIndexerUrl: 'https://staging.key-indexer.flow.com',
  } as FlowNetwork,

  FLOW_EVM_MAINNET: {
    chain: Chain.EVM,
    name: 'Flow EVM Mainnet',
    chainId: 747,
    isTestnet: false,
    rpcEndpoint: 'https://mainnet.evm.nodes.onflow.org',
    evmNetwork: EVMNetwork.FlowMainnet,
    explorerUrl: 'https://flowdiver.io',
  } as EVMNetworkConfig,

  FLOW_EVM_TESTNET: {
    chain: Chain.EVM,
    name: 'Flow EVM Testnet',
    chainId: 545,
    isTestnet: true,
    rpcEndpoint: 'https://testnet.evm.nodes.onflow.org',
    evmNetwork: EVMNetwork.FlowTestnet,
    explorerUrl: 'https://testnet.flowdiver.io',
  } as EVMNetworkConfig,

  ETHEREUM: {
    chain: Chain.EVM,
    name: 'Ethereum Mainnet',
    chainId: 1,
    isTestnet: false,
    rpcEndpoint: 'https://eth.llamarpc.com',
    evmNetwork: EVMNetwork.Ethereum,
    explorerUrl: 'https://etherscan.io',
  } as EVMNetworkConfig,
} as const;

/**
 * Flow address type
 */
export type FlowAddress = string;

/**
 * Flow account key from blockchain
 */
export interface FlowAccountKey {
  index: number;
  publicKey: FlowPublicKey;
  signAlgo: SignatureAlgorithm;
  hashAlgo: HashAlgorithm;
  weight: number;
  revoked: boolean;
}

/**
 * Flow public key
 */
export interface FlowPublicKey {
  hex: string;
  signAlgo: SignatureAlgorithm;
}

/**
 * Flow account data from blockchain
 */
export interface FlowAccountData {
  address: FlowAddress;
  balance: number;
  code: string;
  keys: FlowAccountKey[];
  contracts: Record<string, any>;
}

/**
 * Flow transaction for signing
 */
export interface FlowTransaction {
  script: string;
  arguments: any[];
  referenceBlockId: string;
  gasLimit: number;
  proposalKey: {
    address: FlowAddress;
    keyIndex: number;
    sequenceNumber: number;
  };
  payer: FlowAddress;
  authorizers: FlowAddress[];
}

/**
 * Flow signer protocol
 */
export interface FlowSigner {
  readonly address: FlowAddress;
  readonly keyIndex: number;

  sign(signableData: Uint8Array, transaction?: FlowTransaction): Promise<Uint8Array>;
}
