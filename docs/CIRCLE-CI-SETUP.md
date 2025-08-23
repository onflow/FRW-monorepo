# Circle CI Setup Guide for FRW React Native

This document provides a comprehensive guide for setting up Circle CI for the
Flow Reference Wallet (FRW) React Native 0.79.2 project with automated iOS and
Android builds.

## 📋 Overview

Our CI/CD pipeline supports:

- **Development Builds**: Automated daily builds (00:00 & 12:00 UTC) from `dev`
  branch when changes are detected
  - iOS → TestFlight
  - Android → Firebase App Distribution
- **Production Builds**: Triggered by release tags (`release/rn-*`)
  - iOS → App Store
  - Android → Google Play Store (Internal Track) + Firebase App Distribution

## 🏗️ Architecture

### Trigger Strategy

| Environment     | Trigger                                                     | iOS Destination | Android Destination          |
| --------------- | ----------------------------------------------------------- | --------------- | ---------------------------- |
| **Development** | Scheduled (daily at 00:00 & 12:00 UTC) from `dev` branch    | TestFlight      | Firebase App Distribution    |
| **Production**  | Release tags (`release/rn-0.0.1`, `release/rn-0.0.2`, etc.) | App Store       | Google Play Store + Firebase |

### Submodule Handling

The configuration automatically:

- Initializes and updates git submodules (`apps/react-native/ios` and
  `apps/react-native/android`)
- Syncs submodule branches to their latest commits
- Handles the different branch names (iOS uses `dev`, Android uses `develop`)

## 🔧 Required Circle CI Configuration

### 1. Context Setup

Create the following contexts in Circle CI:

#### `frw-ios-dev` (Development iOS)

```bash
# Keychain and certificates
KEYCHAIN_PASSWORD=your-keychain-password
IOS_CERT_P12_BASE64=base64-encoded-p12-certificate
IOS_CERT_PASSWORD=p12-certificate-password
IOS_PROVISIONING_PROFILE_BASE64=base64-encoded-provisioning-profile

# Apple credentials
APPLE_ID=your-apple-developer-email
APPLE_APP_PASSWORD=app-specific-password

# Configuration files (following iOS CI/CD documentation pattern)
IOS_LOCAL_ENV_BASE64=base64-encoded-LocalEnv-file
IOS_CONFIG_PLIST_BASE64=base64-encoded-config-plist

# API access (for change detection)
CIRCLE_TOKEN=your-circleci-api-token
```

#### `frw-ios-prod` (Production iOS)

```bash
# Same as dev but for production certificates and provisioning profiles
KEYCHAIN_PASSWORD=your-keychain-password
IOS_CERT_P12_BASE64=base64-encoded-production-p12
IOS_CERT_PASSWORD=p12-certificate-password
IOS_PROVISIONING_PROFILE_BASE64=base64-encoded-production-provisioning-profile

APPLE_ID=your-apple-developer-email
APPLE_APP_PASSWORD=app-specific-password

# Production configuration files
IOS_LOCAL_ENV_BASE64=base64-encoded-production-LocalEnv
IOS_CONFIG_PLIST_BASE64=base64-encoded-production-config-plist
```

#### `frw-android-dev` (Development Android)

```bash
# Android signing (dev uses generated keystore)
ANDROID_KEY_PROPERTIES_DEV=content-of-dev-key-properties
ANDROID_LOCAL_PROPERTIES=content-of-local-properties
ANDROID_GOOGLE_SERVICES_DEV=content-of-dev-google-services-json

# Firebase App Distribution
FIREBASE_TOKEN=your-firebase-token

# API access
CIRCLE_TOKEN=your-circleci-api-token
```

#### `frw-android-prod` (Production Android)

```bash
# Android signing (production uses real keystore)
ANDROID_KEYSTORE_BASE64=base64-encoded-production-keystore
ANDROID_KEY_PROPERTIES=content-of-production-key-properties
ANDROID_LOCAL_PROPERTIES=content-of-local-properties
ANDROID_GOOGLE_SERVICES_RELEASE=content-of-production-google-services-json

# Firebase App Distribution
FIREBASE_TOKEN=your-firebase-token

# Google Play Store
FASTLANE_SERVICE_ACCOUNT_JSON=content-of-play-store-service-account-json

# Fastlane
SERVICE_ACCOUNT_JSON=content-of-firebase-service-account-json
```

### 2. Environment Variables Encoding

Following the iOS CI/CD documentation pattern, configuration files must be
base64 encoded:

