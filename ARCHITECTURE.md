# FRW Monorepo Architecture Documentation

## Overview

Flow Reference Wallet (FRW) adopts a monorepo architecture using pnpm workspaces to manage multiple packages. The overall architecture is based on layered design and the ServiceContext pattern, achieving clear separation of responsibilities and dependency management.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Applications Layer"
        RN[React Native App]
        EXT[Browser Extension]
    end
    
    subgraph "Business Logic Layer"
        STORES[📦 stores<br/>State Management]
        WORKFLOW[📦 workflow<br/>Transaction Logic]
    end
    
    subgraph "Service Layer"
        SERVICES[📦 services<br/>Business Services]
    end
    
    subgraph "Core Layer"
        CADENCE[📦 cadence<br/>Flow Integration]
        API[📦 api<br/>Network Layer]
    end
    
    subgraph "Foundation Layer"
        CONTEXT[📦 context<br/>DI Container & Interfaces]
        TYPES[📦 types<br/>Type Definitions]
        UTILS[📦 utils<br/>Utilities]
    end
    
    subgraph "Platform Bridge"
        BRIDGE[Bridge Layer<br/>Native Integration]
    end

    %% Dependencies
    RN --> STORES
    RN --> WORKFLOW
    RN --> SERVICES
    RN --> BRIDGE
    
    EXT --> STORES
    EXT --> WORKFLOW
    EXT --> SERVICES
    
    STORES --> SERVICES
    WORKFLOW --> CADENCE
    WORKFLOW --> SERVICES
    
    SERVICES --> CONTEXT
    SERVICES --> API
    SERVICES --> CADENCE
    
    CADENCE --> TYPES
    API --> TYPES
    SERVICES --> TYPES
    STORES --> TYPES
    WORKFLOW --> TYPES
    
    SERVICES --> UTILS
    STORES --> UTILS
    
    CONTEXT --> CADENCE
    CONTEXT --> WORKFLOW
    CONTEXT -.-> BRIDGE
    
    %% Styling
    classDef appLayer fill:#e1f5fe
    classDef businessLayer fill:#f3e5f5
    classDef serviceLayer fill:#e8f5e8
    classDef coreLayer fill:#fff3e0
    classDef foundationLayer fill:#fafafa
    classDef bridgeLayer fill:#ffebee
    
    class RN,EXT appLayer
    class STORES,WORKFLOW businessLayer
    class SERVICES serviceLayer
    class CADENCE,API coreLayer
    class CONTEXT,TYPES,UTILS foundationLayer
    class BRIDGE bridgeLayer
```

## Package Architecture

### 📱 Applications Layer

#### React Native App (`apps/react-native`)
- **Responsibility**: Mobile app entry point, UI rendering, user interaction
- **Tech Stack**: React Native, React Navigation, NativeWind
- **Key Features**:
  - Theme system (Light/Dark mode)
  - Native Bridge integration
  - Service initialization and dependency injection

```typescript
// App.tsx - Service initialization
import { ServiceContext } from '@onflow/frw-context';
import { bridge } from './bridge/RNBridge';

useEffect(() => {
  // Initialize ServiceContext for dependency injection
  ServiceContext.initialize(bridge);
}, []);
```

#### Browser Extension (`apps/extension`)
- **Responsibility**: Browser extension entry point
- **Status**: Reserved for future extension

---

### 🧠 Business Logic Layer

#### 📦 Stores Package (`packages/stores`)
- **Responsibility**: Global state management, caching strategies
- **Tech Stack**: Zustand
- **Core Modules**:
  - `walletStore`: Wallet account management
  - `tokenStore`: Token and NFT data caching
  - `sendStore`: Transfer flow state management

```javascript
// Accessing services through ServiceContext
import { getCadenceService } from '@onflow/frw-context';
import { getFlowService } from '@onflow/frw-services';

