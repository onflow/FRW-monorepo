# FRW Development Guidelines

This document outlines development best practices for the Flow Reference Wallet
(FRW) monorepo to ensure code quality, maintainability, and adherence to our
MVVM architecture.

## 🚫 Critical Rules - Zero Tolerance

### 1. Logging Standards

**❌ NEVER use `console.log` directly**

```typescript
// ❌ BAD - Direct console logging
console.log('User logged in:', userId);
console.error('Transaction failed:', error);
```

**✅ ALWAYS use the centralized logger**

```typescript
// ✅ GOOD - Structured logging
import { logger } from '@onflow/frw-utils';

logger.info('User authentication completed', { userId, timestamp: Date.now() });
logger.error('Transaction processing failed', {
  error: error.message,
  transactionId,
  userId,
});
```

**Benefits:**

- Cross-platform compatibility (Extension, React Native, Web)
- Structured logging with context
- Centralized log management
- Production-safe log levels

### 2. UI Package Purity Rules

**❌ NEVER import business logic in `packages/ui`**

```typescript
// ❌ BAD - Business logic imports in UI
import { useWalletStore } from '@onflow/frw-stores';
import { tokenService } from '@onflow/frw-services';

// ❌ BAD - Hardcoded values
const TokenCard = () => (
  <YStack bg="#FF0000" p={16}> {/* Hardcoded color and size */}
    <Text fontSize={14}>Balance</Text> {/* Hardcoded size */}
  </YStack>
);
```

**✅ CORRECT approach for UI components**

```typescript
// ✅ GOOD - Pure UI with props
interface TokenCardProps {
  balance: string;
  tokenName: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const TokenCard = ({ balance, tokenName, variant = 'primary', size = 'medium' }: TokenCardProps) => (
  <YStack
    bg={variant === 'primary' ? '$blue500' : '$gray100'}
    p={size === 'large' ? '$6' : '$4'}
  >
    <Text fontSize={size === 'large' ? '$6' : '$4'}>{balance}</Text>
  </YStack>
);
```

**UI Package Rules:**

- **Zero business logic imports** - no stores, services, or workflows
- **No hardcoded colors/sizes** - use theme tokens (`$blue500`, `$4`, etc.)
- **Pure components** - all data via props
- **Exception handling** - Only for critical cases with team approval

### 3. Screen Implementation Patterns

**❌ AVOID complex logic outside screen components**

```typescript
// ❌ BAD - Logic scattered across multiple files
// utils/send-helpers.ts
export const prepareSendTransaction = (amount, recipient) => {
  /* complex logic */
};

// SendScreen.tsx
const SendScreen = () => {
  const transaction = prepareSendTransaction(amount, recipient); // Logic outside screen
  // ...
};
```

**✅ KEEP screen logic self-contained**

```typescript
// ✅ GOOD - Logic within screen (single-use screens)
const SendTokensScreen = () => {
  // Screen-specific logic here
  const handleSendTransaction = useCallback(
    async (amount: string, recipient: string) => {
      try {
        logger.info('Initiating token transfer', { amount, recipient });
        const result = await sendStore.sendTokens(amount, recipient);
        // Handle result...
      } catch (error) {
        logger.error('Token transfer failed', {
          error: error.message,
          amount,
          recipient,
        });
      }
    },
    []
  );

  // Rest of component...
};
```

**✅ PARAMETERIZE reusable screens**

```typescript
// ✅ GOOD - Reusable screen with parameters
interface TokenSelectorScreenProps {
  onTokenSelect: (token: TokenModel) => void;
  allowedTokens?: string[];
  title?: string;
  subtitle?: string;
}

const TokenSelectorScreen = ({
  onTokenSelect,
  allowedTokens = [],
  title = 'Select Token',
  subtitle,
}: TokenSelectorScreenProps) => {
  // Implementation...
};
```

**Screen Guidelines:**

- **Single-use screens**: Keep implementation within the screen file
- **Reusable screens**: Use props for customization
- **Complex workflows**: Use stores/services, not external utility functions
- **Data fetching**: Delegate to stores, not direct service calls

## 🔗 Architecture Boundaries

### 4. PlatformSpec Modifications

**🚨 CRITICAL: Any changes to `PlatformSpec` require team notification**

```typescript
// packages/context/src/interfaces/PlatformSpec.ts
export interface PlatformSpec {
  // Adding or modifying any method here affects ALL platforms:
  // - React Native (iOS/Android)
  // - Browser Extension (Chrome/Firefox)
  // - Web Application
}
```

**Change Process:**

1. **Propose changes** in team discussion before implementation
2. **Document impact** on all platforms (RN, Extension, Web)
3. **Coordinate implementation** across platform teams
4. **Test thoroughly** on all supported platforms

**Why this matters:**

- Cross-platform compatibility requirements
- Native implementation needed for RN
- Extension security model considerations
- Web browser API limitations

### 5. Bridge Data Structure Rules

**✅ ALL PlatformSpec data structures MUST be defined in
`packages/types/src/Bridge.ts`**

```typescript
// ✅ GOOD - Centralized bridge types
// packages/types/src/Bridge.ts
export interface WalletConnectionRequest {
  dappName: string;
  dappUrl: string;
  permissions: string[];
  chainId?: string;
}

export interface TransactionRequest {
  cadence: string;
  arguments: ArgumentValue[];
  gasLimit?: number;
}

// packages/context/src/interfaces/PlatformSpec.ts
import { WalletConnectionRequest, TransactionRequest } from '@onflow/frw-types';

export interface PlatformSpec {
  connectWallet(request: WalletConnectionRequest): Promise<boolean>;
  sendTransaction(request: TransactionRequest): Promise<string>;
}
```

