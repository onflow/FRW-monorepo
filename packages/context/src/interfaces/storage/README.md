# Storage System Documentation

## Overview

The FRW Storage system provides a type-safe, unified interface for persistent
data storage across platforms. It automatically handles versioning, metadata,
and provides full TypeScript type safety.

## Architecture

```
Storage Interface (Platform-agnostic)
├── StorageKeyMap (Type definitions)
├── StorageData<T> (Generic wrapper with metadata)
└── Platform-specific implementations
    ├── Extension (chrome.storage.local)
    ├── React Native (MMKV)
    └── Web (localStorage with fallbacks)
```

## Key Features

- **Type Safety**: Full TypeScript support with automatic type inference
- **Versioning**: Automatic version control with `createdAt` and `updatedAt`
  timestamps
- **Platform Agnostic**: Same API works across Extension, React Native, and Web
- **Metadata**: Automatic metadata management (version, timestamps)
- **Generic Design**: `StorageData<T>` wrapper for any data type

## Core Types

### StorageData<T>

```typescript
export type StorageData<T> = T & {
  version: string;
  createdAt: number;
  updatedAt: number;
};
```

All stored data is automatically wrapped with metadata for versioning and
tracking.

### StorageKeyMap

```typescript
export interface StorageKeyMap {
  tokens: StorageData<TokenModel[]>;
  user: StorageData<User>;
  wallet: StorageData<WalletConfig>;
  settings: StorageData<AppSettings>;
  auth: StorageData<AuthData>;
  cache: StorageData<CacheData>;
}
```

Defines all available storage keys and their corresponding data types.

## Storage Interface

```typescript
export interface Storage {
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

## Basic Usage

```typescript
import { getStorage } from '@onflow/frw-context';

async function example() {
  const storage = getStorage();

  // Store data (metadata added automatically)
  await storage.set('user', {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
  });

  // Retrieve data (full type safety)
  const user = await storage.get('user'); // Type: StorageData<User> | undefined
  if (user) {
    console.log(`User: ${user.name}, Created: ${new Date(user.createdAt)}`);
  }

  // Check if key exists
  if (await storage.has('tokens')) {
    const tokens = await storage.get('tokens');
  }

  // Delete data
  await storage.delete('cache');
}
```

## Platform Implementations

### Extension Implementation (Chrome Storage)

```typescript
// apps/extension/src/services/ExtensionStorage.ts
import type { Storage, StorageKeyMap } from '@onflow/frw-context';

export class ExtensionStorage implements Storage {
  private readonly storageArea = chrome.storage.local;

  async get<K extends keyof StorageKeyMap>(
    key: K
  ): Promise<StorageKeyMap[K] | undefined> {
    try {
      const result = await this.storageArea.get(key as string);
      const data = result[key as string];

      if (!data) return undefined;

      // Parse JSON if string, return as-is if object
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      console.error(`Failed to get ${key as string}:`, error);
      return undefined;
    }
  }

