# 💾 @onflow/frw-data-model

> Browser extension cache and storage system for Flow Reference Wallet

[![npm version](https://img.shields.io/npm/v/@onflow/frw-data-model.svg)](https://www.npmjs.com/package/@onflow/frw-data-model)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

## 📦 Overview

`@onflow/frw-data-model` provides a sophisticated caching system designed specifically for browser extensions. It manages data flow between background scripts and UI components with automatic refresh, TTL support, and batch operations.

### Key Features

- 🔄 **Auto-refresh Architecture**: Frontend requests trigger background updates
- ⏱️ **TTL-based Caching**: Automatic expiry with configurable timestamps
- 🚀 **Batch Operations**: Efficient bulk data loading
- 📡 **Event-driven Updates**: Real-time cache synchronization
- 🎯 **Type-safe Keys**: Predefined cache keys for all wallet data
- 🌐 **Extension Optimized**: Built for Chrome extension architecture

## 📥 Installation

```bash
npm install @onflow/frw-data-model
```

```bash
yarn add @onflow/frw-data-model
```

```bash
pnpm add @onflow/frw-data-model
```

## 🚀 Quick Start

### Frontend Usage (React Hook)

```typescript
import { useCachedData } from '@onflow/frw-data-model';

function WalletBalance() {
  // Automatically fetches and subscribes to updates
  const balance = useCachedData<AccountBalance>(
    accountBalanceKey('mainnet', '0x123...')
  );

  if (!balance) return <div>Loading...</div>;

  return <div>Balance: {balance.amount} FLOW</div>;
}
```

### Background Script Setup

```typescript
import {
  registerRefreshListener,
  setCachedData,
  accountBalanceRefreshRegex,
} from '@onflow/frw-data-model';

// Register a refresh listener for account balance
registerRefreshListener(accountBalanceRefreshRegex, async (network: string, address: string) => {
  // Fetch fresh data from API
  const balance = await fetchAccountBalance(network, address);

  // Cache with 60 second TTL
  await setCachedData(accountBalanceKey(network, address), balance, 60_000);
});
```

## 📚 Architecture

### How It Works

1. **Frontend requests data** using `getCachedData()` or `useCachedData` hook
2. **If data is expired**, a refresh request is automatically triggered
3. **Background script** detects refresh request and fetches fresh data
4. **Fresh data is cached** with a new TTL
5. **Frontend is notified** via storage events and updates automatically

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ──1──▶ │ Cache Layer  │ ◀──4──  │ Background  │
│     (UI)    │ ◀──5── │  (Storage)   │ ──2──▶  │   Script    │
└─────────────┘         └──────────────┘         └──────┬─────┘
                                                         │ 3
                                                         ▼
                                                    ┌─────────┐
                                                    │   API   │
                                                    └─────────┘
```

## 🔑 Cache Keys

The package provides predefined cache keys for all wallet data types:

### Global Keys

```typescript
import { newsKey, remoteConfigKey } from '@onflow/frw-data-model';

// News items
const news = await getCachedData(newsKey());

// Remote configuration
const config = await getCachedData(remoteConfigKey());
```

### User Keys

```typescript
import { userInfoCachekey, cadenceScriptsKey } from '@onflow/frw-data-model';

// User information
const userInfo = await getCachedData(userInfoCachekey(userId));

// Cadence scripts
const scripts = await getCachedScripts();
```

### Account Keys

```typescript
import { coinListKey, nftCollectionListKey, transferListKey } from '@onflow/frw-data-model';

// Token balances
const tokens = await getCachedCoinList('mainnet', '0x123...');

// NFT collections
const nfts = await getCachedNftCollectionList('mainnet');

// Transaction history
const transfers = await getCachedData(transferListKey('mainnet', '0x123...', '0', '15'));
```

## 💡 Usage Patterns

### Frontend Hook with Loading States

```typescript
import { useCachedData } from '@onflow/frw-data-model';

function TokenList() {
  const [network, address] = useWallet();
  const tokens = useCachedData<ExtendedTokenInfo[]>(
    coinListKey(network, address)
  );

  // Loading state
  if (tokens === undefined) {
    return <Skeleton />;
  }

  // Empty state
  if (tokens.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {tokens.map(token => (
        <TokenItem key={token.id} token={token} />
      ))}
    </div>
  );
}
```

### Background Refresh Listeners

```typescript
import {
  registerRefreshListener,
  setCachedData,
  coinListRefreshRegex,
} from '@onflow/frw-data-model';

// Register listener for coin list updates
registerRefreshListener(
  coinListRefreshRegex,
  async (network: string, address: string, currency: string) => {
    try {
      // Fetch token balances
      const tokens = await api.getTokenBalances(network, address);

      // Fetch prices
      const prices = await api.getTokenPrices(tokens, currency);

      // Combine data
      const enrichedTokens = tokens.map((token) => ({
        ...token,
        price: prices[token.id],
        value: token.balance * prices[token.id],
      }));

      // Cache for 30 seconds
      await setCachedData(coinListKey(network, address, currency), enrichedTokens, 30_000);
    } catch (error) {
      console.error('Failed to refresh coin list:', error);
    }
  }
);
```

### Batch Refresh for Performance

```typescript
import { registerBatchRefreshListener } from '@onflow/frw-data-model';

// Batch multiple NFT collection requests
registerBatchRefreshListener(
  nftCollectionRefreshRegex,
  async (network: string, collectionIds: string[]) => {
    // Fetch all collections in one API call
    const collections = await api.getNFTCollectionsBatch(network, collectionIds);

    // Return mapped results
    return collections.reduce((acc, collection) => {
      acc[collection.id] = collection;
      return acc;
    }, {});
  },
  (matches) => matches[3], // Extract collection ID
  (network, address, collectionId, offset) =>
    nftCollectionKey(network, address, collectionId, offset),
  100, // 100ms batch window
  300_000 // 5 minute TTL
);
```

### Manual Cache Management

```typescript
import { getValidData, clearCachedData, triggerRefresh } from '@onflow/frw-data-model';

// Get data without triggering refresh
const cachedOnly = await getValidData(accountBalanceKey(network, address));

// Clear specific cache
await clearCachedData(accountBalanceKey(network, address));

// Force refresh (use sparingly!)
triggerRefresh(accountBalanceKey(network, address));
```

## 🏗️ Data Flow Examples

### Account Balance Flow

```typescript
// 1. Frontend component
function BalanceDisplay() {
  const balance = useCachedData<AccountBalanceInfo>(
    accountBalanceKey('mainnet', currentAddress)
  );

  return <div>{balance?.flowBalance || '...'} FLOW</div>;
}

// 2. Background listener
registerRefreshListener(
  accountBalanceRefreshRegex,
  async (network: string, address: string) => {
    const balance = await fcl.account(address);

    await setCachedData(
      accountBalanceKey(network, address),
      {
        flowBalance: balance.balance,
        storageUsed: balance.storageUsed,
        storageCapacity: balance.storageCapacity
      },
      60_000 // 1 minute TTL
    );
  }
);
```

### NFT Collection with Pagination

```typescript
// Frontend
function NFTGallery() {
  const [offset, setOffset] = useState(0);
  const collection = useCachedData<NFTCollectionData>(
    nftCollectionKey(network, address, 'TopShot', `${offset}`)
  );

  const loadMore = () => {
    setOffset(prev => prev + 24);
  };

  return (
    <InfiniteScroll
      dataLength={collection?.nfts.length || 0}
      next={loadMore}
      hasMore={collection?.hasMore || false}
    >
      {collection?.nfts.map(nft => <NFTCard key={nft.id} nft={nft} />)}
    </InfiniteScroll>
  );
}
```

## 🔧 Storage Backends

### Session Storage (Default)

The package uses Chrome's session storage by default, which:

- Persists until browser closes
- Isolated per extension
- ~10MB limit
- Fast read/write

### Custom Storage Implementation

```typescript
import { StorageInterface } from '@onflow/frw-data-model';

class PersistentStorage implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  async removeItem(key: string): Promise<void> {
    await chrome.storage.local.remove(key);
  }

  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  }

  async getAllKeys(): Promise<string[]> {
    const items = await chrome.storage.local.get();
    return Object.keys(items);
  }
}
```

## 📊 Cache Key Reference

### Naming Convention

Cache keys follow a consistent pattern:

```
{dataType}-{network}-{address}-{...params}
```

### Common Keys

| Key Function                                       | Description     | Example                            |
| -------------------------------------------------- | --------------- | ---------------------------------- |
| `coinListKey(network, address, currency)`          | Token balances  | `coin-list-mainnet-0x123-usd`      |
| `nftCollectionListKey(network)`                    | NFT collections | `nft-collections-mainnet`          |
| `transferListKey(network, address, offset, limit)` | Transactions    | `transfer-list-mainnet-0x123-0-15` |
| `accountBalanceKey(network, address)`              | Account balance | `account-balance-mainnet-0x123`    |
| `userInfoCachekey(userId)`                         | User profile    | `user-info-abc123`                 |

## 🧪 Testing

```typescript
import { MemoryStorage } from '@onflow/frw-data-model/storage';
import { getCachedData, setCachedData } from '@onflow/frw-data-model';

describe('Cache Operations', () => {
  beforeEach(() => {
    // Use memory storage for tests
    global.chrome = {
      storage: {
        session: new MemoryStorage(),
      },
    };
  });

  it('should cache and retrieve data', async () => {
    const key = coinListKey('testnet', '0x123');
    const data = [{ symbol: 'FLOW', balance: '100' }];

    await setCachedData(key, data, 60_000);
    const cached = await getCachedData(key);

    expect(cached).toEqual(data);
  });
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the LGPL-3.0-or-later License - see the LICENSE file for details.

## 🔗 Related Packages

- [@onflow/frw-shared](../shared) - Shared types and utilities
- [@onflow/frw-core](../core) - Core business logic and services
- [@onflow/frw-reducers](../reducers) - State management reducers
- [@onflow/frw-extension-shared](../extension-shared) - Extension utilities
