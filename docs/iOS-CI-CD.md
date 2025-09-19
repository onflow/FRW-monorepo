# iOS CI/CD with Xcode Cloud

This document describes the iOS continuous integration and deployment setup
using Xcode Cloud for the Flow Reference Wallet (FRW) monorepo.

## 📋 Overview

The iOS CI/CD pipeline is configured to automatically build, test, and
distribute iOS apps through Xcode Cloud. The setup includes automated dependency
installation, environment configuration, and TestFlight release note generation.

## 🏗️ Architecture

### Monorepo Structure

```
FRW/
├── apps/
│   └── react-native/
│       └── ios/
│           ├── ci_scripts/          # Xcode Cloud CI scripts
│           │   ├── ci_post_clone.sh # Dependency installation
│           │   └── ci_post_xcodebuild.sh # TestFlight notes
│           ├── .xcode.env          # Node.js environment
│           └── FRW.xcodeproj       # Xcode project
└── packages/                       # Shared monorepo packages
```

### CI Script Execution Flow

1. **`ci_post_clone.sh`** - Runs after repository clone
   - Installs system dependencies (Node.js, pnpm, Ruby, CocoaPods)
   - Builds monorepo packages
   - Installs iOS dependencies
   - Generates environment configuration files

2. **`ci_post_xcodebuild.sh`** - Runs after successful build
   - Generates comprehensive TestFlight release notes
   - Fetches GitHub issue details via API
   - Creates user-friendly "What to Test" documentation

## 🔧 CI Scripts Details

### ci_post_clone.sh

**Purpose**: Set up the complete build environment for the monorepo-based iOS
app.

**Key Features**:

- **Cross-platform compatibility**: Works with both macOS (BSD) and Linux (GNU)
  tools
- **Dependency management via Homebrew**: Node.js, pnpm, CocoaPods, Ruby
- **Ruby version management**: Uses rbenv to install Ruby 3.4.4 (as specified in
  Gemfile)
- **Monorepo support**: Builds all shared packages before iOS-specific setup
- **Environment file generation**: Creates configuration files from base64
  environment variables

**Dependencies Installed**:

```bash
# Package managers and tools
brew install node pnpm cocoapods rbenv ruby-build

# Ruby version management
rbenv install 3.4.4
gem install bundler:2.7.1

# Monorepo packages
pnpm install --frozen-lockfile
pnpm build:packages

# iOS dependencies
bundle install
bundle exec pod install --repo-update
```

**Environment Variables Used**:

- `LOCAL_ENV` - Base64 encoded local environment configuration
- `GOOGLE_SERVICE_DEV` - Base64 encoded Google Services configuration (Dev)
- `GOOGLE_SERVICE_PROD` - Base64 encoded Google Services configuration (Prod)
- `GOOGLE_OAUTH2_DEV` - Base64 encoded Google OAuth2 configuration (Dev)
- `GOOGLE_OAUTH2_PROD` - Base64 encoded Google OAuth2 configuration (Prod)
- `SERVICE_CONFIG_DEV` - Base64 encoded service configuration (Dev)
- `SERVICE_CONFIG_PROD` - Base64 encoded service configuration (Prod)

### ci_post_xcodebuild.sh

**Purpose**: Generate comprehensive TestFlight release notes from git history
and GitHub issues.

**Key Features**:

- **Monorepo git history analysis**: Analyzes commits from the main repository,
  not iOS submodule
- **Intelligent issue detection**: Finds issue references in commit messages and
  PR descriptions
- **GitHub API integration**: Fetches real issue titles and descriptions
- **Multiple commit formats supported**:
  - `feat: [#123] add new feature`
  - `fix: resolve bug (closes #456)`
  - `chore: update deps (fixes #789)`

**Generated TestFlight Notes Format**:

```
What's New in This Build
=================================

Resolved Issues:
* #123: Add dark mode support to settings
* #456: Fix authentication timeout bug
* #789: Update dependency versions

=================================
Recent Changes:
* Merge pull request #123 from feature/dark-mode
* Merge pull request #456 from fix/auth-timeout

=================================
Build Information
* Build Date: [timestamp]
* Branch: [branch-name]
* Latest Commit: [hash] - [message]
* Total Commits (3 days): [count]
```

## ⚙️ Xcode Cloud Configuration

### Required Settings

1. **Xcode Version**: Use Xcode 15.x or earlier to avoid Swift 6.0 compatibility
   issues
2. **Swift Version**: Project is configured for Swift 5.0
3. **Build Scheme**: Configure both development and production schemes
4. **Environment Variables**: Set up base64-encoded configuration secrets

### Branch Configuration

- **Primary Branch**: `dev` - Main development branch
- **CI Branch**: `ci-ios` - iOS-specific CI testing and configuration
- **Release Branches**: Feature branches merged to `dev` via pull requests

