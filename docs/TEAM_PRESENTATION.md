# FRW Architecture - Team Presentation 🚀

*Quick overview for team discussion and onboarding*

## 📋 What We Built

### Before vs After

| **Before** | **After** |
|------------|-----------|
| ❌ Monolithic React Native app | ✅ Modular monorepo with 9 packages |
| ❌ Tight coupling between components | ✅ Clear layered architecture |
| ❌ Difficult to test and mock | ✅ ServiceContext pattern for easy testing |
| ❌ Hard to add new platforms | ✅ Bridge pattern supports any platform |
| ❌ Code scattered everywhere | ✅ Each package has single responsibility |

## 🏗️ The Big Picture

```
📱 React Native App
    ↓ uses
📊 State Management (stores) + ⚡ Transaction Logic (workflow)
    ↓ uses
🔧 Business Services (services) + 🌉 Platform Bridge
    ↓ uses
🔗 Flow Integration (cadence) + 🌐 Network Layer (api)
    ↓ uses
🏗️ Context (DI + interfaces) + 📝 Types + 🔧 Utils
```

## 🎯 Key Innovations

### 1. ServiceContext Pattern
**Problem**: How do packages talk to each other without tight coupling?

**Solution**: One central "phone book" that connects everything
```typescript
// App startup
import { ServiceContext } from '@onflow/frw-context';
ServiceContext.initialize(bridge);

// Any package can now get services
import { getCadenceService } from '@onflow/frw-context';
import { getFlowService } from '@onflow/frw-services';
const flowService = getFlowService();
const cadenceService = getCadenceService();
```

### 2. Bridge Authentication
**Problem**: Flow transactions need complex signing

**Solution**: Bridge handles all authentication automatically
```typescript
// Bridge provides authentication
interface BridgeSpec {
  getProposer(): Promise<any>;
  getPayer(): Promise<any>;
  getAuthorizations(): Promise<any[]>;
}

// CadenceService auto-injects these for transactions
```

### 3. Strategy Pattern for Transactions
**Problem**: Many different ways to send tokens (Flow→Flow, EVM→EVM, etc.)

**Solution**: Each transfer type gets its own strategy
```typescript
// workflow package automatically picks the right strategy
const context = createTransferContext();
await context.execute(sendPayload); // Handles any transfer type
```

## 📦 Package Cheat Sheet

| When you need to... | Go to... |
|---------------------|----------|
| Add new TypeScript types | `packages/types` |
| Add utility functions | `packages/utils` |
| Define core interfaces or DI logic | `packages/context` |
| Make HTTP API calls | `packages/api` |
| Interact with Flow blockchain | `packages/cadence` |
| Create business services | `packages/services` |
| Manage app state | `packages/stores` |
| Handle complex transactions | `packages/workflow` |
| Build mobile UI | `apps/react-native` |

## 🔄 Typical Development Flow

### Adding a New Feature: "Send NFT to Email"

1. **Types** (`packages/types`): Define `EmailRecipient` interface
2. **Utils** (`packages/utils`): Add email validation function
3. **Services** (`packages/services`): Create `EmailService` class
4. **Stores** (`packages/stores`): Add send-to-email state management
5. **Workflow** (`packages/workflow`): Create `EmailNftTransferStrategy`
6. **React Native** (`apps/react-native`): Build the UI

Each step is independent and testable! 🧪

## 🚀 Benefits for Our Team

### 🧑‍💻 For Developers
- **No more "where do I put this code?"** - Clear package structure
- **Easy debugging** - Problems are isolated to specific layers
- **Safe refactoring** - TypeScript catches breaking changes

### 👥 For Team Collaboration
- **Parallel development** - Work on different packages simultaneously
- **Code reviews** - Smaller, focused changes per package
- **Onboarding** - New developers understand structure quickly

### 🎯 For Product
- **Fast feature development** - Reuse existing services and patterns
- **Multi-platform ready** - Same packages work in browser extension
- **Stable releases** - Isolated packages reduce bug impact

## 🧪 Testing Strategy

### Unit Tests
```bash
# Test individual packages
cd packages/services && pnpm test
cd packages/stores && pnpm test
```

### Integration Tests
```typescript
// Mock the bridge for testing
ServiceContext.reset();
ServiceContext.initialize(mockBridge);

// Now test cross-package interactions
```

### E2E Tests
```typescript
// Test complete user flows
const transferContext = createTransferContext();
const result = await transferContext.execute(mockPayload);
```

## 🤝 Team Guidelines

### ✅ Do This
- Use ServiceContext getters: `getCadenceService()` from `@onflow/frw-context`
- Follow the layer hierarchy: apps → business → service → core → foundation
- Add types first, then implement features
- Test each package independently

### ❌ Don't Do This
- Import package internals directly: `import '../../../services/internal'`
- Skip the ServiceContext: Direct service instantiation
- Put business logic in UI components
- Create circular dependencies between packages

## 🔧 Common Development Tasks

### Adding a New Service
```typescript
// 1. Create in services package
export class MyNewService {
  constructor(private bridge: BridgeSpec) {}
  
  async doSomething() {
    // Implementation
  }
}

// 2. Add to ServiceContext
get myNewService(): MyNewService { 
  return MyNewService.getInstance(this._bridge); 
}

// 3. Export getter function
export const getMyNewService = () => getServiceContext().myNewService;
```

### Using Services in Stores
```typescript
// stores package
import { getCadenceService } from '@onflow/frw-context';
import { getFlowService } from '@onflow/frw-services';

export const useMyStore = create((set, get) => ({
  async fetchData() {
    const flowService = getFlowService();
    const data = await flowService.getData();
    set({ data });
  }
}));
```

### Adding Transaction Logic
```typescript
// workflow package - create new strategy
export class MyTransferStrategy implements TransferStrategy {
  canHandle(payload: SendPayload): boolean {
    return payload.type === 'my-special-transfer';
  }
  
  async execute(payload: SendPayload): Promise<any> {
    // Implementation
  }
}

// Add to context in createTransferContext()
context.addStrategy(new MyTransferStrategy());
```

## 🎉 What's Next?

### Immediate Benefits
- ✅ All packages build successfully
- ✅ Bridge authentication working
- ✅ ServiceContext managing all dependencies
- ✅ Ready for parallel development

### Future Possibilities
- 🌐 Browser extension using same packages
- 🖥️ Desktop app with Electron
- 📱 iOS/Android SDK using core packages
- 🧪 Comprehensive test coverage

---

## 🤔 Questions & Discussion

### Quick Questions
1. **"Where do I add validation logic?"** → `packages/utils` for pure functions, `packages/services` for complex business validation
2. **"How do I test with mock data?"** → `ServiceContext.reset()` + provide mock bridge
3. **"Can I use services directly in UI?"** → Yes, through stores that use services from context/services packages
4. **"What if I need to add a new platform?"** → Just implement `BridgeSpec` interface

### Architecture Questions
- How does this compare to other project structures you've seen?
- What concerns do you have about this approach?
- Which packages will you be working on most?
- Any suggestions for improvements?

---

**🎯 Remember**: This architecture is our foundation for building great products together! 

*Let's discuss and make sure everyone is comfortable with the approach* 💪