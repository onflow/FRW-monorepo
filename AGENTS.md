# Repository Guidelines

## Project Structure & Module Organization

- Monorepo root: packages and apps.
- `packages/`: shared libraries (api, cadence, services, stores, utils, types,
  workflow, context).
- `apps/react-native/`: mobile app (iOS/Android).
- `apps/extension/`: browser extension.
- `docs/`: contributor and platform guides.

## Build, Test, and Development Commands

- `pnpm install`: install workspace deps.
- `pnpm build:packages`: build all packages.
- `pnpm dev:rn:full`: start RN app + watch packages.
- `pnpm dev:extension`: start extension dev.
- `pnpm dev:packages`: watch packages only.
- `pnpm lint` / `pnpm lint:fix`: run ESLint, optionally fix.
- `pnpm format` / `pnpm format:check`: Prettier format/check.
- `pnpm typecheck`: TypeScript project-wide types.
- `pnpm test`: run unit tests (packages). E2E for extension uses Playwright.

## Coding Style & Naming Conventions

- Language: TypeScript (strict). Formatting: Prettier 3; Linting: ESLint 9.
- Filenames: `kebab-case.ts`; React components in PascalCase.
- Names: camelCase for vars/functions; PascalCase for components/types.
- No direct `console.*`; use `@onflow/frw-context` logger.

## Testing Guidelines

- Frameworks: Vitest (unit), Playwright (extension E2E).
- Structure tests alongside sources or in `__tests__` per package.
- Aim for meaningful coverage on new/changed code (services, workflows, stores).
- Run: `pnpm test`; add focused tests for modules you modify.

## Commit & Pull Request Guidelines

- Conventional Commits: `<type>[scope]: <description>` (e.g.,
  `feat(api): add token refresh`).
- Branch naming:
  - Allowed without issue: `main`, `master`, `dev`, `develop`, `hotfix/*`,
    `release/*`.
  - All other branches must include an issue number (e.g., `249-feature-title`,
    `dev/249-...`, `feature/abc-249`).
- The `prepare-commit-msg` hook injects `Closes #<issue>` from branch name
  automatically.
- PRs: clear description, link issues (e.g., `Closes #249`), screenshots for UI
  when relevant, passing CI, tests updated, docs updated when needed.

## Security & Configuration Tips

- Requirements: Node 20+, pnpm 9+.
- Husky + lint-staged run on commit; stage only intended files to avoid
  conflicts.
- Keep secrets out of the repo; prefer env/CI secrets.
