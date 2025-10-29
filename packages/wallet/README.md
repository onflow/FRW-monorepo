# @onflow/frw-wallet

TypeScript wallet package for private key-based multi-account management, based
on [Flow Wallet Kit iOS](https://github.com/onflow/flow-wallet-kit) reference
implementation.

## Overview

This package provides a comprehensive wallet implementation following the MVVM
architecture pattern from the iOS Flow Wallet Kit. It supports both Flow
blockchain and EVM-compatible chains with secure key management, account
derivation, and transaction signing capabilities.

## Architecture

```
UID → SecureStorage → Wallet [FlowAccount[], EVMAccount[]] → Selected Account State
        ↓                    ↓
   Cache Storage      TrustWallet Core WASM
```

### Core Components

- **SecureStorage**: Encrypted storage for sensitive key material
- **CacheStorage**: High-performance cache for account metadata
- **BaseAccount**: Abstract base class for all account types
- **FlowAccount**: Flow blockchain-specific account implementation
- **EVMAccount**: EVM-compatible blockchain account implementation
- **Wallet**: Main wallet management class

## Features

### ✅ Implemented

- **Wallet Management**
  - Create wallets from mnemonic or private key
  - Import/export wallet functionality
  - Password-protected wallet encryption
  - Wallet backup and restore

- **Account Management**
  - Multi-account support (Flow + EVM chains)
  - Watch-only account support
  - Account derivation using BIP44 paths
  - Account metadata caching

- **Storage Layer**
  - Secure encrypted key storage
  - Platform-agnostic cache storage
  - Mock implementations for testing

- **Type Safety**
  - Full TypeScript support
  - Comprehensive error handling
  - Strongly typed interfaces

- **Testing**
  - Unit tests with Vitest
  - Mock storage implementations
  - Comprehensive test coverage

### 🚧 In Progress

- **TrustWallet Core Integration**
  - Key derivation implementation
  - Transaction signing
  - Mnemonic generation and validation

### 📋 Planned

- **Flow-Specific Features**
  - COA (Cadence Owned Account) support
  - Child account management
  - Flow transaction signing

- **EVM Features**
  - Multi-network support
  - Token balance queries
  - EIP-712 typed data signing

- **Advanced Security**
  - Hardware wallet support
  - Secure element integration
  - Biometric authentication

## Installation

```bash
pnpm add @onflow/frw-wallet
```

## Usage

### Basic Wallet Creation

```typescript
import {
  Wallet,
  createSecureStorage,
  createCacheStorage,
} from '@onflow/frw-wallet';
import { storage, cache } from '@onflow/frw-context';

// Create storage instances
const secureStorage = createSecureStorage(storage());
const cacheStorage = createCacheStorage(cache());

// Create wallet configuration
const config = {
  secureStorage,
  cacheStorage,
  networks: ['mainnet', 'testnet'],
  defaultNetwork: 'mainnet',
};

// Create a new wallet from mnemonic
const wallet = await Wallet.create(
  {
    name: 'My Wallet',
    type: KeyType.MNEMONIC,
    mnemonic: 'your twelve word mnemonic phrase here...',
    password: 'secure_password_123',
  },
  config
);
```

### Account Management

```typescript
// Load wallet
await wallet.load('secure_password_123');

// Create watch-only Flow account
const flowAccount = await wallet.createWatchAccount(
  '0x1234567890abcdef',
  'flow',
  'mainnet',
  'My Flow Account'
);

// Create watch-only EVM account
const evmAccount = await wallet.createWatchAccount(
  '0x1234567890abcdef1234567890abcdef12345678',
  'evm',
  'ethereum',
  'My EVM Account'
);

// Get all accounts
const accounts = await wallet.fetchAllAccounts();

// Select active account
await wallet.selectAccount(flowAccount.address);
```

### Account Information

```typescript
// Flow account specifics
const flowSummary = flowAccount.getFlowSummary();
console.log(flowSummary.balance); // Flow balance
console.log(flowSummary.keysCount); // Number of account keys

// EVM account specifics
const evmSummary = evmAccount.getEVMSummary();
console.log(evmSummary.balance); // Native token balance
console.log(evmSummary.tokensCount); // Number of tokens
```

### Wallet Backup and Restore

```typescript
// Create backup
const backup = await wallet.createBackup('secure_password_123');

// Restore from backup
const restoredWallet = await Wallet.restoreFromBackup(
  {
    backupData: backup,
    password: 'secure_password_123',
    newName: 'Restored Wallet',
  },
  config
);
```

### Ethereum Transaction Utilities

The wallet SDK exposes helpers for computing Ethereum transaction hashes
directly through Wallet Core without reimplementing RLP encoding.

```typescript
import {
  computeEthTransactionHash,
  computeLegacyEthTransactionHash,
  encodeLegacyEthTransaction,
  buildLegacySigningOutput,
} from '@onflow/frw-wallet';

// 1. Hash a fully encoded transaction (hex or Uint8Array)
const hash = await computeEthTransactionHash(
  '0xf8aa808509c7652400830130b9...' // raw RLP hex
);

// 2. Work with RPC-style legacy transactions (nonce/gas/v/r/s)
const legacyTx = {
  nonce: 21786698,
  gasPrice: '1', // decimal or hex string
  gas: '23300',
  to: '0xF376A6849184571fEEdD246a1Ba2D331cfe56c8c',
  value: '92827600000000',
  input: '0x',
  v: '255',
  r: '0x30000000000000000',
  s: '0x3',
  type: 'legacy',
  typeHex: '0x0',
} as const;

const { rawTransaction, transactionHash } =
  await computeLegacyEthTransactionHash(legacyTx);

// rawTransaction === '0xf38401...0003'
// transactionHash === '0xa2de55...428c3'

// 3. Build a SigningOutput compatible with AnySigner workflows
const signingOutput = await buildLegacySigningOutput(legacyTx);
// signingOutput.encoded, .r, .s, .v can be reused anywhere Wallet Core expects a SigningOutput
```

## Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test --watch
```

## Development

### Mock Storage for Testing

```typescript
import { createMockStorageSetup } from '@onflow/frw-wallet';

const mockStorage = createMockStorageSetup();

const config = {
  secureStorage: mockStorage.secureStorage,
  cacheStorage: mockStorage.cacheStorage,
  networks: ['mainnet'],
};

// Use for testing...
```

### Custom Storage Implementation

```typescript
import { SecureStorage, CacheStorage } from '@onflow/frw-wallet';

class MySecureStorage implements SecureStorage {
  async store(id: string, encryptedData: string): Promise<void> {
    // Your implementation
  }

  async retrieve(id: string): Promise<string | null> {
    // Your implementation
  }

  // ... other methods
}
```

## BIP44 Derivation Paths

- **Flow**: `m/44'/539'/0'/0/{index}`
- **EVM**: `m/44'/60'/0'/0/{index}`

## Error Handling

The package provides comprehensive error types:

```typescript
import {
  WalletError,
  StorageError,
  KeyError,
  AccountError,
  NetworkError,
} from '@onflow/frw-wallet';

try {
  await wallet.load('wrong_password');
} catch (error) {
  if (error instanceof StorageError) {
    console.log('Storage error:', error.code, error.message);
  }
}
```

## Contributing

This package is part of the Flow Reference Wallet monorepo. Please see the main
repository's contributing guidelines.

## License

This project is licensed under the same terms as the Flow Reference Wallet
project.
