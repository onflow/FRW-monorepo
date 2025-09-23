#!/usr/bin/env bash
set -euo pipefail

# Validate that all submodule SHAs referenced by the superproject
# exist on their respective remote repositories.

ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

if [[ ! -f .gitmodules ]]; then
  echo "No .gitmodules found; nothing to validate."
  exit 0
fi

echo "Validating submodule SHAs against remotes..."

missing=()

# Helper: check if a given SHA is fetchable from the remote (i.e., reachable by any ref)
check_sha_on_remote() {
  local url="$1"; shift
  local sha="$1"; shift

  # Use a throwaway repo to avoid polluting the main .git directory
  local tmpdir
  tmpdir=$(mktemp -d)
  (
    cd "$tmpdir"
    git init -q
    # Try to fetch that specific object; if reachable from any remote ref, this succeeds
    # Store it under a temporary ref to satisfy refspec requirements
    git fetch --depth=1 "$url" "$sha:refs/verify-tmp/$sha" >/dev/null 2>&1
  )
  local rc=$?
  rm -rf "$tmpdir"
  return $rc
}

# Helper: rewrite GitHub URLs to include GITHUB_TOKEN when available.
# - Supports https://github.com/org/repo(.git)
# - Converts git@github.com:org/repo(.git) to tokenized https
# - Returns "<fetch_url>|<display_url>" where display_url has no credentials
rewrite_url_for_auth() {
  local orig_url="$1"
  local fetch_url="$orig_url"
  local display_url="$orig_url"

  # If SSH form, convert to https first
  if [[ "$fetch_url" =~ ^git@github.com:(.*)$ ]]; then
    fetch_url="https://github.com/${BASH_REMATCH[1]}"
    display_url="$fetch_url"
  fi

  # If https GitHub and token available, inject x-access-token
  if [[ -n "${GITHUB_TOKEN:-}" ]] && [[ "$fetch_url" =~ ^https://(www\.)?github\.com/(.*)$ ]]; then
    local path_part="${BASH_REMATCH[2]}"
    # Normalize display URL without credentials
    display_url="https://github.com/${path_part}"
    # Inject token for fetch URL (do not echo this string anywhere)
    fetch_url="https://x-access-token:${GITHUB_TOKEN}@github.com/${path_part}"
  fi

  echo "${fetch_url}|${display_url}"
}

# List submodules from .gitmodules
submodules=$(git config -f .gitmodules --get-regexp '^submodule\..*\.path' | awk '{print $2}')

for path in $submodules; do
  # Determine the submodule name by matching the path
  name=$(git config -f .gitmodules --get-regexp '^submodule\..*\.path' | awk -v p="$path" '$2==p {print $1}' | sed -E 's/^submodule\.([^.]*)\.path$/\1/')
  url=$(git config -f .gitmodules --get "submodule.$name.url" || true)

  if [[ -z "$url" ]]; then
    echo "Warning: Could not determine URL for submodule '$name' at '$path'"
    continue
  fi

  # Get the recorded commit for the submodule path in the current HEAD
  sha=$(git ls-tree HEAD "$path" | awk '{print $3}')
  if [[ -z "$sha" ]]; then
    echo "Warning: Could not determine SHA for submodule '$name' at '$path'"
    continue
  fi

  # Possibly rewrite URL for auth
  auth_pair=$(rewrite_url_for_auth "$url")
  IFS='|' read -r fetch_url display_url <<<"$auth_pair"

  echo "- Checking $name ($path) @ $sha on ${display_url}"

  # Query the remote to see if the commit is reachable (fetchable)
  if check_sha_on_remote "$fetch_url" "$sha"; then
    echo "  OK: Commit is reachable on remote"
  else
    echo "  ERROR: Commit $sha for submodule '$name' not reachable on remote ${display_url}"
    echo "         (Tip: ensure the commit exists on the upstream repo and is reachable from a branch or tag)"
    missing+=("$name|$path|$sha|$display_url")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "\nOne or more submodules reference commits that are not reachable on their remotes:"
  for item in "${missing[@]}"; do
    IFS='|' read -r name path sha url <<<"$item"
    echo "  - $name ($path): $sha not reachable on $url"
  done
  echo "\nPlease push the referenced commits to the upstream remote (or ensure they are on a branch/tag),"
  echo "then update the submodule pointers, and re-run CI."
  exit 1
fi

echo "All submodule SHAs are reachable on their remotes."