### Workflow Triggers

- **Pull Request**: Build verification on PR creation/update
- **Branch Push**: Automatic builds on `dev` and `ci-ios` branches
- **Manual Trigger**: On-demand builds for testing and releases

## 🔐 Security & Environment Management

### Environment File Management

The CI generates several environment files from base64-encoded secrets:

```bash
# Development environment
FRW/App/Env/Dev/
├── GoogleOAuth2.plist
├── GoogleService-Info.plist
└── ServiceConfig.plist

# Production environment
FRW/App/Env/Prod/
├── GoogleOAuth2.plist
├── GoogleService-Info.plist
└── ServiceConfig.plist

# Local environment
FRW/App/Env/LocalEnv
```

### Node.js Environment Configuration

The `.xcode.env` file ensures Xcode can find Node.js during build:

```bash
#!/usr/bin/env bash
# Resolve Node.js from PATH so it works on Xcode Cloud and locally
export NODE_BINARY=$(command -v node)
```

**Local Development**: Developers can create `.xcode.env.local` (gitignored) for
custom Node.js paths:

```bash
export NODE_BINARY=$HOME/.nvm/versions/node/v22.12.0/bin/node
```

## 📚 Development Workflow

### Pull Request Requirements

To ensure proper TestFlight documentation, PR descriptions should include issue
references:

```markdown
## 🔗 Related Issues

Closes #123 Fixes #456 Resolves #789

## 📝 Description

[Describe your changes]
```

**Supported Formats**:

- `Closes #123` - Links to GitHub issue #123
- `Fixes #456` - Links to GitHub issue #456
- `Resolves #789` - Links to GitHub issue #789
- `feat: [#123] new feature` - Issue reference in commit message

### Testing Locally

You can test the CI scripts locally:

```bash
# Test TestFlight notes generation
./test_testflight_notes.sh

# Test complete ci_post_xcodebuild.sh simulation
./test_ci_post_xcodebuild.sh
```

## 🚀 Deployment Process

### Automatic TestFlight Distribution

1. **Code Merge**: Developer merges PR to `dev` branch
2. **Build Trigger**: Xcode Cloud detects branch change
3. **Environment Setup**: `ci_post_clone.sh` installs all dependencies
4. **Build Process**: Xcode builds the iOS app
5. **Release Notes**: `ci_post_xcodebuild.sh` generates TestFlight documentation
6. **Distribution**: App is automatically distributed to TestFlight

### TestFlight Release Notes

The generated release notes provide users with:

- **Clear issue resolution**: Which specific bugs and features are included
- **GitHub issue integration**: Direct links to detailed issue descriptions
- **Build metadata**: Branch, commit info, and build statistics
- **Change summary**: Recent merge commits and development activity

## 🔧 Troubleshooting

### Common Issues

**1. Node.js Not Found**

```bash
Error: Command PhaseScriptExecution failed with a nonzero exit code
```

**Solution**: Ensure `.xcode.env` correctly resolves Node.js path and Homebrew
installation succeeds.

**2. Ruby Version Mismatch**

```bash
Your Ruby version is X.X.X, but your Gemfile specified Y.Y.Y
```

**Solution**: The CI script uses rbenv to install the exact Ruby version
specified in `Gemfile`.

**3. CocoaPods Installation Fails**

```bash
Unable to find a specification for [PodName]
```

**Solution**: The script runs `pod install --repo-update` to refresh the
CocoaPods spec repository.

**4. TestFlight Notes Empty**

```bash
No issue references found in merge commits
```

**Solution**: Ensure PR descriptions include `Closes #123` format and commits
reference issues properly.

### Debug Steps

1. **Check Xcode Cloud Logs**: Review build logs for specific error messages
2. **Verify Environment Variables**: Ensure all base64 secrets are properly
   configured
3. **Test Locally**: Use provided test scripts to validate CI logic
4. **Check Dependencies**: Verify Homebrew, rbenv, and package installations

## 📖 Related Documentation

- [Monorepo Architecture](../README.md) - Overall project structure
- [Pull Request Template](../.github/pull_request_template.md) - PR requirements
- [Package Development](../packages/README.md) - Shared package development

## 🤝 Contributing

When modifying CI scripts:

1. **Test Locally**: Always test changes using the provided test scripts
2. **Document Changes**: Update this documentation for any workflow changes
3. **Version Compatibility**: Ensure changes work with both macOS and Linux
   environments
4. **Security Review**: Never commit secrets or sensitive configuration to the
   repository

---

**Note**: This CI/CD setup is specifically designed for the FRW monorepo
structure with React Native iOS apps. The scripts handle the complexity of
building monorepo packages while maintaining iOS-specific build requirements.
