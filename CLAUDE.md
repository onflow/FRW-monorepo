# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flow Reference Wallet (FRW) is a Chrome extension that serves as a digital wallet for the Flow blockchain. It's built using TypeScript, React, and Material-UI (MUI v7), with a background service worker architecture for secure blockchain interactions.

This repository contains the Chrome extension application. Core packages are maintained in a separate repository ([FRW-core](https://github.com/onflow/FRW-core)) and published to npm.

**Note**: If the FRW-core repository is checked out locally at `../FRW-core`, you can use `pnpm link` for local package development.

## Development Commands

### Build Commands

- **Development**: `pnpm build:dev` (file watching enabled)
- **Production**: `pnpm build:pro`
- **CI Build dev**: `pnpm build:dev-ci` (no watch mode)
- **CI Build production**: `pnpm build:ci` (no watch mode)

### Testing & Quality

- **Unit Tests (Watch mode)**: `pnpm test` - Run Vitest tests
- **Unit Tests (Run mode)**: `pnpm test:run` - Watch mode
- **Test Coverage**: `pnpm test:unit:coverage`
- **E2E Tests**: `pnpm test:e2e` - Playwright tests
- **E2E Tests (UI)**: `pnpm test:e2e:ui` - Playwright with UI
- **Linting**: `pnpm lint` / `pnpm lint:fix`
- **Format**: `pnpm format:fix` - Prettier formatting

### Development Tools

- **React DevTools**: `pnpm react-devtools` (run before build)
- **Storybook**: `pnpm storybook` - Component development

## Architecture Overview

### Directory Structure

```
FRW-Extension/
├── src/
│   ├── background/         # Service worker (backend)
│   │   ├── controller/     # Main wallet controller
│   │   ├── service/        # Background services
│   │   └── index.ts        # Service worker entry
│   ├── ui/                 # React popup interface
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # UI services
│   │   └── index.tsx       # React app entry
│   ├── content-script/     # Web page integration
│   │   └── pageProvider/   # Ethereum provider
│   └── core/               # Core business logic
├── _raw/                   # Static extension files
│   ├── manifest.json       # Extension manifest
│   └── _locales/          # Localization files
├── dist/                   # Built extension output
├── docs/                   # Architecture documentation
├── e2e/                    # Playwright E2E tests
└── build/                  # Webpack configuration
```

### Core Architecture

1. **Background Service Worker** (`src/background/`)
   - Handles all blockchain interactions and key management
   - Cannot access DOM or window objects
   - Communicates via Chrome runtime messaging
   - Main controller: `src/background/controller/wallet.ts`

2. **UI Layer** (`src/ui/`)
   - React-based popup interface
   - Communicates with background via `WalletController` proxy
   - Uses MUI v7 components
   - React Router v5 for navigation

3. **Content Scripts** (`src/content-script/`)
   - Injects wallet provider into web pages
   - Handles dApp communication
   - Implements Flow FCL and Ethereum provider interfaces

4. **Core Layer** (`src/core/`)
   - Isolated business logic
   - Shared between UI and background where appropriate

### External Packages

Core functionality is provided by npm packages from the `frw-core` repository:

- **`@onflow/frw-shared`** - Types, constants, utilities
- **`@onflow/frw-core`** - Core wallet services and blockchain logic
- **`@onflow/frw-reducers`** - State management reducers
- **`@onflow/frw-data-model`** - Caching system
- **`@onflow/frw-extension-shared`** - Extension-specific utilities

## Environment Setup

1. **Prerequisites**:
   - Node.js >= 22.11.0
   - pnpm 10.12.1 (enforced in package.json)

2. **Environment Variables** (`.env.dev`):
   - Firebase configuration
   - API endpoints
   - Feature flags
   - `DEV_PASSWORD` (optional)

3. **Chrome Extension Loading**:
   - Build outputs to `dist/` folder
   - Load unpacked extension from `dist/` in Chrome
   - Enable Developer Mode for network switching

## Critical Patterns

### Security

- Private keys never leave background service worker
- All signing operations in background context
- Encrypted storage for sensitive data
- UI can only request operations via messaging

### Multi-Account Support

- Multiple Flow accounts per profile
- Child account support
- EVM addresses linked to Flow accounts
- Account switching managed by background

### Network Support

- Flow Mainnet and Testnet
- EVM networks via linked addresses
- Network switching requires developer mode

### Import Patterns

```typescript
// External packages
import { types } from '@onflow/frw-shared';
import { WalletService } from '@onflow/frw-core';

// Internal imports (use @ alias)
import { Button } from '@/ui/components/Button';
import { WalletController } from '@/background/controller/wallet';
```

### Adding New Wallet Methods

1. Define method in `src/background/controller/wallet.ts`
2. Add types in `@onflow/frw-shared` if needed
3. Expose via message handler in background
4. Add proxy method in UI's WalletController

### Working with Firebase

- Firebase Auth with web-extension package
- Authentication state in background
- UI requests auth via messaging

### Flow Blockchain

- @onflow/fcl for Flow interactions
- Custom transaction building
- Multi-sig account key management

## Build System

- Webpack 5 with environment-specific configs
- TypeScript with strict mode
- Automatic manifest generation
- Support for WASM and top-level await

## Testing

- **Unit Tests**: Vitest with Chrome API mocks
- **E2E Tests**: Playwright with extension loading
- **Component Tests**: Storybook for UI components

## Data Cache Model

Session storage-based caching with TTL:

- `getCachedData(key)` - Frontend access
- `registerRefreshListener()` - Background refresh
- `registerBatchRefreshListener()` - Batch operations
- React hooks: `useCachedData()`, `useUserData()`

Common cache keys:

- `token-price-{address}`
- `nft-collection-{address}`
- `balance-{userId}-{network}`
- `feature-flags`

## Localization

- Files in `_raw/_locales/`
- Use `chrome.i18n.getMessage()`
- Case-insensitive unique keys

## Architecture Rules

ESLint enforces strict boundaries:

1. **UI Layer** (`src/ui/`):
   - Cannot import from `@onflow/frw-core` or `@/background`
   - Must use messaging to communicate with background

2. **Background Layer** (`src/background/`):
   - Cannot import from `@/ui`
   - Direct access to core services

3. **External Packages**:
   - Must remain independent of extension code
   - Published separately to npm

For detailed documentation:

- Architecture: `docs/architecture-separation.md`
- React guidelines: `docs/react-rules.md`
- Cache model: `docs/cache-data-model.md`
