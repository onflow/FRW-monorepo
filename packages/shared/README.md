# 🧩 @onflow/frw-shared

> Shared types, constants, and utilities for Flow Reference Wallet ecosystem

[![npm version](https://img.shields.io/npm/v/@onflow/frw-shared.svg)](https://www.npmjs.com/package/@onflow/frw-shared)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

## 📦 Overview

`@onflow/frw-shared` is the foundational package for the Flow Reference Wallet ecosystem. It provides shared TypeScript types, constants, and utility functions that ensure consistency across all FRW packages and applications.

### Key Features

- 🎯 **Type Safety**: Comprehensive TypeScript types for Flow blockchain operations
- 🔧 **Utility Functions**: Common helpers for address formatting, number handling, and more
- 📊 **Constants**: Centralized constants for networks, currencies, and algorithms
- 🌳 **Tree Shakeable**: Optimized for minimal bundle size
- 🚀 **Zero Platform Dependencies**: Works in any JavaScript environment

## 📥 Installation

```bash
npm install @onflow/frw-shared
```

```bash
yarn add @onflow/frw-shared
```

```bash
pnpm add @onflow/frw-shared
```

## 🚀 Quick Start

### Import Types

```typescript
import { WalletAddress, FlowTransaction, TokenInfo, NetworkType } from '@onflow/frw-shared/types';

// Example: Type-safe wallet address
const address: WalletAddress = {
  address: '0x1234567890abcdef',
  name: 'My Wallet',
  type: 'flow',
};
```

### Use Constants

```typescript
import { NETWORK, FLOW_TOKEN, SIGN_ALGO } from '@onflow/frw-shared/constant';

// Network configurations
console.log(NETWORK.mainnet); // { id: 'mainnet', name: 'Mainnet', ... }

// Sign algorithms
console.log(SIGN_ALGO.P256); // 'ECDSA_P256'
```

### Utility Functions

```typescript
import {
  formatAddress,
  formatTokenValue,
  isValidFlowAddress,
  getEmojiList,
} from '@onflow/frw-shared/utils';

// Format Flow address
const formatted = formatAddress('0x1234567890abcdef'); // '0x1234...cdef'

// Format token values
const value = formatTokenValue(1000000, 8); // '0.01'

// Validate addresses
const isValid = isValidFlowAddress('0x1234567890abcdef'); // true

// Get emoji list for wallet avatars
const emojis = getEmojiList(); // ['🎨', '🎭', ...]
```

## 📚 API Reference

### Type Exports

#### Core Types

- `WalletAddress` - Wallet address structure
- `FlowTransaction` - Flow transaction types
- `TokenInfo` - Token metadata
- `NFTInfo` - NFT metadata
- `NetworkType` - Network configurations

#### Keyring Types

- `KeyringAccount` - Account structure
- `SignType` - Signature types
- `AlgoType` - Algorithm types

#### Feature Types

- `StorageInfo` - Storage usage data
- `CoinItem` - Coin/token item
- `Contact` - Address book contact

### Constants

#### Network Constants

```typescript
import { NETWORK } from '@onflow/frw-shared/constant';

NETWORK.mainnet; // Mainnet configuration
NETWORK.testnet; // Testnet configuration
NETWORK.sandboxnet; // Sandboxnet configuration
```

#### Currency Constants

```typescript
import { FLOW_TOKEN, FUSD_TOKEN } from '@onflow/frw-shared/constant';

FLOW_TOKEN; // Flow token metadata
FUSD_TOKEN; // FUSD token metadata
```

#### Algorithm Constants

```typescript
import { SIGN_ALGO, HASH_ALGO } from '@onflow/frw-shared/constant';

SIGN_ALGO.P256; // ECDSA P256
SIGN_ALGO.SECP256K1; // SECP256K1
HASH_ALGO.SHA2_256; // SHA2-256
HASH_ALGO.SHA3_256; // SHA3-256
```

### Utility Functions

#### Address Utilities

```typescript
// Format address with ellipsis
formatAddress(address: string, length?: number): string

// Validate Flow address
isValidFlowAddress(address: string): boolean

// Convert to 0x format
with0x(address: string): string
without0x(address: string): string
```

#### Number Utilities

```typescript
// Format token values
formatTokenValue(value: number | string, decimals: number): string

// Number formatting
formatLargeNumber(num: number): string
addCommas(num: string | number): string
```

#### Key Utilities

```typescript
// Public key validation
isValidPublicKey(publicKey: string): boolean

// Key formatting
formatPublicKey(publicKey: string): string
```

## 🔗 Package Exports

The package provides multiple entry points for optimal tree-shaking:

```typescript
// Main export
import { ... } from '@onflow/frw-shared';

// Types only
import { ... } from '@onflow/frw-shared/types';

// Constants only
import { ... } from '@onflow/frw-shared/constant';

// Utils only
import { ... } from '@onflow/frw-shared/utils';
```

## 🏗️ Architecture

```
@onflow/frw-shared/
├── src/
│   ├── types/          # TypeScript type definitions
│   │   ├── wallet-types.ts
│   │   ├── transaction-types.ts
│   │   ├── network-types.ts
│   │   └── ...
│   ├── constant/       # Shared constants
│   │   ├── network-constants.ts
│   │   ├── currency-constants.ts
│   │   └── ...
│   └── utils/          # Utility functions
│       ├── address.ts
│       ├── number.ts
│       └── ...
```

## 💡 Usage Examples

### Creating a Type-Safe Wallet Service

### Working with Transactions

```typescript
import { FlowTransaction, TransactionStatus } from '@onflow/frw-shared/types';

function isTransactionPending(tx: FlowTransaction): boolean {
  return tx.status === TransactionStatus.PENDING;
}
```

## 🧪 Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the LGPL-3.0-or-later License - see the LICENSE file for details.

## 🔗 Related Packages

- [@onflow/frw-core](../core) - Core business logic and services
- [@onflow/frw-data-model](../data-model) - Cache data model implementation
- [@onflow/frw-reducers](../reducers) - State management reducers
- [@onflow/frw-extension-shared](../extension-shared) - Extension-specific utilities
