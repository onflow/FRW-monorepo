const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require("path");

/**
 * Metro configuration for monorepo
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..', '..');

const config = {
  resolver: {
    // Enable symlinks support for monorepo
    unstable_enableSymlinks: true,
    // Enable package.json exports field support
    unstable_enablePackageExports: true,
    alias: {
      "@": path.resolve(projectRoot, "src"),
      "ui": path.resolve(projectRoot, "src/components/ui"),
      "icons": path.resolve(projectRoot, "src/assets/icons"),
    },
  },
  // Watch the entire monorepo for changes
  watchFolders: [monorepoRoot],
};

module.exports = withNativeWind(mergeConfig(getDefaultConfig(projectRoot), config), {
  input: "./src/global.css",
});