  async set<K extends keyof StorageKeyMap>(
    key: K,
    value: Omit<StorageKeyMap[K], 'version' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      const now = Date.now();
      const existingData = await this.get(key);

      const dataWithMetadata = {
        ...value,
        version: '1.0.0',
        createdAt: existingData?.createdAt ?? now,
        updatedAt: now,
      } as StorageKeyMap[K];

      await this.storageArea.set({
        [key]: JSON.stringify(dataWithMetadata),
      });
    } catch (error) {
      console.error(`Failed to set ${key as string}:`, error);
      throw new Error(`Storage write failed: ${error}`);
    }
  }

  async has<K extends keyof StorageKeyMap>(key: K): Promise<boolean> {
    try {
      const result = await this.storageArea.get(key as string);
      return result[key as string] !== undefined;
    } catch {
      return false;
    }
  }

  async delete<K extends keyof StorageKeyMap>(key: K): Promise<void> {
    try {
      await this.storageArea.remove(key as string);
    } catch (error) {
      console.error(`Failed to delete ${key as string}:`, error);
    }
  }

  async getAllKeys(): Promise<(keyof StorageKeyMap)[]> {
    try {
      const result = await this.storageArea.get(null);
      return Object.keys(result) as (keyof StorageKeyMap)[];
    } catch {
      return [];
    }
  }

  async clearAll(): Promise<void> {
    try {
      await this.storageArea.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}
```

**Usage in Extension:**

```typescript
// apps/extension/src/background/storage.ts
import { ExtensionStorage } from '../services/ExtensionStorage';

const storage = new ExtensionStorage();

// Register with service context
import { ServiceContext } from '@onflow/frw-context';
ServiceContext.getInstance().setStorage(storage);
```

### React Native Implementation (MMKV)

```typescript
// apps/react-native/src/services/ReactNativeStorage.ts
import { MMKV } from 'react-native-mmkv';
import type { Storage, StorageKeyMap } from '@onflow/frw-context';

export class ReactNativeStorage implements Storage {
  private mmkv: MMKV;

  constructor(encryptionKey?: string) {
    this.mmkv = new MMKV({
      id: 'frw-storage',
      encryptionKey,
    });
  }

  async get<K extends keyof StorageKeyMap>(
    key: K
  ): Promise<StorageKeyMap[K] | undefined> {
    try {
      const data = this.mmkv.getString(key as string);
      return data ? JSON.parse(data) : undefined;
    } catch (error) {
      console.error(`Failed to get ${key as string}:`, error);
      return undefined;
    }
  }

  async set<K extends keyof StorageKeyMap>(
    key: K,
    value: Omit<StorageKeyMap[K], 'version' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      const now = Date.now();
      const existingData = await this.get(key);

      const dataWithMetadata = {
        ...value,
        version: '1.0.0',
        createdAt: existingData?.createdAt ?? now,
        updatedAt: now,
      } as StorageKeyMap[K];

      this.mmkv.set(key as string, JSON.stringify(dataWithMetadata));
    } catch (error) {
      console.error(`Failed to set ${key as string}:`, error);
      throw new Error(`Storage write failed: ${error}`);
    }
  }

  async has<K extends keyof StorageKeyMap>(key: K): Promise<boolean> {
    return this.mmkv.contains(key as string);
  }

  async delete<K extends keyof StorageKeyMap>(key: K): Promise<void> {
    this.mmkv.delete(key as string);
  }

  async getAllKeys(): Promise<(keyof StorageKeyMap)[]> {
    return this.mmkv.getAllKeys() as (keyof StorageKeyMap)[];
  }

  async clearAll(): Promise<void> {
    this.mmkv.clearAll();
  }
}
```

**Usage in React Native:**

```typescript
// apps/react-native/src/App.tsx
import { ReactNativeStorage } from './services/ReactNativeStorage';
import { ServiceContext } from '@onflow/frw-context';

// Initialize storage with optional encryption
const storage = new ReactNativeStorage('my-encryption-key');

// Register with service context
ServiceContext.getInstance().setStorage(storage);
```

## Adding New Storage Types

### Step 1: Define Data Model

If you need a new data model, add it to the types package:

```typescript
// packages/types/src/NotificationModel.ts
export interface NotificationModel {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  createdAt: number;
}
```

### Step 2: Add to StorageKeyMap

```typescript
// packages/context/src/interfaces/storage/StorageKeyMap.ts
import type { NotificationModel } from '@onflow/frw-types';

export interface StorageKeyMap {
  // ... existing keys
  notifications: StorageData<NotificationModel[]>;
}
```

### Step 3: Use the New Storage Type

```typescript
// Automatically type-safe!
async function handleNotifications() {
  const storage = getStorage();

  // Store notifications
  await storage.set('notifications', [
    {
      id: '1',
      title: 'Welcome!',
      message: 'Welcome to FRW',
      type: 'info',
      read: false,
      createdAt: Date.now(),
    },
  ]);

  // Retrieve notifications (fully typed)
  const notifications = await storage.get('notifications'); // StorageData<NotificationModel[]> | undefined
}
```

## Migration and Versioning

The storage system automatically handles versioning. For data migrations:

```typescript
async function handleMigration() {
  const storage = getStorage();
  const userData = await storage.get('user');

  if (userData && userData.version !== CURRENT_VERSION) {
    // Perform migration
    const migratedData = migrateUserData(userData);
    await storage.set('user', migratedData);
  }
}
```

## Error Handling

```typescript
try {
  await storage.set('user', userData);
} catch (error) {
  console.error('Storage failed:', error);
  // Handle storage failure (show user message, retry, etc.)
}
```

## Best Practices

1. **Type Safety**: Always use the defined keys from `StorageKeyMap`
2. **Error Handling**: Wrap storage operations in try-catch blocks
3. **Performance**: Use `has()` before `get()` for optional data
4. **Security**: Use encryption keys for sensitive data (React Native)
5. **Cleanup**: Use `trim()` periodically to optimize storage (React Native)
6. **Versioning**: Always handle version migrations properly

## Testing

```typescript
// Mock storage for testing
class MockStorage implements Storage {
  private data = new Map();

  async get<K extends keyof StorageKeyMap>(
    key: K
  ): Promise<StorageKeyMap[K] | undefined> {
    return this.data.get(key);
  }

  async set<K extends keyof StorageKeyMap>(key: K, value: any): Promise<void> {
    this.data.set(key, {
      ...value,
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // ... implement other methods
}
```

This storage system provides a robust, type-safe foundation for data persistence
across all FRW platforms while maintaining clean architecture and excellent
developer experience.
