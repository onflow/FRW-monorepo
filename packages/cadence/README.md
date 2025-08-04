# @onflow/frw-cadence

Cadence scripts and transaction templates for Flow Reference Wallet.

## Overview

This package provides a collection of pre-built Cadence scripts and transaction templates for common Flow blockchain operations. It serves as a centralized repository for all Flow-specific smart contract interactions used by the Flow Reference Wallet.

## Features

- **Pre-built Scripts**: Ready-to-use Cadence scripts for common operations
- **Transaction Templates**: Reusable transaction templates for various use cases
- **Type Safety**: TypeScript interfaces for script parameters and results
- **Network Support**: Scripts compatible with both mainnet and testnet
- **Optimized Performance**: Efficient scripts designed for minimal computation costs

## Usage

### Basic Usage

```typescript
import { CadenceScripts, CadenceTransactions } from '@onflow/frw-cadence';

// Execute a script to get account info
const accountInfo = await CadenceScripts.getAccountInfo(address);

// Execute a transaction to transfer tokens
const txId = await CadenceTransactions.transferTokens({
  amount: '10.0',
  recipient: '0x1234...',
  tokenType: 'FLOW',
});
```

### Integration with FCL

```typescript
import * as fcl from '@onflow/fcl';
import { getBalanceScript } from '@onflow/frw-cadence';

const script = getBalanceScript();
const balance = await fcl.query({
  cadence: script,
  args: (arg, t) => [arg(address, t.Address)],
});
```

## Common Operations

### Account Management

- Account information retrieval
- Storage inspection
- Capability management
- Key management

### Token Operations

- Balance queries
- Token transfers
- Vault setup and management
- Multi-token support

### NFT Operations

- Collection enumeration
- NFT metadata retrieval
- Transfer operations
- Collection setup

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
