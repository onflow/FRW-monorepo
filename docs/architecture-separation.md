# Flow Reference Wallet - Architecture Separation

## Folder Structure & Import Rules

This document outlines the architectural boundaries and import rules enforced by ESLint in the Flow Reference Wallet Chrome extension.

## Overview

The codebase is organized into distinct layers with strict import rules to maintain separation of concerns and prevent architectural violations. Each folder has specific responsibilities and controlled dependencies.

## Folder Structure

```
src/
├── background/          # Chrome extension background scripts
├── core/               # Core business logic and services
├── ui/                 # Popup UI components and views
│   ├── components/     # Reusable UI components
│   ├── views/         # Page-level components and screens
│   ├── hooks/         # Custom React hooks
│   ├── reducers/      # State management reducers
│   ├── utils/         # UI-specific utilities
│   ├── assets/        # Static assets (images, fonts, etc.)
│   └── style/         # Styling and theming
├── content-script/     # Web page content scripts
└── shared/            # Shared utilities and types
```

## Architecture Diagram

```mermaid
graph TB
    subgraph "Chrome Extension Context"
        subgraph "Background Service Worker"
            BG[background/]
            CORE[core/]
            BG --> CORE
        end

        subgraph "UI Context"
            UI[ui/]
            subgraph "UI Internal Structure"
                VIEWS[views/]
                COMPONENTS[components/]
                HOOKS[hooks/]
                REDUCERS[reducers/]
                UI_UTILS[utils/]
                ASSETS[assets/]
                STYLE[style/]

                VIEWS --> COMPONENTS
                VIEWS --> HOOKS
                VIEWS --> REDUCERS
                COMPONENTS --> HOOKS
                COMPONENTS --> REDUCERS
                HOOKS -.->|messaging| BG
                HOOKS --> SHARED
                REDUCERS --> SHARED
            end
        end

        subgraph "Content Script Context"
            CS[content-script/]
        end

        subgraph "Shared Context"
            SHARED[shared/]
        end
    end

    %% Dependencies
    UI -.->|messaging| BG
    CS --> BG
    BG --> SHARED
    CORE --> SHARED
    UI --> SHARED
    CS --> SHARED

    %% Styling
    classDef background fill:#e1f5fe
    classDef core fill:#f3e5f5
    classDef ui fill:#e8f5e8
    classDef uiInternal fill:#c8e6c9
    classDef contentScript fill:#fff3e0
    classDef shared fill:#f5f5f5

    class BG background
    class CORE core
    class UI ui
    class VIEWS,COMPONENTS,HOOKS,REDUCERS,UI_UTILS,ASSETS,STYLE uiInternal
    class CS contentScript
    class SHARED shared
```

## Layer Responsibilities

### 1. Background (`src/background/`)

- **Purpose**: Chrome extension background service worker
- **Responsibilities**:
  - Extension lifecycle management
  - Message routing between UI and core
  - Chrome API interactions
  - Wallet controller coordination
- **Can import from**: `@/core/*`, `@onflow/flow-wallet-shared/*`
- **Cannot import from**: `@/ui/*`

### 2. Core (`src/core/`)

- **Purpose**: Core business logic and services
- **Responsibilities**:
  - Wallet services (keyring, transactions, etc.)
  - Blockchain interactions
  - Business logic
  - Data persistence
- **Can import from**: `@onflow/flow-wallet-shared/*`, `@/background/webapi/*`
- **Cannot import from**: `@/ui/*`, `@/background/*` (except webapi)

### 3. UI (`src/ui/`)

- **Purpose**: Popup interface and user interactions
- **Responsibilities**:
  - React components and views
  - User interface logic
  - State management for display
  - User input handling
- **Can import from**: `@onflow/flow-wallet-shared/*`
- **Cannot import from**: `@/core/*`, `@/background/*`
- **Communication**: Uses messaging to communicate with background/wallet controller

#### UI Internal Structure

##### 3.1. Views (`src/ui/views/`)

- **Purpose**: Page-level components and complete screens
- **Responsibilities**:
  - Route components
  - Page layouts
  - Screen orchestration
  - Complex user flows
- **Can import from**: `@/ui/components/*`, `@/ui/hooks/*`, `@/ui/reducers/*`, `@/ui/utils/*`, `@/ui/assets/*`, `@/ui/style/*`, `@onflow/flow-wallet-shared/*`
- **Import pattern**: Views compose components and use hooks for state management

