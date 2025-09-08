/**
 * @onflow/frw-wallet - TypeScript wallet package based on Flow Wallet Kit iOS
 * 1:1 implementation of iOS Flow Wallet Kit patterns with Trust Wallet Core integration
 */

// Core types - exact match to iOS Flow Wallet Kit (data models only)
export type * from './types/key';
export type * from './types/account';
export type * from './types/wallet';

// Core wallet classes
export { Wallet, WalletFactory } from './wallet';
export { Account, COA } from './account';
export { WalletTypeUtils } from './types/wallet';

// Key implementations - matches iOS Flow Wallet Kit key types
export { SeedPhraseKey } from './keys/seed-phrase-key';
export { PrivateKey } from './keys/private-key';

// Wallet Core integration
export { WalletCoreProvider } from './crypto/wallet-core-provider';

// Core storage implementations (platform-specific ones should be implemented by apps)
export { MemoryStorage } from './storage';

// Re-export key enums and types
export {
  KeyType,
  SignatureAlgorithm,
  HashAlgorithm,
  FlowChainID,
  type FlowAddress,
  type FlowAccount,
  type FlowTransaction,
  type FlowSigner,
  type KeyProtocol,
  type StorageProtocol,
  type SecurityCheckDelegate,
  type KeyData,
} from './types/key';

// Wallet type exports
export { ChainID, type WalletType } from './types/wallet';

// Account type exports
export { FlowVM, type ChildAccount, type FlowVMProtocol } from './types/account';

// Constants
export { BIP44_PATHS } from './types/key';

// Legacy exports for backward compatibility (will be removed)
export type {
  BaseAccountData,
  AccountMetadata,
  FlowAccountData,
  EVMAccountData,
} from './types/account';