const cadenceService = getCadenceService();
const flowService = getFlowService();
```

#### 📦 Workflow Package (`packages/workflow`)
- **Responsibility**: Transaction logic, transfer strategy pattern
- **Design Pattern**: Strategy Pattern
- **Core Features**:
  - Multiple transfer strategies (Flow-to-Flow, EVM-to-EVM, cross-chain transfers, etc.)
  - Bridge authentication integration
  - FCL configuration management

```javascript
// Bridge authentication integration
export function createCadenceService(network, bridge) {
  const service = new CadenceService();
  
  if (bridge) {
    // Inject authentication interceptors
    service.useRequestInterceptor(async (config) => {
      if (config.type === 'transaction') {
        config.payer = await bridge.getPayer();
        config.proposer = await bridge.getProposer();
        config.authorizations = await bridge.getAuthorizations();
      }
      return config;
    });
  }
  
  return service;
}
```

---

### 🔧 Service Layer

#### 📦 Services Package (`packages/services`)
- **Responsibility**: Business service encapsulation
- **Core Modules**:
  - `FlowService`: Flow blockchain interaction
  - `TokenService` / `NFTService`: Asset data services
  - `AddressBookService`: Address book management
- **Dependencies**: Uses ServiceContext from `@onflow/frw-context` for DI


---

### ⚡ Core Layer

#### 📦 Cadence Package (`packages/cadence`)
- **Responsibility**: Flow blockchain low-level interaction
- **Tech Stack**: @onflow/fcl
- **Core Features**:
  - Cadence script execution
  - Transaction building and signing
  - Request/response interceptor system

#### 📦 API Package (`packages/api`)
- **Responsibility**: HTTP API calls, external service integration
- **Tech Stack**: Axios, OpenAPI code generation
- **Services**:
  - Flow API services
  - Third-party data services

---

### 🏗️ Foundation Layer

#### 📦 Context Package (`packages/context`)
- **Responsibility**: Dependency injection container and core interfaces
- **Tech Stack**: TypeScript
- **Core Features**:
  - `ServiceContext`: Singleton dependency injection container
  - `BridgeSpec`: Platform abstraction interface
  - Service initialization and lifecycle management

##### ServiceContext Pattern

```typescript
// packages/context/src/ServiceContext.ts
export class ServiceContext {
  private static instance: ServiceContext | null = null;
  private _bridge: BridgeSpec | null = null;
  private _cadenceService: CadenceService | null = null;

  public static initialize(bridge: BridgeSpec): ServiceContext {
    if (!ServiceContext.instance) {
      ServiceContext.instance = new ServiceContext();
    }
    ServiceContext.instance._bridge = bridge;
    
    // Create authenticated CadenceService
    const network = bridge.getNetwork() as 'mainnet' | 'testnet';
    ServiceContext.instance._cadenceService = createCadenceService(network, bridge);
    
    return ServiceContext.instance;
  }

  // Getter methods provide service access
  get cadence(): CadenceService { return this._cadenceService!; }
  get bridge(): BridgeSpec { return this._bridge!; }
}

// Convenience functions
export const getCadenceService = () => getServiceContext().cadence;
export const getServiceContext = () => ServiceContext.getInstance();
```

##### Bridge Specification

```typescript
// packages/context/src/interfaces/BridgeSpec.ts
export interface BridgeSpec {
  // Basic platform methods
  getSelectedAddress(): string | null;
  getNetwork(): string;
  getJWT(): Promise<string>;
  getVersion(): string;
  getBuildNumber(): string;
  sign(hexData: string): Promise<string>;
  getSignKeyIndex(): number;
  
  // Data access methods
  getRecentContacts(): Promise<RecentContactsResponse>;
  getWalletAccounts(): Promise<WalletAccountsResponse>;
  
  // Flow transaction authentication methods
  getProposer(): Promise<any>;
  getPayer(): Promise<any>;
  getAuthorizations(): Promise<any[]>;
  
