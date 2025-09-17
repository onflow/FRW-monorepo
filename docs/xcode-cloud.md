Xcode Cloud Setup (FRW Monorepo)

Overview

- Goal: Use Xcode Cloud for iOS signing and distribution, while preparing React
  Native bundle and native env files automatically.
- Strategy: Rely on Xcode Cloud’s auto-run scripts under `ci_scripts/` and keep
  all logic in the monorepo.

Repository Layout

- iOS project (submodule): `apps/react-native/ios`
- React Native app root: `apps/react-native`
- Auto-run scripts for Xcode Cloud: `apps/react-native/ios/ci_scripts/`

Auto-Run Scripts

- Xcode Cloud automatically executes the following scripts when the directory
  `ci_scripts` is located alongside your Xcode project/workspace (here:
  `apps/react-native/ios/ci_scripts`):
  - `ci_post_clone.sh`
  - `ci_pre_xcodebuild.sh`
  - `ci_post_xcodebuild.sh`
- Xcode Cloud runs these scripts with the `ci_scripts` directory as the working
  directory. All relative paths in scripts are written accordingly.
- What they do in this repo:
  - `ci_post_clone.sh`
    - Initialize submodules
    - Ensure Node (install locally if missing)
    - Ensure pnpm via Corepack (optional pinned via `PNPM_VERSION`)
    - Install JS deps (`pnpm install`)
    - Install CocoaPods via Bundler (install bundler if missing), then
      `bundle exec pod install`
    - Call `apps/react-native/ios/ci_scripts/ci_post_clone.sh` to generate
      base64-driven Env/Plist files
  - `ci_pre_xcodebuild.sh`
    - Ensure Node/pnpm again (fresh shell)
    - Run `pnpm run bundle:ios` to generate `ios/main.jsbundle`
  - `ci_post_xcodebuild.sh`
    - Delegate to `apps/react-native/ios/ci_scripts/ci_post_xcodebuild.sh` (if
      present), e.g., generate TestFlight notes

Project Selection in Xcode Cloud

- Source repository: this monorepo.
- Project/Workspace: `apps/react-native/ios/FRW.xcworkspace`.
- Scheme: choose the appropriate scheme (e.g., `FlowWallet-dev` or
  `FlowWallet`).

Required Secrets (Base64)

- Configure these secrets in Xcode Cloud (as environment variables):
  - `LOCAL_ENV`
  - `GOOGLE_OAUTH2_DEV`, `GOOGLE_SERVICE_DEV`, `SERVICE_CONFIG_DEV`
  - `GOOGLE_OAUTH2_PROD`, `GOOGLE_SERVICE_PROD`, `SERVICE_CONFIG_PROD`
- They are decoded by `apps/react-native/ios/ci_scripts/ci_post_clone.sh` into
  `FRW/App/Env`.

Tool Versions (Optional)

- `NODE_VERSION` (default `20.17.0`): used when Node is not available and must
  be installed locally to `$HOME/.local/node`.
- `PNPM_VERSION` (no default): if set, Corepack prepares that pnpm version;
  otherwise latest is used.

Node Resolution in Xcode

- `apps/react-native/ios/.xcode.env` sets
  `export NODE_BINARY=$(command -v node)` so RN build phases resolve Node from
  PATH (works locally and in Xcode Cloud).

Notes & Tips

- Submodules: ensure Xcode Cloud has access to the iOS submodule repository;
  otherwise submodule checkout will fail.
- Script location is critical: `ci_scripts` must be in the same directory as
  `FRW.xcodeproj/FRW.xcworkspace` (here: `apps/react-native/ios/ci_scripts`). A
  root-level `ci_scripts` will not be auto-executed for this workspace.
- Executable bits: Xcode Cloud invokes scripts by path; no explicit chmod is
  required. If you prefer, you can set them executable
  (`chmod +x apps/react-native/ios/ci_scripts/*.sh`).
- Standard RN build phase: if you prefer not to run `bundle:ios` in
  `ci_pre_xcodebuild.sh`, add an Xcode “Bundle React Native code and images”
  build phase that calls
  `node_modules/react-native/scripts/react-native-xcode.sh` (requires
  node_modules from post-clone).

Troubleshooting

- Node not found: scripts auto-install Node to `$HOME/.local/node` and export
  PATH. You can pin `NODE_VERSION` if needed.
- pnpm not found: scripts enable Corepack and prepare pnpm. You can pin
  `PNPM_VERSION`.
- CocoaPods issues: `bundle install` installs pods tooling per `Gemfile`;
  `bundle exec pod install --repo-update` is used to ensure up-to-date specs.
- Missing base64 secrets: env/Plist generation will be skipped and may break
  builds; double-check Xcode Cloud environment variables.
