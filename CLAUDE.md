# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is the Flow Reference Wallet (FRW) - a production-ready Flow blockchain
wallet built on **MVVM architecture** in a TypeScript monorepo. The project
supports both React Native mobile apps and browser extensions, with a clean
separation between View, ViewModel, Network, and Model layers.

**Key Architecture**: `types` → `api/cadence` → `services/workflow` → `stores` →
`screens` → `apps`

## Development Commands

**IMPORTANT: This project uses pnpm, not npm!**

### Core Commands

- `pnpm install` - Install dependencies
- `pnpm build` - Build all packages
- `pnpm build:packages` - Build only packages (excludes apps)
- `pnpm dev` - Watch build all packages in parallel
- `pnpm dev:packages` - Watch build packages only
- `pnpm clean` - Clean build artifacts and reinstall

### Platform-Specific Commands

- `pnpm dev:extension` - Build extension in dev mode
- `pnpm dev:rn` - Start React Native Metro bundler
- `pnpm dev:rn:full` - Watch packages + start RN (single terminal)
- `pnpm build:rn` - Build React Native for both platforms

### Quality & Testing

- `pnpm lint` - Lint all code
- `pnpm lint:fix` - Auto-fix lint issues
- `pnpm format` - Format with Prettier
- `pnpm typecheck` - TypeScript validation
- `pnpm test` - Run unit tests (excluding React Native)

### Custom Claude Commands

- `/create-issue` - Automated GitHub issue creation with intelligent formatting
  - `/create-issue` - Auto-generate issue from current changes
  - `/create-issue "Add dark mode"` - Custom title with auto description
  - `/create-issue "Fix bug" "Description here"` - Custom title and description

- `/create-pr` - Automated PR creation to dev branch with validation and issue
  linking
  - `/create-pr` - Create PR to dev with auto-generated title
  - `/create-pr main` - Create PR to main branch
  - `/create-pr dev "feat: new feature"` - Create PR with custom title
  - Automatically searches and links related GitHub issues

## Tamagui V4 Shorthands

When working with Tamagui components, always use these V4 shorthand properties
for cleaner, more maintainable code:

### Layout & Spacing

- `padding` → `p`
- `paddingTop` → `pt`
- `paddingBottom` → `pb`
- `paddingLeft` → `pl`
- `paddingRight` → `pr`
- `paddingHorizontal` → `px`
- `paddingVertical` → `py`
- `margin` → `m`
- `marginTop` → `mt`
- `marginBottom` → `mb`
- `marginLeft` → `ml`
- `marginRight` → `mr`
- `marginHorizontal` → `mx`
- `marginVertical` → `my`

### Flexbox

- `alignItems` → `items`
- `justifyContent` → `justify`
- `flexDirection` → `direction`
- `flexWrap` → `wrap`
- `alignSelf` → `self`
- `flex` → `flex`
- `flexGrow` → `grow`
- `flexShrink` → `shrink`
- `flexBasis` → `basis`

### Dimensions

- `width` → `w`
- `height` → `h`
- `minWidth` → `minW`
- `minHeight` → `minH`
- `maxWidth` → `maxW`
- `maxHeight` → `maxH`

### Colors & Styling

- `backgroundColor` → `bg`
- `color` → `color` (stays the same)
- `borderColor` → `borderColor` (stays the same)
- `borderWidth` → `borderWidth` (stays the same)
- `borderRadius` → `rounded`

### Positioning

- `position` → `pos`
- `top` → `top`
- `bottom` → `bottom`
- `left` → `left`
- `right` → `right`
- `zIndex` → `z`

### Text

- `fontSize` → `fontSize` (stays the same)
- `fontWeight` → `fontWeight` (stays the same)
- `textAlign` → `text`
- `lineHeight` → `lineHeight` (stays the same)
- `letterSpacing` → `letterSpacing` (stays the same)

### Display

- `display` → `display` (stays the same)
- `overflow` → `overflow` (stays the same)
- `opacity` → `opacity` (stays the same)

### Example Usage

