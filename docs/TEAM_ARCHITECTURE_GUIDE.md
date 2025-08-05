# FRW Architecture - Team Guide 🏗️

*Simplified architecture guide for quick team understanding and discussion*

## 🎯 Core Concepts

### 1. Monorepo + Layered Architecture
- **Single Repository, Multiple Packages** - Easy code sharing and unified management
- **Clear Layering** - Each layer has distinct responsibilities and clear dependencies
- **ServiceContext Pattern** - Solves cross-package dependencies and testing issues

### 2. Key Design Principles
- **Upward Dependencies** - Lower layers don't depend on higher layers
- **Interface Abstraction** - Decoupling through Bridge and ServiceContext
- **Reusability** - Packages can be reused across different projects

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                Applications Layer                    │
│  ┌─────────────────┐    ┌─────────────────┐         │
│  │  React Native   │    │ Browser Extension│         │
│  │      App        │    │    (Future)     │         │
│  └─────────────────┘    └─────────────────┘         │
└─────────────┬───────────────────┬───────────────────┘
              │                   │
┌─────────────▼───────────────────▼───────────────────┐
│              Business Logic Layer                   │
│  ┌─────────────────┐    ┌─────────────────┐         │
│  │     stores      │    │    workflow     │         │
│  │ State Management│    │ Transaction Logic│        │
│  └─────────────────┘    └─────────────────┘         │
└─────────────┬───────────────────┬───────────────────┘
              │                   │
┌─────────────▼───────────────────▼───────────────────┐
│                Service Layer                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │             ServiceContext                      │ │
│  │         (Dependency Injection)                  │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────┐    ┌─────────────────┐         │
│  │    services     │    │     Bridge      │         │
│  │ Business Logic  │    │Platform Abstraction│      │
│  └─────────────────┘    └─────────────────┘         │
└─────────────┬───────────────────┬───────────────────┘
              │                   │
┌─────────────▼───────────────────▼───────────────────┐
│                Core Layer                           │
│  ┌─────────────────┐    ┌─────────────────┐         │
│  │    cadence      │    │      api        │         │
│  │ Flow Blockchain │    │  Network Layer  │         │
│  └─────────────────┘    └─────────────────┘         │
└─────────────┬───────────────────┬───────────────────┘
              │                   │
┌─────────────▼───────────────────▼───────────────────┐
│              Foundation Layer                        │
│  ┌─────────────────┐    ┌─────────────────┐         │
│  │     types       │    │     utils       │         │
│  │ Type Definitions│    │ Utility Functions│        │
│  └─────────────────┘    └─────────────────┘         │
└─────────────────────────────────────────────────────┘
```

## 🔧 Package Responsibilities

| Package | Responsibility | Main Content | Layer |
|---------|----------------|-------------|-------|
| **apps/react-native** | Mobile App Entry | UI, Navigation, Themes, Bridge Integration | Top |
| **stores** | State Management | Zustand stores, Caching strategies | Business |
| **workflow** | Transaction Logic | Strategy Pattern, FCL Configuration | Business |
| **services** | Business Services | ServiceContext, Business Logic Encapsulation | Service |
| **cadence** | Flow Integration | FCL, Cadence Scripts | Core |
| **api** | Network Layer | HTTP Requests, API Integration | Core |
| **types** | Type Definitions | TypeScript Interfaces and Types | Foundation |
| **utils** | Utility Functions | Pure Functions, Formatting Tools | Foundation |

## 🔄 ServiceContext Pattern Explained

### Background Problem
- Multiple packages need Bridge access
- Packages cannot directly depend on each other
- Need to facilitate testing and mocking

### Solution

```typescript
// 1. ServiceContext as Dependency Injection Container
export class ServiceContext {
  private static instance: ServiceContext | null = null;
  private _bridge: BridgeSpec | null = null;

  public static initialize(bridge: BridgeSpec): ServiceContext {
    // Initialize all services
    ServiceContext.instance = new ServiceContext();
    ServiceContext.instance._bridge = bridge;
    
    // Inject bridge into services
    FlowService.getInstance(bridge);
    AddressBookService.getInstance(bridge);
    
    return ServiceContext.instance;
  }

  // Provide service access
  get flow(): FlowService { return FlowService.getInstance(); }
  get cadence(): CadenceService { return this._cadenceService!; }
}

// 2. Convenience functions for other packages
export const getFlowService = () => getServiceContext().flow;
export const getCadenceService = () => getServiceContext().cadence;
```

### Usage

```typescript
// Initialize on app startup
ServiceContext.initialize(bridge);

// Use in stores
import { getCadenceService } from '@onflow/frw-services';
const cadenceService = getCadenceService();

// Reset for testing
ServiceContext.reset();
```

## 🌉 Bridge Authentication Integration

### Problem
Flow transactions need proposer, payer, authorizations

### Solution

```typescript
// 1. Extend BridgeSpec interface
export interface BridgeSpec {
  // Original methods...
  getSelectedAddress(): string | null;
  getNetwork(): string;
  
  // New authentication methods
  getProposer(): Promise<any>;
  getPayer(): Promise<any>;
  getAuthorizations(): Promise<any[]>;
}

// 2. workflow package supports bridge authentication
export function createCadenceService(network, bridge) {
  const service = new CadenceService();
  
  if (bridge) {
    // Auto-inject authentication interceptors
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

## 🚀 Development Workflow

### 1. Adding New Features
```
1. Define types in types package
2. Add utility functions in utils package (if needed)
3. Implement business logic in services package
4. Manage state in stores package
5. Handle complex transaction logic in workflow package
6. Implement UI in React Native
```

### 2. Cross-Package Communication
```
✅ Through ServiceContext: stores → services
✅ Through getter functions: getCadenceService()
✅ Through interface abstraction: BridgeSpec
❌ Direct import of other package instances
```

### 3. Testing Strategy
```
Unit Tests: Each package tested independently
Integration Tests: Through ServiceContext integration testing
Mock: ServiceContext.reset() + provide mock bridge
```

## 💡 Key Advantages

### 🎯 For Developers
- **Clear Code Organization** - Know where to write what code
- **Type Safety** - Complete TypeScript support
- **Easy Debugging** - Clear layering, easy problem location

### 🔧 For Team
- **Parallel Development** - Different members can work on different packages independently
- **Code Reuse** - Packages can be used across multiple projects
- **Easy Maintenance** - Responsibility separation, controllable impact scope

### 🚀 For Product
- **Fast Extension** - New features quickly added through Strategy Pattern
- **Multi-Platform Support** - Bridge pattern supports different platforms
- **High Stability** - Layered architecture reduces coupling, improves stability

## 🤔 Common Questions

### Q: Why not write all logic directly in React Native?
A: Layered architecture facilitates code reuse, testing, and maintenance. Packages can be reused across browser extensions, desktop apps, and other platforms.

### Q: What's the difference between ServiceContext and traditional DI frameworks?
A: ServiceContext is more lightweight, specifically designed for our architecture, avoiding the learning curve of complex DI frameworks.

### Q: How to share data between packages?
A: Get service instances through ServiceContext, manage shared state through stores, avoid direct cross-package dependencies.

### Q: How can new team members get started quickly?
A: 1) Understand layering concepts 2) Start with types package to see type definitions 3) See how ServiceContext connects packages 4) Implement features in specific packages

---

**🎯 Core Philosophy**: Clear layering, single responsibility, interface abstraction, easy testing

*Feel free to discuss any questions! This architecture is the foundation of our team collaboration 💪*