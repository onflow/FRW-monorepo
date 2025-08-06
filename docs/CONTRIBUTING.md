# Contributing Guide

This guide covers the development workflow, coding standards, and contribution
guidelines for the Flow Reference Wallet monorepo.

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Quality Standards](#code-quality-standards)
- [Pull Request Process](#pull-request-process)
- [Architecture Guidelines](#architecture-guidelines)

## 🚀 Development Setup

### Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0 (automatically managed via `packageManager` field)
- **Git**: Latest version with proper SSH/HTTPS setup

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/onflow/FRW-monorepo.git
   cd FRW
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build all packages**

   ```bash
   pnpm build:packages
   ```

4. **Run development environment**

   ```bash
   # For React Native development
   pnpm dev:rn:full

   # For Extension development
   pnpm dev:extension

   # For package development only
   pnpm dev:packages
   ```

## 📝 Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/)
specification to ensure consistent commit messages and enable automated
changelog generation.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

#### **Core Types (Required)**

| Type   | Purpose      | Example                                |
| ------ | ------------ | -------------------------------------- |
| `feat` | New features | `feat: add user authentication system` |
| `fix`  | Bug fixes    | `fix: resolve login timeout issue`     |

#### **Common Types**

| Type       | Purpose                            | Example                                         |
| ---------- | ---------------------------------- | ----------------------------------------------- |
| `docs`     | Documentation changes              | `docs: update API reference guide`              |
| `style`    | Code formatting (no logic changes) | `style: fix ESLint warnings in utils`           |
| `refactor` | Code refactoring                   | `refactor: extract validation logic to service` |
| `perf`     | Performance improvements           | `perf: optimize query response time`            |
| `test`     | Test additions/modifications       | `test: add unit tests for auth service`         |
| `build`    | Build system changes               | `build: update webpack configuration`           |
| `ci`       | CI/CD configuration changes        | `ci: add automated deployment workflow`         |
| `chore`    | Maintenance tasks                  | `chore: update npm dependencies`                |

#### **Extended Types**

| Type       | Purpose                   | Example                                      |
| ---------- | ------------------------- | -------------------------------------------- |
| `security` | Security fixes            | `security: patch XSS vulnerability in forms` |
| `deps`     | Dependency updates        | `deps: bump react from 18.2.0 to 19.0.0`     |
| `config`   | Configuration changes     | `config: update ESLint rules for TypeScript` |
| `hotfix`   | Critical production fixes | `hotfix: resolve payment gateway timeout`    |
| `cleanup`  | Code cleanup              | `cleanup: remove unused imports and files`   |

### Scope Examples

Scopes help identify which part of the codebase is affected:

```bash
feat(auth): add OAuth2 integration
fix(ui): resolve button alignment in modal
docs(api): add endpoint documentation
test(stores): add unit tests for wallet store
chore(deps): update Flow SDK to latest version
```

### Breaking Changes

Use `!` after the type or `BREAKING CHANGE:` in the footer:

```bash
# Method 1: Using exclamation mark
feat!: remove deprecated login API

# Method 2: Using footer
feat: update authentication system

BREAKING CHANGE: The /api/v1/login endpoint has been removed.
Use /api/v2/auth/login instead.
```

### Examples

#### **Simple Commits**

```bash
feat: add dark mode toggle to settings
fix: resolve memory leak in token refresh
docs: add React Native development guide
test: add integration tests for send flow
chore: update TypeScript to version 5.7
```

#### **Scoped Commits**

```bash
feat(wallet): implement multi-account support
fix(nft): resolve image loading timeout
style(components): apply consistent button styling
perf(api): optimize batch token price fetching
```

#### **Multi-line Commits**

```bash
feat: implement comprehensive user dashboard

- Add user profile management interface
- Create activity timeline with transaction history
- Implement settings panel with preferences
- Integrate real-time notification system
- Add responsive design for mobile devices

Closes #123
Co-authored-by: John Doe <john@example.com>
```

### ❌ Common Mistakes

```bash
# ❌ Wrong - Missing type
"Update user interface"

# ❌ Wrong - Invalid type
"updated: fix login bug"

# ❌ Wrong - Missing colon and space
"fix:login timeout"

# ❌ Wrong - Uppercase first letter
"fix: Fix login timeout"

# ❌ Wrong - Ending with period
"fix: resolve login timeout."

# ✅ Correct
"fix: resolve login timeout issue"
```

### 🔧 Fixing Failed Commits

If commitlint fails, you can fix your commit message:

```bash
# Fix the most recent commit message
git commit --amend -m "fix: resolve login timeout issue"

# For older commits, use interactive rebase
git rebase -i HEAD~3  # Edit last 3 commits
```

## 🧹 Code Quality Standards

### Automated Quality Checks

Our monorepo includes automated code quality enforcement:

- **ESLint**: Linting for TypeScript/JavaScript
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Runs checks only on staged files

### Pre-commit Hooks

Every commit automatically runs:

1. **ESLint** with auto-fix on staged `.ts`, `.tsx`, `.js`, `.jsx` files
2. **Prettier** formatting on staged files
3. **commitlint** validation on commit message

### Manual Quality Checks

```bash
# Run ESLint on entire codebase
pnpm lint

# Fix ESLint issues automatically
pnpm lint:fix

# Check Prettier formatting
pnpm format:check

# Format all files with Prettier
pnpm format

# Run TypeScript type checking
pnpm typecheck

# Run all tests
pnpm test
```

### Code Style Guidelines

- **Use TypeScript** for all new code
- **Prefer explicit return types** for functions in packages
- **Use consistent naming**: camelCase for variables/functions, PascalCase for
  components
- **Comment complex logic** but prefer self-documenting code
- **Keep functions small** and focused on single responsibility
- **Use meaningful variable names** that describe the data

## 🔄 Pull Request Process

### Before Creating a PR

1. **Create a feature branch**

   ```bash
   git checkout -b feat/user-authentication
   git checkout -b fix/login-timeout
   git checkout -b docs/contributing-guide
   ```

2. **Make your changes** following the coding standards

3. **Test your changes**

   ```bash
   pnpm build:packages  # Ensure packages build
   pnpm lint           # Check for linting issues
   pnpm typecheck      # Verify TypeScript types
   pnpm test           # Run tests
   ```

4. **Commit with conventional format**
   ```bash
   git add .
   git commit -m "feat: add user authentication system"
   ```

### Creating the PR

1. **Push your branch**

   ```bash
   git push origin feat/user-authentication
   ```

2. **Create PR** with clear title and description:
   - Title should follow conventional commits format
   - Description should explain what changes were made and why
   - Link relevant issues with `Closes #123`

### PR Requirements

✅ **Required Checks**

- All CI checks must pass
- Code review approval from at least one maintainer
- No merge conflicts
- Conventional commit format

✅ **Best Practices**

- Keep PRs focused and reasonably sized
- Update documentation if needed
- Add tests for new features
- Ensure backward compatibility

## 🏗️ Architecture Guidelines

### Monorepo Structure

```
FRW/
├── packages/          # Shared packages
│   ├── api/          # API client and types
│   ├── cadence/      # Flow blockchain interactions
│   ├── context/      # Dependency injection
│   ├── services/     # Business logic services
│   ├── stores/       # State management (Zustand)
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Utility functions
│   └── workflow/     # Complex business workflows
├── apps/
│   ├── react-native/ # Mobile application
│   └── extension/    # Browser extension
└── docs/             # Documentation
```

### Development Principles

1. **MVVM Architecture**: Types → API/Cadence → Services/Workflow → Stores → UI
2. **Dependency Injection**: Use ServiceContext for loose coupling
3. **Package Independence**: Packages should not depend on apps
4. **Shared State**: Use Zustand stores for cross-component state
5. **Type Safety**: Prefer TypeScript strict mode everywhere

### Import Guidelines

```typescript
// ✅ External packages first
import React from 'react';
import { z } from 'zod';

// ✅ Internal packages
import { ApiClient } from '@onflow/frw-api';
import { WalletService } from '@onflow/frw-services';

// ✅ Relative imports last
import { Button } from '../components/Button';
import { useWallet } from './hooks/useWallet';
```

## 🤝 Getting Help

- **Documentation**: Check `/docs` directory for detailed guides
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Don't hesitate to ask for feedback in PRs

## 📚 Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Flow Blockchain Documentation](https://developers.flow.com/)
- [React Native Development Guide](./apps/react-native/README.md)
- [Architecture Overview](./ARCHITECTURE.md)

---

Happy contributing! 🚀