```tsx
// Before (verbose)
<YStack
  padding="$4"
  marginBottom="$2"
  alignItems="center"
  justifyContent="center"
  backgroundColor="$gray1"
  borderRadius="$3"
  minWidth={120}
  minHeight={80}
  maxWidth={100}
  textAlign="center"
>

// After (with shorthands)
<YStack
  p="$4"
  mb="$2"
  items="center"
  justify="center"
  bg="$gray1"
  rounded="$3"
  minW={120}
  minH={80}
  maxW={100}
  text="center"
>
```

## Icons Package

The `@onflow/frw-icons` package contains universal React SVG components with
runtime color theming, inspired by IconPark's approach. All icons work across
Web, React Native, and Extensions without requiring react-native-svg.

### Key Features

- **Runtime Color Control**: Dynamic color theming without hardcoded values
- **Universal Compatibility**: Works across Web, React Native, and Extensions
- **Theme Support**: Outline, filled, and dual-tone themes
- **TypeScript Support**: Full type safety with `IconWrapperProps`
- **Automatic Generation**: Custom build script converts SVG files to React
  components
- **Flexible API**: Size, color, and theme can be controlled at runtime

### Usage

```tsx
import { ArrowRight, CheckCircle, IconWrapper } from '@onflow/frw-icons';

// Basic usage with size and color control
<ArrowRight size={24} color="#3b82f6" theme="outline" />

// Different themes
<CheckCircle size={32} color="#10b981" theme="filled" />
<ArrowRight size={24} color="#374151" theme="dual-tone" />

// All standard SVG props are supported
<Copy
  size={20}
  color="#ef4444"
  theme="outline"
  onClick={handleCopy}
  style={{ cursor: 'pointer' }}
/>
```

### Available Themes

- **outline**: Strokes with current color, no fill (default)
- **filled**: Filled with current color
- **dual-tone**: Preserves original design but allows color override

### IconWrapper Component

The core `IconWrapper` component handles runtime color conversion:

- Processes SVG children to apply theme-based coloring
- Removes opacity attributes that interfere with color control
- Supports all standard SVG props
- Automatically handles viewBox and sizing

## MVVM Architecture

This project follows strict MVVM (Model-View-ViewModel) architecture with clear
layer separation:

### Package Structure by Layer

**📋 Model Layer**

- `packages/types` - Pure data structures and interfaces (zero dependencies)

**🌐 Network Layer**

- `packages/api` - HTTP API clients with auto-generated services from
  OpenAPI/Swagger
- `packages/cadence` - Flow blockchain interaction via Cadence scripts and
  transactions

**⚙️ Business Logic Layer**

- `packages/services` - Domain services using provider pattern for data
  transformation
- `packages/workflow` - Transaction orchestration and complex business processes

**🧠 ViewModel Layer**

- `packages/stores` - UI state management with Zustand, automatic caching, and
  data transformation for UI consumption

**🎨 UI Layer**

- `packages/ui` - Pure, stateless UI components with Tamagui (no business logic)
- `packages/icons` - Universal React SVG components with runtime theming

**📺 Screen Layer (UI + ViewModel Integration)**

- `packages/screens` - Pre-built screens combining UI components with
  ViewModels, ready for direct use by applications

**📱 Application Layer**

- `apps/react-native` - iOS/Android mobile app with React Native 0.80 + React 19
- `apps/extension` - Chrome extension using shared screens and components

**🔧 Infrastructure**

- `packages/context` - Dependency injection container and platform abstraction
- `packages/utils` - Pure utility functions (zero dependencies)

### Development Flow (MVVM + Universal Screens)

1. **Model First**: Define data structures in `packages/types`
2. **Network Layer**: Implement API clients in `packages/api` and
   `packages/cadence`
3. **Business Logic**: Add domain services in `packages/services` and workflows
   in `packages/workflow`
4. **ViewModel**: Manage UI state in `packages/stores` (ViewModels)
5. **UI Components**: Build pure, stateless components in `packages/ui`
6. **Screen Integration**: Combine UI + ViewModels in `packages/screens`
7. **Application**: Use pre-built screens directly in `apps/react-native` and
   `apps/extension`

This pattern ensures **maximum code reuse** - both platforms share not just
business logic, but entire screen implementations.

### Key Architecture Rules

