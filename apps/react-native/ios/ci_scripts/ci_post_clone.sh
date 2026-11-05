#!/bin/sh
set -eu

echo "Stage: PRE-Xcode Build running.... "

# for future reference
# https://developer.apple.com/documentation/xcode/environment-variable-reference

# Install toolchains without Homebrew. Xcode Cloud images for Xcode 26.x run on Intel Macs, where
# Homebrew no longer ships bottles (since September 2026) and its from-source builds fail, so
# Node.js comes from nodejs.org and Ruby is built by ruby-build directly (see below).

# Store the repository root for later use
REPO_ROOT=$(cd ../../../.. && pwd)
echo "[Xcode Cloud] Repository root: $REPO_ROOT"

# Install Node.js if not available
NODE_VERSION="22.23.4"
if ! command -v node >/dev/null 2>&1; then
  case "$(uname -m)" in
    arm64) NODE_ARCH="arm64" ;;
    *) NODE_ARCH="x64" ;;
  esac
  NODE_TARBALL="node-v$NODE_VERSION-darwin-$NODE_ARCH.tar.gz"
  echo "[Xcode Cloud] Installing Node.js $NODE_VERSION ($NODE_ARCH) from nodejs.org..."
  curl -fsSL -o "$HOME/$NODE_TARBALL" "https://nodejs.org/dist/v$NODE_VERSION/$NODE_TARBALL"
  curl -fsSL "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt" | grep " $NODE_TARBALL\$" | (cd "$HOME" && shasum -a 256 -c -)
  tar -xzf "$HOME/$NODE_TARBALL" -C "$HOME"
  export PATH="$HOME/node-v$NODE_VERSION-darwin-$NODE_ARCH/bin:$PATH"
fi
echo "[Xcode Cloud] Node.js $(node -v) at $(command -v node)"

# Xcode build phases (React Native codegen, Hermes) don't inherit this script's PATH, so point
# them at the same node through the .xcode.env.local file that with-environment.sh sources.
echo "export NODE_BINARY=\"$(command -v node)\"" > "$REPO_ROOT/apps/react-native/ios/.xcode.env.local"

# Install pnpm if not available, at the version pinned in package.json
if ! command -v pnpm >/dev/null 2>&1; then
  PNPM_VERSION=$(node -p "require('$REPO_ROOT/package.json').packageManager.split('@')[1]")
  echo "[Xcode Cloud] Installing pnpm $PNPM_VERSION via npm..."
  npm install -g "pnpm@$PNPM_VERSION"
else
  echo "[Xcode Cloud] pnpm already available: $(pnpm -v)"
fi

# Install JavaScript dependencies from monorepo root
echo "[Xcode Cloud] Installing JavaScript dependencies..."
cd "$REPO_ROOT"
echo "[Xcode Cloud] Current directory: $(pwd)"
pnpm install --frozen-lockfile
pnpm build:packages

# Navigate to FRW submodule for environment file generation
cd "$REPO_ROOT/apps/react-native/ios/FRW/App/Env/"
echo "[Xcode Cloud] Current directory for env files: $(pwd)" 

LOCAL_ENV_FILE=./LocalEnv

GOOGLE_OAUTH2_FILE_DEV=./Dev/GoogleOAuth2.plist
GOOGLE_SERVICE_FILE_DEV=./Dev/GoogleService-Info.plist
SERVICE_CONFIG_FILE_DEV=./Dev/ServiceConfig.plist

GOOGLE_OAUTH2_FILE_PROD=./Prod/GoogleOAuth2.plist
GOOGLE_SERVICE_FILE_PROD=./Prod/GoogleService-Info.plist
SERVICE_CONFIG_FILE_PROD=./Prod/ServiceConfig.plist


if [ ! -f $LOCAL_ENV_FILE ] 
then
	echo "Generating LocalEnv..."
	base64 -D -o $LOCAL_ENV_FILE <<< $LOCAL_ENV
fi

# Google Drive backup is off (GOOGLE_DRIVE_BACKUP_ENABLED=false), so GoogleOAuth2.plist is never
# read at runtime, but it is still a bundled resource. Without the secret, write an empty plist.
if [ ! -f $GOOGLE_OAUTH2_FILE_DEV ] 
then
	if [ -n "${GOOGLE_OAUTH2_DEV:-}" ]
	then
		echo "DEV: Generating GoogleOAuth2..."
		base64 -D -o $GOOGLE_OAUTH2_FILE_DEV <<< "$GOOGLE_OAUTH2_DEV"
	else
		echo "DEV: GOOGLE_OAUTH2_DEV not set, writing an empty GoogleOAuth2.plist"
		echo '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict/></plist>' > $GOOGLE_OAUTH2_FILE_DEV
	fi
fi

# Firebase is off (FirebaseRuntime.isEnabled = false) and GoogleService-Info.plist is no longer
# bundled, so GOOGLE_SERVICE_DEV is optional.
if [ ! -f $GOOGLE_SERVICE_FILE_DEV ] && [ -n "${GOOGLE_SERVICE_DEV:-}" ]
then
	echo "DEV: Generating GoogleService-Info..."
	base64 -D -o $GOOGLE_SERVICE_FILE_DEV <<< "$GOOGLE_SERVICE_DEV"
fi

if [ ! -f $SERVICE_CONFIG_FILE_DEV ] 
then
	echo "DEV: Generating ServiceConfig..."
	base64 -D -o $SERVICE_CONFIG_FILE_DEV <<< $SERVICE_CONFIG_DEV
fi