##### 3.2. Components (`src/ui/components/`)

- **Purpose**: Reusable UI components
- **Responsibilities**:
  - Atomic UI elements
  - Reusable component patterns
  - Component composition
  - UI interactions
- **Can import from**: `@/ui/hooks/*`, `@/ui/reducers/*`, `@/ui/utils/*`, `@/ui/assets/*`, `@/ui/style/*`, `@onflow/flow-wallet-shared/*`
- **Cannot import from**: `@/ui/views/*` (components should not depend on views)

##### 3.3. Hooks (`src/ui/hooks/`)

- **Purpose**: Custom React hooks for state and side effects
- **Responsibilities**:
  - State management logic
  - Background communication
  - Storage interactions
  - Custom React patterns
- **Can import from**: `@/ui/reducers/*`, `@/ui/utils/*`, `@onflow/flow-wallet-shared/*`
- **Special permissions**: Can communicate with background via messaging
- **Cannot import from**: `@/ui/views/*`, `@/ui/components/*`

##### 3.4. Reducers (`src/ui/reducers/`)

- **Purpose**: State management and data transformations
- **Responsibilities**:
  - State reduction logic
  - Data transformations
  - Action handling
  - Pure state functions
- **Can import from**: `@onflow/flow-wallet-shared/*` only
- **Cannot import from**: Any other UI subfolder or external folders
- **Note**: Must remain pure and isolated for predictable state management

##### 3.5. Utils (`src/ui/utils/`)

- **Purpose**: UI-specific utility functions
- **Responsibilities**:
  - UI helper functions
  - Formatting utilities
  - UI-specific calculations
  - Browser API wrappers
- **Can import from**: `@onflow/flow-wallet-shared/*`
- **Cannot import from**: Other UI subfolders (to prevent circular dependencies)

##### 3.6. Assets (`src/ui/assets/`)

- **Purpose**: Static assets for the UI
- **Responsibilities**:
  - Images, icons, fonts
  - Static JSON data
  - SVG assets
- **Import pattern**: Imported by other UI components using `@/ui/assets/*`

##### 3.7. Style (`src/ui/style/`)

- **Purpose**: Styling and theming
- **Responsibilities**:
  - Theme definitions
  - CSS utilities
  - Design tokens
  - Global styles
- **Can import from**: `@onflow/flow-wallet-shared/*` (for shared constants)
- **Import pattern**: Imported by components for styling

### 4. Content Script (`src/content-script/`)

- **Purpose**: Web page integration
- **Responsibilities**:
  - dApp provider injection
  - Web page communication
  - Flow FCL and Ethereum provider interfaces
- **Can import from**: `@/background/*`, `@onflow/flow-wallet-shared/*`

### 5. Shared Package (`@onflow/flow-wallet-shared`)

- **Purpose**: Common utilities and types (now as a separate workspace package)
- **Responsibilities**:
  - Type definitions
  - Utility functions
  - Constants
  - Common helpers
- **Location**: `packages/shared/`
- **Import as**: `@onflow/flow-wallet-shared/*`
- **Can import from**: Nothing (standalone package)
- **Cannot import from**: Any project folders

## Import Rules (Simplified)

### Key Principles

1. **Use aliases for cross-folder imports**: Always use `@/folder/*` syntax
2. **Shared package imports**: Use `@onflow/flow-wallet-shared/*`
3. **Layer boundaries are enforced**: UI ↔ Core/Background separation
4. **Relative imports allowed within folders**: Use `./` or `../` within the same folder

### Examples

```typescript
// ✅ Correct - importing from shared package
import { SomeType } from '@onflow/flow-wallet-shared/types/some-type';
import { formatAddress } from '@onflow/flow-wallet-shared/utils/address';

// ✅ Correct - cross-folder imports with aliases
import { walletService } from '@/core/service/wallet';
import { Button } from '@/ui/components/Button';
import { useWallet } from '@/ui/hooks/use-wallet';

// ✅ Correct - relative imports within same folder
import { helper } from './helper';
import { utils } from '../utils';
```

### Relative Imports (Only within same subfolder)

Use relative imports only within the same subfolder:

```typescript
// ✅ Correct - within same subfolder
import { helper } from './helper';
import { Component } from '../SubFolder/Component';
import { utils } from '../../utils/index';
```

### UI Import Hierarchy

