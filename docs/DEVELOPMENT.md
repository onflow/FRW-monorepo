# Development Guide

## Code Quality Tools

This monorepo uses a comprehensive set of code quality tools to maintain
consistent code standards across all packages and applications.

## 🛠️ Tools Overview

### ESLint

- **Config**: `eslint.config.mjs` (flat config format)
- **Scope**: All TypeScript, JavaScript, React files
- **Rules**: TypeScript strict, React hooks, React Native specific rules
- **Commands**:
  ```bash
  pnpm lint              # Lint all files
  pnpm lint:fix          # Auto-fix issues
  pnpm lint:packages     # Lint only packages
  ```

### Prettier

- **Config**: `.prettierrc.json`
- **Scope**: All code files (TS, JS, JSON, MD, YAML)
- **Settings**: Single quotes, 2 spaces, 100 char width
- **Commands**:
  ```bash
  pnpm format            # Format all files
  pnpm format:check      # Check formatting
  pnpm format:packages   # Format only packages
  ```

### Husky + lint-staged

- **Pre-commit**: Auto-lint and format staged files
- **Commit-msg**: Validate commit message format
- **Config**: `.husky/`, `.lintstagedrc.json`
- **Commit format**: Conventional commits (feat, fix, docs, etc.)

### Commitlint

- **Config**: `.commitlintrc.json`
- **Format**: `type(scope): description`
- **Examples**:
  ```
  feat(stores): add token caching
  fix(react-native): resolve navigation issue
  docs(architecture): update MVVM diagram
  ```

## 📁 File Structure

```
.
├── eslint.config.mjs          # ESLint configuration (workspace-wide)
├── .prettierrc.json           # Prettier configuration
├── .prettierignore            # Prettier ignore patterns
├── .lintstagedrc.json         # Lint-staged configuration
├── .commitlintrc.json         # Commitlint configuration
├── .editorconfig              # Editor configuration
├── .husky/                    # Git hooks
│   ├── pre-commit             # Run lint-staged
│   ├── commit-msg             # Validate commit message
│   └── _/husky.sh             # Husky helper script
└── .vscode/                   # VSCode workspace settings
    ├── settings.json          # Editor settings
    └── extensions.json        # Recommended extensions
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Initialize Git Hooks

```bash
pnpm run prepare  # Sets up Husky hooks (v9+ format)
```

### 3. Verify Setup

```bash
pnpm lint         # Should pass without errors
pnpm format:check # Should pass without errors
pnpm typecheck    # Should pass without errors
```

## 🔧 IDE Configuration

### VSCode (Recommended)

- **Auto-setup**: Settings are pre-configured in `.vscode/`
- **Extensions**: Install recommended extensions when prompted
- **Features**:
  - Auto-format on save
  - Auto-fix ESLint issues
  - TypeScript strict checking
  - File nesting for better organization
  - Optimized search/exclude patterns

### Other IDEs

- **EditorConfig**: `.editorconfig` provides basic settings
- **Manual setup**: Configure ESLint and Prettier plugins

## 🎯 Workflows

### Development Workflow

1. **Write code** following MVVM architecture
2. **Auto-formatting** happens on save (if using VSCode)
3. **Commit changes**:
   - Pre-commit hook runs lint-staged
   - Commit message is validated
   - Only properly formatted/linted code is committed

### Package-Specific Rules

#### Packages (`packages/*`)

- **Stricter rules**: More explicit function return types
- **Shared across apps**: All packages must be highly reusable

#### React Native (`apps/react-native`)

- **React Native globals**: `__DEV__`, `fetch`, `navigator`
- **Allow require()**: For React Native assets
- **React hooks rules**: Enforced

#### Extension (`apps/extension`)

- **Browser/WebExtension globals**: `chrome`, `browser`
- **Standard web APIs**: Available

## 📝 Commit Message Format

### Structure

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding/updating tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Maintenance tasks

### Scopes

- **types**: Type definitions
- **api**: API layer changes
- **cadence**: Flow blockchain changes
- **services**: Service layer changes
- **workflow**: Business logic changes
- **stores**: State management changes
- **react-native**: RN app changes
- **extension**: Extension app changes
- **docs**: Documentation
- **ci**: CI/CD changes

### Examples

```bash
git commit -m "feat(stores): add automatic token refresh"
git commit -m "fix(react-native): resolve navigation back button issue"
git commit -m "docs(architecture): update MVVM flow diagram"
git commit -m "refactor(services): extract common provider logic"
```

## ⚡ Performance Tips

### Large Monorepo Optimizations

1. **File exclusions**: Build artifacts, `node_modules`, etc. are excluded
2. **ESLint caching**: Enabled by default
3. **Prettier ignore**: Binary files and generated code ignored
4. **Git hooks**: Only run on staged files (fast)

### VSCode Optimizations

1. **File nesting**: Config files are nested under main files
2. **Search exclusions**: Build artifacts excluded from search
3. **Watcher exclusions**: Prevents unnecessary file watching

## 🐛 Troubleshooting

### ESLint Issues

```bash
# Clear ESLint cache
rm -rf .eslintcache
pnpm lint

# Check specific files
pnpm eslint "packages/**/*.ts" --debug
```

### Prettier Issues

```bash
# Check what files are being processed
pnpm prettier --check . --list-different

# Debug ignore patterns
pnpm prettier --check . --debug-check
```

### Husky Issues

```bash
# Reinstall hooks
rm -rf .husky/_
pnpm run prepare

# Skip hooks temporarily (emergency)
git commit --no-verify -m "emergency commit"
```

### TypeScript Issues

```bash
# Check each package individually
pnpm -r typecheck

# Clean and rebuild
pnpm clean
pnpm build
```

## 📋 Quality Checklist

Before creating a PR, ensure:

- [ ] **Code passes linting**: `pnpm lint`
- [ ] **Code is formatted**: `pnpm format:check`
- [ ] **Types are valid**: `pnpm typecheck`
- [ ] **Tests pass**: `pnpm test`
- [ ] **Builds successfully**: `pnpm build`
- [ ] **Commits follow format**: Use conventional commits
- [ ] **No console.logs**: Remove debug statements
- [ ] **Documentation updated**: If adding new features

---

_This development guide is maintained by the Flow Foundation team. For questions
or issues, create an issue in the repository._