  // UI interaction methods
  scanQRCode(): Promise<string>;
  closeRN(): void;
}
```

#### 📦 Types Package (`packages/types`)
- **Responsibility**: TypeScript type definitions
- **Core Types**:
  - `WalletAccount`, `TokenInfo`, `NFTModel`
  - `BridgeSpec`, `SendPayload`
  - Business domain models

#### 📦 Utils Package (`packages/utils`)
- **Responsibility**: Pure function utility library
- **Features**:
  - Address formatting and validation
  - NFT data processing
  - String and numeric utilities

---

## React Native App Layer Architecture

### 🏗️ Layer Structure

```
apps/react-native/
├── src/
│   ├── components/          # UI component layer
│   │   ├── ui/             # Basic UI components
│   │   └── screens/        # Screen components
│   ├── contexts/           # React Context
│   │   ├── ThemeContext    # Theme management
│   │   └── ConfirmationDrawerContext
│   ├── navigation/         # Navigation layer
│   │   └── AppNavigator    # React Navigation config
│   ├── bridge/            # Platform bridge layer
│   │   ├── RNBridge       # React Native Bridge implementation
│   │   └── NativeFRWBridge # Native module interface
│   ├── network/           # Network configuration layer
│   │   └── cadence        # FCL configuration
│   └── lib/               # Application utility layer
│       ├── i18n           # Internationalization
│       └── androidTextFix # Platform adaptation
```

### 🔄 Data Flow

```mermaid
sequenceDiagram
    participant UI as UI Components
    participant Store as Zustand Store
    participant Service as Service Layer
    participant Bridge as Native Bridge
    participant Flow as Flow Network

    UI->>Store: User action (e.g., send transaction)
    Store->>Service: Call business service
    Service->>Bridge: Request signature/authentication
    Bridge->>Service: Return signature data
    Service->>Flow: Send transaction to Flow
    Flow->>Service: Return transaction result
    Service->>Store: Update state
    Store->>UI: Trigger UI update
```

### 🔌 Bridge Integration

#### Native Bridge Architecture

```typescript
// apps/react-native/src/bridge/RNBridge.ts
class RNBridge implements BridgeSpec {
  getSelectedAddress(): string | null {
    return NativeFRWBridge.getSelectedAddress();
  }

  async getProposer(): Promise<any> {
    return await NativeFRWBridge.getProposer();
  }

  async getPayer(): Promise<any> {
    return await NativeFRWBridge.getPayer();
  }

  async getAuthorizations(): Promise<any[]> {
    return await NativeFRWBridge.getAuthorizations();
  }
}
```

#### Service Initialization Flow

```typescript
// App.tsx
import { ServiceContext } from '@onflow/frw-context';

const App = () => {
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Initialize ServiceContext with bridge
      ServiceContext.initialize(bridge);
      
      // 2. Load wallet data
      await loadAccountsFromBridge();
    };
    
    initializeApp();
  }, []);
};
```

## Key Design Principles

### 🎯 Layer Responsibilities

1. **UI Layer**: Pure presentation logic, no business logic
2. **State Layer**: State management and caching strategies
3. **Service Layer**: Business logic encapsulation and API abstraction
4. **Core Layer**: Blockchain and network interaction
5. **Foundation Layer**: Type definitions and utility functions

### 🔄 Dependency Management

- **Upward Dependencies**: Lower layers don't depend on higher layers
- **Horizontal Isolation**: Minimal dependencies between same-layer packages
- **Interface Abstraction**: Decoupling through interfaces and ServiceContext

### 🚀 Extensibility

- **Adding Services**: Add new services in services package, access through ServiceContext from context package
- **Adding Applications**: Reuse all packages, only need to implement corresponding Bridge
- **Adding Features**: Extend through Strategy Pattern in workflow

## Development Workflow

### 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start React Native
cd apps/react-native
pnpm start

# Run tests
pnpm run test
```

### 📦 Package Development

1. **Modify Types**: Define in `packages/types`
2. **Add Utility Functions**: Implement in `packages/utils`
3. **Add Services**: Add in `packages/services`, access through ServiceContext from `packages/context`
4. **State Management**: Use Zustand in `packages/stores`
5. **Transaction Logic**: Use Strategy Pattern in `packages/workflow`

### 🧪 Testing Strategy

- **Unit Tests**: Each package tested independently
- **Integration Tests**: End-to-end tests in workflow package
- **Mock Bridge**: Test isolation through ServiceContext.reset()

---

## Benefits of This Architecture

### ✅ Advantages

1. **Clear Separation of Responsibilities**: Each package has a clear scope of responsibility
2. **High Reusability**: Packages can be reused across different applications
3. **Type Safety**: Complete TypeScript support
4. **Easy Testing**: ServiceContext pattern facilitates mocking and testing
5. **Platform Agnostic**: Bridge pattern supports multi-platform extension
6. **Maintainability**: Layered architecture is easy to understand and maintain

### 🎯 Use Cases

- Multi-platform wallet application development
- Blockchain applications requiring complex state management
- Large-scale projects with team collaboration
- Projects needing rapid new feature expansion

---

*This architecture documentation is maintained by the FRW development team. For questions or suggestions, please create an issue in the repository.*