```typescript
// ✅ Views can import components
import { AccountCard } from '@/ui/components/account/account-card';

// ✅ Components can import hooks
import { useWallet } from '@/ui/hooks/use-wallet';

// ✅ Hooks can import reducers
import { accountReducer } from '@/ui/reducers/account-reducer';

// ✅ Anyone can import from shared
import { formatAddress } from '@onflow/flow-wallet-shared/utils/address';
```

### Forbidden Patterns

```typescript
// ❌ Wrong - UI importing from core
import { keyringService } from '@/core/service/keyring';

// ❌ Wrong - Core importing from UI
import { Button } from '@/ui/components/Button';

// ❌ Wrong - Background importing from UI
import { useWallet } from '@/ui/hooks/use-wallet';

// ❌ Wrong - Reducers importing from other layers
import { walletController } from '@/background/controller/wallet';

// ❌ Wrong - Using old shared path
import { formatAddress } from '@/shared/utils/address';
// ✅ Correct - Use the package name
import { formatAddress } from '@onflow/flow-wallet-shared/utils/address';
```

## Communication Patterns

### UI ↔ Background Communication

UI communicates with background through Chrome extension messaging:

```typescript
// UI hooks
export const useWallet = () => {
  const walletController = new WalletController();

  const getAccounts = async () => {
    return await walletController.getAccounts();
  };

  return { getAccounts };
};

// Background side
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle messages from UI
});
```

### UI Internal Communication

```typescript
// Views use components and hooks
const Dashboard = () => {
  const { accounts } = useWallet(); // Hook for data

  return (
    <div>
      <AccountCard account={accounts[0]} /> {/* Component for UI */}
    </div>
  );
};

// Hooks use reducers for state management
const useWallet = () => {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  // ...
};
```

### Background ↔ Core Communication

Background directly imports and uses core services:

```typescript
// Background
import { keyringService } from '@/core/service/keyring';
const accounts = await keyringService.getAccounts();
```

## ESLint Enforcement (Simplified)

The ESLint rules have been simplified to focus on the essential architectural boundaries:

1. **Background folder**:

   - Cannot import from `@/ui/*`
   - All other imports allowed

2. **Core folder**:

   - Cannot import from `@/ui/*`
   - Can only import `@/background/webapi/*` from background
   - All other imports allowed

3. **Core services**:

   - Same as core, plus:
   - Can only import from `@/core/service/*` or `@/core/utils/*` within core

4. **UI folder**:

   - Cannot import from `@/core/*` or `@/background/*`
   - All other imports allowed

5. **UI reducers**:

   - Can only import from `@onflow/flow-wallet-shared/*`
   - Must remain pure (no imports from other layers)

6. **Content script**:
   - Cannot import from `@/ui/*` or `@/core/*`
   - Can import from `@/background/*` and shared

## Benefits

This architecture provides:

- **Clear separation of concerns**: Each layer has distinct responsibilities
- **Maintainable codebase**: Easier to understand and modify
- **Testable code**: Isolated layers can be tested independently
- **Chrome extension compliance**: Proper separation between contexts
- **Security**: Background service worker isolation
- **Scalability**: Clear boundaries for future development
- **Predictable state management**: Isolated reducers ensure predictable state changes
- **Reusable components**: Components can be used across different views
- **Organized UI structure**: Clear hierarchy from views → components → hooks → reducers

## Development Guidelines

1. **Before adding imports**: Check if the import follows the architectural rules
2. **Use aliases**: Always use `@/folder/*` aliases for cross-folder imports
3. **Keep layers isolated**: Don't create direct dependencies between UI and core
4. **Use messaging**: UI should communicate with core through background messaging
5. **Shared utilities**: Put common code in shared, not in specific layers
6. **UI hierarchy**: Follow views → components → hooks → reducers pattern
7. **Pure reducers**: Keep reducers isolated and pure for predictable state management
8. **Reusable components**: Design components to be reusable across different views

## Violations and Fixes

If you encounter ESLint violations:

1. **"UI cannot import from Core layer"**: Use the wallet controller messaging instead
2. **"Core cannot import from UI layer"**: Core should not depend on UI components
3. **"Background cannot import from UI layer"**: Background is a service worker without DOM access
4. **"Reducers must be pure"**: Move side effects to hooks, keep reducers pure
5. **"Core services can only import webapi from background"**: Use the webapi module for browser APIs

This architecture ensures a maintainable, secure, and scalable Chrome extension codebase with clear separation of concerns at both the application and UI levels.
