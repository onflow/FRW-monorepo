# Claude Code Configuration

This directory contains project-level configuration for
[Claude Code](https://claude.ai/code).

## Quick Setup for Team Members

### Prerequisites

- Install [Claude Code CLI](https://claude.ai/code)
- Ensure you have Claude Pro or API access

### One-Time Plugin Installation

Run this command to install all required plugins for this project:

```bash
# Official plugins
claude plugin install frontend-design@claude-plugins-official
claude plugin install context7@claude-plugins-official
claude plugin install github@claude-plugins-official
claude plugin install playwright@claude-plugins-official
claude plugin install pr-review-toolkit@claude-plugins-official
claude plugin install figma@claude-plugins-official
claude plugin install typescript-lsp@claude-plugins-official
claude plugin install swift-lsp@claude-plugins-official
claude plugin install kotlin-lsp@claude-plugins-official
claude plugin install code-simplifier@claude-plugins-official
claude plugin install feature-dev@claude-plugins-official
claude plugin install code-review@claude-plugins-official
claude plugin install commit-commands@claude-plugins-official
claude plugin install security-guidance@claude-plugins-official

# Agent skills
claude plugin install document-skills@anthropic-agent-skills
```

Or use the provided install script:

```bash
bash .claude/install-plugins.sh
```

### How It Works

**Project Configuration (Shared via Git)**:

- `.claude/settings.json` - Team-shared configuration (enabled plugins,
  permissions)
- `.claude/commands/` - Custom commands (e.g., `/create-issue`, `/create-pr`)
- `.claude/agents/` - Custom agents (e.g., `code-architect`, `figma-ui-builder`)

**Local Configuration (Not in Git)**:

- `.claude/settings.local.json` - Personal overrides (optional)
- `~/.claude/plugins/` - Installed plugins (global, per-user)

### Verification

After installation, verify plugins are enabled:

```bash
claude # Start Claude Code in the project
# You should see the custom commands available: /create-issue, /create-pr, /i18n
```

## Available Plugins

### Frontend & Design

- **frontend-design** - Create production-grade frontend interfaces
- **figma** - Figma design integration with code connect

### Code Quality & Review

- **code-simplifier** - Simplify and refine code
- **code-review** - Comprehensive code review
- **pr-review-toolkit** - Advanced PR review agents

### Language Support

- **typescript-lsp** - TypeScript language server
- **swift-lsp** - Swift language server (for React Native iOS)
- **kotlin-lsp** - Kotlin language server (for React Native Android)

### Development Tools

- **github** - GitHub integration (issues, PRs, etc.)
- **playwright** - Browser automation and testing
- **context7** - Real-time documentation queries
- **document-skills** - Document processing capabilities

### Workflows

- **feature-dev** - Guided feature development
- **commit-commands** - Enhanced git commit workflows
- **security-guidance** - Security best practices

## Custom Commands

### `/create-issue [title] [description]`

Create GitHub issues with intelligent formatting and labels.

Examples:

```bash
/create-issue                           # Auto-generate from git changes
/create-issue "Add dark mode"           # Custom title, auto description
/create-issue "Fix bug" "Description"   # Custom title and description
```

### `/create-pr [base-branch] [title]`

Create pull requests with automatic validation and issue linking.

Examples:

```bash
/create-pr                              # Create PR to dev
/create-pr main                         # Create PR to main
/create-pr dev "feat: new feature"      # Custom title
```

### `/i18n`

Internationalization tools for the project.

## Custom Agents

- **code-architect** - Architecture design and guidance
- **figma-ui-builder** - Build pixel-perfect UI from Figma designs
- **test-engineering-expert** - Comprehensive testing guidance
- **web3-security-auditor** - Web3 wallet security reviews

## Troubleshooting

### Plugins not showing up

1. Ensure plugins are installed: `claude plugin list`
2. Check project settings: `cat .claude/settings.json`
3. Restart Claude Code

### Permission issues

- Project permissions are pre-configured in `settings.json`
- Personal overrides can be added to `.claude/settings.local.json` (not tracked
  in git)

## Learn More

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Plugin Marketplace](https://claude.ai/plugins)
- [MCP Servers](https://modelcontextprotocol.io)