- **Strict Layer Boundaries**: ESLint enforces import restrictions
- **Pure UI Components**: `packages/ui` has no business logic or state
  management
- **Screen-Level Integration**: `packages/screens` combines UI + ViewModels for
  complete functionality
- **Application Simplicity**: Apps import ready-to-use screens, minimal
  platform-specific code
- **Universal Code Reuse**: Both React Native and Extension share screens, UI,
  and business logic
- **ServiceContext DI**: All services use dependency injection via
  ServiceContext

## Storybook Integration

The UI package includes comprehensive Storybook integration:

- `pnpm storybook` - Start Storybook for component development
- Icon showcase with search and interactive features
- Component documentation with argTypes
- CSS Grid layouts for responsive displays
- Proper color theming and visibility handling

## Workspace Configuration

### Package Management

- **pnpm workspaces** with automatic linking enabled
- **Node.js >= 20.0.0** and **pnpm >= 9.0.0** required
- **React 19.1.0** override across all packages for consistency
- Shared TypeScript configuration via `tsconfig.base.json`

### Environment Requirements

- **TypeScript 5.7+** with strict mode enabled
- **ESLint 9.x** with TypeScript integration
- **Prettier 3.x** for code formatting
- **Husky** for Git hooks and **lint-staged** for commit validation
- **Commitlint** with conventional commits format

## Code Quality Rules

### Comments and Communication (CRITICAL)

- **ALL code comments, documentation, and commit messages MUST be written in
  English only**
- No Chinese, Japanese, or other non-English comments allowed in code files
- This ensures code maintainability and accessibility for all developers
- **Conversational communication with Claude Code can be in Chinese or English**
- **Variable names, function names, and API responses should be in English**

### File Naming Conventions

- **React Components**: `kebab-case.tsx` (in `components/` folders)
- **Hooks**: `use-kebab-case.ts` (in `hooks/` folders)
- **Other TypeScript**: `kebab-case.ts`
- **Shared components**: Use PascalCase in `src/ui/FRWComponent/`
- **Avoid `index.ts`** files for re-exports unless required by framework

### Import Patterns

- **Path aliases**: `@/folder/*` for cross-folder imports
- **Workspace packages**: `import { TokenStore } from '@onflow/frw-stores'`
- **Prefer named exports** over default exports
- **Strict boundaries**: ESLint enforces layer separation (View ↔ ViewModel ↔
  Business Logic)

### Testing Requirements

- **Unit tests**: Vitest for all packages (run with `pnpm test`)
- **E2E tests**: Playwright for extension (`pnpm test:e2e`)
- **Type safety**: All cache and data types must be explicitly typed
- **Coverage**: New code requires appropriate test coverage

## Platform-Specific Notes

### React Native (`apps/react-native`)

- **NativeWind 4.x** for styling (Tailwind CSS for React Native)
- **React Navigation v7** with native stack navigation
- **MMKV** for persistent storage
- **Theme system** with CSS variables and light/dark mode
- **Nitro modules** for native iOS/Android bridge functionality
- **Bundle commands**: iOS (`pnpm bundle:ios`), Android (`pnpm bundle:android`)

### Browser Extension (`apps/extension`)

- **Chrome Manifest V3** service worker architecture
- **Background scripts** handle blockchain/key management (secure context)
- **UI components** communicate via Chrome messaging API
- **Content scripts** inject wallet provider for dApp integration
- **Custom caching system** with stale-while-revalidate pattern
- **E2E testing** with Playwright extension loading

## Monorepo Development Workflow

### Typical Development Session

```bash
# Terminal 1: Watch all packages for changes
pnpm dev:packages

# Terminal 2A: React Native development
pnpm dev:rn

# Terminal 2B: Extension development
pnpm dev:extension

# Or combined (single terminal)
pnpm dev:rn:full
```

### Package Development

- **Build specific package**: `pnpm -F @onflow/frw-types build`
- **Test specific package**: `pnpm -F @onflow/frw-services test`
- **Lint specific package**: `pnpm -F @onflow/frw-workflow lint`
- **Local linking**: If FRW-core repo is at `../FRW-core`, use `pnpm link`