# Google Drive backup is off (GOOGLE_DRIVE_BACKUP_ENABLED=false), so GoogleOAuth2.plist is never
# read at runtime, but it is still a bundled resource. Without the secret, write an empty plist.
if [ ! -f $GOOGLE_OAUTH2_FILE_PROD ] 
then
	if [ -n "${GOOGLE_OAUTH2_PROD:-}" ]
	then
		echo "PROD: Generating GoogleOAuth2..."
		base64 -D -o $GOOGLE_OAUTH2_FILE_PROD <<< "$GOOGLE_OAUTH2_PROD"
	else
		echo "PROD: GOOGLE_OAUTH2_PROD not set, writing an empty GoogleOAuth2.plist"
		echo '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict/></plist>' > $GOOGLE_OAUTH2_FILE_PROD
	fi
fi

# Firebase is off (FirebaseRuntime.isEnabled = false) and GoogleService-Info.plist is no longer
# bundled, so GOOGLE_SERVICE_PROD is optional.
if [ ! -f $GOOGLE_SERVICE_FILE_PROD ] && [ -n "${GOOGLE_SERVICE_PROD:-}" ]
then
	echo "PROD: Generating GoogleService-Info..."
	base64 -D -o $GOOGLE_SERVICE_FILE_PROD <<< "$GOOGLE_SERVICE_PROD"
fi

if [ ! -f $SERVICE_CONFIG_FILE_PROD ] 
then
	echo "PROD: Generating ServiceConfig..."
	base64 -D -o $SERVICE_CONFIG_FILE_PROD <<< $SERVICE_CONFIG_PROD
fi


echo "[Xcode Cloud] Installing iOS dependencies..."

# Go back to React Native app directory for bundling
cd "$REPO_ROOT/apps/react-native"
echo "[Xcode Cloud] Current directory for bundling: $(pwd)"
pnpm bundle:ios

# Go to iOS directory and install pods
cd "$REPO_ROOT/apps/react-native/ios"
echo "[Xcode Cloud] Current directory for CocoaPods: $(pwd)"

# Install and configure rbenv for Ruby version management
echo "[Xcode Cloud] Setting up Ruby with rbenv..."

# Install rbenv and ruby-build if not available. ruby-build compiles OpenSSL and libyaml itself
# when Homebrew doesn't provide them.
if ! command -v rbenv >/dev/null 2>&1; then
  echo "[Xcode Cloud] Installing rbenv and ruby-build from GitHub..."
  git clone --depth 1 --branch v1.3.2 https://github.com/rbenv/rbenv.git "$HOME/.rbenv"
  git clone --depth 1 --branch v20261023 https://github.com/rbenv/ruby-build.git "$HOME/.rbenv/plugins/ruby-build"
fi
export RUBY_BUILD_VENDOR_OPENSSL=1

# Initialize rbenv
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init - --no-rehash)"

# Read Ruby version from Gemfile
if [ -f "Gemfile" ]; then
  RUBY_VERSION=$(grep -E "^ruby ['\"]" Gemfile | sed -E "s/ruby ['\"]([^'\"]+)['\"].*/\1/")
  echo "[Xcode Cloud] Ruby version specified in Gemfile: $RUBY_VERSION"
else
  RUBY_VERSION="3.4.4"
  echo "[Xcode Cloud] No Gemfile found, using default Ruby version: $RUBY_VERSION"
fi

echo "[Xcode Cloud] Installing Ruby $RUBY_VERSION..."
if ! rbenv versions | grep -q "$RUBY_VERSION"; then
  # Ruby's psych extension needs libyaml, which ruby-build doesn't vendor. Build it from source
  # instead of relying on Homebrew.
  LIBYAML_DIR="$HOME/.libyaml"
  if [ ! -f "$LIBYAML_DIR/include/yaml.h" ]; then
    echo "[Xcode Cloud] Building libyaml 0.2.5..."
    curl -fsSL -o "$HOME/yaml-0.2.5.tar.gz" https://github.com/yaml/libyaml/releases/download/0.2.5/yaml-0.2.5.tar.gz
    echo "c642ae9b75fee120b2d96c712538bd2cf283228d2337df2cf2988e3c02678ef4  $HOME/yaml-0.2.5.tar.gz" | shasum -a 256 -c -
    tar -xzf "$HOME/yaml-0.2.5.tar.gz" -C "$HOME"
    (cd "$HOME/yaml-0.2.5" && ./configure --prefix="$LIBYAML_DIR" --disable-dependency-tracking >/dev/null && make -j"$(sysctl -n hw.ncpu)" install >/dev/null)
  fi
  RUBY_CONFIGURE_OPTS="--with-libyaml-dir=$LIBYAML_DIR" rbenv install "$RUBY_VERSION"
fi

# Set Ruby version for this project
rbenv local "$RUBY_VERSION"
rbenv rehash

# Verify Ruby version
echo "[Xcode Cloud] Ruby version: $(ruby -v)"

# Install bundler 2.7.1
echo "[Xcode Cloud] Installing bundler 2.7.1..."
gem install bundler:2.7.1 -N

# Set Swift version for compatibility
echo "[Xcode Cloud] Setting Swift version compatibility..."
export SWIFT_VERSION=5.0

# Install Ruby gems
echo "[Xcode Cloud] Installing Ruby dependencies..."
bundle install || {
  echo "[Xcode Cloud] Bundle install failed, trying to update bundler..."
  bundle update --bundler
  bundle install
}

# Install CocoaPods dependencies
echo "[Xcode Cloud] Installing CocoaPods dependencies..."
bundle exec pod install --repo-update

echo "Stage: PRE-Xcode Build is completed..."

exit 0
