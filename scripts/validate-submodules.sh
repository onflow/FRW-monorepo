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

  echo "- Checking $name ($path) @ $sha on $url"

  # Query the remote to see if the commit exists
  # Using --exit-code is not supported; we check stdout length instead
  if git ls-remote "$url" "$sha" | grep -q "$sha"; then
    echo "  OK: Commit exists on remote"
  else
    echo "  ERROR: Commit $sha for submodule '$name' not found on remote $url"
    missing+=("$name|$path|$sha|$url")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "\nOne or more submodules reference commits that do not exist on their remotes:"
  for item in "${missing[@]}"; do
    IFS='|' read -r name path sha url <<<"$item"
    echo "  - $name ($path): $sha not found on $url"
  done
  echo "\nPlease push the referenced commits to the submodule remote, or update the submodule to a valid commit."
  exit 1
fi

echo "All submodule SHAs are valid on their remotes."

