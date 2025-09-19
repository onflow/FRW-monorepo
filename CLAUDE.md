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

## GitHub Workflows

The project includes automated GitHub Actions workflows for improved development
efficiency:

### AI-Powered Release Notes Generation (`.github/workflows/release-notes.yml`)

Automatically generates engaging, user-friendly release notes using Claude AI
when creating GitHub releases:

**🤖 AI Features:**

- Uses Claude AI (Claude-3.5-Sonnet) to intelligently analyze commits
- Transforms technical commit messages into user-friendly language
- Focuses on end-user benefits rather than technical details
- Automatically categorizes and prioritizes changes
- Generates engaging, marketing-friendly descriptions
- Handles any commit format (conventional commits or free-form)

**🔧 Technical Features:**

- Collects commit titles, descriptions, authors, and dates
- Analyzes commit range between releases
- Provides comprehensive context about Flow Reference Wallet to Claude
- Includes fallback mechanism if AI is unavailable
- Updates release notes via GitHub API

**⚙️ Configuration:**

- **Required:** `ANTHROPIC_API_KEY` secret must be set in repository
- **Trigger:** Runs automatically when a release is published or created
- **Monorepo Support:** Automatically detects and handles monorepo tags like:
  - `release/rn-0.0.1` → `release/rn-0.0.2` (React Native releases)
  - `release/extension-1.2.0` → `release/extension-1.2.1` (Extension releases)
  - `release/packages-2.1.0` → `release/packages-2.1.1` (Package releases)
- **Smart Commit Range:** Analyzes all commits between matching tag prefixes
- **Customization:** Modify the AI prompt in the workflow file

**📝 Example AI-Generated Output:**

```markdown
## 🆕 What's New

- Enjoy faster transaction processing with our improved Flow blockchain
  integration
- New biometric authentication keeps your wallet secure and convenient

## 🔧 Improvements

- Smoother user interface with enhanced animations and responsiveness
- Better error messages help you understand and resolve issues quickly

## 🐛 Bug Fixes

- Fixed rare issue where token balances might display incorrectly
- Resolved connection problems on slower networks

---

Thank you for using Flow Reference Wallet! 🚀
```

**🧠 AI Prompt Engineering:**

The workflow provides Claude with:

- Repository context (Flow Reference Wallet, blockchain, mobile/extension)
- Target audience (end users, not developers)
- Commit analysis with titles, descriptions, authors, and dates
- Clear guidelines for user-focused, engaging language
- Structured output format with appropriate emojis

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

### Data Storage Architecture

The project uses a **dual storage system** for optimal performance and clear
separation of concerns:

#### Storage - Business Data (`Storage` interface)

**Purpose**: Type-safe storage for structured business data with automatic
versioning and metadata management.

**Features**:

- **Type Safety**: Strongly typed with `StorageKeyMap` interface
- **Automatic Metadata**: Adds `version`, `createdAt`, `updatedAt` to all data
- **Versioning**: Built-in data versioning for migration support
- **Validation**: Schema validation and error handling

**Usage**:

```typescript
import { storage } from '@onflow/frw-context';

// Type-safe business data operations
await storage.set('user', { name: 'John', email: 'john@example.com' });
const user = await storage.get('user'); // Fully typed return

// Automatic metadata is added:
// { name: 'John', email: 'john@example.com', version: '1.0.0', createdAt: 1234567890, updatedAt: 1234567890 }
```

**Storage Keys** (defined in `StorageKeyMap`):

- `tokens` - Token balances and metadata
- `user` - User profile and preferences
- `wallet` - Wallet configuration and settings
- `settings` - Application settings
- `auth` - Authentication tokens and state
- `recentRecipients` - Recently used addresses

#### Cache - High-Performance Caching (`Cache` interface)

**Purpose**: Optimized caching system for temporary data, specifically designed
for TanStack Query performance.

**Features**:

- **High Performance**: Independent key-value storage, no metadata overhead
- **TTL Support**: Optional time-to-live for automatic expiration
- **Auto-Cleanup**: Built-in expired entry cleanup
- **Batch Operations**: Efficient multi-key operations
- **Prefix Support**: Namespace-based key organization

