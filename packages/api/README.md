# @onflow/frw-api

Network API services and client interfaces for Flow Reference Wallet.

## Overview

This package provides HTTP client interfaces and service definitions for interacting with Flow Reference Wallet backend APIs. It includes auto-generated TypeScript clients from OpenAPI/Swagger specifications.

## Features

- **Auto-generated Clients**: TypeScript clients generated from OpenAPI specs
- **Type Safety**: Full TypeScript support with auto-generated types
- **Axios Integration**: Built on Axios for reliable HTTP communication
- **Multiple Service Endpoints**: Support for various backend services
- **Error Handling**: Consistent error handling across all API calls

## Architecture

### Generated Services

The package includes auto-generated services from two main API specifications:

#### JavaScript/TypeScript Services (`service.ts`)

- Auto-generated from `js_swagger.json`
- Modern TypeScript interfaces and client methods
- Promise-based async/await support

#### Go Services (`goService.ts`)

- Auto-generated from `go_swagger.json`
- Compatible with existing Go backend services
- Includes legacy endpoint support

### Available Services

- **NftService**: NFT collection and asset management
- **FlowEvmNftService**: EVM-based NFT services
- **UserFtTokensService**: Fungible token management
- **AddressbookService**: Contact and address book management
- **AccountService**: Account management operations
- **CryptoService**: Cryptographic operations
- **CoinService**: Coin and token operations
- **UserService**: User profile and settings
- **ProfileService**: User profile management
- **DeviceService**: Device registration and management

## Usage

### Basic Service Usage

```typescript
import { NftService, UserFtTokensService, AddressbookService } from '@onflow/frw-api';

// Get NFT collections for an address
const nftResponse = await NftService.id({ address: '0x1234...' });
console.log(nftResponse.data);

// Get fungible tokens
const tokenResponse = await UserFtTokensService.ft({
  address: '0x1234...',
  network: 'mainnet',
  currency: 'USD',
});
console.log(tokenResponse.data);

// Get address book contacts
const contacts = await AddressbookService.contact();
console.log(contacts.data);
```

### EVM Services

```typescript
import { FlowEvmNftService } from '@onflow/frw-api';

// Get EVM NFT collections
const evmNfts = await FlowEvmNftService.id({ address: '0x1234...' });
console.log(evmNfts.data);

// Get NFTs from a specific collection
const collectionNfts = await FlowEvmNftService.collectionList({
  address: '0x1234...',
  collectionIdentifier: 'SomeCollection',
  offset: 0,
  limit: 50,
});
console.log(collectionNfts.data);
```

### Configuration

```typescript
import './codgen/axios'; // Import axios configuration

// The axios configuration is automatically applied
// All services use the configured axios instance
```

## Code Generation

This package uses automated code generation from OpenAPI specifications:

### Scripts

- `pnpm codegen`: Generate TypeScript clients from both swagger files
- `codegen.cjs`: Generates JavaScript/TypeScript services
- `codegen-go.cjs`: Generates Go-compatible services

### Source Files

- `js_swagger.json`: JavaScript/TypeScript API specification
- `go_swagger.json`: Go backend API specification

### Generated Files

- `src/codgen/service.ts`: Modern TypeScript services
- `src/codgen/goService.ts`: Go-compatible services
- `src/codgen/axios.ts`: Axios configuration and interceptors
- `src/codgen/utils.ts`: Utility functions and types

## Development

```bash
# Install dependencies
pnpm install

# Generate API clients
pnpm codegen

# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check
```

## API Specifications

### Updating APIs

1. Update the appropriate swagger JSON file (`js_swagger.json` or `go_swagger.json`)
2. Run code generation: `pnpm codegen`
3. Review generated changes
4. Update version and rebuild

### Adding New Endpoints

1. Add endpoints to the appropriate swagger specification
2. Regenerate clients: `pnpm codegen`
3. Export new services in `src/index.ts`
4. Update types if needed

## Error Handling

All API services return responses in a consistent format:

```typescript
interface ApiResponse<T> {
  data?: T;
  status?: number;
  message?: string;
  success?: boolean;
}
```

Handle errors appropriately:

```typescript
try {
  const response = await NftService.id({ address });
  if (response.data) {
    // Handle success
    console.log(response.data);
  }
} catch (error) {
  // Handle API errors
  console.error('API Error:', error);
}
```

## Dependencies

- `axios`: HTTP client library
- `swagger-axios-codegen`: Code generation tool

## License

LGPL-3.0-or-later
