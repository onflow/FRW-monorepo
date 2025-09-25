**Android CI/CD**

- Overview: Automated builds for the React Native Android app under
  `apps/react-native/android` with Firebase App Distribution and optional
  AI-style release notes.

**Triggers**

- Schedule: Runs twice daily at Sydney local time.
  - 10:30 Sydney
    - AEST months (Apr–Sep): 00:30 UTC (cron `30 0 * 4-9 *`)
    - AEDT months (Oct–Mar): 23:30 UTC (cron `30 23 * 1,2,3,10,11,12 *`)
  - 16:00 Sydney
    - AEST months (Apr–Sep): 06:00 UTC (cron `0 6 * 4-9 *`)
    - AEDT months (Oct–Mar): 05:00 UTC (cron `0 5 * 1,2,3,10,11,12 *`)
- Manual: `workflow_dispatch` with `buildType` input (`release` default; `dev`
  optional; `debug` for local testing only).

**Build Types**

- `release`: Default. Signs with provided keystore and uploads to Firebase if
  credentials are present.
- `dev`: Optional. Same as release but uses the `dev` product flavor/variant and
  uploads to Firebase App Distribution if configured.
- `debug`: For local CI debugging; does not upload.

**Secrets and Variables**

- Environment: Uses GitHub Environments (`production` for `release`,
  `development` for `dev`/`debug`) so environment‑scoped secrets/vars apply
  automatically.
- Required for Firebase upload:
  - `secrets.SERVICE_ACCOUNT_JSON` or `secrets.SERVICE_ACCOUNT_JSON_B64`: Google
    service account credentials (JSON or base64).
  - `vars.FIREBASE_TESTERS`: Comma‑separated emails for testers.
- Optional/compat secrets (raw or base64). Any not provided are skipped
  gracefully:
  - `secrets.LOCAL_PROPERTIES` (raw)
  - `secrets.KEY_PROPERTIES` or `secrets.KEY_PROPERTIES_B64`
  - `secrets.GOOGLE_SERVICES` or `secrets.GOOGLE_SERVICES_B64` (writes to
    `app/src/dev/google-services.json` and `app/google-services.json`)
  - `secrets.ANDROID_GOOGLE_SERVICES_DEV_B64`,
    `secrets.ANDROID_GOOGLE_SERVICES_PROD_B64` (fallbacks)
  - `secrets.ANDROID_FIREBASE_CREDENTIALS_B64` (fallback for service account)
  - `secrets.KEYSTORE_BASE64` (optional keystore; appended to `local.properties`
    as `storeFile`)

**Key Steps**

- Checkout with submodules and full history to ensure `./gradlew` exists.
- Prepare config files:
  - Writes `local.properties` from `LOCAL_PROPERTIES` (raw) or creates a minimal
    file with `sdk.dir` and `testers`.
  - Writes `key.properties` from `KEY_PROPERTIES` (raw) or `_B64`.
  - Writes Google Services JSON from `GOOGLE_SERVICES` (raw) or
    `_B64`/Android‑specific fallbacks.
  - Writes `firebase-appdist.json` from `SERVICE_ACCOUNT_JSON` (raw) or `_B64`;
    injects `serviceCredentialsFile` and `testers` into `local.properties`.
- Build:
  - `release` → `:app:assembleRelease`
  - `dev` → `:app:assembleDev`
  - `debug` → `:app:assembleDebug`
- Artifacts: Uploads all generated APKs as `android-<buildType>-apk` artifact.
  - Also uploads Android App Bundles (.aab) as `android-<buildType>-aab`.
- Release notes: Generates a `release-notes.txt` from recent commits (last 3
  days) and attaches to Firebase upload when credentials and testers are
  present.
- Firebase upload:
  - `dev`: `:app:appDistributionUploadDev`
  - `release`: `:app:appDistributionUploadRelease`

**Manual Run**

- GitHub → Actions → “Android Build & Release” → “Run workflow”.
  - buildType: default `release`.
  - targetRef: default `dev` (builds that branch even if you launch from
    default).

**Common Issues**

- No manual button: Workflows only show the button when present on the default
  branch. Merge the workflow first.
- Firebase skipped: Ensure `SERVICE_ACCOUNT_JSON` (or `_B64`) and
  `vars.FIREBASE_TESTERS` exist in the active Environment.
- Debug keystore error: The workflow generates `debug.keystore` in a writable
  temp dir and sets `XDG_CONFIG_HOME`/`ANDROID_SDK_HOME` accordingly.

**Files**

- Workflow: `.github/workflows/android.yml`
- App: `apps/react-native/android`
