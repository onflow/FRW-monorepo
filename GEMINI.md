# Gemini Context: Flow Reference Wallet (FRW) Monorepo

## 1. Project Overview

The Flow Reference Wallet (FRW) is a production-ready cryptocurrency wallet for
the Flow blockchain. It is a monorepo containing:

- **React Native Mobile App:** `apps/react-native` (iOS & Android).
- **Browser Extension:** `apps/extension` (Chrome & Firefox).
- **Shared Packages:** A suite of libraries in `packages/` implementing the core
  logic, UI, and state management.

## 2. Technical Stack

- **Language:** TypeScript (Strict typing enforced).
- **Package Manager:** `pnpm` (v10+, uses workspaces).
- **Mobile:** React Native (0.79.2), Metro.
- **Extension:** React (19.0.0), Webpack.
- **State Management:** Zustand (`packages/stores`).
- **UI Framework:** Tamagui (`packages/ui`).
- **Architecture:** MVVM (Model-View-ViewModel).

## 3. Workspace Structure

The project follows a strict monorepo structure managed by `pnpm`.

```text
FRW-monorepo/
├── apps/
│   ├── react-native/       # Mobile App (iOS/Android)
│   └── extension/          # Browser Extension
├── packages/
│   ├── api/                # Network Layer: HTTP API clients
│   ├── cadence/            # Network Layer: Flow interactions & smart contracts
│   ├── context/            # Dependency Injection & Platform Abstraction
│   ├── icons/              # SVG Assets
│   ├── screens/            # Screen Layer: Integrates UI with ViewModels
│   ├── services/           # Business Logic: Domain services
│   ├── stores/             # ViewModel: State management (Zustand)
│   ├── types/              # Model: Pure data structures & interfaces
│   ├── ui/                 # UI Layer: Pure, stateless components (Tamagui)
│   ├── utils/              # Shared utilities (Logger, etc.)
│   └── workflow/           # Business Logic: Transaction orchestration
└── docs/                   # Detailed documentation
```

## 4. Key Commands

**Setup & Build**

```bash
pnpm install            # Install dependencies
pnpm build              # Build all packages and apps
pnpm build:packages     # Build only shared packages
pnpm build:extension    # Build extension (dev mode)
```

**Development**

```bash
# Recommended: Run in separate terminals
pnpm dev:packages       # Watch shared packages for changes
pnpm dev:rn             # Start React Native Metro bundler
pnpm dev:extension      # Build extension in watch mode

# React Native specific
pnpm run ios            # Run on iOS simulator
pnpm run android        # Run on Android emulator
```

**Quality Assurance**

```bash
pnpm test               # Run unit tests (excludes RN currently)
pnpm lint               # Run ESLint
pnpm typecheck          # Run TypeScript compiler check
pnpm format             # Format code with Prettier
```

## 5. Architecture & Patterns (Strictly Enforced)

The project adheres to **MVVM (Model-View-ViewModel)**. You must respect the
layer boundaries.

| Layer         | Package                | Responsibility              | Allowed Imports                 |
| :------------ | :--------------------- | :-------------------------- | :------------------------------ |
| **Model**     | `types`                | Pure data interfaces.       | None.                           |
| **Network**   | `api`, `cadence`       | External comms (HTTP/Flow). | `types`                         |
| **Business**  | `services`, `workflow` | Domain logic, rules.        | `types`, `api`, `cadence`       |
| **ViewModel** | `stores`               | UI state, caching.          | `types`, `services`, `workflow` |
| **UI**        | `ui`                   | **PURE** components only.   | `types` (**NO** logic/stores)   |
| **Screen**    | `screens`              | Connects UI to Stores.      | `ui`, `stores`, `types`         |

## 6. Critical Development Rules (Zero Tolerance)

1.  **Logging:** **NEVER** use `console.log`. ALWAYS use `logger` from
    `@onflow/frw-utils`.
    ```typescript
    import { logger } from '@onflow/frw-utils';
    logger.info('Action performed', { data });
    ```
2.  **UI Purity:** `packages/ui` must **NEVER** import from `stores`,
    `services`, or contain business logic. Data must be passed via props.
3.  **Internationalization:** **NEVER** hardcode strings in `ui` or `screens`.
    ALWAYS use `useI18n` and defined JSON keys.
    ```typescript
    const { t } = useI18n();
    <Text>{t('welcome.title')}</Text>
    ```
4.  **PlatformSpec:** Changes to `PlatformSpec` interface in `packages/context`
    affect ALL platforms and require strict coordination.
5.  **Bridge Types:** All data structures for `PlatformSpec` MUST be defined in
    `packages/types/src/Bridge.ts`.
6.  **Storage:** Storage keys must be typed in `StorageKeyMap` within
    `@onflow/frw-context`.

## 7. Contribution Workflow

1.  **Create Branch:** `feat/your-feature` or `fix/your-fix`.
2.  **Implement:** Follow MVVM and Critical Rules.
3.  **Verify:** Run `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
4.  **Commit:** Use conventional commits (e.g., `feat: add user profile`).
