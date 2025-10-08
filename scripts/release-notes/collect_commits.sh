#!/usr/bin/env bash
set -euo pipefail

# Collect commit information for release notes.
# Decides the TAG_NAME based on event and finds previous tag (prefix-aware),
# then writes a human-readable commit_info.md and exports outputs for GitHub Actions.
#
# Inputs via env vars:
#   EVENT_NAME           - github.event_name
#   INPUT_TAG_NAME       - inputs.tag_name (legacy, when workflow_dispatch)
#   INPUT_FROM_TAG       - inputs.from_tag (when workflow_dispatch)
#   INPUT_TO_TAG         - inputs.to_tag (when workflow_dispatch)
#   RELEASE_TAG_NAME     - github.event.release.tag_name (for release event)
#   REPOSITORY           - github.repository (used for links in fallback)
#   GITHUB_OUTPUT        - (provided by Actions) file path for outputs

EVENT_NAME=${EVENT_NAME:-}
INPUT_TAG_NAME=${INPUT_TAG_NAME:-}
INPUT_FROM_TAG=${INPUT_FROM_TAG:-}
INPUT_TO_TAG=${INPUT_TO_TAG:-}
RELEASE_TAG_NAME=${RELEASE_TAG_NAME:-}
GITHUB_REF=${GITHUB_REF:-}
GITHUB_REF_NAME=${GITHUB_REF_NAME:-}
REPOSITORY=${REPOSITORY:-}

# Determine TAG_NAME (priority: tag_name > to_tag > release event tag > current ref tag)
TAG_NAME=""
if [[ -n "$INPUT_TAG_NAME" ]]; then
  TAG_NAME="$INPUT_TAG_NAME"
elif [[ -n "$INPUT_TO_TAG" ]]; then
  TAG_NAME="$INPUT_TO_TAG"
elif [[ -n "$RELEASE_TAG_NAME" ]]; then
  TAG_NAME="$RELEASE_TAG_NAME"
elif [[ "$GITHUB_REF" == refs/tags/* || -n "$GITHUB_REF_NAME" && "$GITHUB_REF" == refs/tags/* ]]; then
  TAG_NAME="$GITHUB_REF_NAME"
fi

if [[ -z "$TAG_NAME" ]]; then
  echo "::error::TAG_NAME is empty. Ensure inputs.tag_name or release.tag_name is provided." >&2
  exit 1
fi

echo "Processing release: $TAG_NAME"

# Extract tag prefix (monorepo), e.g., prefix from "release/rn-0.0.2"
TAG_PREFIX=""
TAG_VERSION=""
if [[ "$TAG_NAME" =~ ^(.*)-([0-9]+\.[0-9]+\.[0-9]+.*)$ ]]; then
  TAG_PREFIX="${BASH_REMATCH[1]}"
  TAG_VERSION="${BASH_REMATCH[2]}"
  echo "Detected monorepo tag - Prefix: $TAG_PREFIX, Version: $TAG_VERSION"
else
  echo "Standard tag format detected: $TAG_NAME"
fi

# Resolve previous tag: prefer manual from_tag when provided
if [[ -n "$INPUT_FROM_TAG" ]]; then
  PREVIOUS_TAG="$INPUT_FROM_TAG"
else
  if [[ -n "$TAG_PREFIX" ]]; then
    echo "Looking for previous tag with prefix: ${TAG_PREFIX}-*"
    PREVIOUS_TAG=$(git tag --list "${TAG_PREFIX}-*" --sort=-version:refname | grep -v "^${TAG_NAME}$" | head -n 1 || true)
  else
    PREVIOUS_TAG=$(git describe --tags --abbrev=0 "$TAG_NAME^" 2>/dev/null || true)
  fi
fi

if [[ -z "${PREVIOUS_TAG:-}" ]]; then
  echo "No previous tag found, analyzing all commits since repository start"
  COMMIT_RANGE=""
  COMMITS=$(git log --pretty=format:'%H|%s|%b|%an|%ad' --date=short --no-merges)
else
  echo "Previous tag: $PREVIOUS_TAG"
  COMMIT_RANGE="$PREVIOUS_TAG..$TAG_NAME"
  COMMITS=$(git log --pretty=format:'%H|%s|%b|%an|%ad' --date=short --no-merges "$COMMIT_RANGE")
fi

# Write commit info file
COMMIT_INFO_FILE="commit_info.md"
{
  echo "# Flow Reference Wallet Release Analysis"
  echo
  echo "## Repository Context"
  echo "This is the Flow Reference Wallet (FRW), a production-ready Flow blockchain wallet built with MVVM architecture in a TypeScript monorepo. It supports both React Native mobile apps and browser extensions, allowing users to interact with the Flow blockchain, manage their digital assets, and use dApps."
  echo
  echo "## Target Audience"
  echo "The release notes are for end users of the Flow Reference Wallet - both mobile app users and browser extension users. They want to know what new features, improvements, and fixes they can expect in this release."
  echo
  if [[ -n "${PREVIOUS_TAG:-}" ]]; then
    echo "## Release Range: $PREVIOUS_TAG → $TAG_NAME"
  else
    echo "## Release: $TAG_NAME"
  fi
  echo
  echo "## Commits to Analyze:"
  echo
} > "$COMMIT_INFO_FILE"

COMMIT_COUNT=0
while IFS='|' read -r commit_hash commit_subject commit_body author_name commit_date; do
  [[ -z "$commit_hash" ]] && continue
  COMMIT_COUNT=$((COMMIT_COUNT + 1))
  {
    echo "### Commit $COMMIT_COUNT: ${commit_hash:0:8}"
    echo "- Author: $author_name"
    echo "- Date: $commit_date"
    echo "- Title: $commit_subject"
    if [[ -n "$commit_body" && "$commit_body" != "$commit_subject" ]]; then
      echo "- Description:"
      echo '```'
      echo "$commit_body"
      echo '```'
    fi
    echo
  } >> "$COMMIT_INFO_FILE"
done <<< "$COMMITS"

echo "Total commits to analyze: $COMMIT_COUNT"

# Export outputs for GitHub Actions
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "TAG_NAME=$TAG_NAME"
    echo "PREVIOUS_TAG=${PREVIOUS_TAG:-}"
    echo "COMMIT_COUNT=$COMMIT_COUNT"
  } >> "$GITHUB_OUTPUT"
fi

exit 0
