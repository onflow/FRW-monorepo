# @onflow/frw-workflow

Transaction workflow and strategy patterns for Flow Reference Wallet.

## Overview

This package provides a comprehensive transaction workflow system using the Strategy pattern. It handles various transaction types across Flow and EVM networks, including token transfers, NFT transfers, and cross-network operations.

## Features

- **Strategy Pattern**: Modular transaction strategies for different scenarios
- **Multi-Network Support**: Handles Flow mainnet/testnet and EVM transactions
- **Cross-Network Transfers**: Supports transfers between Flow and EVM addresses
- **Account Management**: Child account and multi-account support
- **Transaction Validation**: Comprehensive payload validation and error handling
- **Context Management**: Maintains transaction context throughout the workflow

## Architecture

### Transaction Strategies

The package implements different strategies for various transaction scenarios:

#### Token Transfer Strategies

```typescript
- FlowToFlowTokenStrategy: Flow account to Flow account
- FlowToEvmTokenStrategy: Flow account to EVM address
- EvmToFlowTokenStrategy: EVM address to Flow account
- EvmToEvmTokenStrategy: EVM address to EVM address
- ChildToChildTokenStrategy: Child account to child account
- ChildToFlowTokenStrategy: Child account to parent Flow account
```

#### NFT Transfer Strategies

```typescript
- FlowToFlowNFTStrategy: Flow NFT transfers
- EvmToEvmNFTStrategy: EVM NFT transfers
- CrossNetworkNFTStrategy: Cross-network NFT transfers
```

## Usage

### Basic Transaction Sending

```typescript
import { SendTransaction } from '@onflow/frw-workflow';

// Token transfer payload
const payload = {
  type: 'token',
  assetType: 'flow',
  proposer: '0x1234...',
  receiver: '0x5678...',
  sender: '0x1234...',
  amount: '10.0',
  flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
  decimal: 8,
  childAddrs: [],
  ids: [],
};

// Execute transaction
const txId = await SendTransaction(payload);
console.log('Transaction ID:', txId);
```

### NFT Transfer

```typescript
import { SendTransaction } from '@onflow/frw-workflow';

// NFT transfer payload
const nftPayload = {
  type: 'nft',
  assetType: 'flow',
  proposer: '0x1234...',
  receiver: '0x5678...',
  sender: '0x1234...',
  ids: ['123'],
  flowIdentifier: 'A.address.ContractName.NFT',
  childAddrs: [],
  amount: '',
  decimal: 0,
};

const txId = await SendTransaction(nftPayload);
```

### EVM Contract Interactions

```typescript
import { encodeEvmContractCallData } from '@onflow/frw-workflow';

// Encode ERC20 transfer
const tokenPayload = {
  type: 'token',
  amount: '100.0',
  receiver: '0xRecipientAddress...',
  decimal: 18,
  ids: [],
  sender: '0xSenderAddress...',
};

const callData = encodeEvmContractCallData(tokenPayload);
console.log('Encoded call data:', callData);
```

## Strategy Selection

The workflow automatically selects the appropriate strategy based on payload analysis:

```typescript
// Internal strategy selection logic
function selectTokenStrategy(payload: SendPayload): TransactionStrategy {
  const senderType = getAddressType(payload.sender);
  const receiverType = getAddressType(payload.receiver);

  if (senderType === 'flow' && receiverType === 'flow') {
    return new FlowToFlowTokenStrategy();
  } else if (senderType === 'flow' && receiverType === 'evm') {
    return new FlowToEvmTokenStrategy();
  }
  // ... additional strategy selection logic
}
```

## Validation

### Payload Validation

```typescript
import { validateSendPayload } from '@onflow/frw-workflow';

try {
  validateSendPayload(payload);
  // Payload is valid
} catch (error) {
  console.error('Validation error:', error.message);
}
```

### Address Validation

```typescript
import { validateFlowAddress, validateEvmAddress } from '@onflow/frw-workflow';

// Validate Flow address
const isValidFlow = validateFlowAddress('0x1234...');

// Validate EVM address
const isValidEvm = validateEvmAddress('0x1234...');
```

## Context Management

The workflow maintains context throughout transaction execution:

```typescript
import { TransactionContext } from '@onflow/frw-workflow';

// Context includes network info, account details, and transaction state
interface TransactionContext {
  network: 'mainnet' | 'testnet';
  accounts: Account[];
  currentAccount: Account;
  gasEstimate?: string;
  errorMessages: string[];
}
```

## Utilities

### Account Management

```typescript
import {
  getMainAccountFromChildAccounts,
  getCurrentAccount,
  getAccountByAddress,
} from '@onflow/frw-workflow';

// Get main account from child account list
const mainAccount = getMainAccountFromChildAccounts(childAccounts);

// Get current active account
const current = await getCurrentAccount();

// Find account by address
const account = getAccountByAddress(accounts, address);
```

### Cryptographic Operations

```typescript
import { generateKeyPair, signTransaction, hashTransaction } from '@onflow/frw-workflow';

// Generate new key pair
const { publicKey, privateKey } = generateKeyPair();

// Sign transaction
const signature = await signTransaction(transaction, privateKey);

// Hash transaction for signing
const hash = hashTransaction(transaction);
```

## Error Handling

The workflow provides comprehensive error handling:

```typescript
import { TransactionError, ValidationError } from '@onflow/frw-workflow';

try {
  const txId = await SendTransaction(payload);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
  } else if (error instanceof TransactionError) {
    console.error('Transaction failed:', error.message, error.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Testing

The package includes comprehensive tests for all strategies and utilities:

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test -- send.ft.test.ts    # Token transfer tests
pnpm test -- send.nft.test.ts   # NFT transfer tests
pnpm test -- query.test.ts      # Query operation tests
```

### Test Examples

```typescript
// Example token transfer test
it('should transfer FLOW tokens between accounts', async () => {
  const payload = {
    type: 'token',
    assetType: 'flow',
    proposer: mainAccount.address,
    receiver: childAccount.address,
    sender: mainAccount.address,
    amount: '1.0',
    flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
    decimal: 8,
    childAddrs: [],
    ids: [],
  };

  const txId = await SendTransaction(payload);
  expect(txId).toHaveLength(64);
});
```

## Configuration

### Network Configuration

```typescript
import { configureFCL } from '@onflow/frw-workflow';

// Configure for mainnet
configureFCL('mainnet');

// Configure for testnet
configureFCL('testnet');
```

### Service Integration

```typescript
import { cadenceService } from '@onflow/frw-workflow';

// The workflow integrates with the Cadence service for Flow operations
const balance = await cadenceService.getFlowBalanceForAnyAccounts([address]);
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

## Integration

This package is designed to work with other FRW packages:

- **@onflow/frw-types**: Uses type definitions for payloads and responses
- **@onflow/frw-cadence**: Executes Cadence scripts and transactions
- **@onflow/frw-api**: Interacts with backend services
- **@onflow/frw-stores**: Provides transaction state management
