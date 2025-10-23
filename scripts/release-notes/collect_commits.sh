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
GITHUB_TOKEN=${GITHUB_TOKEN:-}

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

# Resolve previous tag (flat if-elif-else for clarity)
if [[ -n "$INPUT_FROM_TAG" ]]; then
  PREVIOUS_TAG="$INPUT_FROM_TAG"
elif [[ -n "$TAG_PREFIX" ]]; then
  echo "Looking for previous tag with prefix: ${TAG_PREFIX}-*"
  PREVIOUS_TAG=$(git tag --list "${TAG_PREFIX}-*" --sort=-version:refname | grep -v "^${TAG_NAME}$" | head -n 1 || true)
else
  PREVIOUS_TAG=$(git describe --tags --abbrev=0 "$TAG_NAME^" 2>/dev/null || true)
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
  # Clean conventional prefixes/scopes and ticket IDs from title for user-facing text
  clean_subject=$(echo "$commit_subject" \
    | sed -E "s/^(feat|fix|chore|refactor|style|docs|test|perf|build|ci|revert)(\([^)]+\))?(!)?:\s*//I" \
    | sed -E "s/^\[?[A-Za-z]+-[0-9]+\](:|-)?\s*//" \
    | sed -E "s/[[:space:]]+$//")
  {
    echo "### Commit $COMMIT_COUNT: ${commit_hash:0:8}"
    echo "- Author: $author_name"
    echo "- Date: $commit_date"
    echo "- Title: $clean_subject"
    if [[ -n "$commit_body" && "$commit_body" != "$commit_subject" ]]; then
      echo "- Description:"
      echo '```'
      echo "$commit_body"
      echo '```'
    fi
    echo
  } >> "$COMMIT_INFO_FILE"
  # Prefer GitHub API to map commit -> PR for accurate PR number and author handle
  if [[ -n "$GITHUB_TOKEN" && -n "$REPOSITORY" ]]; then
    API_DATA=$(curl -s -L \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com/repos/${REPOSITORY}/commits/${commit_hash}/pulls" || true)
    echo "$API_DATA" | jq -r '.[] | "\(.number)|\(.title)|\(.user.login)"' 2>/dev/null >> pr_entries_api.txt || true
  else
    PR_LIST=$(printf '%s\n%s\n' "$commit_subject" "$commit_body" | grep -Eo "#[0-9]+" | tr -d "#" | sort -n | uniq | tr "\n" " ")
    if [[ -n "${PR_LIST:-}" ]]; then
      for pr in $PR_LIST; do
        echo "$pr|$clean_subject|$author_name" >> pr_entries.txt
      done
    fi
  fi

  # Try to extract a PR number from subject/body (matches patterns like "(#123)" or "#123")
  PR_NUM=$(printf '%s\n%s\n' "$commit_subject" "$commit_body" | grep -Eo '#[0-9]+' | head -n 1 | tr -d '#' || true)
  if [[ -n "${PR_NUM:-}" ]]; then
    # Accumulate entries for a later PR list (dedup by PR later)
    echo "$PR_NUM|$clean_subject|$author_name" >> pr_entries.txt
  fi
done <<< "$COMMITS"

echo "Total commits to analyze: $COMMIT_COUNT"

# Build PR Index (with GitHub handles if available)
if [[ -f pr_entries_api.txt ]]; then
  awk -F'|' '!seen[$1]++ {print $0}' pr_entries_api.txt > pr_unique_api.txt || true
  if [[ -s pr_unique_api.txt ]]; then
    : > pr_index.md
    while IFS='|' read -r pr title login; do
      safe_title=$(echo "$title" | tr '\n' ' ')
      if [[ -n "$login" ]]; then
        echo "- ${safe_title} (#${pr}) — @${login}" >> pr_index.md
      else
        echo "- ${safe_title} (#${pr})" >> pr_index.md
      fi
    done < pr_unique_api.txt
  fi
fi

# Fallback PR list (no handles) if API not used
if [[ ! -s pr_index.md && -f pr_entries.txt ]]; then
  # Keep first occurrence per PR (newest first in our log ordering)
  awk -F'|' '!seen[$1]++ {print $0}' pr_entries.txt > pr_unique.txt || true
  if [[ -s pr_unique.txt ]]; then
    {
      echo "## PRs"
      echo
      while IFS='|' read -r pr title author; do
        safe_title=$(echo "$title" | tr '\n' ' ')
        echo "- ${safe_title} (#${pr}) — @${author}"
      done < pr_unique.txt
    } > pr_list.md
  fi
fi

# Export outputs for GitHub Actions
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "TAG_NAME=$TAG_NAME"
    echo "PREVIOUS_TAG=${PREVIOUS_TAG:-}"
    echo "COMMIT_COUNT=$COMMIT_COUNT"
  } >> "$GITHUB_OUTPUT"
fi

exit 0
