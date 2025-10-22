/**
 * @onflow/frw-wallet - TypeScript wallet package based on Flow Wallet Kit iOS
 * 1:1 implementation of iOS Flow Wallet Kit patterns with Trust Wallet Core integration
 */

// Core types - exact match to iOS Flow Wallet Kit (data models only)
export type * from './types/key';
export type * from './types/key-protocol';
export type * from './types/storage';
export type * from './types/account';
export type * from './types/wallet';
export type * from './types/chain';

// Core wallet classes
export {
  Wallet,
  WalletFactory,
  WalletTypeUtils,
  WalletUtils,
  type AccountsListener,
  type LoadingListener,
} from './wallet';
export { Account, COA } from './account';

// Key implementations - matches iOS Flow Wallet Kit key types
export { SeedPhraseKey } from './keys/seed-phrase-key';
export { PrivateKey } from './keys/private-key';

// Wallet Core integration
export { WalletCoreProvider } from './crypto/wallet-core-provider';

// Ethereum services
export {
  EthProvider,
  EthRpcError,
  type EthCallRequest,
  type EthBlockTag,
} from './services/eth-provider';
export {
  EthSigner,
  type EthUnsignedTransaction,
  type EthSignedTransaction,
  type EthLegacyTransaction,
  type EthEIP1559Transaction,
  type EthAccessListEntry,
  type EthSignedMessage,
  type HexLike,
} from './services/eth-signer';

// Core storage implementations (platform-specific ones should be implemented by apps)
export { MemoryStorage } from './storage';

// Re-export key enums and types
export {
  KeyType,
  SignatureAlgorithm,
  HashAlgorithm,
  FlowChainID,
  type FlowAddress,
  type FlowAccountData,
  type FlowTransaction,
  type FlowSigner,
  type KeyProtocol,
  type StorageProtocol,
  type SecurityCheckDelegate,
  type KeyData,
} from './types/key';

// Chain types
export { Chain, ChainUtils } from './types/chain';

// Wallet type exports
export { ChainID, type WalletType } from './types/wallet';

// Account type exports
export {
  FlowVM,
  type BaseAccount,
  type FlowAccount,
  type EVMAccount,
  type ChildAccount,
  type FlowVMProtocol,
} from './types/account';

// Constants
export { BIP44_PATHS } from './types/key';
