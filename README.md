# FRW-monorepo — Flow Reference Wallet (Mobile + Browser Extension)

> Production-ready Flow wallet with React Native and Browser
> Extension

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.80-green)](https://reactnative.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-10.14-orange)](https://pnpm.io/)
[![Flow](https://img.shields.io/badge/Flow-Blockchain-purple)](https://flow.com/)
[![Extension E2E](https://img.shields.io/github/actions/workflow/status/onflow/FRW-monorepo/extension-e2e.yml?label=extension%20e2e)](https://github.com/onflow/FRW-monorepo/actions/workflows/extension-e2e.yml)

## 📁 Project Structure

```
FRW-monorepo/
├── apps/
│   ├── react-native/            # React Native shared code & Metro bundler
│   │   ├── ios/                 # iOS native app (git submodule: FRW-iOS)
│   │   └── android/             # Android native app (git submodule: FRW-android)
│   └── extension/               # Browser extension (Chrome/Firefox)
├── packages/                    # Shared libraries
│   ├── types/                   # TypeScript definitions & data models
│   ├── api/                     # HTTP API clients for backend services
│   ├── cadence/                 # Flow interaction & smart contracts
│   ├── services/                # Business logic & domain services
│   ├── workflow/                # Transaction workflows & orchestration
│   ├── stores/                  # State management (Zustand stores)
│   ├── ui/                      # Reusable UI components (Tamagui)
│   ├── icons/                   # SVG icon components
│   ├── screens/                 # Complete screen implementations
│   ├── utils/                   # Utility functions & helpers
│   └── context/                 # Dependency injection & platform abstraction
├── docs/                        # Documentation & guidelines
└── tools/                       # Build tools & configurations
```

## 🚀 Quick Start

### Prerequisites

```bash
# Required versions
node >= 20.0.0
pnpm >= 9.0.0
```

**For React Native development**, follow the official
[React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment)
guide:

- **iOS development**: Xcode >= 14, CocoaPods >= 1.15
- **Android development**: Android Studio, Java 17+

### Installation

```bash
# Clone repository with submodules
git clone --recurse-submodules https://github.com/onflow/FRW-monorepo
cd FRW-monorepo

# Or if already cloned, initialize submodules
git submodule update --init --recursive

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

## 📚 Documentation

For detailed development guidelines and best practices:

- **[Development Guidelines](./docs/DEVELOPMENT_GUIDELINES.md)** - Coding
  standards, architecture rules, and common patterns
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - How to contribute to the
  project
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - Technical architecture
  documentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Follow our [Development Guidelines](./docs/DEVELOPMENT_GUIDELINES.md)
4. Commit with conventional format: `git commit -m "feat: add amazing feature"`
5. Run quality checks: `pnpm lint && pnpm typecheck && pnpm build`
6. Submit a pull request

Please read our **[Contributing Guide](./docs/CONTRIBUTING.md)** for detailed
instructions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

---

**Built with ❤️ by the Flow Foundation team**

_Ready to build the future of decentralized finance on Flow!_ 🚀

## About Flow

This repo is part of the [Flow network](https://flow.com), a Layer 1 blockchain built for consumer applications, AI agents, and DeFi at scale.

- Developer docs: https://developers.flow.com
- Cadence language: https://cadence-lang.org
- Community: [Flow Discord](https://discord.gg/flow) · [Flow Forum](https://forum.flow.com)
- Governance: [Flow Improvement Proposals](https://github.com/onflow/flips)
