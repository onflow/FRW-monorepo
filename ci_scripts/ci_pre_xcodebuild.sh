#!/bin/sh
set -eu

echo "[Xcode Cloud] ci_pre_xcodebuild.sh starting (bundle RN)..."

# Ensure Node.js and pnpm are available (in case this runs in a fresh shell)
if ! command -v node >/dev/null 2>&1; then
  echo "[Xcode Cloud] Node.js not found in PATH. Trying local install..."
  if [ -x "$HOME/.local/node/bin/node" ]; then
    export PATH="$HOME/.local/node/bin:$PATH"
  else
    NODE_VERSION="${NODE_VERSION:-20.17.0}"
    ARCH=$(uname -m)
    case "$ARCH" in
      arm64) NODE_TARBALL="node-v${NODE_VERSION}-darwin-arm64" ;;
      x86_64) NODE_TARBALL="node-v${NODE_VERSION}-darwin-x64" ;;
      *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;;
    esac
    NODE_BASE="$HOME/.local"
    mkdir -p "$NODE_BASE"
    echo "[Xcode Cloud] Downloading https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TARBALL}.tar.gz"
    curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TARBALL}.tar.gz" -o "/tmp/${NODE_TARBALL}.tar.gz"
    tar -xzf "/tmp/${NODE_TARBALL}.tar.gz" -C "$NODE_BASE"
    rm -f "/tmp/${NODE_TARBALL}.tar.gz"
    ln -sfn "$NODE_BASE/${NODE_TARBALL}" "$NODE_BASE/node"
    export PATH="$NODE_BASE/node/bin:$PATH"
  fi
  echo "[Xcode Cloud] Using Node version: $(node -v)"
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[Xcode Cloud] pnpm not found. Enabling corepack..."
  corepack enable || true
  if [ -n "${PNPM_VERSION:-}" ]; then
    corepack prepare "pnpm@${PNPM_VERSION}" --activate
  else
    corepack prepare pnpm@latest --activate
  fi
fi

(
  cd apps/react-native || exit 1
  pnpm run bundle:ios
)

echo "[Xcode Cloud] ci_pre_xcodebuild.sh completed (bundle ready)."