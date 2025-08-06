# Flow Reference Wallet (FRW) 🌊

> Production-ready Flow blockchain wallet

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.80-green)](https://reactnative.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-10.14-orange)](https://pnpm.io/)
[![Flow](https://img.shields.io/badge/Flow-Blockchain-purple)](https://flow.com/)
[![MVVM](https://img.shields.io/badge/Architecture-MVVM-red)](./docs/ARCHITECTURE.md)

## ✨ Features

- 🏗️ **MVVM Architecture**: Clean Model-ViewModel-View separation with reactive
  UI
- 📱 **Multi-Platform**: React Native (iOS/Android) + Browser Extension
- 🌙 **Theme System**: Complete light/dark mode with CSS variables
- 🔗 **Flow + EVM**: Full Flow and Ethereum blockchain support
- 💾 **Smart Caching**: Intelligent state management with automatic refresh
- 🧪 **Type Safe**: Complete TypeScript coverage across all packages
- 🚀 **Production Ready**: Battle-tested with 10,000+ active users

**Data Flow**: `types` → `api/cadence` → `services/workflow` → `stores` → `apps`

## 📦 Package Structure

| Package               | Role         | Purpose                               | Dependencies              |
| --------------------- | ------------ | ------------------------------------- | ------------------------- |
| **types**             | 📋 Model     | Data structures & interfaces          | none                      |
| **api**               | 🌐 Network   | HTTP API clients                      | types                     |
| **cadence**           | 🌐 Network   | Flow blockchain integration           | types                     |
| **services**          | ⚙️ Business  | Domain services & data transformation | api, cadence, types       |
| **workflow**          | ⚙️ Business  | Transaction orchestration             | cadence, services, types  |
| **stores**            | 🧠 ViewModel | UI state management                   | services, workflow, types |
| **apps/react-native** | 📱 View      | iOS/Android mobile app                | stores, types             |
| **apps/extension**    | 📱 View      | Browser extension                     | stores, types             |

## 🚀 Quick Start

### Prerequisites

```bash
# Required versions
node >= 20.0.0
pnpm >= 9.0.0

# iOS development (optional)
Xcode >= 14
CocoaPods >= 1.15

# Android development (optional)
Android Studio
Java 17+
```

### Installation

```bash
# Clone repository
git clone https://github.com/onflow/FRW-monorepo
cd FRW-monorepo

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Option 1: Separate terminals (recommended)
pnpm dev:packages    # Terminal 1: Watch packages for changes
pnpm dev:rn          # Terminal 2: Start React Native

# Option 2: Combined (single terminal)
pnpm dev:rn:full     # Both packages watch + RN start
```

### Platform Specific

```bash
# React Native
pnpm dev:rn          # Start Metro bundler
pnpm run ios         # Run on iOS simulator
pnpm run android     # Run on Android emulator

# Browser Extension
cd apps/extension
pnpm dev             # Development build
pnpm build           # Production build
```

## 🛠️ Development Workflow

### MVVM Development Flow

1. **📋 Model First**: Define data structures in `packages/types`
2. **🌐 Network Layer**: Implement API clients in `packages/api` and
   `packages/cadence`
3. **⚙️ Business Logic**: Add domain services in `packages/services` and
   workflows in `packages/workflow`
4. **🧠 ViewModel**: Manage UI state in `packages/stores`
5. **📱 View**: Build reactive UI components in applications

## 🏃‍♂️ Available Scripts

### Root Level

```bash
# Development
pnpm dev:packages        # Watch all packages
pnpm dev:rn             # Start React Native
pnpm dev:rn:full        # Combined packages watch + RN

# Building
pnpm build              # Build all packages
pnpm build:packages     # Build only packages
pnpm build:rn           # Build React Native app

# Quality
pnpm lint               # Lint all packages
pnpm lint:fix           # Fix lint issues
pnpm test               # Run all tests
pnpm typecheck          # TypeScript validation
```

### Package Level

```bash
# Build specific package
pnpm -F @onflow/frw-types build
pnpm -F @onflow/frw-stores build

# Test specific package
pnpm -F @onflow/frw-services test

# Lint specific package
pnpm -F @onflow/frw-workflow lint
```

## 📱 Applications

### React Native App

**Features**:

- ✅ Complete wallet functionality (send, receive, NFTs)
- ✅ Multi-chain support (Flow + EVM)
- ✅ Native iOS/Android integration
- ✅ Theme system with CSS variables
- ✅ Hardware wallet support
- ✅ Multi-language support

**Tech Stack**:

- React Native 0.80 + React 19
- NativeWind (Tailwind CSS for RN)
- React Navigation v7
- Zustand state management
- MMKV persistent storage
- Native Turbo Modules

### Browser Extension

**Features**:

- ✅ Transaction signing
- ✅ Account management
- ✅ dApp integration
- ✅ Background service workers

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests for specific package
pnpm -F @onflow/frw-stores test

# Watch mode
pnpm test --watch
```

## 📋 Type Safety

The entire codebase is built with TypeScript and follows strict type safety:

```typescript
// Shared types across all packages
import { TokenInfo, WalletAccount, SendPayload } from '@onflow/frw-types';

// Type-safe API calls
const tokenService = new TokenService();
const tokens: TokenInfo[] = await tokenService.getTokens(address);

// Type-safe state management
const { selectedToken, setSelectedToken } = useTokenStore();
setSelectedToken(tokens[0]); // TypeScript ensures correct type
```

## 🤝 Contributing

We welcome contributions! Please read our
**[Contributing Guide](./docs/CONTRIBUTING.md)** for detailed instructions on:

- 📝 **Commit Message Guidelines** (Conventional Commits format)
- 🧹 **Code Quality Standards** (ESLint, Prettier, TypeScript)
- 🔄 **Pull Request Process**
- 🏗️ **Architecture Guidelines** (MVVM patterns)

### Quick Start

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feat/amazing-feature`
3. **Make your changes** following our coding standards
4. **Commit with conventional format**:
   `git commit -m "feat: add amazing feature"`
5. **Run quality checks**: `pnpm lint && pnpm typecheck && pnpm build`
6. **Submit pull request**

> 💡 **Tip**: All commits must follow
> [Conventional Commits](https://www.conventionalcommits.org/) format to pass
> our automated checks!

## 📊 CI/CD

GitHub Actions workflows automatically:

- ✅ **Package Validation**: Build and test changed packages
- ✅ **React Native Validation**: iOS/Android build validation
- ✅ **Lint Changed Files**: ESLint + Prettier on modified files
- ✅ **Full CI Pipeline**: Complete validation on PRs
- ✅ **Claude PR Review**: AI-powered code review with `@claude`
- ✅ **Security Audits**: Dependency vulnerability scanning

## 📚 Documentation

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - Complete MVVM architecture
  documentation
- **[React Native Guide](./apps/react-native/README.md)** - React Native app
  specific documentation
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - Development workflow and
  commit message guidelines
- **[API Documentation](./docs/API.md)** - API reference and examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

---

**Built with ❤️ by the Flow Foundation team**

_Ready to build the future of decentralized finance on Flow!_ 🚀
