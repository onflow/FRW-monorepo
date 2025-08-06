# CodePush Deployment Keys Setup

## Current Status

- ✅ CodePush is configured with placeholder deployment keys
- ⚠️ You need real deployment keys from App Center to enable OTA updates

## How to Get Real Deployment Keys

### 1. Install App Center CLI

```bash
npm install -g appcenter-cli
```

### 2. Login to App Center

```bash
appcenter login
```

### 3. Create Your Android App

```bash
appcenter apps create -d "YourApp-Android" -o Android -p React-Native
```

### 4. Create Deployment Environments

```bash
# Create staging deployment
appcenter codepush deployment add Staging -a your-username/YourApp-Android

# Create production deployment
appcenter codepush deployment add Production -a your-username/YourApp-Android
```

### 5. Get Deployment Keys

```bash
appcenter codepush deployment list -a your-username/YourApp-Android -k
```

### 6. Update Android Configuration

Replace the placeholder keys in these files:

**Debug builds:** `android/app/src/debug/res/values/codepush.xml`

```xml
<string name="codepush_deployment_key_staging">YOUR_STAGING_KEY_HERE</string>
```

**Release builds:** `android/app/src/main/res/values/codepush.xml`

```xml
<string name="codepush_deployment_key_production">YOUR_PRODUCTION_KEY_HERE</string>
```

### 7. Deploy Updates

```bash
# Deploy to staging
pnpm run codepush:android:staging

# Deploy to production
pnpm run codepush:android:production
```

## Current Placeholder Keys

The app is configured with these placeholder keys:

- Staging: `staging-deployment-key-placeholder-replace-with-real-key`
- Production: `production-deployment-key-placeholder-replace-with-real-key`

**The app will run normally but CodePush updates won't work until you replace these with real keys from App Center.**