**Usage**:

```typescript
import { cache } from '@onflow/frw-context';

// High-performance cache operations
await cache.set('query-user-123', userData, 300000); // 5 min TTL
const cached = await cache.get('query-user-123');

// Bulk operations
await cache.clearByPrefix('tanquery:'); // Clear all TanStack Query cache
const stats = await cache.getStats(); // Get cache statistics
```

#### TanStack Query Integration

TanStack Query **automatically uses the optimized Cache system** for all query
caching:

- **Performance**: Each query uses an independent cache key (no large object
  serialization)
- **Memory Efficient**: Automatic cleanup of expired queries
- **Transparent**: Existing TanStack Query code works without changes
- **Prefix**: All TanStack Query cache keys use `tanquery:` prefix

```typescript
// TanStack Query works transparently with the new cache system
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: fetchUser,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
// Automatically cached using cache.set('tanquery:hash', data, ttl)
```

#### Platform Implementation

Each platform implements both interfaces via `PlatformSpec`:

```typescript
// React Native - AsyncStorage-based implementation
storage(): Storage // -> AsyncStorageImpl (business data)
cache(): Cache     // -> AsyncStorageCache (query cache)

// Extension - Chrome storage-based implementation
storage(): Storage // -> ChromeStorageImpl (business data)
cache(): Cache     // -> ChromeCache (query cache)
```

#### Performance Benefits

- **Storage**: Structured data with metadata for business logic requirements
- **Cache**: Raw performance for temporary data and query results
- **TanStack Query**: 10x+ performance improvement with independent key storage
- **Memory**: Reduced memory usage with automatic cleanup and TTL support

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

### Logging Guidelines

- **NEVER use `console.log`, `console.debug`, `console.info`, `console.warn`, or
  `console.error`**
- **ALWAYS use the centralized logger from `@onflow/frw-context`**
- **Available log levels**: `'debug' | 'info' | 'warn' | 'error'`
- **Automatic filtering**: Debug logs are filtered out in production
- **Platform abstraction**: All logs go through the platform layer for
  consistency

**Logger Import and Usage**:

```typescript
// ✅ Preferred - Use global logger from context
import { logger } from '@onflow/frw-context';

logger.debug('User selected account:', account);
logger.info('Services initialized successfully');
logger.warn('Falling back to default language:', language);
logger.error('Failed to load tokens:', error);

// ✅ Alternative - Create component-specific logger with prefix
import { createLogger } from '@onflow/frw-utils';
import { bridge } from '@onflow/frw-context';

const componentLogger = createLogger(bridge, 'MyComponent');
componentLogger.info('Component initialized');

// ✅ For PlatformImpl classes - Use built-in log method
this.log('info', 'Platform initialized');
this.log('debug', 'Current language detected:', language);
```

**Platform Implementation**:

- **React Native**: Console output + Instabug integration
- **Extension**: Console output + Chrome runtime messaging
- **Automatic filtering**: Debug level respects `isDebug()` flag
- **Global access**: Logger is initialized by ServiceContext and available
  everywhere

**Examples**:

```typescript
// ❌ Bad - Direct console usage
console.log('User selected account:', account);
console.error('Failed to load tokens:', error);

// ✅ Good - Centralized logger
import { logger } from '@onflow/frw-context';

logger.debug('User selected account:', account);
logger.error('Failed to load tokens:', error);

// ✅ Good - With component context
const myLogger = createLogger(bridge, 'TokenService');
myLogger.warn('Token refresh failed, retrying...');
```

### Testing Requirements

- **Unit tests**: Vitest for all packages (run with `pnpm test`)
- **E2E tests**: Playwright for extension (`pnpm test:e2e`)
- **Type safety**: All cache and data types must be explicitly typed
- **Coverage**: New code requires appropriate test coverage

## Platform-Specific Notes

### React Native (`apps/react-native`)

- **NativeWind 4.x** for styling (Tailwind CSS for React Native)
- **React Navigation v7** with native stack navigation
- **AsyncStorage** for persistent storage (dual Storage + Cache system)
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
