#!/bin/sh
set -eu

echo "[Xcode Cloud] ci_post_clone.sh starting..."

# Ensure submodules are available
git submodule sync --recursive
git submodule update --init --recursive

# Ensure Node.js is available (install locally if missing)
if ! command -v node >/dev/null 2>&1; then
  echo "[Xcode Cloud] Node.js not found. Installing local Node..."
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
  rm -f "$NODE_BASE/node"
  ln -sfn "$NODE_BASE/${NODE_TARBALL}" "$NODE_BASE/node"
  export PATH="$NODE_BASE/node/bin:$PATH"
  echo "[Xcode Cloud] Installed Node version: $(node -v)"
fi

# Setup pnpm via Corepack if needed
if ! command -v pnpm >/dev/null 2>&1; then
  echo "[Xcode Cloud] Enabling Corepack and preparing pnpm..."
  corepack enable || true
  if [ -n "${PNPM_VERSION:-}" ]; then
    corepack prepare "pnpm@${PNPM_VERSION}" --activate
  else
    corepack prepare pnpm@latest --activate
  fi
fi

# Install JS dependencies (monorepo app)
(
  cd apps/react-native || exit 1
  echo "[Xcode Cloud] Installing JS dependencies (pnpm install)..."
  pnpm install --frozen-lockfile

  # iOS pods inside submodule
  echo "[Xcode Cloud] Installing iOS pods..."
  (
    cd ios || exit 1
    # Ensure bundler is available (Xcode Cloud may not have it preinstalled)
    if ! command -v bundle >/dev/null 2>&1; then
      echo "[Xcode Cloud] Installing bundler..."
      gem install bundler -N
    fi
    bundle install
    bundle exec pod install --repo-update

    # Generate native env/config files from base64 secrets via existing script in submodule
    echo "[Xcode Cloud] Generating Env/Plist files..."
    ./ci_scripts/ci_post_clone.sh
  )
)

echo "[Xcode Cloud] ci_post_clone.sh completed."
