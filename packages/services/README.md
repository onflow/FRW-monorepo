# @onflow/frw-services

Service layer for Flow Reference Wallet projects.

## Overview

This package contains all service classes that handle business logic, data fetching, and external API interactions for the Flow Reference Wallet ecosystem.

## Services

### AddressBookService

Manages user's address book contacts with persistent storage support.

```typescript
import { AddressBookService } from '@onflow/frw-services';

const service = AddressBookService.getInstance();
const contacts = await service.getAddressBook();
```

### FlowService

Handles Flow blockchain interactions and account management.

```typescript
import { FlowService } from '@onflow/frw-services';

const flowService = new FlowService();
const account = await flowService.getAccount(address);
```

### NFTService

Manages NFT-related operations including fetching, caching, and display.

```typescript
import { NFTService } from '@onflow/frw-services';

const nftService = NFTService.getInstance();
const nfts = await nftService.getUserNFTs(address);
```

### RecentRecipientsService

Tracks and manages recently used recipient addresses.

```typescript
import { RecentRecipientsService } from '@onflow/frw-services';

const service = RecentRecipientsService.getInstance(bridge, storage);
const recent = await service.getAllRecentRecipients();
```

### TokenService

Handles token-related operations including balance fetching and token management.

```typescript
import { TokenService } from '@onflow/frw-services';

const tokenService = TokenService.getInstance();
const balance = await tokenService.getTokenBalance(address, tokenId);
```

## Interfaces

### BridgeSpec

Defines the interface for native bridge communications in React Native environments.

### Storage

Defines the interface for persistent storage operations (MMKV, AsyncStorage, etc.).

## Usage

```typescript
// Import specific services
import { 
  AddressBookService,
  FlowService,
  NFTService,
  RecentRecipientsService,
  TokenService 
} from '@onflow/frw-services';

// Import interfaces
import type { BridgeSpec, Storage } from '@onflow/frw-services';
```

## Dependencies

- `@onflow/frw-api` - API layer for backend communications
- `@onflow/frw-types` - Shared type definitions
- `@onflow/frw-workflow` - Flow blockchain workflow operations