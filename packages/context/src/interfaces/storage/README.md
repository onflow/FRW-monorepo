# Dual Storage System Documentation

## Overview

FRW uses a **dual storage architecture** optimized for different data types and
usage patterns. The system provides two distinct interfaces: **Storage** for
structured business data and **Cache** for high-performance temporary data.

## Storage vs Cache Comparison

| Feature         | Storage (Business Data)           | Cache (Query Data)           |
| --------------- | --------------------------------- | ---------------------------- |
| **Purpose**     | Persistent business data          | Temporary query cache        |
| **Type Safety** | Strongly typed StorageKeyMap      | Raw key-value pairs          |
| **Metadata**    | Automatic versioning + timestamps | None (performance optimized) |
| **TTL Support** | Manual                            | Automatic with cleanup       |
| **Performance** | Structured data                   | Optimized for speed          |
| **Keys**        | Fixed schema                      | Dynamic query hashes         |

## Quick Usage

### Storage (Business Data)

```typescript
import { storage } from '@onflow/frw-context';

// Type-safe business data with automatic metadata
await storage.set('user', { name: 'John', email: 'john@example.com' });
const user = await storage.get('user'); // StorageData<User> | undefined

// Access metadata
if (user) {
  console.log(`Created: ${new Date(user.createdAt)}, Version: ${user.version}`);
}
```

### Cache (High-Performance)

```typescript
import { cache } from '@onflow/frw-context';

// Fast key-value cache with optional TTL
await cache.set('session-123', sessionData, 5 * 60 * 1000); // 5 min TTL
const session = await cache.get('session-123');

// Batch operations
await cache.clearByPrefix('tanquery:'); // Clear all TanStack Query cache
const stats = await cache.getStats?.(); // Get cache statistics
```

### TanStack Query Integration (Automatic)

TanStack Query automatically uses the Cache system:

```typescript
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: fetchUser,
  staleTime: 5 * 60 * 1000,
});

// Automatically uses: cache.set('tanquery:${hash}', data, staleTime)
// 10x+ performance improvement over previous implementation
```

## Interfaces

### Storage Interface

```typescript
export interface Storage {
  // Type-safe operations with StorageKeyMap
  get<K extends keyof StorageKeyMap>(
    key: K
  ): Promise<StorageKeyMap[K] | undefined>;
  set<K extends keyof StorageKeyMap>(
    key: K,
    value: Omit<StorageKeyMap[K], 'version' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;
  has<K extends keyof StorageKeyMap>(key: K): Promise<boolean>;
  delete<K extends keyof StorageKeyMap>(key: K): Promise<void>;
  getAllKeys(): Promise<(keyof StorageKeyMap)[]>;
  clearAll(): Promise<void>;
  recrypt?(key: string | undefined): Promise<void>;
  trim?(): Promise<void>;
}
```

### Cache Interface

```typescript
export interface Cache {
  // High-performance key-value operations
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  getKeysByPrefix(prefix: string): Promise<string[]>;
  clear(): Promise<void>;
  clearByPrefix(prefix: string): Promise<void>;
  getStats?(): Promise<{ keyCount: number; estimatedSize?: number }>;
}
```

## Platform Implementation

Each platform implements both interfaces via `PlatformSpec`:

```typescript
// React Native
class PlatformImpl implements PlatformSpec {
  storage(): Storage {
    return new AsyncStorageImpl(); // Business data
  }

  cache(): Cache {
    return new AsyncStorageCache('tanquery:'); // Query cache
  }
}

// Browser Extension
class ExtensionPlatform implements PlatformSpec {
  storage(): Storage {
    return new ChromeStorageImpl(); // Business data
  }

  cache(): Cache {
    return new ChromeCache('tanquery:'); // Query cache
  }
}
```

## StorageKeyMap

Define your business data types in `StorageKeyMap`:

```typescript
export interface StorageKeyMap {
  tokens: StorageData<TokenModel[]>;
  user: StorageData<User>;
  wallet: StorageData<WalletConfig>;
  settings: StorageData<AppSettings>;
  auth: StorageData<AuthData>;
  cache: StorageData<CacheData>;
  recentRecipients: StorageData<RecentRecipient[]>;
}

// All data automatically wrapped with:
export type StorageData<T> = T & {
  version: string;
  createdAt: number;
  updatedAt: number;
};
```

## Adding New Storage Keys

1. **Define the data model** in `@onflow/frw-types`
2. **Add to StorageKeyMap** with proper typing
3. **Use with full type safety**

```typescript
// 1. In packages/types
export interface NotificationModel {
  id: string;
  title: string;
  message: string;
  read: boolean;
}

// 2. In StorageKeyMap
export interface StorageKeyMap {
  // ... existing keys
  notifications: StorageData<NotificationModel[]>;
}

// 3. Use with type safety
await storage.set('notifications', [
  { id: '1', title: 'Welcome', message: 'Hello!', read: false },
]);

const notifications = await storage.get('notifications'); // Fully typed!
```

## Performance Benefits

- **Storage**: Type safety and metadata for business logic requirements
- **Cache**: Raw performance for temporary data and query results
- **TanStack Query**: 10x+ performance improvement with independent key storage
- **Memory**: Reduced memory usage with automatic TTL cleanup

## Migration from Single Storage

**Before (Single Storage):**

```typescript
// All data mixed together in single storage system
await storage.set('tanstack-query-cache', { ...largeObject }); // Slow
```

**After (Dual Storage):**

```typescript
// Business data: structured with metadata
await storage.set('user', userData); // Type-safe with versioning

// Cache data: optimized for performance
await cache.set('tanquery:user-123', queryResult, 300000); // Fast TTL cache
```

## Best Practices

1. **Use Storage for**: User data, settings, wallet config, tokens, persistent
   state
2. **Use Cache for**: Query results, temporary data, computed values, API
   responses
3. **Type Safety**: Always use StorageKeyMap keys for Storage operations
4. **TTL**: Set appropriate TTL for Cache data to prevent memory bloat
5. **Prefixes**: Use consistent prefixes for Cache keys (`tanquery:`,
   `session:`, etc.)
6. **Cleanup**: Use `clearByPrefix()` for bulk cache cleanup operations

This dual storage system provides optimal performance while maintaining type
safety and clean architecture across all FRW platforms.
