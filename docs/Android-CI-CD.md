# Android CI/CD (GitHub Actions)

This document outlines the Android CI/CD setup for the FRW monorepo. The
workflow mirrors the iOS approach: build monorepo packages first, then build the
Android app with Gradle, and optionally distribute dev builds via Firebase App
Distribution.

## Overview

- Workflow: `.github/workflows/android.yml`
- Triggers: PRs to `apps/react-native/**`, pushes to `dev`, `release/*`, and
  tags `release/rn-*`, plus manual `workflow_dispatch`.
- Build Types:
  - `debug` (default for PRs)
  - `dev` (on release branches/tags; uses Firebase App Distribution if secrets
    provided)
  - `release` (manual via workflow input)

## Secrets

Add these repository secrets to enable dependency resolution and distribution:

- GitHub Packages
  - `GPR_USER`: GitHub username (e.g., `lmcmz`)
  - `GPR_KEY`: GitHub Personal Access Token with `read:packages`

- Firebase App Distribution (optional for `dev` uploads)
  - `ANDROID_FIREBASE_CREDENTIALS_B64`: Base64 of Google service account JSON
  - `FIREBASE_TESTERS`: Comma-separated tester emails

- Google Services JSON (optional; if not provided, build proceeds without
  Firebase features)
  - `ANDROID_GOOGLE_SERVICES_DEV_B64`: Base64 of `app/google-services.json` for
    dev
  - `ANDROID_GOOGLE_SERVICES_PROD_B64`: Base64 of
    `app/src/release/google-services.json`

- Signing (optional; required for `dev`/`release` if you want non-debug signing)
  - `ANDROID_KEY_PROPERTIES_B64`: Base64 of `android/key.properties`

Example `key.properties` content:

```
storeFile=/path/to/keystore.jks
storePassword=***
keyAlias=***
keyPassword=***
```

Note: The project defaults to the debug keystore when these are not present, so
`assembleDebug` works without secrets.

## What the Workflow Does

1. Checks out the repo and installs Node 20 + pnpm
2. Installs and builds monorepo packages (`packages/*`) and regenerates RN
   bridge models
3. Sets up Java 17, Gradle, and Android SDK Build-Tools 35 + platforms 35/36
4. Writes Gradle credentials for GitHub Packages to
   `~/.gradle/gradle.properties` so Gradle can download:
   - `com.github.onflow.flow-wallet-kit:flow-wallet-android`
   - TrustWallet `wallet-core` from GitHub Packages
5. Optionally writes:
   - `app/google-services.json` and `app/src/release/google-services.json`
   - `key.properties`
   - `local.properties` with `serviceCredentialsFile` and `testers` for Firebase
6. Builds the selected variant with Gradle
7. Uploads generated APK(s) as workflow artifacts
8. For `dev` builds (on release branches/tags) with Firebase secrets, uploads to
   App Distribution

## Local Parity

To reproduce CI locally:

```
# From repo root
pnpm install --frozen-lockfile
pnpm -r --filter='./packages/*' build
pnpm -F "frw-rn" codegen:bridge

cd apps/react-native/android
./gradlew :app:assembleDebug
```

## Notes

- The Android build reads GitHub Packages credentials from Gradle properties as
  `gpr.user` / `gpr.key` and also supports `GITHUB_USERNAME` / `GITHUB_TOKEN`
  env vars.
- Firebase App Distribution requires `local.properties` to include
  `serviceCredentialsFile` and optionally `testers`. The workflow writes these
  if `ANDROID_FIREBASE_CREDENTIALS_B64` is provided.
- For `dev`/`release` variants, ensure signing is configured (use
  `ANDROID_KEY_PROPERTIES_B64`).
