# @onflow/frw-screens

Screen components and logic for Flow Wallet with integrated data stores.

## Features

✅ **Complete Screen Components** - Home, NFT List, Send Flow, Color Demo  
✅ **Integrated Data Stores** - Zustand-based stores with mock data  
✅ **TypeScript Support** - Full type safety throughout  
✅ **Tamagui UI** - Modern, cross-platform UI components  
✅ **Demo Components** - Interactive demos to showcase functionality

## Installation

```bash
pnpm add @onflow/frw-screens
```

## Quick Start

### 1. Basic Screen Usage

```typescript
import { HomeScreen, useDemoDataStore } from '@onflow/frw-screens';

// Mock translation function
const t = (key: string) => key;

// Mock navigation
const navigation = {
  navigate: (screen: string, params?: any) => console.log(`Navigate to ${screen}`, params),
  goBack: () => console.log('Go back'),
};

// Mock bridge
const bridge = {};

function App() {
  return (
    <HomeScreen
      navigation={navigation}
      bridge={bridge}
      t={t}
      address="0x1234567890abcdef"
      network="Flow Mainnet"
    />
  );
}
```

### 2. Using the Demo Component

```typescript
import { ScreensDemo } from '@onflow/frw-screens';

function App() {
  return <ScreensDemo />;
}
```

### 3. Using Data Stores Directly

```typescript
import { useDemoDataStore } from '@onflow/frw-screens';

function TokenList() {
  const {
    tokens,
    isLoadingTokens,
    tokensError,
    fetchTokens
  } = useDemoDataStore();

  React.useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  if (isLoadingTokens) return <div>Loading...</div>;
  if (tokensError) return <div>Error: {tokensError}</div>;

  return (
    <div>
      {tokens.map(token => (
        <div key={token.id}>
          {token.name}: {token.balance} {token.symbol}
        </div>
      ))}
    </div>
  );
}
```

## Available Screens

### HomeScreen

Main dashboard showing account info, token/NFT counts, and navigation options.

**Props:**

- `address?: string` - Wallet address to display
- `network?: string` - Network name to display
- `onNavigateToColorDemo?: () => void` - Color demo navigation callback
- `onNavigateToSelectTokens?: () => void` - Send flow navigation callback

### SelectTokensScreen

Token selection interface for send transactions.

**Props:**

- `onTokenSelect?: (token: TokenModel) => void` - Token selection callback
- `onAccountSelect?: (account: WalletAccount) => void` - Account selection
  callback

### NFTListScreen

Grid view of NFTs with selection capabilities.

**Props:**

- `collection?: CollectionModel` - NFT collection to display
- `address?: string` - Wallet address
- `selectedNFTIds?: string[]` - Pre-selected NFT IDs
- `isEditing?: boolean` - Enable selection mode
- `onNFTSelect?: (nft: NFTModel) => void` - NFT selection callback

### ColorDemoScreen

Theme and color palette demonstration.

**Props:**

- `theme?: { isDark: boolean }` - Current theme state
- `onThemeToggle?: () => void` - Theme toggle callback

## Data Stores

### useDemoDataStore

Main store with mock data for all screens.

**Available Data:**

- `tokens: TokenModel[]` - Mock tokens (FLOW, USDC, FUSD)
- `nfts: NFTModel[]` - Mock NFTs (NBA Top Shot, CryptoKitties)
- `collections: CollectionModel[]` - Mock collections
- `accounts: WalletAccount[]` - Mock wallet accounts
- `activeAccount: WalletAccount | null` - Currently active account

**Loading States:**

- `isLoadingTokens: boolean`
- `isLoadingNFTs: boolean`
- `isLoadingAccounts: boolean`

**Error States:**

- `tokensError: string | null`
- `nftsError: string | null`
- `accountsError: string | null`

**Actions:**

- `fetchTokens(): Promise<void>` - Load token data
- `fetchNFTs(): Promise<void>` - Load NFT data
- `fetchAccounts(): Promise<void>` - Load account data
- `setActiveAccount(account: WalletAccount): void` - Set active account

### useAccessibleAssetStore

Store for managing child account permissions.

**Features:**

- Child account asset accessibility checking
- Integration with CadenceService
- Token/NFT/Collection permission validation

## Demo Components

### ScreensDemo

Interactive demo with navigation between all screens.

```typescript
import { ScreensDemo } from '@onflow/frw-screens';

<ScreensDemo />
```

### DataViewer

Debug component showing all store data in a readable format.

```typescript
import { DataViewer } from '@onflow/frw-screens';

<DataViewer />
```

## Mock Data

The demo store includes realistic mock data:

**Tokens:**

- Flow (FLOW) - 125.50 balance, $0.85 price
- USD Coin (USDC) - 1,250.00 balance, $1.00 price
- Flow USD (FUSD) - 500.25 balance, $1.00 price

**NFTs:**

- NBA Top Shot moments (LeBron, Curry, Giannis, Kawhi)
- CryptoKitties (#1337, #2048)

**Accounts:**

- Main Account (🚀) - Active
- Secondary Account (🌟)

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Development mode
pnpm dev
```

## Architecture

The package follows a clean architecture pattern:

- **Screens** - UI components with props-based configuration
- **Stores** - Zustand state management with actions and selectors
- **Types** - Shared TypeScript interfaces
- **Demo** - Interactive examples and debugging tools

All screens are designed to work with or without the stores, making them
flexible for different integration scenarios.
