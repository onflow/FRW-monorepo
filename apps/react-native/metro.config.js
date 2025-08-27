const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/**
 * Metro configuration for monorepo with import.meta transformation
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..', '..');

const defaultConfig = getDefaultConfig(projectRoot);

const config = {
  resolver: {
    // Enable symlinks support for monorepo
    unstable_enableSymlinks: true,
    // Enable package.json exports field support
    unstable_enablePackageExports: true,
    // Exclude SVG from asset extensions and add to source extensions
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    alias: {
      '@': path.resolve(projectRoot, 'src'),
      ui: path.resolve(projectRoot, 'src/components/ui'),
      icons: path.resolve(projectRoot, 'src/assets/icons'),
    },
  },
  transformer: {
    // Use combined transformer to handle both SVG and import.meta transformations
    babelTransformerPath: require.resolve('./metro-combined-transformer.js'),
  },
  // Watch the entire monorepo for changes
  watchFolders: [monorepoRoot],
};

module.exports = withNativeWind(mergeConfig(getDefaultConfig(projectRoot), config), {
  input: './src/global.css',
});