**❌ NEVER define bridge types inline**

```typescript
// ❌ BAD - Inline type definition
export interface PlatformSpec {
  connectWallet(request: {
    dappName: string;
    dappUrl: string; // This should be in Bridge.ts!
  }): Promise<boolean>;
}
```

**Benefits:**

- **Single source of truth** for cross-platform data contracts
- **Type safety** across all platform implementations
- **Documentation** - Bridge.ts serves as API reference
- **Version control** - Changes are tracked in one place

## 💾 Storage Management

### 6. Type-Safe Storage

**✅ ALWAYS define storage keys in StorageKeyMap**

```typescript
// ✅ GOOD - Typed storage usage
import { StorageKeyMap } from '@onflow/frw-context';

// Define your data type
interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  notifications: boolean;
}

// Add to StorageKeyMap
declare module '@onflow/frw-context' {
  interface StorageKeyMap {
    userPreferences: UserPreferences;
  }
}

// Use with full type safety
const preferences = await storage.get('userPreferences');
await storage.set('userPreferences', {
  theme: 'dark',
  currency: 'USD',
  notifications: true,
});
```

**❌ NEVER use untyped storage**

```typescript
// ❌ BAD - No type safety
await storage.set('user_prefs', { theme: 'dark' }); // Typo-prone key
const prefs = await storage.get('userPrefs'); // Different key!
// prefs is 'any' type - no IntelliSense, no type checking
```

**Storage Best Practices:**

- **Strong typing** - No `any` types allowed
- **Consistent keys** - Use camelCase, defined in StorageKeyMap
- **Error handling** - Always handle storage failures
- **Sensitive data** - Use encrypted storage for secrets
- **Version migrations** - Handle data structure changes gracefully

## 🏗️ MVVM Architecture Enforcement

### Layer Responsibilities

**📋 Model Layer (`packages/types`)**

- Pure data structures and interfaces
- Zero dependencies on other packages
- TypeScript definitions only

**🌐 Network Layer (`packages/api`, `packages/cadence`)**

- HTTP API clients and blockchain interactions
- Data fetching and external service communication
- Error handling for network operations

**⚙️ Business Logic (`packages/services`, `packages/workflow`)**

- Domain services and transaction orchestration
- Data transformation and validation
- Business rules implementation

**🧠 ViewModel (`packages/stores`)**

- UI state management with Zustand
- Data caching and transformation for UI consumption
- Bridge between business logic and UI

**🎨 UI Layer (`packages/ui`)**

- Pure, stateless components
- No business logic or store imports
- Theme-based styling only

**📺 Screen Layer (`packages/screens`)**

- Integration of UI components with ViewModels
- Screen-specific business logic
- Navigation and user interaction handling

### Import Rules by Layer

```typescript
// ✅ ALLOWED imports by package

// packages/types - No imports from other FRW packages

// packages/api & packages/cadence
import { UserModel } from '@onflow/frw-types'; // ✅ Types only

// packages/services & packages/workflow
import { TokenModel } from '@onflow/frw-types'; // ✅ Types
import { apiClient } from '@onflow/frw-api'; // ✅ Network layer

// packages/stores
import { WalletService } from '@onflow/frw-services'; // ✅ Business logic
import { UserModel } from '@onflow/frw-types'; // ✅ Types

// packages/ui
import { TokenModel } from '@onflow/frw-types'; // ✅ Types for props only
// ❌ NO imports from stores, services, workflow, api, cadence

// packages/screens
import { TokenCard } from '@onflow/frw-ui'; // ✅ UI components
import { useWalletStore } from '@onflow/frw-stores'; // ✅ ViewModels
import { TokenModel } from '@onflow/frw-types'; // ✅ Types
```

## 🔍 Code Review Checklist

Before submitting any PR, ensure:

- [ ] **Logging**: No `console.log` usage, proper logger implementation
- [ ] **UI Purity**: No business logic imports in `packages/ui`
- [ ] **Screen Logic**: Appropriate abstraction level for screen components
- [ ] **PlatformSpec**: Team notification for any interface changes
- [ ] **Bridge Types**: All PlatformSpec data structures in `Bridge.ts`
- [ ] **Storage Types**: Strong typing with StorageKeyMap definitions
- [ ] **MVVM Boundaries**: Correct import patterns between layers
- [ ] **Error Handling**: Proper error logging and user feedback
- [ ] **Type Safety**: No `any` types without explicit justification

## 🚀 Tools and Automation

Run these commands before submitting:

```bash
# Type checking
pnpm typecheck

# Linting (includes import boundary checks)
pnpm lint

# Formatting
pnpm format

# Full validation
pnpm build && pnpm test
```

## 📞 Getting Help

When in doubt:

- **Architecture questions**: Consult team lead or architect
- **PlatformSpec changes**: Create RFC and notify all platform maintainers
- **Storage patterns**: Review existing implementations in stores
- **UI components**: Check Storybook for existing patterns (`pnpm storybook`)

---

**Remember**: These guidelines maintain code quality, prevent bugs, and ensure
our MVVM architecture scales effectively across all platforms. Following them
makes the entire team more productive! 🎯
