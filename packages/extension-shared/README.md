# 🔌 @onflow/frw-extension-shared

> Extension-specific utilities and helpers for Flow Reference Wallet browser extensions

[![npm version](https://img.shields.io/npm/v/@onflow/frw-extension-shared.svg)](https://www.npmjs.com/package/@onflow/frw-extension-shared)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

## 📦 Overview

`@onflow/frw-extension-shared` provides specialized utilities for building browser extension wallets in the Flow ecosystem. It includes Chrome storage adapters, messaging systems, logging utilities, and contact management helpers.

### Key Features

- 💾 **Chrome Storage**: Type-safe Chrome storage adapter for caching
- 📡 **Messaging System**: Cross-context messaging for extensions
- 📝 **Logging**: Extension-specific logging with Chrome runtime support
- 👥 **Contact Utils**: Address book and contact management utilities
- 🔒 **Type Safe**: Full TypeScript support
- 🎯 **Extension Optimized**: Built specifically for browser extensions

## 📥 Installation

```bash
npm install @onflow/frw-extension-shared
```

```bash
yarn add @onflow/frw-extension-shared
```

```bash
pnpm add @onflow/frw-extension-shared
```

## 🚀 Quick Start

### Chrome Storage Integration

```typescript
import { ChromeStorage } from '@onflow/frw-extension-shared/chrome-storage';
import { CacheDataAccess } from '@onflow/frw-data-model';

// Create cache with Chrome storage
const storage = new ChromeStorage();
const cache = new CacheDataAccess(storage);

// Use cache as normal
await cache.set('user:123', userData, 3600);
const user = await cache.get('user:123');
```

### Messaging System

```typescript
import { MessageHub, createMessage, sendMessage } from '@onflow/frw-extension-shared/messaging';

// Create message hub
const hub = new MessageHub();

// Listen for messages
hub.on('USER_LOGIN', (data) => {
  console.log('User logged in:', data);
});

// Send message
await sendMessage({
  type: 'USER_LOGIN',
  data: { userId: '123', timestamp: Date.now() },
});
```

### Extension Logging

```typescript
import { ExtensionLogger } from '@onflow/frw-extension-shared/chrome-logger';

const logger = new ExtensionLogger('MyModule');

// Log with Chrome runtime info
logger.info('Extension started');
logger.error('Failed to connect', { error });
logger.debug('Cache hit', { key: 'user:123' });
```

## 📚 Core Components

### 💾 Chrome Storage Adapter

Implements the FRW data model storage interface for Chrome extensions.

```typescript
import { ChromeStorage } from '@onflow/frw-extension-shared/chrome-storage';

const storage = new ChromeStorage({
  area: 'local', // 'local' | 'sync' | 'session'
  prefix: 'frw_', // Optional key prefix
});

// Direct usage
await storage.setItem('key', 'value');
const value = await storage.getItem('key');
await storage.removeItem('key');
const allKeys = await storage.getAllKeys();

// With cache system
import { CacheDataAccess } from '@onflow/frw-data-model';
const cache = new CacheDataAccess(storage);
```

#### Storage Areas

- **local**: Persistent storage, ~10MB limit
- **sync**: Synced across devices, ~100KB limit
- **session**: Temporary storage, cleared on browser close

### 📡 Messaging System

Cross-context communication for browser extensions.

```typescript
import {
  MessageHub,
  PortMessage,
  BroadcastChannelMessage,
} from '@onflow/frw-extension-shared/messaging';

// Port-based messaging (background <-> popup/content)
const portMessenger = new PortMessage();

// Connect to background
portMessenger.connect('background');

// Listen for messages
portMessenger.on('WALLET_LOCKED', () => {
  console.log('Wallet locked');
});

// Send message
portMessenger.send('UNLOCK_WALLET', { password: '...' });

// Broadcast channel (between tabs/windows)
const broadcast = new BroadcastChannelMessage('frw-channel');

broadcast.on('NETWORK_CHANGED', (network) => {
  console.log('Network changed to:', network);
});

broadcast.send('NETWORK_CHANGED', 'testnet');
```

### 📝 Extension Logger

Logging utility with Chrome runtime integration.

```typescript
import { ExtensionLogger } from '@onflow/frw-extension-shared/chrome-logger';

const logger = new ExtensionLogger('WalletService', {
  enabled: true,
  level: 'debug', // 'error' | 'warn' | 'info' | 'debug'
  includeTimestamp: true,
  includeContext: true,
});

// Structured logging
logger.info('Transaction sent', {
  txId: '0x123...',
  amount: '10.0',
  to: '0xabc...',
});

// Error logging with stack traces
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error });
}

// Performance tracking
const timer = logger.time('fetchUserData');
const userData = await fetchUser();
timer.end({ userId: userData.id });
```

### 👥 Contact Utilities

Helper functions for managing contacts and address books.

```typescript
import {
  ContactUtils,
  formatContact,
  validateContact,
  searchContacts,
} from '@onflow/frw-extension-shared/contact-utils';

// Format contact for display
const formatted = formatContact({
  name: 'Alice',
  address: '0x1234567890abcdef',
  domain: 'alice.find',
  avatar: '🎨',
});

// Validate contact data
const isValid = validateContact(contactData);

// Search contacts
const results = searchContacts(contacts, 'ali');

// Manage contact groups
const grouped = ContactUtils.groupByDomain(contacts);
const favorites = ContactUtils.filterFavorites(contacts);
```

## 💡 Usage Patterns

### Extension Architecture

```typescript
// background.js
import { ChromeStorage } from '@onflow/frw-extension-shared/chrome-storage';
import { MessageHub } from '@onflow/frw-extension-shared/messaging';
import { ExtensionLogger } from '@onflow/frw-extension-shared/chrome-logger';

class BackgroundService {
  private storage = new ChromeStorage();
  private messageHub = new MessageHub();
  private logger = new ExtensionLogger('Background');

  constructor() {
    this.setupMessageHandlers();
    this.logger.info('Background service initialized');
  }

  private setupMessageHandlers() {
    this.messageHub.on('GET_USER_DATA', async (request, sender) => {
      const userData = await this.storage.getItem('userData');
      return userData;
    });

    this.messageHub.on('SAVE_USER_DATA', async (data) => {
      await this.storage.setItem('userData', data);
      this.logger.info('User data saved');
    });
  }
}

// popup.js
import { sendMessage } from '@onflow/frw-extension-shared/messaging';

async function loadUserData() {
  const userData = await sendMessage({
    type: 'GET_USER_DATA',
  });

  displayUserData(userData);
}
```

### State Synchronization

```typescript
import { ChromeStorage } from '@onflow/frw-extension-shared/chrome-storage';
import { BroadcastChannelMessage } from '@onflow/frw-extension-shared/messaging';

class StateSync {
  private storage = new ChromeStorage({ area: 'local' });
  private broadcast = new BroadcastChannelMessage('state-sync');

  async updateState(key: string, value: any) {
    // Update storage
    await this.storage.setItem(key, JSON.stringify(value));

    // Broadcast to other contexts
    this.broadcast.send('STATE_UPDATED', { key, value });
  }

  watchState(callback: (key: string, value: any) => void) {
    // Listen for broadcasts
    this.broadcast.on('STATE_UPDATED', ({ key, value }) => {
      callback(key, value);
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        for (const [key, { newValue }] of Object.entries(changes)) {
          if (newValue) {
            callback(key, JSON.parse(newValue));
          }
        }
      }
    });
  }
}
```

### Error Boundary Integration

```typescript
import { ExtensionLogger } from '@onflow/frw-extension-shared/chrome-logger';

const logger = new ExtensionLogger('ErrorBoundary');

// Global error handler
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
  });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise,
  });
});
```

## 🏗️ Architecture

```
@onflow/frw-extension-shared/
├── src/
│   ├── chrome-storage.ts    # Chrome storage adapter
│   ├── chrome-logger.ts     # Extension logging
│   ├── messaging.ts         # Message system exports
│   ├── contact-utils.ts     # Contact helpers
│   └── message/
│       ├── eventBus.ts      # Event emitter
│       ├── portMessage.ts   # Port messaging
│       └── broadcastChannelMessage.ts
```

## 🔧 Advanced Features

### Custom Message Protocol

```typescript
import { MessageHub } from '@onflow/frw-extension-shared/messaging';

// Define message types
interface MessageTypes {
  WALLET_CONNECT: { chainId: number };
  WALLET_DISCONNECT: void;
  SIGN_TRANSACTION: { tx: string };
  TRANSACTION_SIGNED: { signature: string };
}

// Type-safe message hub
class TypedMessageHub extends MessageHub {
  on<K extends keyof MessageTypes>(type: K, handler: (data: MessageTypes[K]) => void) {
    super.on(type, handler);
  }

  send<K extends keyof MessageTypes>(type: K, data: MessageTypes[K]) {
    super.send(type, data);
  }
}
```

### Storage Migration

```typescript
import { ChromeStorage } from '@onflow/frw-extension-shared/chrome-storage';

class StorageMigration {
  private storage = new ChromeStorage();

  async migrate() {
    const version = await this.storage.getItem('_version');

    if (!version || version < '2.0.0') {
      await this.migrateV1ToV2();
    }

    await this.storage.setItem('_version', '2.0.0');
  }

  private async migrateV1ToV2() {
    // Migrate data structure
    const oldData = await this.storage.getItem('userData');
    if (oldData) {
      const newData = this.transformData(oldData);
      await this.storage.setItem('userData_v2', newData);
      await this.storage.removeItem('userData');
    }
  }
}
```

## 🧪 Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🔒 Security Considerations

- Always validate messages between contexts
- Use content security policies in manifest
- Sanitize data before storage
- Implement permission checks for sensitive operations
- Use Chrome's native APIs for secure communication

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the LGPL-3.0-or-later License - see the LICENSE file for details.

## 🔗 Related Packages

- [@onflow/frw-shared](../shared) - Shared types and utilities
- [@onflow/frw-core](../core) - Core business logic and services
- [@onflow/frw-data-model](../data-model) - Cache data model
- [@onflow/frw-reducers](../reducers) - State management reducers
