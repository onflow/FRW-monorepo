# @onflow/frw-types

TypeScript type definitions and interfaces for Flow Reference Wallet.

## Overview

This package provides comprehensive TypeScript type definitions, interfaces, and
utility types for the Flow Reference Wallet ecosystem. It serves as the
foundation for type safety across all FRW packages and applications.

## Features

- **Comprehensive Types**: Complete type definitions for wallets, accounts,
  tokens, NFTs, and transactions
- **Cross-Platform Support**: Types for both Flow and EVM ecosystems
- **Bridge Interfaces**: Type definitions for cross-platform bridge
  communication
- **Utility Types**: Helper types and type guards for common operations
- **String Utilities**: Formatting and validation utilities for display values

## Type Categories

### Wallet & Account Types

```typescript
import { WalletType, Account, ChildAccount } from '@onflow/frw-types';

// Wallet types
type WalletType = 'Flow' | 'EVM';

// Account structure
interface Account {
  address: string;
  type: WalletType;
  name?: string;
  avatar?: string;
  evmAddress?: string;
}

// Child account with parent reference
interface ChildAccount extends Account {
  parent: string;
  scopes: string[];
}
```

### Token & NFT Types

```typescript
import { TokenInfo, NFTModel, CollectionModel } from '@onflow/frw-types';

// Token information with pricing and balance
class TokenInfo {
  type: WalletType;
  name: string;
  symbol?: string;
  balance?: string;
  priceInUSD?: string;
  logoURI?: string;
  // ... additional properties
}

// NFT model with metadata
interface NFTModel {
  id: string;
  name: string;
  thumbnail?: string;
  type: WalletType;
  collection?: CollectionModel;
}

// NFT collection information
interface CollectionModel {
  id: string;
  name: string;
  description?: string;
  type: WalletType;
  count?: number;
}
```

### Transaction Types

```typescript
import { SendPayload, TransactionStatus } from '@onflow/frw-types';

// Send transaction payload
interface SendPayload {
  type: 'token' | 'nft';
  assetType: 'flow' | 'evm';
  sender: string;
  receiver: string;
  amount?: string;
  tokenContractAddr?: string;
  // ... additional fields
}

// Transaction status tracking
interface TransactionStatus {
  txId: string;
  status: 'pending' | 'sealed' | 'executed' | 'failed';
  errorMessage?: string;
}
```

### Bridge Communication Types

```typescript
import { BridgeSpec, Storage } from '@onflow/frw-types';

// Bridge interface for cross-platform communication
interface BridgeSpec {
  getSelectedAddress(): string | null;
  getNetwork(): string;
  getJWT(): Promise<string>;
  sign(hexData: string): Promise<string>;
  getWalletAccounts(): Promise<WalletAccountsResponse>;
  // ... additional methods
}

// Storage interface for cross-platform persistence
interface Storage {
  set(key: string, value: boolean | string | number | ArrayBuffer): void;
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  // ... additional methods
}
```

### Store Types

```typescript
import { WalletState, TokenState, SendState } from '@onflow/frw-types';

// Wallet store state
interface WalletState {
  currentAccount: WalletAccount | null;
  accounts: WalletAccount[];
  childAccounts: ChildAccount[];
  isLoading: boolean;
}

// Token store state
interface TokenState {
  tokens: TokenInfo[];
  nftCollections: CollectionModel[];
  balances: Record<string, string>;
  isLoading: boolean;
}

// Send transaction state
interface SendState {
  payload: SendPayload | null;
  status: TransactionStatus | null;
  isLoading: boolean;
  error: string | null;
}
```

## Utility Functions

### String Formatting

```typescript
import { formatCurrencyStringForDisplay } from '@onflow/frw-types';

// Format currency values for display
const formatted = formatCurrencyStringForDisplay({
  value: 1234.56,
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});
// Result: "1,234.56"
```

### Token Utilities

```typescript
import {
  TokenInfo,
  mapCadenceTokenDataWithCurrencyToTokenInfo,
} from '@onflow/frw-types';

// Map API response to TokenInfo
const tokenInfo = mapCadenceTokenDataWithCurrencyToTokenInfo(apiResponse);

// Check if token is FLOW
const isFlow = tokenInfo.isFlow();

// Get formatted balance display
const displayBalance = tokenInfo.getDisplayBalanceWithSymbol();
```

### NFT Utilities

```typescript
import { NFTModel, getNFTCover } from '@onflow/frw-types';

// Get NFT cover image URL
const coverUrl = getNFTCover(nftModel);
```

## Address Utilities

```typescript
import { addressType } from '@onflow/frw-types';

// Determine address type
const type = addressType(address);
// Result: 'flow' | 'evm' | 'invalid'

// Validate Flow address
const isValidFlow = addressType(address) === 'flow';

// Validate EVM address
const isValidEVM = addressType(address) === 'evm';
```

## Type Guards

```typescript
import { isAccount, isChildAccount, isTokenInfo } from '@onflow/frw-types';

// Type guards for runtime type checking
if (isAccount(data)) {
  // TypeScript knows data is Account
  console.log(data.address);
}

if (isChildAccount(data)) {
  // TypeScript knows data is ChildAccount
  console.log(data.parent);
}

if (isTokenInfo(data)) {
  // TypeScript knows data is TokenInfo
  console.log(data.symbol);
}
```

## Usage Examples

### Wallet Integration

```typescript
import { Account, WalletType, BridgeSpec } from '@onflow/frw-types';

function createWalletAccount(
  address: string,
  type: WalletType,
  bridge: BridgeSpec
): Account {
  return {
    address,
    type,
    name: `${type} Account`,
    evmAddress: type === 'Flow' ? undefined : address,
  };
}
```

### Token Management

```typescript
import { TokenInfo, WalletType } from '@onflow/frw-types';

function createTokenInfo(data: any): TokenInfo {
  return new TokenInfo({
    type: WalletType.Flow,
    name: data.name,
    symbol: data.symbol,
    balance: data.balance,
    priceInUSD: data.price,
    logoURI: data.logo,
  });
}
```

### Transaction Building

```typescript
import { SendPayload, WalletType } from '@onflow/frw-types';

function buildTokenTransfer(
  sender: string,
  receiver: string,
  amount: string,
  tokenAddress: string
): SendPayload {
  return {
    type: 'token',
    assetType: 'flow',
    sender,
    receiver,
    amount,
    tokenContractAddr: tokenAddress,
    ids: [],
    decimal: 8,
  };
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check
```

## Architecture Principles

- **Type Safety First**: All types are strictly defined with no `any` usage
- **Cross-Platform**: Types work across Flow and EVM ecosystems
- **Extensible**: Types can be extended for custom implementations
- **Runtime Safety**: Includes type guards for runtime validation
- **Documentation**: All types are thoroughly documented with TSDoc
