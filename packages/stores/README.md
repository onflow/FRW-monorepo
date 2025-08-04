# @onflow/frw-stores

State management stores and service layer with Zustand integration for Flow Reference Wallet.

## Overview

This package provides a comprehensive state management solution for Flow Reference Wallet applications, built on top of Zustand. It includes both reactive stores for UI state management and singleton service classes for business logic.

## Features

- **Zustand-based State Management**: Lightweight and performant state management
- **Service Layer**: Singleton pattern services for consistent API access
- **Bridge Integration**: Cross-platform bridge support for native applications
- **Multi-Wallet Support**: Support for both Flow and EVM wallet types
- **Type Safety**: Full TypeScript support with strict typing

## Architecture

### Services

All services follow the singleton pattern with bridge integration:

- **FlowService**: Flow blockchain interactions and balance queries
- **NFTService**: NFT collection and asset management (Flow & EVM)
- **TokenService**: Token information and balance management (Flow & EVM)
- **AddressBookService**: Contact and address management
- **RecentRecipientsService**: Recent transaction recipient tracking

### Stores

- **walletStore**: Wallet account management and selection
- **tokenStore**: Token balances, NFT collections, and asset data
- **sendStore**: Transaction sending workflow and state

## Usage

### Service Usage

```typescript
import { FlowService, NFTService, TokenService } from '@onflow/frw-stores';

// Initialize services with bridge
const bridge = getBridge(); // Your bridge implementation
const flowService = FlowService.getInstance(bridge);
const nftService = NFTService.getInstance(WalletType.Flow, bridge);
const tokenService = TokenService.getInstance(WalletType.Flow, bridge);

// Use services
const balance = await flowService.getCoaBalance(address);
const collections = await nftService.getNFTCollections(address);
const tokens = await tokenService.getTokenInfo(address);
```

### Store Usage

```typescript
import { useWalletStore, useTokenStore, useSendStore } from '@onflow/frw-stores';

function MyComponent() {
  const { currentAccount, accounts } = useWalletStore();
  const { tokens, nftCollections } = useTokenStore();
  const { sendTransaction } = useSendStore();

  // Use store data and actions
}
```

### Bridge Integration

Services require a bridge implementation that conforms to the `BridgeSpec` interface:

```typescript
interface BridgeSpec {
  getSelectedAddress(): string | null;
  getNetwork(): string;
  getJWT(): Promise<string>;
  getVersion(): string;
  getBuildNumber(): string;
  sign(hexData: string): Promise<string>;
  getRecentContacts(): Promise<RecentContactsResponse>;
  getWalletAccounts(): Promise<WalletAccountsResponse>;
  getSignKeyIndex(): number;
  scanQRCode(): Promise<string>;
  closeRN(): void;
}
```

## Dependencies

- `@onflow/frw-api`: API service layer
- `@onflow/frw-types`: Type definitions
- `@onflow/frw-workflow`: Transaction workflows
- `zustand`: State management library

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

- **Singleton Services**: Each service type maintains a single instance per configuration
- **Bridge Abstraction**: Services work across different platforms through bridge interface
- **Type Safety**: All services and stores are fully typed
- **Separation of Concerns**: Clear separation between UI state (stores) and business logic (services)
- **Multi-Network Support**: Services handle both Flow mainnet/testnet and EVM networks