```bash
# Encode files to base64
base64 -i LocalEnv
base64 -i Config.plist
base64 -i keystore.jks
base64 -i provisioning-profile.mobileprovision
base64 -i certificate.p12
```

## 📱 iOS Configuration

### Required Files in iOS Submodule

The iOS build expects these files (following existing iOS CI/CD pattern):

- `LocalEnv` - Environment configuration
- `FRW/Foundation/Config.plist` - App configuration
- `ExportOptions-dev.plist` - Development export options
- `ExportOptions-prod.plist` - Production export options

### Schemes

- **Development**: `FlowWallet-dev`
- **Production**: `FlowWallet`

### App Store Connect

- Uses `xcrun altool` for uploads
- Requires Apple ID and app-specific password

## 🤖 Android Configuration

### Build Types

- **Development**: `assembleDev` + Firebase App Distribution
- **Production**: `assembleRelease` + `bundleRelease` + Google Play Store

### Required Files

- `key.properties` - Keystore configuration
- `local.properties` - Android SDK paths
- `google-services.json` - Firebase configuration (dev/release variants)
- `fastlane/service-account.json` - Google Play Store service account

### Fastlane Integration

Uses existing Fastlane configuration in Android submodule:

```ruby
# fastlane/Fastfile
lane :internal do
  gradle(task: "clean bundleRelease")
  upload_to_play_store(
    track: 'internal',
    release_status: 'draft',
    # ... other options
  )
end
```

## 🔄 Workflow Details

### Development Workflow (Scheduled)

1. **Trigger**: Cron schedule at 00:00 and 12:00 UTC on `dev` branch
2. **Change Detection**: Uses Circle CI API to compare with last successful
   build
3. **Conditional Build**: Only builds if changes detected in `apps/react-native`
   or `packages`
4. **Parallel Execution**: iOS and Android builds run simultaneously
5. **Submodule Sync**: Automatically pulls latest commits from submodules

### Production Workflow (Tag-based)

1. **Trigger**: Push release tag like `release/rn-0.0.1`
2. **No Change Detection**: Always builds (explicit release)
3. **Parallel Execution**: iOS and Android builds run simultaneously
4. **Store Upload**: Automatic upload to App Store and Google Play Store

### Example Release Process

```bash
# Create and push release tag
git checkout main
git tag release/rn-0.0.1
git push origin release/rn-0.0.1

# This automatically triggers production builds
```

## 🛠️ Maintenance

### Adding New Configuration Files

1. **iOS**: Follow the base64 encoding pattern from iOS CI/CD docs

   ```bash
   base64 -i NewConfigFile > encoded.txt
   # Add encoded content to Circle CI context as IOS_NEW_CONFIG_BASE64
   ```

2. **Android**: Add to appropriate context as environment variable
   ```bash
   # Add to Circle CI context
   ANDROID_NEW_CONFIG="content here"
   ```

### Updating Submodules

The pipeline automatically handles submodule updates, but you can manually sync:

```bash
git submodule update --remote
git commit -am "Update submodules"
```

### Debugging Builds

1. **Check Change Detection**: Look for "Changes detected" or "No changes" in
   logs
2. **Verify Context**: Ensure all environment variables are set in appropriate
   contexts
3. **Submodule Issues**: Check that submodules are properly initialized
4. **Certificate Issues**: Verify base64 encoding and keychain setup

## 🔐 Security Best Practices

1. **Sensitive Data**: All secrets stored in Circle CI contexts, never in code
2. **File Cleanup**: Automatic cleanup of temporary files after builds
3. **Base64 Encoding**: Configuration files encoded to prevent exposure
4. **Context Separation**: Dev and prod contexts kept separate
5. **Limited Permissions**: Service accounts use minimal required permissions

## 📊 Monitoring

### Build Notifications

- Circle CI sends notifications for failed builds
- Success/failure status visible in Circle CI dashboard

### Artifact Storage

- Build artifacts (IPAs, APKs, AABs) stored for 30 days
- Available for download from Circle CI dashboard

### Change Detection Logs

- Shows exactly which files triggered builds
- Helps optimize build frequency and resource usage

## 🚀 Benefits

1. **Automated Daily Testing**: Catch issues early with daily dev builds
2. **Conditional Building**: Saves resources by only building when necessary
3. **Parallel Execution**: Faster builds with iOS and Android running
   simultaneously
4. **Consistent Releases**: Tag-based releases ensure predictable deployments
5. **Integrated with Existing Workflows**: Leverages your current AI-powered
   release notes
6. **Submodule Aware**: Handles complex submodule structure automatically

This setup provides a robust, automated CI/CD pipeline that scales with your
development workflow while maintaining security and efficiency.
