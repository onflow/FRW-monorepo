#!/usr/bin/env bash
set -euo pipefail

# Update GitHub release body with the content of ai_release_notes.md
# Inputs via env vars:
#   EVENT_NAME            - github.event_name
#   TAG_NAME              - tag name for the release
#   REPOSITORY            - owner/repo
#   GITHUB_TOKEN          - token with repo scope
#   RELEASE_ID            - (optional) when event is release, id is provided

EVENT_NAME=${EVENT_NAME:-}
TAG_NAME=${TAG_NAME:-}
REPOSITORY=${REPOSITORY:-}
GITHUB_TOKEN=${GITHUB_TOKEN:-}
RELEASE_ID=${RELEASE_ID:-}

if [[ -z "$TAG_NAME" ]]; then
  echo "::error::TAG_NAME is required." >&2
  exit 1
fi
if [[ -z "$REPOSITORY" ]]; then
  echo "::error::REPOSITORY is required (owner/repo)." >&2
  exit 1
fi
if [[ -z "$GITHUB_TOKEN" ]]; then
  echo "::error::GITHUB_TOKEN is required." >&2
  exit 1
fi
if [[ ! -f ai_release_notes.md ]]; then
  echo "::error::ai_release_notes.md not found." >&2
  exit 1
fi

# Resolve release ID if not provided
if [[ -z "$RELEASE_ID" ]]; then
  RELEASE_ID=$(curl -s -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${REPOSITORY}/releases/tags/${TAG_NAME}" | jq -r '.id // empty')
fi

if [[ -z "$RELEASE_ID" ]]; then
  echo "::error::No release found for tag ${TAG_NAME}. Please create the release first." >&2
  exit 1
fi

RELEASE_NOTES=$(cat ai_release_notes.md)
ESCAPED_NOTES=$(echo "$RELEASE_NOTES" | jq -Rs .)

curl -s -L \
  -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${REPOSITORY}/releases/$RELEASE_ID" \
  -d "{\"body\":$ESCAPED_NOTES}" >/dev/null

echo "✅ Release notes updated successfully with AI-generated content!"
exit 0

