#!/usr/bin/env bash
set -euo pipefail

# Update the mobile submodules (iOS / Android) to specific refs.
# Usage:
#   scripts/update-submodule-refs.sh [--ios-ref <ref>] [--android-ref <ref>]
#                                    [--skip-ios] [--skip-android]
#
# When a ref is omitted the default branch defined in .gitmodules (dev) is used.

IOS_PATH="apps/react-native/ios"
ANDROID_PATH="apps/react-native/android"

IOS_REF=""
ANDROID_REF=""
UPDATE_IOS=true
UPDATE_ANDROID=true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ios-ref)
      IOS_REF="${2:-}"
      if [[ -z "$IOS_REF" ]]; then
        echo "Error: --ios-ref requires a value" >&2
        exit 1
      fi
      shift 2
      ;;
    --android-ref)
      ANDROID_REF="${2:-}"
      if [[ -z "$ANDROID_REF" ]]; then
        echo "Error: --android-ref requires a value" >&2
        exit 1
      fi
      shift 2
      ;;
    --skip-ios)
      UPDATE_IOS=false
      shift
      ;;
    --skip-android)
      UPDATE_ANDROID=false
      shift
      ;;
    -h|--help)
      sed -n '1,120p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

update_submodule() {
  local path=$1
  local label=$2
  local ref=$3

  if [[ ! -d "$path" ]]; then
    echo "Initializing submodule for $label ($path)"
    git submodule update --init "$path"
  fi

  if [[ -z "$ref" || "$ref" == "default" ]]; then
    # Use ref configured in .gitmodules (dev)
    ref=$(git config -f .gitmodules "submodule.${label}.branch" || echo "dev")
  fi

  echo "::group::Updating $label ($path) to $ref"
  git submodule sync -- "$path"
  git submodule update --init "$path"

  local old_sha
  old_sha=$(git ls-tree HEAD "$path" | awk '{print $3}')

  (
    cd "$path"
    git fetch origin "$ref"
    git checkout --detach FETCH_HEAD
  )

  git add "$path"

  local staged_sha
  staged_sha=$(git ls-files --stage "$path" | awk 'NR==1 {print $2}')

  if [[ "$staged_sha" == "$old_sha" ]]; then
    echo "No change for $label; already at $staged_sha"
  else
    echo "Updated $label from ${old_sha:-<none>} to $staged_sha"
  fi
  echo "::endgroup::"
}

if $UPDATE_IOS; then
  update_submodule "$IOS_PATH" "apps/react-native/ios" "$IOS_REF"
fi

if $UPDATE_ANDROID; then
  update_submodule "$ANDROID_PATH" "apps/react-native/android" "$ANDROID_REF"
fi
