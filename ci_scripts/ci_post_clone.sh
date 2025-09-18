#!/bin/sh
set -eu

echo "[Xcode Cloud] ci_post_clone.sh starting..."

# Ensure submodules are available
git submodule sync --recursive
git submodule update --init --recursive

# Install dependencies via Homebrew
echo "[Xcode Cloud] Installing dependencies via Homebrew..."

# Install Node.js if not available
if ! command -v node >/dev/null 2>&1; then
  echo "[Xcode Cloud] Installing Node.js via Homebrew..."
  brew install node
else
  echo "[Xcode Cloud] Node.js already available: $(node -v)"
fi

# Install pnpm if not available
if ! command -v pnpm >/dev/null 2>&1; then
  echo "[Xcode Cloud] Installing pnpm via Homebrew..."
  brew install pnpm
else
  echo "[Xcode Cloud] pnpm already available: $(pnpm -v)"
fi

# Install CocoaPods if not available
if ! command -v pod >/dev/null 2>&1; then
  echo "[Xcode Cloud] Installing CocoaPods via Homebrew..."
  brew install cocoapods
else
  echo "[Xcode Cloud] CocoaPods already available: $(pod --version)"
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
    # Ensure bundler is available
    if ! command -v bundle >/dev/null 2>&1; then
      echo "[Xcode Cloud] Installing bundler via Homebrew..."
      brew install ruby
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