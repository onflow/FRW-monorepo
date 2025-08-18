---
description:
  'Automatically create a pull request to dev branch with proper validation and
  commit handling'
argument-hint: '[target-branch] [title]'
allowed-tools: [Bash, TodoWrite]
---

# Create Pull Request

Create a pull request automatically with proper validation, commit handling, and
GitHub integration.

Arguments:

- `target-branch` (optional): Target branch for the PR (default: dev)
- `title` (optional): PR title (auto-generated if not provided)

## Process

I'll handle the following steps automatically:

1. **Validation**:
   - Check GitHub CLI authentication
   - Verify we're in a git repository
   - Ensure current branch is different from target branch
   - Validate target branch exists

2. **Commit Handling**:
   - Check for uncommitted changes
   - Stage and commit any pending changes with appropriate message
   - Generate meaningful commit messages based on file changes

3. **PR Creation**:
   - Analyze commits between current branch and target
   - Generate comprehensive PR title and description
   - Include changed files list and test checklist
   - Push branch to origin if needed
   - Create PR using GitHub CLI

4. **Validation Steps**:
   - Run `pnpm build:packages` to ensure build passes
   - Run `pnpm typecheck` for TypeScript validation
   - Run `pnpm lint` for code quality

Let me create your PR with target branch: **$ARGUMENTS**
