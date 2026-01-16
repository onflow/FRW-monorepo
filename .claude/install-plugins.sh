#!/bin/bash
set -e

echo "🚀 Installing Claude Code plugins for FRW project..."
echo ""

# Check if claude CLI is installed
if ! command -v claude &> /dev/null; then
    echo "❌ Error: Claude Code CLI is not installed."
    echo "Please install it from: https://claude.ai/code"
    exit 1
fi

echo "📦 Installing official plugins..."

plugins=(
    "frontend-design@claude-plugins-official"
    "context7@claude-plugins-official"
    "github@claude-plugins-official"
    "playwright@claude-plugins-official"
    "pr-review-toolkit@claude-plugins-official"
    "figma@claude-plugins-official"
    "typescript-lsp@claude-plugins-official"
    "swift-lsp@claude-plugins-official"
    "kotlin-lsp@claude-plugins-official"
    "code-simplifier@claude-plugins-official"
    "feature-dev@claude-plugins-official"
    "code-review@claude-plugins-official"
    "commit-commands@claude-plugins-official"
    "security-guidance@claude-plugins-official"
    "document-skills@anthropic-agent-skills"
)

failed_plugins=()

for plugin in "${plugins[@]}"; do
    echo "  → Installing $plugin..."
    if claude plugin install "$plugin" 2>&1 | grep -q "already installed\|Successfully installed"; then
        echo "    ✓ $plugin"
    else
        echo "    ⚠️  Failed to install $plugin"
        failed_plugins+=("$plugin")
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#failed_plugins[@]} -eq 0 ]; then
    echo "✅ All plugins installed successfully!"
    echo ""
    echo "📝 Available custom commands:"
    echo "   • /create-issue - Create GitHub issues"
    echo "   • /create-pr - Create pull requests"
    echo "   • /i18n - Internationalization tools"
    echo ""
    echo "🤖 Available custom agents:"
    echo "   • code-architect"
    echo "   • figma-ui-builder"
    echo "   • test-engineering-expert"
    echo "   • web3-security-auditor"
    echo ""
    echo "🎉 You're all set! Run 'claude' to start."
else
    echo "⚠️  Some plugins failed to install:"
    for plugin in "${failed_plugins[@]}"; do
        echo "   • $plugin"
    done
    echo ""
    echo "Please install them manually with:"
    echo "  claude plugin install <plugin-name>"
    exit 1
fi
