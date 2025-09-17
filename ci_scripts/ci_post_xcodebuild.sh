#!/bin/sh
set -eu

echo "[Xcode Cloud] ci_post_xcodebuild.sh starting..."

# Delegate to submodule's post-xcodebuild script if present
if [ -f "apps/react-native/ios/ci_scripts/ci_post_xcodebuild.sh" ]; then
  (
    cd apps/react-native/ios || exit 1
    ./ci_scripts/ci_post_xcodebuild.sh
  )
else
  echo "[Xcode Cloud] No submodule post-xcodebuild script found; skipping."
fi

echo "[Xcode Cloud] ci_post_xcodebuild.sh completed."

