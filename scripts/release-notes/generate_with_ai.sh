#!/usr/bin/env bash
set -euo pipefail

# Generate AI-based release notes using Anthropic Claude API.
# Requires commit_info.md to be present in current directory.
# Inputs via env vars:
#   PREVIOUS_TAG, TAG_NAME, COMMIT_COUNT, REPOSITORY
#   ANTHROPIC_API_KEY (secret)
# Output: writes ai_release_notes.md, sets RELEASE_NOTES in GITHUB_OUTPUT (optional)

PREVIOUS_TAG=${PREVIOUS_TAG:-}
TAG_NAME=${TAG_NAME:-}
COMMIT_COUNT=${COMMIT_COUNT:-}
REPOSITORY=${REPOSITORY:-}

if [[ ! -f commit_info.md ]]; then
  echo "::error::commit_info.md not found; run collect_commits.sh first." >&2
  exit 1
fi

echo "Preparing prompt for AI generation..."

cat > claude_prompt.md << 'PROMPT_EOF'
You are an expert technical writer creating release notes for the Flow Reference Wallet (FRW), a blockchain wallet application. Your task is to transform technical commit messages into engaging, user-friendly release notes that end users will understand and appreciate.

**CRITICAL GUIDELINES:**
1. Write for END USERS, not developers - avoid technical jargon
2. Focus on user-facing benefits and improvements they will actually experience
3. Skip internal changes that don't affect users (unless they improve performance/security)
4. Use exciting, positive language to highlight improvements
5. Group related changes logically
6. Be concise but informative

**OUTPUT FORMAT (use this exact structure):**

## 🆕 What's New
[List major new features and capabilities users will discover]

## 🔧 Improvements
[Performance boosts, UI enhancements, better user experience]

## 🐛 Bug Fixes
[Issues resolved that users might have experienced]

## 🔐 Security & Performance
[Security improvements and performance optimizations]

**Important:**
- Only include sections that have actual content
- If a section would be empty, omit it entirely
- End with: "---
Thank you for using Flow Reference Wallet! 🚀"
- Focus on what users will see and feel, not what developers changed
PROMPT_EOF

cat commit_info.md >> claude_prompt.md
{
  echo
  echo "Now, please analyze these commits and create engaging, user-focused release notes that highlight what users will experience and benefit from."
} >> claude_prompt.md

cat > claude_request_template.json << 'JSON_EOF'
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 8000,
  "messages": [
    {"role": "user", "content": null}
  ]
}
JSON_EOF

jq --rawfile content claude_prompt.md '.messages[0].content = $content' claude_request_template.json > claude_request_final.json

RELEASE_NOTES=""
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  RESPONSE=$(curl -s -X POST https://api.anthropic.com/v1/messages \
    -H "Content-Type: application/json" \
    -H "x-api-key: ${ANTHROPIC_API_KEY}" \
    -H "anthropic-version: 2023-06-01" \
    -d @claude_request_final.json || true)
  RELEASE_NOTES=$(echo "$RESPONSE" | jq -r '.content[0].text' 2>/dev/null || echo "")
fi

if [[ -z "$RELEASE_NOTES" || "$RELEASE_NOTES" == "null" ]]; then
  echo "AI generation failed or unavailable; using fallback notes."
  if [[ -n "$PREVIOUS_TAG" ]]; then
    CHANGELOG_LINK="**Full Changelog**: https://github.com/${REPOSITORY}/compare/${PREVIOUS_TAG}...${TAG_NAME}"
  else
    CHANGELOG_LINK="**Full Changelog**: https://github.com/${REPOSITORY}/commits/${TAG_NAME}"
  fi
  RELEASE_NOTES="## What's Changed"$'\n\n'"This release includes ${COMMIT_COUNT} improvements and updates to the Flow Reference Wallet."$'\n\n'"${CHANGELOG_LINK}"$'\n\n'"---"$'\n'"Thank you for using Flow Reference Wallet! 🚀"
fi

echo "$RELEASE_NOTES" > ai_release_notes.md

# Clean temp prompt files for security
rm -f claude_prompt.md claude_request_template.json claude_request_final.json || true

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "RELEASE_NOTES<<EOF"
    echo "$RELEASE_NOTES"
    echo "EOF"
  } >> "$GITHUB_OUTPUT"
fi

echo "✅ AI-generated release notes prepared (or fallback)."
exit 0

